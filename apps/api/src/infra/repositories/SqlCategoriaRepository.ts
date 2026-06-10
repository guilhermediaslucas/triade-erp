import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Categoria, CategoriaRepository } from '../../domain/cadastro/Categoria.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlCategoriaRepository implements CategoriaRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<Categoria[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(`SELECT id, nome, criado_em FROM "${s}".categoria ORDER BY nome`);
    return linhas.map((r: any) => ({ id: r.id, nome: r.nome, criadoEm: new Date(r.criado_em) }));
  }

  async buscarPorId(schema: string, id: string): Promise<Categoria | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT id, nome, criado_em FROM "${s}".categoria WHERE id = $1`, [id]))[0];
    return r ? { id: r.id, nome: r.nome, criadoEm: new Date(r.criado_em) } : null;
  }

  async criar(schema: string, nome: string): Promise<Categoria> {
    const s = validarSchema(schema);
    const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".categoria (id, nome) VALUES ($1, $2)`, [id, nome]);
    return { id, nome, criadoEm: new Date() };
  }

  async atualizar(schema: string, id: string, nome: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".categoria SET nome = $2 WHERE id = $1`, [id, nome]);
  }
}
