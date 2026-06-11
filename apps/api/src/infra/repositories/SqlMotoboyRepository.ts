import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Motoboy, MotoboyRepository } from '../../domain/pessoa/Motoboy.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): Motoboy => ({ id: r.id, nome: r.nome, telefone: r.telefone ?? null, ativo: r.ativo });

export class SqlMotoboyRepository implements MotoboyRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Motoboy[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".motoboy ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Motoboy | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".motoboy WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, telefone: string | null): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".motoboy (id, nome, telefone) VALUES ($1,$2,$3)`, [id, nome, telefone]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, telefone: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".motoboy SET nome = $2, telefone = $3 WHERE id = $1`, [id, nome, telefone]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".motoboy SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
