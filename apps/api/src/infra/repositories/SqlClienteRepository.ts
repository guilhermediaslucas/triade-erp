import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Cliente, ClienteRepository, NovoCliente } from '../../domain/pessoa/Cliente.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): Cliente {
  return {
    id: r.id, tipoPessoa: r.tipo_pessoa, nome: r.nome, fantasia: r.fantasia ?? null,
    documento: r.documento, email: r.email ?? null, telefone: r.telefone ?? null,
    limiteCredito: Number(r.limite_credito), ativo: r.ativo, criadoEm: new Date(r.criado_em),
  };
}

export class SqlClienteRepository implements ClienteRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Cliente[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".cliente ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Cliente | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".cliente WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, d: NovoCliente): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".cliente (id, tipo_pessoa, nome, fantasia, documento, email, telefone, limite_credito)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, d.tipoPessoa, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.limiteCredito]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoCliente): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".cliente SET tipo_pessoa=$2, nome=$3, fantasia=$4, documento=$5, email=$6, telefone=$7, limite_credito=$8 WHERE id=$1`,
      [id, d.tipoPessoa, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.limiteCredito]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".cliente SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
