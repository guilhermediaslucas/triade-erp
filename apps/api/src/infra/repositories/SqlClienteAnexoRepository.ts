import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { ClienteAnexo, ClienteAnexoRepository, NovoClienteAnexo } from '../../domain/pessoa/ClienteAnexo.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): ClienteAnexo {
  return {
    id: r.id, clienteId: r.cliente_id, nomeArquivo: r.nome_arquivo, tipo: r.tipo,
    tamanho: Number(r.tamanho) || 0, chave: r.chave, usuarioNome: r.usuario_nome ?? null,
    criadoEm: new Date(r.criado_em).toISOString(),
  };
}

export class SqlClienteAnexoRepository implements ClienteAnexoRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorCliente(schema: string, clienteId: string): Promise<ClienteAnexo[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(
      `SELECT * FROM "${s}".cliente_anexo WHERE cliente_id = $1 ORDER BY criado_em`, [clienteId])).map(map);
  }

  async buscarPorId(schema: string, id: string): Promise<ClienteAnexo | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".cliente_anexo WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }

  async criar(schema: string, a: NovoClienteAnexo): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".cliente_anexo (id, cliente_id, nome_arquivo, tipo, tamanho, chave, usuario_nome)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, a.clienteId, a.nomeArquivo, a.tipo, a.tamanho, a.chave, a.usuarioNome]);
    return id;
  }

  async remover(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".cliente_anexo WHERE id = $1`, [id]);
  }
}
