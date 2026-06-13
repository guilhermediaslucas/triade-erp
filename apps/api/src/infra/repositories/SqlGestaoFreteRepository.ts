import type { DataSource } from 'typeorm';
import type { GestaoFreteRepository, LinhaFreteMotoboy, LinhaFretePedido } from '../../domain/comercial/GestaoFrete.js';
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
              AND p.status = 'entregue'
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY mb.id, mb.nome
        HAVING SUM(p.frete) > 0
        ORDER BY mb.nome`, [de, ate]);
    return linhas.map((r: any) => ({
      motoboyId: r.id, motoboy: r.nome, qtdPedidos: Number(r.qtd), totalFrete: Math.round(Number(r.total_frete) * 100) / 100,
    }));
  }

  async listarPedidos(schema: string, de: string | null, ate: string | null): Promise<LinhaFretePedido[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.numero, p.criado_em, c.nome AS cliente, p.forma_entrega, mb.nome AS motoboy, p.distancia_km, p.frete
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
        WHERE p.frete > 0 AND p.status = 'entregue'
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        ORDER BY p.criado_em DESC`, [de, ate]);
    return linhas.map((r: any) => ({
      numero: Number(r.numero), criadoEm: new Date(r.criado_em).toISOString(), clienteNome: r.cliente ?? null,
      formaEntrega: r.forma_entrega ?? 'motoboy', motoboy: r.motoboy ?? null,
      distanciaKm: r.distancia_km != null ? Number(r.distancia_km) : null, frete: Math.round(Number(r.frete) * 100) / 100,
    }));
  }
}
