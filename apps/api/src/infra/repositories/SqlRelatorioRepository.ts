import type { DataSource } from 'typeorm';
import type { LinhaProduto, RelatorioRepository, RelatorioVendas } from '../../domain/relatorio/Relatorio.js';
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
}
