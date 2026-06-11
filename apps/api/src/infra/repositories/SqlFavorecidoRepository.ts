import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Favorecido, FavorecidoRepository, NovoFavorecido } from '../../domain/cadastro/Favorecido.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): Favorecido => ({
  id: r.id, nome: r.nome, tipoPessoa: r.tipo_pessoa,
  documento: r.documento ?? null, chavePix: r.chave_pix ?? null,
  banco: r.banco ?? null, agencia: r.agencia ?? null, conta: r.conta ?? null,
  observacao: r.observacao ?? null, ativo: r.ativo,
});

export class SqlFavorecidoRepository implements FavorecidoRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<Favorecido[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".favorecido ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Favorecido | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".favorecido WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, d: NovoFavorecido): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".favorecido (id, nome, tipo_pessoa, documento, chave_pix, banco, agencia, conta, observacao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, d.nome, d.tipoPessoa, d.documento, d.chavePix, d.banco, d.agencia, d.conta, d.observacao]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoFavorecido): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".favorecido SET nome=$2, tipo_pessoa=$3, documento=$4, chave_pix=$5, banco=$6, agencia=$7, conta=$8, observacao=$9 WHERE id=$1`,
      [id, d.nome, d.tipoPessoa, d.documento, d.chavePix, d.banco, d.agencia, d.conta, d.observacao]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".favorecido SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
