import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Fornecedor, FornecedorRepository, NovoFornecedor } from '../../domain/pessoa/Fornecedor.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): Fornecedor {
  return { id: r.id, nome: r.nome, fantasia: r.fantasia ?? null, documento: r.documento,
    email: r.email ?? null, telefone: r.telefone ?? null, cep: r.cep ?? null, cidade: r.cidade ?? null,
    uf: r.uf ?? null, logradouro: r.logradouro ?? null, numero: r.numero ?? null,
    complemento: r.complemento ?? null, bairro: r.bairro ?? null, ativo: r.ativo, criadoEm: new Date(r.criado_em) };
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
    await this.ds.query(`INSERT INTO "${s}".fornecedor (id,nome,fantasia,documento,email,telefone,cep,cidade,uf,logradouro,numero,complemento,bairro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.cep, d.cidade, d.uf, d.logradouro, d.numero, d.complemento, d.bairro]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoFornecedor): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".fornecedor SET nome=$2,fantasia=$3,documento=$4,email=$5,telefone=$6,cep=$7,cidade=$8,uf=$9,logradouro=$10,numero=$11,complemento=$12,bairro=$13 WHERE id=$1`,
      [id, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.cep, d.cidade, d.uf, d.logradouro, d.numero, d.complemento, d.bairro]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".fornecedor SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
