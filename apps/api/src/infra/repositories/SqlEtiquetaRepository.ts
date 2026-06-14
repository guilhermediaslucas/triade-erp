import type { DataSource } from 'typeorm';
import type { Etiqueta, EtiquetaConsulta, EtiquetaRepository, StatusEtiqueta } from '../../domain/estoque/Etiqueta.js';
import { validarSchema } from '../tenant/validarSchema.js';

const SELECT_CONSULTA = (s: string) =>
  `SELECT e.codigo, e.status, e.produto_id, p.nome AS produto_nome, p.unidade,
          e.lote_id, l.lote, l.validade, l.quantidade AS saldo_lote, l.custo_unitario,
          m.nome AS marca, e.fornecedor, e.nf, e.emissao
     FROM "${s}".etiqueta e
     JOIN "${s}".produto p ON p.id = e.produto_id
     JOIN "${s}".estoque_lote l ON l.id = e.lote_id
     LEFT JOIN "${s}".marca m ON m.id = l.marca_id`;

function mapConsulta(r: any): EtiquetaConsulta {
  return {
    codigo: r.codigo, status: r.status as StatusEtiqueta,
    produtoId: r.produto_id, produtoNome: r.produto_nome, unidade: r.unidade ?? null,
    loteId: r.lote_id, lote: r.lote ?? null,
    validade: r.validade ? new Date(r.validade).toISOString().slice(0, 10) : null,
    marca: r.marca ?? null, saldoLote: Number(r.saldo_lote) || 0, custoUnitario: Number(r.custo_unitario) || 0,
    fornecedor: r.fornecedor ?? null, nf: r.nf ?? null,
    emissao: r.emissao ? new Date(r.emissao).toISOString().slice(0, 10) : null,
  };
}

export class SqlEtiquetaRepository implements EtiquetaRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorLote(schema: string, loteId: string): Promise<Etiqueta[]> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(
      `SELECT id, codigo, status, criado_em FROM "${s}".etiqueta
        WHERE lote_id = $1 ORDER BY criado_em, codigo`, [loteId]);
    return rows.map((r: any) => ({
      id: r.id, codigo: r.codigo, status: r.status as StatusEtiqueta,
      criadoEm: new Date(r.criado_em).toISOString(),
    }));
  }

  async buscarPorCodigo(schema: string, codigo: string): Promise<EtiquetaConsulta | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`${SELECT_CONSULTA(s)} WHERE e.codigo = $1`, [codigo]))[0];
    return r ? mapConsulta(r) : null;
  }

  async listarEmEstoque(schema: string): Promise<EtiquetaConsulta[]> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(`${SELECT_CONSULTA(s)} WHERE e.status = 'estoque' ORDER BY p.nome, e.codigo`);
    return rows.map(mapConsulta);
  }

  async jaExistem(schema: string, codigos: string[]): Promise<string[]> {
    const s = validarSchema(schema);
    if (!codigos.length) return [];
    const rows = await this.ds.query(
      `SELECT codigo FROM "${s}".etiqueta WHERE codigo = ANY($1)`, [codigos]);
    return rows.map((r: any) => r.codigo);
  }

  async consumir(schema: string, codigo: string, status: StatusEtiqueta, pedidoRef: string | null = null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".etiqueta SET status = $2, pedido_ref = $3 WHERE codigo = $1`, [codigo, status, pedidoRef]);
  }

  async reverterPorPedido(schema: string, pedidoRef: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".etiqueta SET status = 'estoque', pedido_ref = NULL
        WHERE pedido_ref = $1 AND status = 'saida'`, [pedidoRef]);
  }
}
