import type { DataSource } from 'typeorm';
import type { Etiqueta, EtiquetaConsulta, EtiquetaRepository, StatusEtiqueta } from '../../domain/estoque/Etiqueta.js';
import { validarSchema } from '../tenant/validarSchema.js';

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
    const r = (await this.ds.query(
      `SELECT e.codigo, e.status, e.produto_id, p.nome AS produto_nome,
              e.lote_id, l.lote, l.validade
         FROM "${s}".etiqueta e
         JOIN "${s}".produto p ON p.id = e.produto_id
         JOIN "${s}".estoque_lote l ON l.id = e.lote_id
        WHERE e.codigo = $1`, [codigo]))[0];
    if (!r) return null;
    return {
      codigo: r.codigo, status: r.status as StatusEtiqueta,
      produtoId: r.produto_id, produtoNome: r.produto_nome,
      loteId: r.lote_id, lote: r.lote ?? null,
      validade: r.validade ? new Date(r.validade).toISOString().slice(0, 10) : null,
    };
  }

  async listarEmEstoque(schema: string): Promise<EtiquetaConsulta[]> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(
      `SELECT e.codigo, e.status, e.produto_id, p.nome AS produto_nome,
              e.lote_id, l.lote, l.validade
         FROM "${s}".etiqueta e
         JOIN "${s}".produto p ON p.id = e.produto_id
         JOIN "${s}".estoque_lote l ON l.id = e.lote_id
        WHERE e.status = 'estoque'
        ORDER BY p.nome, e.codigo`);
    return rows.map((r: any) => ({
      codigo: r.codigo, status: r.status as StatusEtiqueta,
      produtoId: r.produto_id, produtoNome: r.produto_nome,
      loteId: r.lote_id, lote: r.lote ?? null,
      validade: r.validade ? new Date(r.validade).toISOString().slice(0, 10) : null,
    }));
  }

  async jaExistem(schema: string, codigos: string[]): Promise<string[]> {
    const s = validarSchema(schema);
    if (!codigos.length) return [];
    const rows = await this.ds.query(
      `SELECT codigo FROM "${s}".etiqueta WHERE codigo = ANY($1)`, [codigos]);
    return rows.map((r: any) => r.codigo);
  }

  async consumir(schema: string, codigo: string, status: StatusEtiqueta): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".etiqueta SET status = $2 WHERE codigo = $1`, [codigo, status]);
  }
}
