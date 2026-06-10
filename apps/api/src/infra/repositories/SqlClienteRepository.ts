import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Cliente, ClienteRepository, EnderecoCliente, NovoCliente } from '../../domain/pessoa/Cliente.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapCliente(r: any, ends: EnderecoCliente[]): Cliente {
  return {
    id: r.id, tipoPessoa: r.tipo_pessoa, nome: r.nome, fantasia: r.fantasia ?? null,
    documento: r.documento, email: r.email ?? null, telefone: r.telefone ?? null,
    limiteCredito: Number(r.limite_credito), ativo: r.ativo, criadoEm: new Date(r.criado_em),
    enderecos: ends,
  };
}
function mapEnd(r: any): EnderecoCliente {
  return {
    id: r.id, cep: r.cep ?? null, logradouro: r.logradouro ?? null, numero: r.numero ?? null,
    complemento: r.complemento ?? null, bairro: r.bairro ?? null, cidade: r.cidade ?? null,
    uf: r.uf ?? null, favorito: r.favorito,
  };
}

export class SqlClienteRepository implements ClienteRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<Cliente[]> {
    const s = validarSchema(schema);
    const clientes = await this.ds.query(`SELECT * FROM "${s}".cliente ORDER BY nome`);
    const ends = await this.ds.query(`SELECT * FROM "${s}".cliente_endereco`);
    return clientes.map((c: any) => mapCliente(c, ends.filter((e: any) => e.cliente_id === c.id).map(mapEnd)));
  }

  async buscarPorId(schema: string, id: string): Promise<Cliente | null> {
    const s = validarSchema(schema);
    const c = (await this.ds.query(`SELECT * FROM "${s}".cliente WHERE id = $1`, [id]))[0];
    if (!c) return null;
    const ends = await this.ds.query(`SELECT * FROM "${s}".cliente_endereco WHERE cliente_id = $1`, [id]);
    return mapCliente(c, ends.map(mapEnd));
  }

  async criar(schema: string, d: NovoCliente): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".cliente (id, tipo_pessoa, nome, fantasia, documento, email, telefone, limite_credito)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, d.tipoPessoa, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.limiteCredito]);
    await this.gravarEnderecos(s, id, d.enderecos);
    return id;
  }

  async atualizar(schema: string, id: string, d: NovoCliente): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".cliente SET tipo_pessoa=$2, nome=$3, fantasia=$4, documento=$5, email=$6, telefone=$7, limite_credito=$8 WHERE id=$1`,
      [id, d.tipoPessoa, d.nome, d.fantasia, d.documento, d.email, d.telefone, d.limiteCredito]);
    await this.ds.query(`DELETE FROM "${s}".cliente_endereco WHERE cliente_id = $1`, [id]);
    await this.gravarEnderecos(s, id, d.enderecos);
  }

  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".cliente SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }

  private async gravarEnderecos(schema: string, clienteId: string, ends: EnderecoCliente[]): Promise<void> {
    for (const e of ends) {
      await this.ds.query(
        `INSERT INTO "${schema}".cliente_endereco (id, cliente_id, cep, logradouro, numero, complemento, bairro, cidade, uf, favorito)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [randomUUID(), clienteId, e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf, e.favorito]);
    }
  }
}
