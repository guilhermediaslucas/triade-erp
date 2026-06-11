import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { MovimentoFluxo, NovoTitulo, PagoOrigem, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import { validarSchema } from '../tenant/validarSchema.js';

const iso = (d: any) => (d ? new Date(d).toISOString() : null);
const dataISO = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function map(r: any): Titulo {
  return {
    id: r.id, tipo: r.tipo, descricao: r.descricao, pessoaNome: r.pessoa_nome ?? null,
    valor: Number(r.valor), vencimento: dataISO(r.vencimento), status: r.status,
    formaPagamento: r.forma_pagamento ?? null, pagoEm: iso(r.pago_em), origem: r.origem,
    pedidoId: r.pedido_id ?? null,
    categoriaFinanceiraId: r.categoria_financeira_id ?? null, categoriaFinanceiraNome: r.categoria_financeira_nome ?? null,
    criadoEm: iso(r.criado_em)!,
  };
}

export class SqlTituloRepository implements TituloRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPagos(schema: string): Promise<MovimentoFluxo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT tipo, descricao, pessoa_nome, valor, forma_pagamento, pago_em
         FROM "${s}".titulo WHERE status = 'pago' AND pago_em IS NOT NULL ORDER BY pago_em`);
    return linhas.map((r: any) => ({
      data: iso(r.pago_em)!, tipo: r.tipo === 'receber' ? 'entrada' : 'saida',
      descricao: r.descricao, pessoaNome: r.pessoa_nome ?? null, valor: Number(r.valor),
      formaPagamento: r.forma_pagamento ?? null,
    }));
  }

  // Soma dos títulos pagos por tipo + origem, no período (pela data de pagamento).
  async pagosPorOrigem(schema: string, de: string | null, ate: string | null): Promise<PagoOrigem[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT tipo, origem, SUM(valor)::numeric total
         FROM "${s}".titulo
        WHERE status = 'pago' AND pago_em IS NOT NULL
          AND ($1::date IS NULL OR pago_em::date >= $1)
          AND ($2::date IS NULL OR pago_em::date <= $2)
        GROUP BY tipo, origem`, [de, ate]);
    return linhas.map((r: any) => ({ tipo: r.tipo, origem: r.origem, total: Number(r.total) }));
  }

  async listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(
      `SELECT t.*, cf.nome AS categoria_financeira_nome
         FROM "${s}".titulo t
         LEFT JOIN "${s}".categoria_financeira cf ON cf.id = t.categoria_financeira_id
        WHERE t.tipo = $1 ORDER BY t.vencimento`, [tipo])).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Titulo | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".titulo WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, t: NovoTitulo, origem: string, pedidoId: string | null): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".titulo (id, tipo, descricao, pessoa_nome, valor, vencimento, origem, pedido_id, categoria_financeira_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, t.tipo, t.descricao, t.pessoaNome, t.valor, t.vencimento, origem, pedidoId, t.categoriaFinanceiraId ?? null]);
    return id;
  }
  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET status='pago', forma_pagamento=$2, conta_corrente_id=$3, pago_em=now() WHERE id=$1`, [id, formaPagamento, contaCorrenteId]);
  }
  async cancelarBaixa(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET status='aberto', forma_pagamento=NULL, conta_corrente_id=NULL, pago_em=NULL WHERE id=$1`, [id]);
  }
  async excluir(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".titulo WHERE id=$1`, [id]);
  }
  async criarParcelasDePedido(schema: string, descricao: string, pessoaNome: string | null, valorTotal: number, pedidoId: string, parcelas: number, intervaloDias: number): Promise<void> {
    const s = validarSchema(schema);
    const n = Math.max(1, parcelas);
    const base = Math.floor((valorTotal / n) * 100) / 100;
    for (let i = 1; i <= n; i++) {
      const valor = i === n ? Math.round((valorTotal - base * (n - 1)) * 100) / 100 : base;
      const desc = n > 1 ? `${descricao} (${i}/${n})` : descricao;
      const dias = i * intervaloDias;
      await this.ds.query(
        `INSERT INTO "${s}".titulo (id, tipo, descricao, pessoa_nome, valor, vencimento, origem, pedido_id)
         VALUES ($1,'receber',$2,$3,$4,(CURRENT_DATE + $5::int),'pedido',$6)`,
        [randomUUID(), desc, pessoaNome, valor, dias, pedidoId]);
    }
  }
}
