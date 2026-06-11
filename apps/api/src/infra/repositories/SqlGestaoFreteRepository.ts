import type { DataSource } from 'typeorm';
import type { GestaoFreteRepository, LinhaFreteMotoboy } from '../../domain/comercial/GestaoFrete.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlGestaoFreteRepository implements GestaoFreteRepository {
  constructor(private readonly ds: DataSource) {}
  async apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaFreteMotoboy[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT mb.id, mb.nome, COUNT(p.id) qtd, COALESCE(SUM(p.frete),0) total_frete
         FROM "${s}".motoboy mb
         JOIN "${s}".pedido p ON p.motoboy_id = mb.id
              AND p.forma_entrega = 'motoboy'
              AND p.status NOT IN ('orcamento','cancelado')
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY mb.id, mb.nome
        HAVING SUM(p.frete) > 0
        ORDER BY mb.nome`, [de, ate]);
    return linhas.map((r: any) => ({
      motoboyId: r.id, motoboy: r.nome, qtdPedidos: Number(r.qtd), totalFrete: Math.round(Number(r.total_frete) * 100) / 100,
    }));
  }
}
