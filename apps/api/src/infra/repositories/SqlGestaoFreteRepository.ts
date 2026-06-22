import type { DataSource } from 'typeorm';
import type { GestaoFreteRepository, LinhaFreteMotoboy, LinhaFretePedido, PedidoParaGerar } from '../../domain/comercial/GestaoFrete.js';
import { validarSchema } from '../tenant/validarSchema.js';

const PAGO = `COALESCE(p.frete_motoboy, p.frete_custo, p.frete)`;

export class SqlGestaoFreteRepository implements GestaoFreteRepository {
  constructor(private readonly ds: DataSource) {}
  async apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaFreteMotoboy[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT mb.id, mb.nome, COUNT(p.id) qtd, COALESCE(SUM(COALESCE(p.frete_motoboy, p.frete_custo, p.frete)),0) total_frete
         FROM "${s}".motoboy mb
         JOIN "${s}".pedido p ON p.motoboy_id = mb.id
              AND p.forma_entrega = 'motoboy'
              AND p.status = 'entregue'
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY mb.id, mb.nome
        HAVING SUM(COALESCE(p.frete_motoboy, p.frete_custo, p.frete)) > 0
        ORDER BY mb.nome`, [de, ate]);
    return linhas.map((r: any) => ({
      motoboyId: r.id, motoboy: r.nome, qtdPedidos: Number(r.qtd), totalFrete: Math.round(Number(r.total_frete) * 100) / 100,
    }));
  }

  async listarPedidos(schema: string, de: string | null, ate: string | null, gerado: boolean | null): Promise<LinhaFretePedido[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id, p.numero, p.criado_em, c.nome AS cliente, p.forma_entrega, mb.nome AS motoboy, p.distancia_km,
              ${PAGO} AS pago, p.frete_gerado
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
        WHERE p.forma_entrega = 'motoboy' AND p.status = 'entregue' AND ${PAGO} > 0
          AND ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
          AND ($3::boolean IS NULL OR p.frete_gerado = $3)
        ORDER BY p.criado_em DESC`, [de, ate, gerado]);
    return linhas.map((r: any) => ({
      id: r.id, numero: Number(r.numero), criadoEm: new Date(r.criado_em).toISOString(), clienteNome: r.cliente ?? null,
      formaEntrega: r.forma_entrega ?? 'motoboy', motoboy: r.motoboy ?? null,
      distanciaKm: r.distancia_km != null ? Number(r.distancia_km) : null,
      frete: Math.round(Number(r.pago) * 100) / 100, gerado: r.frete_gerado === true,
    }));
  }

  async pedidosParaGerar(schema: string, ids: string[]): Promise<PedidoParaGerar[]> {
    const s = validarSchema(schema);
    if (!ids.length) return [];
    const linhas = await this.ds.query(
      `SELECT p.id, p.motoboy_id, mb.nome AS motoboy, ${PAGO} AS pago
         FROM "${s}".pedido p
         JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
        WHERE p.id = ANY($1) AND p.forma_entrega = 'motoboy' AND p.status = 'entregue'
          AND p.frete_gerado = false AND ${PAGO} > 0`, [ids]);
    return linhas.map((r: any) => ({ id: r.id, motoboyId: r.motoboy_id, motoboy: r.motoboy, valor: Math.round(Number(r.pago) * 100) / 100 }));
  }

  async marcarGerado(schema: string, ids: string[], tituloId: string | null): Promise<void> {
    const s = validarSchema(schema);
    if (!ids.length) return;
    await this.ds.query(`UPDATE "${s}".pedido SET frete_gerado = true, frete_titulo_id = $2 WHERE id = ANY($1)`, [ids, tituloId]);
  }
}
