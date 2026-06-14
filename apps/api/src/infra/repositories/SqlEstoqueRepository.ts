import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { EntradaEstoque, EstoqueRepository, LotePosicao, PosicaoProduto } from '../../domain/estoque/Estoque.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlEstoqueRepository implements EstoqueRepository {
  constructor(private readonly ds: DataSource) {}

  async posicao(schema: string): Promise<PosicaoProduto[]> {
    const s = validarSchema(schema);
    const produtos = await this.ds.query(
      `SELECT id, nome, unidade, estoque_minimo FROM "${s}".produto WHERE ativo = true ORDER BY nome`);
    const lotes = await this.ds.query(
      `SELECT el.id, el.produto_id, el.lote, el.validade, el.quantidade, el.custo_unitario, m.nome AS marca
         FROM "${s}".estoque_lote el
         LEFT JOIN "${s}".marca m ON m.id = el.marca_id
        WHERE el.quantidade > 0 ORDER BY el.validade NULLS LAST`);
    // Reservado = quantidade comprometida em pedidos JÁ confirmados mas ainda NÃO
    // separados (aguardando pagamento / aprovado). Depois da separação a baixa é
    // física (sai do saldo); orçamento é rascunho e não reserva.
    const reservas = await this.ds.query(
      `SELECT pi.produto_id, COALESCE(SUM(pi.quantidade),0) AS q
         FROM "${s}".pedido_item pi
         JOIN "${s}".pedido p ON p.id = pi.pedido_id
        WHERE p.status IN ('aguardando_pagamento','aprovado')
        GROUP BY pi.produto_id`);
    const reservaPorProduto = new Map<string, number>();
    for (const r of reservas) reservaPorProduto.set(r.produto_id, Number(r.q));
    return produtos.map((p: any) => {
      const ls: LotePosicao[] = lotes.filter((l: any) => l.produto_id === p.id).map((l: any) => ({
        id: l.id, lote: l.lote ?? null,
        validade: l.validade ? new Date(l.validade).toISOString().slice(0, 10) : null,
        quantidade: Number(l.quantidade), custoUnitario: Number(l.custo_unitario),
        marca: l.marca ?? null,
      }));
      const saldo = ls.reduce((a, l) => a + l.quantidade, 0);
      const reservado = reservaPorProduto.get(p.id) ?? 0;
      return {
        produtoId: p.id, produtoNome: p.nome, unidade: p.unidade, estoqueMinimo: p.estoque_minimo,
        saldo, abaixoMinimo: saldo < p.estoque_minimo, lotes: ls,
        reservado, disponivel: saldo - reservado,
      };
    });
  }

  async disponivel(schema: string, produtoId: string): Promise<number> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT COALESCE(SUM(quantidade),0) AS q FROM "${s}".estoque_lote WHERE produto_id = $1`, [produtoId]))[0];
    return Number(r.q);
  }

  async baixarFifo(schema: string, produtoId: string, quantidade: number, ref: string): Promise<void> {
    const s = validarSchema(schema);
    let restante = quantidade;
    const lotes = await this.ds.query(
      `SELECT id, quantidade FROM "${s}".estoque_lote
        WHERE produto_id = $1 AND quantidade > 0
        ORDER BY validade NULLS LAST, criado_em`, [produtoId]);
    for (const l of lotes) {
      if (restante <= 0) break;
      const disp = Number(l.quantidade);
      const usar = Math.min(disp, restante);
      await this.ds.query(`UPDATE "${s}".estoque_lote SET quantidade = quantidade - $2 WHERE id = $1`, [l.id, usar]);
      await this.ds.query(
        `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
         VALUES ($1, $2, $3, 'saida', $4, $5)`,
        [randomUUID(), produtoId, l.id, usar, ref]);
      restante -= usar;
    }
  }

  async saldoLote(schema: string, loteId: string): Promise<{ produtoId: string; saldo: number } | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT produto_id, quantidade FROM "${s}".estoque_lote WHERE id = $1`, [loteId]))[0];
    return r ? { produtoId: r.produto_id, saldo: Number(r.quantidade) } : null;
  }

  async baixarLote(schema: string, loteId: string, produtoId: string, quantidade: number, motivo: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".estoque_lote SET quantidade = quantidade - $2 WHERE id = $1`, [loteId, quantidade]);
    await this.ds.query(
      `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
       VALUES ($1, $2, $3, 'perda', $4, $5)`,
      [randomUUID(), produtoId, loteId, quantidade, motivo]);
  }

  async produtoExiste(schema: string, produtoId: string): Promise<boolean> {
    const s = validarSchema(schema);
    const r = await this.ds.query(`SELECT 1 FROM "${s}".produto WHERE id = $1`, [produtoId]);
    return r.length > 0;
  }

  async registrarEntrada(schema: string, e: EntradaEstoque): Promise<void> {
    const s = validarSchema(schema);
    const marcaId = e.marcaId ?? null;
    // mescla com lote existente de mesmo produto+lote+validade+marca; senão cria
    const existente = (await this.ds.query(
      `SELECT id FROM "${s}".estoque_lote
        WHERE produto_id = $1 AND COALESCE(lote,'') = COALESCE($2,'')
          AND validade IS NOT DISTINCT FROM $3::date
          AND marca_id IS NOT DISTINCT FROM $4::uuid LIMIT 1`,
      [e.produtoId, e.lote, e.validade, marcaId]))[0];
    let loteId: string;
    if (existente) {
      loteId = existente.id;
      await this.ds.query(
        `UPDATE "${s}".estoque_lote SET quantidade = quantidade + $2, custo_unitario = $3 WHERE id = $1`,
        [loteId, e.quantidade, e.custoUnitario]);
    } else {
      loteId = randomUUID();
      await this.ds.query(
        `INSERT INTO "${s}".estoque_lote (id, produto_id, lote, validade, quantidade, custo_unitario, marca_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [loteId, e.produtoId, e.lote, e.validade, e.quantidade, e.custoUnitario, marcaId]);
    }
    await this.ds.query(
      `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
       VALUES ($1,$2,$3,'entrada',$4,$5)`,
      [randomUUID(), e.produtoId, loteId, e.quantidade, 'Entrada de estoque']);
    // Registra as etiquetas (codigos ja afixados nos produtos) bipadas nesta entrada.
    // O sistema NAO gera codigos: insere os que vieram da leitura, vinculando ao lote.
    for (const codigo of e.codigos ?? []) {
      await this.ds.query(
        `INSERT INTO "${s}".etiqueta (id, codigo, produto_id, lote_id, status, fornecedor, nf, emissao)
         VALUES ($1,$2,$3,$4,'estoque',$5,$6,$7) ON CONFLICT (codigo) DO NOTHING`,
        [randomUUID(), codigo, e.produtoId, loteId, e.fornecedor ?? null, e.nf ?? null, e.emissao ?? null]);
    }
  }

  async baixarUnidadeLote(schema: string, loteId: string, produtoId: string, ref: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".estoque_lote SET quantidade = quantidade - 1 WHERE id = $1`, [loteId]);
    await this.ds.query(
      `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
       VALUES ($1, $2, $3, 'saida', 1, $4)`,
      [randomUUID(), produtoId, loteId, ref]);
  }

  async baixarUnidadeLotePerda(schema: string, loteId: string, produtoId: string, motivo: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".estoque_lote SET quantidade = quantidade - 1 WHERE id = $1`, [loteId]);
    await this.ds.query(
      `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
       VALUES ($1, $2, $3, 'perda', 1, $4)`,
      [randomUUID(), produtoId, loteId, motivo]);
  }

  // Cancelamento de pedido: repõe o saldo dos lotes que tiveram saída por este ref
  // (FIFO ou bipagem) e registra o movimento de devolução. Idempotente por flag de devolução.
  async devolverPorRef(schema: string, ref: string): Promise<void> {
    const s = validarSchema(schema);
    const saidas = await this.ds.query(
      `SELECT lote_id, produto_id, SUM(quantidade)::int AS qtd
         FROM "${s}".estoque_movimento
        WHERE tipo = 'saida' AND observacao = $1
        GROUP BY lote_id, produto_id`, [ref]);
    for (const m of saidas) {
      await this.ds.query(`UPDATE "${s}".estoque_lote SET quantidade = quantidade + $2 WHERE id = $1`, [m.lote_id, Number(m.qtd)]);
      await this.ds.query(
        `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
         VALUES ($1, $2, $3, 'entrada', $4, $5)`,
        [randomUUID(), m.produto_id, m.lote_id, Number(m.qtd), 'Devolução ' + ref]);
    }
    // Remove os movimentos de saída originais para não devolver duas vezes em novo cancelamento.
    await this.ds.query(`DELETE FROM "${s}".estoque_movimento WHERE tipo = 'saida' AND observacao = $1`, [ref]);
  }
}
