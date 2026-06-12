import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Banco, BancoRepository } from '../../domain/cadastro/Banco.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): Banco => ({ id: r.id, nome: r.nome, ativo: r.ativo });

export class SqlBancoRepository implements BancoRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Banco[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".banco ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Banco | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".banco WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".banco (id, nome) VALUES ($1,$2)`, [id, nome]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".banco SET nome=$2 WHERE id=$1`, [id, nome]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".banco SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
