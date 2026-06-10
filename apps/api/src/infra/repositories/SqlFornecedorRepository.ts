import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Fornecedor, FornecedorRepository, NovoFornecedor } from '../../domain/pessoa/Fornecedor.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): Fornecedor {
  return { id: r.id, nome: r.nome, fantasia: r.fantasia ?? null, documento: r.documento,
    email: r.email ?? null, telefone: r.telefone ?? null, ativo: r.ativo, criadoEm: new Date(r.criado_em) };
}
export class SqlFornecedorRepository implements FornecedorRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Fornecedor[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".fornecedor ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Fornecedor | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".fornecedor WHERE id=$1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, d: NovoFornecedor): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".fornecedor (id,nome,fantasia,documento,email,telefone) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, d.nome, d.fantasia, d.documento, d.email, d.telefone]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoFornecedor): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".fornecedor SET nome=$2,fantasia=$3,documento=$4,email=$5,telefone=$6 WHERE id=$1`,
      [id, d.nome, d.fantasia, d.documento, d.email, d.telefone]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".fornecedor SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
