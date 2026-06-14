import type { DataSource } from 'typeorm';
import type { DashboardRepository, DrillFaturamento, ItemSerie, ResumoDashboard, SerieDashboard, TipoSerie } from '../../domain/dashboard/Dashboard.js';
import { validarSchema } from '../tenant/validarSchema.js';

// null = sem período anterior (cur>0 e ant=0) → frontend mostra "novo no período".
const pct = (cur: number, ant: number): number | null =>
  ant > 0 ? Math.round(((cur - ant) / ant) * 1000) / 10 : (cur > 0 ? null : 0);

export class SqlDashboardRepository implements DashboardRepository {
  constructor(private readonly ds: DataSource) {}

  async resumo(schema: string): Promise<ResumoDashboard> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);
    const NAO = `status NOT IN ('orcamento','cancelado')`;
    // Datetime é gravado em UTC; o bucket de "dia/semana/mês/ano" precisa ser no fuso da
    // empresa (senão vendas da tarde/noite caem no dia seguinte em UTC e somem do "dia").
    const tz = (await this.ds.query(
      `SELECT COALESCE(timezone_padrao, 'America/Sao_Paulo') tz FROM public.empresa WHERE schema_name = $1`,
      [s]))[0]?.tz || 'America/Sao_Paulo';
    // Atalhos no fuso da empresa: criado_em local e "agora" local.
    const L = `(criado_em AT TIME ZONE $1)`;        // criado_em em hora local
    const HOJE = `(now() AT TIME ZONE $1)`;          // agora em hora local

    // Vendas por período + período anterior (uma query), bucketadas no fuso da empresa
    const vd = (await this.ds.query(
      `SELECT
         COALESCE(SUM(total) FILTER (WHERE ${L}::date = ${HOJE}::date),0) dia,
         COALESCE(SUM(total) FILTER (WHERE ${L}::date = ${HOJE}::date - 1),0) dia_ant,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('week', ${HOJE})),0) sem,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('week', ${HOJE}) - interval '7 days' AND ${L} < date_trunc('week', ${HOJE})),0) sem_ant,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('month', ${HOJE})),0) mes,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('month', ${HOJE}) - interval '1 month' AND ${L} < date_trunc('month', ${HOJE})),0) mes_ant,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('year', ${HOJE})),0) ano,
         COALESCE(SUM(total) FILTER (WHERE ${L} >= date_trunc('year', ${HOJE}) - interval '1 year' AND ${L} < date_trunc('year', ${HOJE})),0) ano_ant
       FROM "${s}".pedido WHERE ${NAO}`, [tz]))[0];

    const cli = (await this.ds.query(
      `SELECT COUNT(*) FILTER (WHERE ativo)::int ativos,
              COUNT(*) FILTER (WHERE ${L} >= date_trunc('month', ${HOJE}))::int novos,
              COUNT(*) FILTER (WHERE ${L} >= date_trunc('month', ${HOJE}) - interval '1 month' AND ${L} < date_trunc('month', ${HOJE}))::int novos_ant
         FROM "${s}".cliente`, [tz]))[0];

    const porStatus = await this.ds.query(
      `SELECT status, COUNT(*)::int q FROM "${s}".pedido GROUP BY status`);

    const rec = (await this.ds.query(
      `SELECT COALESCE(SUM(valor) FILTER (WHERE status='aberto'),0) ab,
              COALESCE(SUM(valor) FILTER (WHERE status='aberto' AND vencimento < CURRENT_DATE),0) vc
         FROM "${s}".titulo WHERE tipo='receber'`))[0];
    const pag = (await this.ds.query(
      `SELECT COALESCE(SUM(valor) FILTER (WHERE status='aberto'),0) ab,
              COALESCE(SUM(valor) FILTER (WHERE status='aberto' AND vencimento < CURRENT_DATE),0) vc
         FROM "${s}".titulo WHERE tipo='pagar'`))[0];

    const baixo = (await this.ds.query(
      `SELECT COUNT(*)::int q FROM (
         SELECT p.id, p.estoque_minimo, COALESCE(SUM(l.quantidade),0) saldo
           FROM "${s}".produto p
           LEFT JOIN "${s}".estoque_lote l ON l.produto_id = p.id
          WHERE p.ativo GROUP BY p.id, p.estoque_minimo
       ) x WHERE x.saldo < x.estoque_minimo`))[0];

    const caixa = (await this.ds.query(
      `SELECT COALESCE(SUM(CASE WHEN tipo='receber' THEN valor ELSE -valor END),0) s
         FROM "${s}".titulo WHERE status='pago'`))[0];

    // Fluxo do mês (títulos pagos no mês)
    const fx = (await this.ds.query(
      `SELECT COALESCE(SUM(valor) FILTER (WHERE tipo='receber'),0) ent,
              COALESCE(SUM(valor) FILTER (WHERE tipo='pagar'),0) sai
         FROM "${s}".titulo WHERE status='pago' AND date_trunc('month', pago_em) = date_trunc('month', now())`))[0];

    const top = await this.ds.query(
      `SELECT produto_nome nome, SUM(quantidade)::numeric q, COALESCE(SUM(subtotal),0) valor
         FROM "${s}".pedido_item GROUP BY produto_nome ORDER BY q DESC LIMIT 5`);

    const topCliVal = await this.ds.query(
      `SELECT COALESCE(c.nome,'—') nome, COALESCE(SUM(p.total),0) total
         FROM "${s}".pedido p LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${NAO} GROUP BY c.nome ORDER BY total DESC LIMIT 5`);
    const topCliQtd = await this.ds.query(
      `SELECT COALESCE(c.nome,'—') nome, COUNT(*)::int qtd
         FROM "${s}".pedido p LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${NAO} GROUP BY c.nome ORDER BY qtd DESC LIMIT 5`);

    const recentes = await this.ds.query(
      `SELECT p.numero, COALESCE(c.nome,'—') cliente, COALESCE(v.nome,'—') vendedor,
              p.total valor, p.status, p.criado_em data
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        ORDER BY p.criado_em DESC LIMIT 5`);

    const fatMensal = await this.ds.query(
      `SELECT to_char(m, 'YYYY-MM') mes, COALESCE(SUM(p.total),0) total
         FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
         LEFT JOIN "${s}".pedido p ON date_trunc('month', p.criado_em) = m AND p.${NAO}
        GROUP BY m ORDER BY m`);

    // Faturamento dos 6 meses imediatamente anteriores (série de comparação "Período anterior").
    const fatAnterior = await this.ds.query(
      `SELECT to_char(m, 'YYYY-MM') mes, COALESCE(SUM(p.total),0) total
         FROM generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()) - interval '6 months', interval '1 month') m
         LEFT JOIN "${s}".pedido p ON date_trunc('month', p.criado_em) = m AND p.${NAO}
        GROUP BY m ORDER BY m`);

    // Meta mensal (barra de meta no gráfico): repetida em cada um dos meses exibidos.
    const metaMes = Number(
      (await this.ds.query(`SELECT valor FROM "${s}".meta WHERE periodo = 'mes'`))[0]?.valor ?? 0) || 0;

    const vendasCat = await this.ds.query(
      `SELECT COALESCE(c.nome,'—') categoria, COALESCE(SUM(pi.subtotal),0) total
         FROM "${s}".pedido_item pi
         JOIN "${s}".pedido p ON p.id = pi.pedido_id AND p.${NAO}
         LEFT JOIN "${s}".produto pr ON pr.id = pi.produto_id
         LEFT JOIN "${s}".categoria c ON c.id = pr.categoria_id
        WHERE p.criado_em >= date_trunc('month', now()) - interval '5 months'
        GROUP BY 1 ORDER BY total DESC LIMIT 6`);

    const saldos = await this.ds.query(
      `SELECT cc.nome, (cc.saldo_inicial
         + COALESCE((SELECT SUM(CASE WHEN t.tipo='receber' THEN t.valor ELSE -t.valor END)
                       FROM "${s}".titulo t WHERE t.status='pago' AND t.conta_corrente_id = cc.id),0)) saldo
         FROM "${s}".conta_corrente cc WHERE cc.ativo ORDER BY cc.nome`);

    return {
      vendasDia: um(vd.dia), vendasDiaDeltaPct: pct(um(vd.dia), um(vd.dia_ant)),
      vendasSemana: um(vd.sem), vendasSemanaDeltaPct: pct(um(vd.sem), um(vd.sem_ant)),
      vendasMes: um(vd.mes), vendasMesDeltaPct: pct(um(vd.mes), um(vd.mes_ant)),
      vendasAno: um(vd.ano), vendasAnoDeltaPct: pct(um(vd.ano), um(vd.ano_ant)),
      clientesAtivos: um(cli.ativos), clientesDeltaPct: pct(um(cli.novos), um(cli.novos_ant)),
      pedidosPorStatus: porStatus.map((r: any) => ({ status: r.status, quantidade: r.q })),
      receberAberto: um(rec.ab), receberVencido: um(rec.vc),
      pagarAberto: um(pag.ab), pagarVencido: um(pag.vc),
      estoqueBaixo: um(baixo.q),
      saldoCaixa: um(caixa.s),
      topProdutos: top.map((r: any) => ({ nome: r.nome, quantidade: um(r.q), valor: um(r.valor) })),
      topClientesValor: topCliVal.map((r: any) => ({ nome: r.nome, total: um(r.total) })),
      topClientesQtd: topCliQtd.map((r: any) => ({ nome: r.nome, qtd: um(r.qtd) })),
      pedidosRecentes: recentes.map((r: any) => ({ numero: um(r.numero), cliente: r.cliente, vendedor: r.vendedor, valor: um(r.valor), status: r.status, data: new Date(r.data).toISOString() })),
      fluxoEntradasMes: um(fx.ent), fluxoSaidasMes: um(fx.sai), fluxoSaldoMes: um(fx.ent) - um(fx.sai),
      faturamentoMensal: fatMensal.map((r: any) => ({ mes: r.mes, total: um(r.total) })),
      faturamentoAnterior: fatAnterior.map((r: any) => ({ mes: r.mes, total: um(r.total) })),
      metaMensal: fatMensal.map(() => metaMes),
      vendasCategoria: vendasCat.map((r: any) => ({ categoria: r.categoria, total: um(r.total) })),
      saldosBancarios: saldos.map((r: any) => ({ nome: r.nome, saldo: um(r.saldo) })),
    };
  }

  // Série temporal das vendas (pedidos não orçamento/cancelado) para o drill dos KPIs.
  async serie(schema: string, tipo: TipoSerie, de: string | null, ate: string | null): Promise<SerieDashboard> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);
    const NAO = `status NOT IN ('orcamento','cancelado')`;
    const tz = (await this.ds.query(
      `SELECT COALESCE(timezone_padrao, 'America/Sao_Paulo') tz FROM public.empresa WHERE schema_name = $1`,
      [s]))[0]?.tz || 'America/Sao_Paulo';

    if (tipo === 'clientes') {
      const q = (await this.ds.query(
        `SELECT COUNT(*) FILTER (WHERE ativo)::int q, to_char(now(),'MM/YYYY') rotulo FROM "${s}".cliente`))[0];
      return { tipo, labels: [q.rotulo], data: [um(q.q)], formato: 'quantidade' };
    }

    let sql: string;
    let params: any[] = [];
    // criado_em em hora local da empresa (datetime gravado em UTC)
    const L = `(p.criado_em AT TIME ZONE $1)`;
    if (tipo === 'dia') {
      // Intervalo arbitrário (default: últimos 30 dias), série diária no fuso da empresa.
      const ini = de ?? null, fim = ate ?? null;
      sql =
        `WITH faixa AS (
           SELECT COALESCE($2::date, (now() AT TIME ZONE $1)::date - 29) di,
                  COALESCE($3::date, (now() AT TIME ZONE $1)::date) df
         )
         SELECT to_char(g.d,'DD/MM') rotulo, COALESCE(SUM(p.total),0) total
           FROM faixa, generate_series((SELECT LEAST(di,df) FROM faixa), (SELECT GREATEST(di,df) FROM faixa), interval '1 day') g(d)
           LEFT JOIN "${s}".pedido p ON ${L}::date = g.d::date AND p.${NAO}
          GROUP BY g.d ORDER BY g.d`;
      params = [tz, ini, fim];
    } else if (tipo === 'semana') {
      sql =
        `SELECT to_char(g.w,'DD/MM') rotulo, COALESCE(SUM(p.total),0) total
           FROM generate_series(date_trunc('week', now() AT TIME ZONE $1) - interval '11 weeks', date_trunc('week', now() AT TIME ZONE $1), interval '1 week') g(w)
           LEFT JOIN "${s}".pedido p ON date_trunc('week', ${L}) = g.w AND p.${NAO}
          GROUP BY g.w ORDER BY g.w`;
      params = [tz];
    } else if (tipo === 'mes') {
      sql =
        `SELECT to_char(g.m,'MM/YYYY') rotulo, COALESCE(SUM(p.total),0) total
           FROM generate_series(date_trunc('month', now() AT TIME ZONE $1) - interval '11 months', date_trunc('month', now() AT TIME ZONE $1), interval '1 month') g(m)
           LEFT JOIN "${s}".pedido p ON date_trunc('month', ${L}) = g.m AND p.${NAO}
          GROUP BY g.m ORDER BY g.m`;
      params = [tz];
    } else {
      // ano: últimos 5 anos
      sql =
        `SELECT to_char(g.y,'YYYY') rotulo, COALESCE(SUM(p.total),0) total
           FROM generate_series(date_trunc('year', now() AT TIME ZONE $1) - interval '4 years', date_trunc('year', now() AT TIME ZONE $1), interval '1 year') g(y)
           LEFT JOIN "${s}".pedido p ON date_trunc('year', ${L}) = g.y AND p.${NAO}
          GROUP BY g.y ORDER BY g.y`;
      params = [tz];
    }

    const rows = await this.ds.query(sql, params);
    return {
      tipo,
      labels: rows.map((r: any) => r.rotulo),
      data: rows.map((r: any) => um(r.total)),
      formato: 'moeda',
    };
  }

  // Vendas (pedidos) que compõem o valor do KPI clicado, no período correspondente.
  async serieItens(schema: string, tipo: TipoSerie, de: string | null, ate: string | null): Promise<ItemSerie[]> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);
    const NAO = `status NOT IN ('orcamento','cancelado')`;

    if (tipo === 'clientes') {
      const cli = await this.ds.query(
        `SELECT nome, ativo, COALESCE(limite_credito,0) limite, criado_em
           FROM "${s}".cliente WHERE ativo ORDER BY nome`);
      return cli.map((c: any) => ({
        numero: null, cliente: c.nome, vendedor: '',
        data: c.criado_em ? new Date(c.criado_em).toISOString() : null,
        status: c.ativo ? 'ativo' : 'inativo', valor: um(c.limite),
      }));
    }

    const tz = (await this.ds.query(
      `SELECT COALESCE(timezone_padrao, 'America/Sao_Paulo') tz FROM public.empresa WHERE schema_name = $1`,
      [s]))[0]?.tz || 'America/Sao_Paulo';
    // Janela por tipo de KPI (igual à do card), bucketada no fuso da empresa. $1 = tz.
    const L = `(p.criado_em AT TIME ZONE $1)`, HOJE = `(now() AT TIME ZONE $1)`;
    let filtro: string; const params: any[] = [tz];
    if (tipo === 'dia') {
      filtro = `${L}::date BETWEEN COALESCE($2::date, ${HOJE}::date - 29) AND COALESCE($3::date, ${HOJE}::date)`;
      params.push(de, ate);
    } else if (tipo === 'semana') {
      filtro = `${L} >= date_trunc('week', ${HOJE})`;
    } else if (tipo === 'mes') {
      filtro = `${L} >= date_trunc('month', ${HOJE})`;
    } else {
      filtro = `${L} >= date_trunc('year', ${HOJE})`;
    }

    const rows = await this.ds.query(
      `SELECT p.numero, COALESCE(c.nome,'—') cliente, COALESCE(v.nome,'—') vendedor,
              p.criado_em, p.status, p.total
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        WHERE p.${NAO} AND ${filtro}
        ORDER BY p.criado_em DESC`, params);
    return rows.map((r: any) => ({
      numero: um(r.numero), cliente: r.cliente, vendedor: r.vendedor,
      data: new Date(r.criado_em).toISOString(), status: r.status, valor: um(r.total),
    }));
  }

  // Drilldown de um mês do faturamento (clique no ponto/barra do gráfico).
  async drillFaturamento(schema: string, mes: string): Promise<DrillFaturamento> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);
    const NAO = `status NOT IN ('orcamento','cancelado')`;
    const tot = (await this.ds.query(
      `SELECT COALESCE(SUM(total),0) total, COUNT(*)::int pedidos
         FROM "${s}".pedido
        WHERE ${NAO} AND to_char(date_trunc('month', criado_em),'YYYY-MM') = $1`, [mes]))[0];
    const top = await this.ds.query(
      `SELECT COALESCE(c.nome,'—') nome, COALESCE(SUM(p.total),0) total
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${NAO} AND to_char(date_trunc('month', p.criado_em),'YYYY-MM') = $1
        GROUP BY 1 ORDER BY total DESC LIMIT 5`, [mes]);
    const pedidos = um(tot.pedidos), total = um(tot.total);
    return {
      mes, total, pedidos,
      ticketMedio: pedidos > 0 ? Math.round((total / pedidos) * 100) / 100 : 0,
      topClientes: top.map((r: any) => ({ nome: r.nome, total: um(r.total) })),
    };
  }
}
