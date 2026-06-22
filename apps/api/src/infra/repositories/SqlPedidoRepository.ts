import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { HistFormaEntrega, NovoPedido, Pedido, PedidoRepository, PedidoResumo, StatusPedido } from '../../domain/comercial/Pedido.js';
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
                                  forma_entrega, motoboy_id, distancia_km, subtotal, frete, total, condicao_parcelas, condicao_intervalo, frete_custo, frete_motoboy, desconto)
       VALUES ($1,$2,$3,$4,'orcamento',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [id, numero, p.clienteId, p.vendedorId, p.formaPagamento, p.observacao, p.enderecoEntrega,
       p.formaEntrega, p.motoboyId, p.distanciaKm, p.subtotal, p.frete, p.total, p.condicaoParcelas, p.condicaoIntervalo, p.freteCusto, p.freteMotoboy, p.desconto]);
    for (const it of p.itens) {
      await this.ds.query(
        `INSERT INTO "${s}".pedido_item (id, pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), id, it.produtoId, it.produtoNome, it.quantidade, it.precoUnitario, it.subtotal]);
    }
    return id;
  }

  // Edita um pedido (só usado enquanto está em orçamento): atualiza os dados e
  // recria os itens. O número e o status (orçamento) não mudam aqui.
  async editar(schema: string, id: string, p: NovoPedido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".pedido
          SET cliente_id = $2, vendedor_id = $3, forma_pagamento = $4, observacao = $5, endereco_entrega = $6,
              forma_entrega = $7, motoboy_id = $8, distancia_km = $9, subtotal = $10, frete = $11, total = $12,
              condicao_parcelas = $13, condicao_intervalo = $14, frete_custo = $15, frete_motoboy = $16, desconto = $17
        WHERE id = $1`,
      [id, p.clienteId, p.vendedorId, p.formaPagamento, p.observacao, p.enderecoEntrega,
       p.formaEntrega, p.motoboyId, p.distanciaKm, p.subtotal, p.frete, p.total, p.condicaoParcelas, p.condicaoIntervalo, p.freteCusto, p.freteMotoboy, p.desconto]);
    await this.ds.query(`DELETE FROM "${s}".pedido_item WHERE pedido_id = $1`, [id]);
    for (const it of p.itens) {
      await this.ds.query(
        `INSERT INTO "${s}".pedido_item (id, pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), id, it.produtoId, it.produtoNome, it.quantidade, it.precoUnitario, it.subtotal]);
    }
  }

  async listar(schema: string): Promise<PedidoResumo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id, p.numero, p.status, p.total, p.criado_em, p.forma_entrega, p.forma_pagamento,
              c.nome AS cliente_nome, v.nome AS vendedor_nome
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
        ORDER BY p.numero DESC`);
    return linhas.map((r: any) => ({
      id: r.id, numero: r.numero, clienteNome: r.cliente_nome ?? null, vendedorNome: r.vendedor_nome ?? null,
      status: r.status, total: Number(r.total), criadoEm: new Date(r.criado_em), formaEntrega: r.forma_entrega ?? 'retirada',
      formaPagamento: r.forma_pagamento ?? null,
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
    return this.montar(s, r);
  }

  async buscarPorNumero(schema: string, numero: number): Promise<Pedido | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT p.*, c.nome AS cliente_nome, v.nome AS vendedor_nome, mb.nome AS motoboy_nome
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".vendedor v ON v.id = p.vendedor_id
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
        WHERE p.numero = $1`, [numero]))[0];
    if (!r) return null;
    return this.montar(s, r);
  }

  private async montar(s: string, r: any): Promise<Pedido> {
    const id = r.id;
    const itens = await this.ds.query(`SELECT * FROM "${s}".pedido_item WHERE pedido_id = $1`, [id]);

    // Lotes consumidos na separação (rastreabilidade): movimentos de saída deste pedido,
    // identificados pela observação = ref do pedido. Agrupa lote+validade por produto.
    const ref = 'Pedido PE-' + String(r.numero).padStart(6, '0');
    const movs = await this.ds.query(
      `SELECT m.produto_id, l.lote, l.validade
         FROM "${s}".estoque_movimento m
         JOIN "${s}".estoque_lote l ON l.id = m.lote_id
        WHERE m.tipo = 'saida' AND m.observacao = $1
        GROUP BY m.produto_id, l.lote, l.validade
        ORDER BY l.validade NULLS LAST`, [ref]);
    const lotesPorProduto = new Map<string, { lote: string; validade: string | null }[]>();
    for (const m of movs) {
      const lista = lotesPorProduto.get(m.produto_id) ?? [];
      lista.push({ lote: m.lote, validade: m.validade ? new Date(m.validade).toISOString().slice(0, 10) : null });
      lotesPorProduto.set(m.produto_id, lista);
    }

    return {
      id: r.id, numero: r.numero, clienteId: r.cliente_id ?? null, clienteNome: r.cliente_nome ?? null,
      vendedorId: r.vendedor_id ?? null, vendedorNome: r.vendedor_nome ?? null, status: r.status,
      formaPagamento: r.forma_pagamento ?? null, observacao: r.observacao ?? null, enderecoEntrega: r.endereco_entrega ?? null,
      formaEntrega: r.forma_entrega ?? 'retirada', motoboyId: r.motoboy_id ?? null, motoboyNome: r.motoboy_nome ?? null,
      distanciaKm: r.distancia_km != null ? Number(r.distancia_km) : null,
      formaEnvio: r.forma_envio ?? null, formaEnvioDetalhe: r.forma_envio_detalhe ?? null,
      entregueEm: r.entregue_em ? new Date(r.entregue_em).toISOString().slice(0, 10) : null,
      separadoPor: r.separado_por ?? null, separadoEm: r.separado_em ? new Date(r.separado_em).toISOString() : null,
      expedidoPor: r.expedido_por ?? null, expedidoEm: r.expedido_em ? new Date(r.expedido_em).toISOString() : null,
      recebidoPor: r.recebido_por ?? null,
      subtotal: Number(r.subtotal), desconto: Number(r.desconto ?? 0), frete: Number(r.frete), freteCusto: Number(r.frete_custo ?? r.frete ?? 0), total: Number(r.total),
      condicaoParcelas: r.condicao_parcelas ?? 1, condicaoIntervalo: r.condicao_intervalo ?? 30, criadoEm: new Date(r.criado_em),
      itens: itens.map((i: any) => ({
        id: i.id, produtoId: i.produto_id ?? null, produtoNome: i.produto_nome,
        quantidade: Number(i.quantidade), precoUnitario: Number(i.preco_unitario), subtotal: Number(i.subtotal),
        lotes: i.produto_id ? (lotesPorProduto.get(i.produto_id) ?? []) : [],
      })),
    };
  }

  async mudarStatus(schema: string, id: string, status: StatusPedido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET status = $2 WHERE id = $1`, [id, status]);
  }
  async definirExpedicao(schema: string, id: string, formaEnvio: string, detalhe: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET forma_envio = $2, forma_envio_detalhe = $3 WHERE id = $1`, [id, formaEnvio, detalhe]);
  }
  async definirMotoboy(schema: string, id: string, motoboyId: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET motoboy_id = $2 WHERE id = $1`, [id, motoboyId]);
  }
  async alterarFormaEntrega(schema: string, id: string, forma: string, motoboyId: string | null, hist: HistFormaEntrega): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET forma_entrega = $2, motoboy_id = $3 WHERE id = $1`, [id, forma, motoboyId]);
    await this.ds.query(
      `INSERT INTO "${s}".forma_entrega_historico (id, pedido_id, de, para, justificativa, usuario_nome)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), id, hist.de, hist.para, hist.justificativa, hist.usuarioNome]);
  }
  async historicoFormaEntrega(schema: string, id: string): Promise<HistFormaEntrega[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT de, para, justificativa, usuario_nome, criado_em FROM "${s}".forma_entrega_historico WHERE pedido_id = $1 ORDER BY criado_em DESC`, [id]);
    return rs.map((r: any) => ({ de: r.de, para: r.para, justificativa: r.justificativa, usuarioNome: r.usuario_nome ?? null, criadoEm: new Date(r.criado_em).toISOString() }));
  }
  async definirEntrega(schema: string, id: string, entregueEm: string, recebidoPor: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET entregue_em = $2, recebido_por = $3 WHERE id = $1`, [id, entregueEm, recebidoPor]);
  }
  async logSeparacao(schema: string, id: string, ator: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET separado_por = $2, separado_em = now() WHERE id = $1`, [id, ator]);
  }
  async logExpedicao(schema: string, id: string, ator: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".pedido SET expedido_por = $2, expedido_em = now() WHERE id = $1`, [id, ator]);
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
