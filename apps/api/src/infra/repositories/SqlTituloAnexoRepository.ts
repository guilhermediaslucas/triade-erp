import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { NovoTituloAnexo, TituloAnexo, TituloAnexoRepository } from '../../domain/financeiro/Anexo.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): TituloAnexo {
  return {
    id: r.id, tituloId: r.titulo_id, nomeArquivo: r.nome_arquivo, tipo: r.tipo,
    tamanho: Number(r.tamanho) || 0, chave: r.chave, usuarioNome: r.usuario_nome ?? null,
    criadoEm: new Date(r.criado_em).toISOString(),
  };
}

export class SqlTituloAnexoRepository implements TituloAnexoRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorTitulo(schema: string, tituloId: string): Promise<TituloAnexo[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(
      `SELECT * FROM "${s}".titulo_anexo WHERE titulo_id = $1 ORDER BY criado_em`, [tituloId])).map(map);
  }

  async buscarPorId(schema: string, id: string): Promise<TituloAnexo | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".titulo_anexo WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }

  async criar(schema: string, a: NovoTituloAnexo): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".titulo_anexo (id, titulo_id, nome_arquivo, tipo, tamanho, chave, usuario_nome)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, a.tituloId, a.nomeArquivo, a.tipo, a.tamanho, a.chave, a.usuarioNome]);
    return id;
  }

  async remover(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".titulo_anexo WHERE id = $1`, [id]);
  }
}
