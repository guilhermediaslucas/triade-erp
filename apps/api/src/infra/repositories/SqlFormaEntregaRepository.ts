import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { FormaEntrega, FormaEntregaRepository } from '../../domain/cadastro/FormaEntrega.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): FormaEntrega => ({
  id: r.id, nome: r.nome, tipo: r.tipo, prazo: r.prazo ?? null, observacao: r.observacao ?? null, ativo: r.ativo,
});

export class SqlFormaEntregaRepository implements FormaEntregaRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<FormaEntrega[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".forma_entrega ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<FormaEntrega | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".forma_entrega WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, tipo: string, prazo: string | null, observacao: string | null): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".forma_entrega (id, nome, tipo, prazo, observacao) VALUES ($1,$2,$3,$4,$5)`,
      [id, nome, tipo, prazo, observacao]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, tipo: string, prazo: string | null, observacao: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".forma_entrega SET nome=$2, tipo=$3, prazo=$4, observacao=$5 WHERE id=$1`,
      [id, nome, tipo, prazo, observacao]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".forma_entrega SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
