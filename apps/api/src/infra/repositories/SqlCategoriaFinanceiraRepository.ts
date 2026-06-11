import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { CategoriaFinanceira, CategoriaFinanceiraRepository, TipoCatFin } from '../../domain/financeiro/CategoriaFinanceira.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): CategoriaFinanceira => ({ id: r.id, nome: r.nome, tipo: r.tipo, ativo: r.ativo });

export class SqlCategoriaFinanceiraRepository implements CategoriaFinanceiraRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<CategoriaFinanceira[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".categoria_financeira ORDER BY tipo, nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<CategoriaFinanceira | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".categoria_financeira WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, tipo: TipoCatFin): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".categoria_financeira (id, nome, tipo) VALUES ($1,$2,$3)`, [id, nome, tipo]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, tipo: TipoCatFin): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".categoria_financeira SET nome = $2, tipo = $3 WHERE id = $1`, [id, nome, tipo]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".categoria_financeira SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
