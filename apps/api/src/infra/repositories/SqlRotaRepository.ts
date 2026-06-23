import type { DataSource } from 'typeorm';
import type { ParadaRota, RotaRepository } from '../../domain/logistica/Rota.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlRotaRepository implements RotaRepository {
  constructor(private readonly ds: DataSource) {}

  async entregasDoMotoboy(schema: string, motoboyId: string): Promise<ParadaRota[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, p.endereco_entrega, p.ordem_rota
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.motoboy_id = $1 AND p.forma_entrega = 'motoboy' AND p.status = 'expedido' AND p.entrega_status <> 'entregue'
        ORDER BY p.ordem_rota NULLS LAST, p.criado_em`, [motoboyId]);
    return rs.map((r: any): ParadaRota => ({
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null,
      enderecoEntrega: r.endereco_entrega ?? null, ordemRota: r.ordem_rota != null ? Number(r.ordem_rota) : null,
    }));
  }

  async definirOrdem(schema: string, itens: { pedidoId: string; ordem: number }[]): Promise<void> {
    const s = validarSchema(schema);
    for (const it of itens) {
      await this.ds.query(`UPDATE "${s}".pedido SET ordem_rota = $2 WHERE id = $1`, [it.pedidoId, it.ordem]);
    }
  }
}
