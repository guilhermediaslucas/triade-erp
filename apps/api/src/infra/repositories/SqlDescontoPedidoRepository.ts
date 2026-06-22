import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { DadosDescontoPedido, DescontoPedido, DescontoPedidoRepository } from '../../domain/comercial/DescontoPedido.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapear(r: any): DescontoPedido {
  return {
    id: r.id, clienteId: r.cliente_id, clienteNome: r.cliente_nome ?? null,
    tipo: r.tipo === 'fixo' ? 'fixo' : 'percentual', valor: Number(r.valor), minimo: Number(r.minimo), motivo: r.motivo ?? null,
    de: r.de instanceof Date ? r.de.toISOString().slice(0, 10) : String(r.de).slice(0, 10),
    ate: r.ate instanceof Date ? r.ate.toISOString().slice(0, 10) : String(r.ate).slice(0, 10),
    vigente: r.vigente === true,
  };
}

export class SqlDescontoPedidoRepository implements DescontoPedidoRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<DescontoPedido[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(
      `SELECT dp.*, c.nome cliente_nome, (CURRENT_DATE BETWEEN dp.de AND dp.ate) vigente
         FROM "${s}".desconto_pedido dp
         LEFT JOIN "${s}".cliente c ON c.id = dp.cliente_id
        ORDER BY dp.de DESC`)).map(mapear);
  }

  async criar(schema: string, d: DadosDescontoPedido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".desconto_pedido (id, cliente_id, tipo, valor, minimo, motivo, de, ate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), d.clienteId, d.tipo, d.valor, d.minimo, d.motivo, d.de, d.ate]);
  }

  async atualizar(schema: string, id: string, d: DadosDescontoPedido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".desconto_pedido SET cliente_id=$2, tipo=$3, valor=$4, minimo=$5, motivo=$6, de=$7, ate=$8 WHERE id=$1`,
      [id, d.clienteId, d.tipo, d.valor, d.minimo, d.motivo, d.de, d.ate]);
  }

  async remover(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".desconto_pedido WHERE id = $1`, [id]);
  }

  async descontoVigente(schema: string, clienteId: string, subtotal: number): Promise<number> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT tipo, valor, minimo FROM "${s}".desconto_pedido
        WHERE (cliente_id = $1 OR cliente_id IS NULL) AND CURRENT_DATE BETWEEN de AND ate AND $2 >= minimo
        ORDER BY (cliente_id IS NOT NULL) DESC, de DESC LIMIT 1`, [clienteId, subtotal]))[0];
    if (!r) return 0;
    const desc = r.tipo === 'fixo' ? Number(r.valor) : Math.round(subtotal * Number(r.valor) / 100 * 100) / 100;
    return Math.max(0, Math.min(subtotal, desc));
  }
}
