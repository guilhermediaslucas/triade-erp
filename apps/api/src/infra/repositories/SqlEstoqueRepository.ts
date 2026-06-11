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
      `SELECT id, produto_id, lote, validade, quantidade, custo_unitario
         FROM "${s}".estoque_lote WHERE quantidade > 0 ORDER BY validade NULLS LAST`);
    return produtos.map((p: any) => {
      const ls: LotePosicao[] = lotes.filter((l: any) => l.produto_id === p.id).map((l: any) => ({
        id: l.id, lote: l.lote ?? null,
        validade: l.validade ? new Date(l.validade).toISOString().slice(0, 10) : null,
        quantidade: Number(l.quantidade), custoUnitario: Number(l.custo_unitario),
      }));
      const saldo = ls.reduce((a, l) => a + l.quantidade, 0);
      return {
        produtoId: p.id, produtoNome: p.nome, unidade: p.unidade, estoqueMinimo: p.estoque_minimo,
        saldo, abaixoMinimo: saldo < p.estoque_minimo, lotes: ls,
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
    // mescla com lote existente de mesmo produto+lote+validade; senão cria
    const existente = (await this.ds.query(
      `SELECT id FROM "${s}".estoque_lote
        WHERE produto_id = $1 AND COALESCE(lote,'') = COALESCE($2,'')
          AND validade IS NOT DISTINCT FROM $3::date LIMIT 1`,
      [e.produtoId, e.lote, e.validade]))[0];
    let loteId: string;
    if (existente) {
      loteId = existente.id;
      await this.ds.query(
        `UPDATE "${s}".estoque_lote SET quantidade = quantidade + $2, custo_unitario = $3 WHERE id = $1`,
        [loteId, e.quantidade, e.custoUnitario]);
    } else {
      loteId = randomUUID();
      await this.ds.query(
        `INSERT INTO "${s}".estoque_lote (id, produto_id, lote, validade, quantidade, custo_unitario)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [loteId, e.produtoId, e.lote, e.validade, e.quantidade, e.custoUnitario]);
    }
    await this.ds.query(
      `INSERT INTO "${s}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao)
       VALUES ($1,$2,$3,'entrada',$4,$5)`,
      [randomUUID(), e.produtoId, loteId, e.quantidade, 'Entrada de estoque']);
    // Registra as etiquetas (codigos ja afixados nos produtos) bipadas nesta entrada.
    // O sistema NAO gera codigos: insere os que vieram da leitura, vinculando ao lote.
    for (const codigo of e.codigos ?? []) {
      await this.ds.query(
        `INSERT INTO "${s}".etiqueta (id, codigo, produto_id, lote_id, status)
         VALUES ($1,$2,$3,$4,'estoque') ON CONFLICT (codigo) DO NOTHING`,
        [randomUUID(), codigo, e.produtoId, loteId]);
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
}
