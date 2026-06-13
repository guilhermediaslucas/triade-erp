import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { LinhaConciliacao, MovimentoFluxo, NovoTitulo, PagoAgrupado, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import { validarSchema } from '../tenant/validarSchema.js';

const iso = (d: any) => (d ? new Date(d).toISOString() : null);
const dataISO = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function numeroFmt(tipo: TipoTitulo, n: any): string {
  if (n == null) return '—';
  return (tipo === 'receber' ? 'REC-' : 'PAG-') + String(n).padStart(6, '0');
}

function map(r: any): Titulo {
  return {
    id: r.id, numero: numeroFmt(r.tipo, r.numero), tipo: r.tipo, descricao: r.descricao, pessoaNome: r.pessoa_nome ?? null,
    valor: Number(r.valor), vencimento: dataISO(r.vencimento), status: r.status,
    formaPagamento: r.forma_pagamento ?? null, pagoEm: iso(r.pago_em), origem: r.origem,
    pedidoId: r.pedido_id ?? null,
    categoriaFinanceiraId: r.categoria_financeira_id ?? null, categoriaFinanceiraNome: r.categoria_financeira_nome ?? null,
    favorecidoId: r.favorecido_id ?? null, favorecidoNome: r.favorecido_nome ?? null,
    vendedorNome: r.vendedor_nome ?? null,
    previsto: r.previsto === true,
    tipoDocumento: r.tipo_documento ?? null,
    numeroDocumento: r.numero_documento ?? null,
    emissao: r.emissao ? dataISO(r.emissao) : null,
    contaCorrenteNome: r.conta_corrente_nome ?? null,
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
  async pagosPorOrigem(schema: string, de: string | null, ate: string | null): Promise<PagoAgrupado[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT tipo, origem chave, SUM(valor)::numeric total
         FROM "${s}".titulo
        WHERE status = 'pago' AND pago_em IS NOT NULL
          AND ($1::date IS NULL OR pago_em::date >= $1)
          AND ($2::date IS NULL OR pago_em::date <= $2)
        GROUP BY tipo, origem`, [de, ate]);
    return linhas.map((r: any) => ({ tipo: r.tipo, chave: r.chave, total: Number(r.total) }));
  }

  // Soma dos títulos pagos por tipo + categoria financeira (sem categoria cai em "—").
  async pagosPorCategoria(schema: string, de: string | null, ate: string | null): Promise<PagoAgrupado[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT t.tipo, COALESCE(cf.nome, '—') chave, SUM(t.valor)::numeric total
         FROM "${s}".titulo t
         LEFT JOIN "${s}".categoria_financeira cf ON cf.id = t.categoria_financeira_id
        WHERE t.status = 'pago' AND t.pago_em IS NOT NULL
          AND ($1::date IS NULL OR t.pago_em::date >= $1)
          AND ($2::date IS NULL OR t.pago_em::date <= $2)
        GROUP BY t.tipo, COALESCE(cf.nome, '—')`, [de, ate]);
    return linhas.map((r: any) => ({ tipo: r.tipo, chave: r.chave, total: Number(r.total) }));
  }

  async listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(
      `SELECT t.*, cf.nome AS categoria_financeira_nome, fv.nome AS favorecido_nome, vd.nome AS vendedor_nome, cc.nome AS conta_corrente_nome
         FROM "${s}".titulo t
         LEFT JOIN "${s}".categoria_financeira cf ON cf.id = t.categoria_financeira_id
         LEFT JOIN "${s}".favorecido fv ON fv.id = t.favorecido_id
         LEFT JOIN "${s}".pedido pd ON pd.id = t.pedido_id
         LEFT JOIN "${s}".vendedor vd ON vd.id = pd.vendedor_id
         LEFT JOIN "${s}".conta_corrente cc ON cc.id = t.conta_corrente_id
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
      `INSERT INTO "${s}".titulo (id, numero, tipo, descricao, pessoa_nome, valor, vencimento, origem, pedido_id, categoria_financeira_id, favorecido_id, previsto, tipo_documento, numero_documento, emissao)
       VALUES ($1, nextval('"${s}".titulo_numero_seq'), $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, COALESCE($14, CURRENT_DATE))`,
      [id, t.tipo, t.descricao, t.pessoaNome, t.valor, t.vencimento, origem, pedidoId, t.categoriaFinanceiraId ?? null, t.favorecidoId ?? null, t.previsto === true, t.tipoDocumento ?? null, t.numeroDocumento ?? null, t.emissao ?? null]);
    return id;
  }
  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null, dataBaixa?: string | null): Promise<void> {
    const s = validarSchema(schema);
    // Data da baixa: usa a informada (YYYY-MM-DD) ou agora.
    await this.ds.query(`UPDATE "${s}".titulo SET status='pago', forma_pagamento=$2, conta_corrente_id=$3, pago_em=COALESCE($4::timestamptz, now()) WHERE id=$1`, [id, formaPagamento, contaCorrenteId, dataBaixa || null]);
  }
  async definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET previsto=$2 WHERE id=$1`, [id, previsto]);
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
        `INSERT INTO "${s}".titulo (id, numero, tipo, descricao, pessoa_nome, valor, vencimento, origem, pedido_id)
         VALUES ($1, nextval('"${s}".titulo_numero_seq'),'receber',$2,$3,$4,(CURRENT_DATE + $5::int),'pedido',$6)`,
        [randomUUID(), desc, pessoaNome, valor, dias, pedidoId]);
    }
  }

  async conciliacao(schema: string, contaCorrenteId: string, de: string | null, ate: string | null): Promise<LinhaConciliacao[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT id, tipo, descricao, pessoa_nome, valor, pago_em, conciliado
         FROM "${s}".titulo
        WHERE status = 'pago' AND conta_corrente_id = $1
          AND ($2::date IS NULL OR pago_em::date >= $2)
          AND ($3::date IS NULL OR pago_em::date <= $3)
        ORDER BY pago_em`, [contaCorrenteId, de, ate]);
    return linhas.map((r: any) => ({
      id: r.id, tipo: r.tipo, descricao: r.descricao, pessoaNome: r.pessoa_nome ?? null,
      valor: Number(r.valor), pagoEm: iso(r.pago_em)!, conciliado: r.conciliado,
    }));
  }

  async definirConciliado(schema: string, id: string, conciliado: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".titulo SET conciliado = $2, conciliado_em = CASE WHEN $2 THEN now() ELSE NULL END WHERE id = $1`,
      [id, conciliado]);
  }
}
