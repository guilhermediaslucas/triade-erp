import type { DataSource } from 'typeorm';
import type { DashboardRepository, ResumoDashboard } from '../../domain/dashboard/Dashboard.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlDashboardRepository implements DashboardRepository {
  constructor(private readonly ds: DataSource) {}

  async resumo(schema: string): Promise<ResumoDashboard> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);

    const vendas = (await this.ds.query(
      `SELECT COALESCE(SUM(total),0) v FROM "${s}".pedido
        WHERE status NOT IN ('orcamento','cancelado')
          AND date_trunc('month', criado_em) = date_trunc('month', now())`))[0];

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

    const top = await this.ds.query(
      `SELECT produto_nome nome, SUM(quantidade)::numeric q
         FROM "${s}".pedido_item GROUP BY produto_nome ORDER BY q DESC LIMIT 5`);

    const fatMensal = await this.ds.query(
      `SELECT to_char(m, 'YYYY-MM') mes, COALESCE(SUM(p.total),0) total
         FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
         LEFT JOIN "${s}".pedido p ON date_trunc('month', p.criado_em) = m AND p.status NOT IN ('orcamento','cancelado')
        GROUP BY m ORDER BY m`);

    const vendasCat = await this.ds.query(
      `SELECT COALESCE(c.nome,'—') categoria, COALESCE(SUM(pi.subtotal),0) total
         FROM "${s}".pedido_item pi
         JOIN "${s}".pedido p ON p.id = pi.pedido_id AND p.status NOT IN ('orcamento','cancelado')
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
      vendasMes: um(vendas.v),
      pedidosPorStatus: porStatus.map((r: any) => ({ status: r.status, quantidade: r.q })),
      receberAberto: um(rec.ab), receberVencido: um(rec.vc),
      pagarAberto: um(pag.ab), pagarVencido: um(pag.vc),
      estoqueBaixo: um(baixo.q),
      saldoCaixa: um(caixa.s),
      topProdutos: top.map((r: any) => ({ nome: r.nome, quantidade: um(r.q) })),
      faturamentoMensal: fatMensal.map((r: any) => ({ mes: r.mes, total: um(r.total) })),
      vendasCategoria: vendasCat.map((r: any) => ({ categoria: r.categoria, total: um(r.total) })),
      saldosBancarios: saldos.map((r: any) => ({ nome: r.nome, saldo: um(r.saldo) })),
    };
  }
}
