import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { AjustesBaixa, LinhaConciliacao, MovimentoFluxo, NovoTitulo, PagoAgrupado, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
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
    pedidoFormaPagamento: r.pedido_forma_pagamento ?? null,
    pedidoFrete: r.pedido_frete != null ? Number(r.pedido_frete) : null,
    pedidoFreteTipo: r.pedido_forma_entrega ?? null,
    anexosCount: Number(r.anexos) || 0,
    conferido: r.conferido === true,
    conferidoEm: iso(r.conferido_em),
    favorecidoForma: r.favorecido_forma ?? null,
    favorecidoPagoEm: r.favorecido_pago_em ? dataISO(r.favorecido_pago_em) : null,
    previsto: r.previsto === true,
    tipoDocumento: r.tipo_documento ?? null,
    numeroDocumento: r.numero_documento ?? null,
    emissao: r.emissao ? dataISO(r.emissao) : null,
    contaCorrenteNome: r.conta_corrente_nome ?? null,
    desconto: r.desconto != null ? Number(r.desconto) : 0,
    multa: r.multa != null ? Number(r.multa) : 0,
    juros: r.juros != null ? Number(r.juros) : 0,
    taxaCartao: r.taxa_cartao != null ? Number(r.taxa_cartao) : 0,
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
      `SELECT t.*, cf.nome AS categoria_financeira_nome, fv.nome AS favorecido_nome, vd.nome AS vendedor_nome, cc.nome AS conta_corrente_nome,
              pd.forma_pagamento AS pedido_forma_pagamento, pd.frete AS pedido_frete, pd.forma_entrega AS pedido_forma_entrega,
              (SELECT COUNT(*) FROM "${s}".titulo_anexo ta WHERE ta.titulo_id = t.id) AS anexos
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
  async listarPorPedido(schema: string, pedidoId: string): Promise<Titulo[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".titulo WHERE pedido_id = $1`, [pedidoId])).map(map);
  }
  async criar(schema: string, t: NovoTitulo, origem: string, pedidoId: string | null): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".titulo (id, numero, tipo, descricao, pessoa_nome, valor, vencimento, origem, pedido_id, categoria_financeira_id, favorecido_id, previsto, tipo_documento, numero_documento, emissao, favorecido_forma, favorecido_pago_em)
       VALUES ($1, nextval('"${s}".titulo_numero_seq'), $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, COALESCE($14, CURRENT_DATE),$15,$16)`,
      [id, t.tipo, t.descricao, t.pessoaNome, t.valor, t.vencimento, origem, pedidoId, t.categoriaFinanceiraId ?? null, t.favorecidoId ?? null, t.previsto === true, t.tipoDocumento ?? null, t.numeroDocumento ?? null, t.emissao ?? null, t.favorecidoForma ?? null, t.favorecidoPagoEm ?? null]);
    return id;
  }
  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null, dataBaixa?: string | null, ajustes?: AjustesBaixa): Promise<void> {
    const s = validarSchema(schema);
    // Data da baixa: usa a informada (YYYY-MM-DD) ou agora. Grava a composição (desconto/multa/juros).
    await this.ds.query(
      `UPDATE "${s}".titulo SET status='pago', forma_pagamento=$2, conta_corrente_id=$3, pago_em=COALESCE($4::timestamptz, now()), desconto=$5, multa=$6, juros=$7, taxa_cartao=$8 WHERE id=$1`,
      [id, formaPagamento, contaCorrenteId, dataBaixa || null, ajustes?.desconto ?? 0, ajustes?.multa ?? 0, ajustes?.juros ?? 0, ajustes?.taxaCartao ?? 0]);
  }
  async definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET previsto=$2 WHERE id=$1`, [id, previsto]);
  }
  async definirConferido(schema: string, id: string, conferido: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET conferido=$2, conferido_em=$3 WHERE id=$1`, [id, conferido, conferido ? new Date().toISOString() : null]);
  }
  async definirReembolso(schema: string, id: string, d: { favorecidoId: string | null; favorecidoForma: string | null; favorecidoPagoEm: string | null; vencimento: string | null }): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".titulo SET favorecido_id=$2, favorecido_forma=$3, favorecido_pago_em=$4, vencimento=COALESCE($5, vencimento) WHERE id=$1`,
      [id, d.favorecidoId, d.favorecidoForma, d.favorecidoPagoEm, d.vencimento]);
  }
  async cancelarBaixa(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".titulo SET status='aberto', forma_pagamento=NULL, conta_corrente_id=NULL, pago_em=NULL, desconto=0, multa=0, juros=0 WHERE id=$1`, [id]);
  }
  async excluir(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".titulo WHERE id=$1`, [id]);
  }
  async atualizarCompra(schema: string, id: string, d: { descricao: string; pessoaNome: string | null; valor: number; vencimento: string; numeroDocumento: string | null }): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".titulo SET descricao=$2, pessoa_nome=$3, valor=$4, vencimento=$5, numero_documento=$6 WHERE id=$1`,
      [id, d.descricao, d.pessoaNome, d.valor, d.vencimento, d.numeroDocumento]);
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
      `SELECT id, tipo, descricao, pessoa_nome,
              (valor - COALESCE(desconto,0) + COALESCE(multa,0) + COALESCE(juros,0)) AS valor,
              pago_em, conciliado
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
