import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Marca, MarcaRepository } from '../../domain/cadastro/Marca.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): Marca => ({ id: r.id, nome: r.nome, fabricante: r.fabricante ?? null, ativo: r.ativo });

export class SqlMarcaRepository implements MarcaRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Marca[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".marca ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Marca | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".marca WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, fabricante: string | null): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".marca (id, nome, fabricante) VALUES ($1,$2,$3)`, [id, nome, fabricante]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, fabricante: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".marca SET nome = $2, fabricante = $3 WHERE id = $1`, [id, nome, fabricante]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".marca SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
