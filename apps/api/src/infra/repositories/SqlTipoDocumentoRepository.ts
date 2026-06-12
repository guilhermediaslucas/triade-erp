import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { TipoDocumento, TipoDocumentoRepository } from '../../domain/cadastro/TipoDocumento.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): TipoDocumento => ({ id: r.id, nome: r.nome, ativo: r.ativo });

export class SqlTipoDocumentoRepository implements TipoDocumentoRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<TipoDocumento[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".tipo_documento ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<TipoDocumento | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".tipo_documento WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".tipo_documento (id, nome) VALUES ($1,$2)`, [id, nome]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".tipo_documento SET nome=$2 WHERE id=$1`, [id, nome]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".tipo_documento SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
