import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { NovoPedido, Pedido, PedidoRepository, PedidoResumo, StatusPedido } from '../../domain/comercial/Pedido.js';
import { validarSchema } from '../tenant/validarSchema.js';

// status que "consomem" limite de crédito (pedido em aberto, fora orçamento/cancelado/entregue)
const STATUS_ABERTO = ['aguardando_pagamento', 'aprovado', 'separacao', 'expedido'];

export class SqlPedidoRepository implements PedidoRepository {
  constructor(private readonly ds: DataSource) {}

  async proximoNumero(schema: string): Promise<number> {
    const s = validarSchema(schema);
    const r = await this.ds.query(`SELECT nextval('"${s}".pedido_numero_seq') AS n`);
    return Number(r[0].n);
  }

  async criar(schema: string, numero: number, p: NovoPedido): Promise<string> {
    const s = validarSchema(schema);
    const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".pedido (id, numero, cliente_id, vendedor_id, status, forma_pagamento, observacao, endereco_entrega,
                                  forma_entrega, motoboy_id, distancia_km, subtotal, frete, total, condicao_parcelas, condicao_intervalo)
       VALUES ($1,$2,$3,$4,'orcamento',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [id, numero, p.clienteId, p.vendedorId, p.formaPagamento, p.observacao, p.enderecoEntrega,
       p.formaEntrega, p.motoboyId, p.distanciaKm, p.subtotal, p.frete, p.total, p.condicaoParcelas, p.condicaoIntervalo]);
    for (const it of p.itens) {
      await this.ds.query(
        `INSERT INTO "${s}".pedido_item (id, pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), id, it.produtoId, it.produtoNome, it.quantidade, it.precoUnitario, it.subtotal]);
    }
    return id;
  }

  async listar(schema: string): Promise<PedidoResumo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id, p.numero, p.status, p.total, p.criado_em,
              c.nome AS cliente_nome, v.nome AS vendedor_nome
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        ORDER BY p.numero DESC`);
    return linhas.map((r: any) => ({
      id: r.id, numero: r.numero, clienteNome: r.cliente_nome ?? null, vendedorNome: r.vendedor_nome ?? null,
      status: r.status, total: Number(r.total), criadoEm: new Date(r.criado_em),
    }));
  }

  async buscarPorId(schema: string, id: string): Promise<Pedido | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT p.*, c.nome AS cliente_nome, v.nome AS vendedor_nome, mb.nome AS motoboy_nome
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
        WHERE p.id = $1`, [id]))[0];
    if (!r) return null;
    const itens = await this.ds.query(`SELECT * FROM "${s}".pedido_item WHERE pedido_id = $1`, [id]);
    return {
      id: r.id, numero: r.numero, clienteId: r.cliente_id ?? null, clienteNome: r.cliente_nome ?? null,
      vendedorId: r.vendedor_id ?? null, vendedorNome: r.vendedor_nome ?? null, status: r.status,
      formaPagamento: r.forma_pagamento ?? null, observacao: r.observacao ?? null, enderecoEntrega: r.endereco_entrega ?? null,
      formaEntrega: r.forma_entrega ?? 'retirada', motoboyId: r.motoboy_id ?? null, motoboyNome: r.motoboy_nome ?? null,
      distanciaKm: r.distancia_km != null ? Number(r.distancia_km) : null,
      subtotal: Number(r.subtotal), frete: Number(r.frete), total: Number(r.total),
      condicaoParcelas: r.condicao_parcelas ?? 1, condicaoIntervalo: r.condicao_intervalo ?? 30, criadoEm: new Date(r.criado_em),
      itens: itens.map((i: any) => ({
        id: i.id, produtoId: i.produto_id ?? null, produtoNome: i.produto_nome,
        quantidade: Number(i.quantidade), precoUnitario: Number(i.preco_unitario), subtotal: Number(i.subtotal),
      })),
    };
  }

  async mudarStatus(schema: string, id: string, status: StatusPedido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET status = $2 WHERE id = $1`, [id, status]);
  }

  async somaEmAberto(schema: string, clienteId: string, excetoPedidoId: string): Promise<number> {
    const s = validarSchema(schema);
    const r = await this.ds.query(
      `SELECT COALESCE(SUM(total),0) AS s FROM "${s}".pedido
        WHERE cliente_id = $1 AND id <> $2 AND status = ANY($3)`,
      [clienteId, excetoPedidoId, STATUS_ABERTO]);
    return Number(r[0].s);
  }
}
