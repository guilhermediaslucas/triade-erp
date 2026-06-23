import type { DataSource } from 'typeorm';
import type { LinhaEntregaVol, LinhaEstoqueParado, LinhaPedidoRel, LinhaPerda, LinhaProduto, LinhaValidadeLote, RelatorioRepository, RelatorioVendas, RelatorioVendasContabil } from '../../domain/relatorio/Relatorio.js';
import { validarSchema } from '../tenant/validarSchema.js';

const ATIVO = "status NOT IN ('orcamento','cancelado')";

export class SqlRelatorioRepository implements RelatorioRepository {
  constructor(private readonly ds: DataSource) {}

  async vendas(schema: string, de: string | null, ate: string | null): Promise<RelatorioVendas> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.numero, p.criado_em, p.status, p.total, c.nome cliente, v.nome vendedor
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        WHERE p.${ATIVO}
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        ORDER BY p.criado_em DESC`, [de, ate]);
    const map = linhas.map((r: any) => ({
      numero: r.numero, data: new Date(r.criado_em).toISOString(), cliente: r.cliente ?? null,
      vendedor: r.vendedor ?? null, status: r.status, total: Number(r.total),
    }));
    const total = map.reduce((a: number, l: any) => a + l.total, 0);
    const agrup: Record<string, { quantidade: number; total: number }> = {};
    for (const l of map) { const k = l.vendedor ?? '—'; (agrup[k] ??= { quantidade: 0, total: 0 }); agrup[k].quantidade++; agrup[k].total += l.total; }
    const porVendedor = Object.entries(agrup).map(([vendedor, v]) => ({ vendedor, ...v })).sort((a, b) => b.total - a.total);
    return { linhas: map, total, quantidade: map.length, porVendedor };
  }

  // Relatório contábil: venda (subtotal) separada do frete (cobrado/custo/absorvido), por pedido.
  async vendasContabil(schema: string, de: string | null, ate: string | null): Promise<RelatorioVendasContabil> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.numero, p.criado_em, c.nome cliente, p.subtotal, p.frete, p.frete_custo, p.total, p.forma_entrega,
              (SELECT t.id FROM "${s}".titulo t WHERE t.pedido_id = p.id ORDER BY t.vencimento LIMIT 1) AS titulo_id,
              (SELECT COUNT(*) FROM "${s}".titulo_anexo a JOIN "${s}".titulo t ON t.id = a.titulo_id WHERE t.pedido_id = p.id) AS anexos
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${ATIVO}
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        ORDER BY p.criado_em DESC`, [de, ate]);
    const map = linhas.map((r: any) => {
      const venda = Number(r.subtotal), freteCobrado = Number(r.frete), freteCusto = Number(r.frete_custo ?? r.frete ?? 0);
      return {
        numero: r.numero, data: new Date(r.criado_em).toISOString(), cliente: r.cliente ?? null,
        venda, freteCobrado, freteCusto, absorvido: Math.round((freteCusto - freteCobrado) * 100) / 100,
        tipoFrete: r.forma_entrega ?? 'retirada', total: Number(r.total),
        tituloId: r.titulo_id ?? null, anexosCount: Number(r.anexos) || 0,
      };
    });
    const soma = (k: 'venda' | 'freteCobrado' | 'freteCusto' | 'absorvido' | 'total') =>
      Math.round(map.reduce((a: number, l: any) => a + l[k], 0) * 100) / 100;
    return { linhas: map, venda: soma('venda'), freteCobrado: soma('freteCobrado'), freteCusto: soma('freteCusto'), absorvido: soma('absorvido'), total: soma('total') };
  }

  // Relatório de pedidos: lista plana de TODOS os pedidos (inclui orçamento/cancelado),
  // com filtro de data (criação) e status opcional.
  async pedidos(schema: string, de: string | null, ate: string | null, status: string | null): Promise<LinhaPedidoRel[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.numero, p.criado_em, p.status, p.total, p.forma_entrega, p.forma_envio, p.entregue_em,
              c.nome cliente, v.nome vendedor
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
          AND ($3::text IS NULL OR p.status = $3)
        ORDER BY p.criado_em DESC`, [de, ate, status]);
    return linhas.map((r: any) => ({
      numero: r.numero, data: new Date(r.criado_em).toISOString(), cliente: r.cliente ?? null, vendedor: r.vendedor ?? null,
      formaEntrega: r.forma_entrega ?? 'retirada', formaEnvio: r.forma_envio ?? null, status: r.status, total: Number(r.total),
      entregueEm: r.entregue_em ? new Date(r.entregue_em).toISOString().slice(0, 10) : null,
    }));
  }

  // Volume de entregas: pedidos entregues (entregue_em preenchido) no período, pela data de entrega.
  // Uma linha por pedido — a tela agrupa por dia/semana/mês e separa por forma de entrega.
  async volumeEntregas(schema: string, de: string | null, ate: string | null): Promise<LinhaEntregaVol[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT to_char(p.entregue_em, 'YYYY-MM-DD') AS data, p.forma_entrega, p.total
         FROM "${s}".pedido p
        WHERE p.entregue_em IS NOT NULL
          AND p.status <> 'cancelado'
          AND ($1::date IS NULL OR p.entregue_em >= $1)
          AND ($2::date IS NULL OR p.entregue_em <= $2)
        ORDER BY p.entregue_em`, [de, ate]);
    return linhas.map((r: any) => ({
      data: r.data, formaEntrega: r.forma_entrega ?? 'retirada', total: Number(r.total),
    }));
  }

  async produtosVendidos(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT pi.produto_nome nome, SUM(pi.quantidade)::numeric q, SUM(pi.subtotal)::numeric total
         FROM "${s}".pedido_item pi JOIN "${s}".pedido p ON p.id = pi.pedido_id
        WHERE p.${ATIVO}
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY pi.produto_nome ORDER BY q DESC`, [de, ate]);
    return linhas.map((r: any) => ({ nome: r.nome, quantidade: Number(r.q), total: Number(r.total) }));
  }

  async curvaAbcProdutos(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT pi.produto_nome nome, SUM(pi.quantidade)::numeric q, SUM(pi.subtotal)::numeric total
         FROM "${s}".pedido_item pi JOIN "${s}".pedido p ON p.id = pi.pedido_id
        WHERE p.${ATIVO}
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY pi.produto_nome ORDER BY total DESC, q DESC`, [de, ate]);
    return linhas.map((r: any) => ({ nome: r.nome, quantidade: Number(r.q), total: Number(r.total) }));
  }

  async curvaAbcClientes(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT COALESCE(c.nome, '—') nome, COUNT(*)::numeric q, SUM(p.total)::numeric total
         FROM "${s}".pedido p LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${ATIVO}
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY COALESCE(c.nome, '—') ORDER BY total DESC, q DESC`, [de, ate]);
    return linhas.map((r: any) => ({ nome: r.nome, quantidade: Number(r.q), total: Number(r.total) }));
  }

  async validadeLotes(schema: string): Promise<LinhaValidadeLote[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT el.produto_id, pr.nome produto, el.lote, el.validade, el.quantidade saldo, el.custo_unitario
         FROM "${s}".estoque_lote el
         JOIN "${s}".produto pr ON pr.id = el.produto_id
        WHERE el.quantidade > 0
        ORDER BY el.validade NULLS LAST, pr.nome`);
    return linhas.map((r: any) => {
      const saldo = Number(r.saldo), custo = Number(r.custo_unitario);
      return {
        produtoId: r.produto_id, produto: r.produto, lote: r.lote ?? null,
        validade: r.validade ? new Date(r.validade).toISOString().slice(0, 10) : null,
        saldo, custoUnitario: custo, valor: Math.round(saldo * custo * 100) / 100,
      };
    });
  }

  async estoqueParado(schema: string): Promise<LinhaEstoqueParado[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT pr.id, pr.nome,
              COALESCE(SUM(el.quantidade),0) saldo,
              COALESCE(SUM(el.quantidade * el.custo_unitario),0) valor,
              (SELECT MAX(m.criado_em) FROM "${s}".estoque_movimento m
                WHERE m.produto_id = pr.id AND m.tipo = 'saida') ultima_saida
         FROM "${s}".produto pr
         JOIN "${s}".estoque_lote el ON el.produto_id = pr.id
        WHERE pr.ativo = true
        GROUP BY pr.id, pr.nome
        HAVING SUM(el.quantidade) > 0
        ORDER BY ultima_saida ASC NULLS FIRST, pr.nome`);
    return linhas.map((r: any) => ({
      produtoId: r.id, produto: r.nome, saldo: Number(r.saldo),
      valor: Math.round(Number(r.valor) * 100) / 100,
      ultimaSaida: r.ultima_saida ? new Date(r.ultima_saida).toISOString() : null,
    }));
  }

  // Movimentos de PERDA no período (baixa/perda + ajuste de inventário). Valor ≈ qtd × custo do lote.
  async perdasEstoque(schema: string, de: string | null, ate: string | null): Promise<LinhaPerda[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT m.produto_id, pr.nome produto, el.lote, m.quantidade, m.observacao motivo, m.criado_em,
              COALESCE(el.custo_unitario, 0) custo
         FROM "${s}".estoque_movimento m
         JOIN "${s}".produto pr ON pr.id = m.produto_id
         LEFT JOIN "${s}".estoque_lote el ON el.id = m.lote_id
        WHERE m.tipo = 'perda'
          AND ($1::date IS NULL OR m.criado_em::date >= $1)
          AND ($2::date IS NULL OR m.criado_em::date <= $2)
        ORDER BY m.criado_em DESC`, [de, ate]);
    return linhas.map((r: any) => {
      const qtd = Number(r.quantidade), custo = Number(r.custo);
      return {
        produtoId: r.produto_id, produto: r.produto, lote: r.lote ?? null, quantidade: qtd,
        motivo: r.motivo ?? null, data: new Date(r.criado_em).toISOString(),
        valor: Math.round(qtd * custo * 100) / 100,
      };
    });
  }
}
