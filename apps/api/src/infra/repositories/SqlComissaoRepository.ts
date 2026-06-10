import type { DataSource } from 'typeorm';
import type { ComissaoRepository, LinhaComissao } from '../../domain/financeiro/Comissao.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlComissaoRepository implements ComissaoRepository {
  constructor(private readonly ds: DataSource) {}
  async apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaComissao[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT v.id, v.nome, v.comissao_percentual pct, COALESCE(SUM(p.total),0) vendido
         FROM "${s}".vendedor v
         JOIN "${s}".pedido p ON p.vendedor_id = v.id AND p.status NOT IN ('orcamento','cancelado')
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY v.id, v.nome, v.comissao_percentual
        HAVING SUM(p.total) > 0
        ORDER BY v.nome`, [de, ate]);
    return linhas.map((r: any) => {
      const vendido = Number(r.vendido), pct = Number(r.pct);
      return { vendedorId: r.id, vendedor: r.nome, percentual: pct, vendido, comissao: Math.round(vendido * pct) / 100 };
    });
  }
}
