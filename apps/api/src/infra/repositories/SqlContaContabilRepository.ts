import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { ContaContabil, ContaContabilRepository, NovaContaContabil, TipoContaContabil } from '../../domain/financeiro/ContaContabil.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): ContaContabil => ({
  id: r.id, codigo: r.codigo, descricao: r.descricao, tipo: (r.tipo as TipoContaContabil),
  paiId: r.pai_id ?? null, ativo: r.ativo,
});

export class SqlContaContabilRepository implements ContaContabilRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<ContaContabil[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".conta_contabil ORDER BY codigo`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<ContaContabil | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".conta_contabil WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, d: NovaContaContabil): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".conta_contabil (id, codigo, descricao, tipo, pai_id) VALUES ($1,$2,$3,$4,$5)`,
      [id, d.codigo, d.descricao, d.tipo, d.paiId]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovaContaContabil): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".conta_contabil SET codigo=$2, descricao=$3, tipo=$4, pai_id=$5 WHERE id=$1`,
      [id, d.codigo, d.descricao, d.tipo, d.paiId]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".conta_contabil SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
