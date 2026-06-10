import type { DataSource } from 'typeorm';
import type { PrecoBaseRepository, PrecoProduto } from '../../domain/comercial/PrecoBase.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlPrecoBaseRepository implements PrecoBaseRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<PrecoProduto[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id, p.nome, p.unidade, p.ativo, c.nome AS categoria_nome,
              COALESCE(pb.preco, 0) AS preco
         FROM "${s}".produto p
         LEFT JOIN "${s}".categoria c ON c.id = p.categoria_id
         LEFT JOIN "${s}".preco_base pb ON pb.produto_id = p.id
        ORDER BY p.nome`);
    return linhas.map((r: any) => ({
      produtoId: r.id, produtoNome: r.nome, categoriaNome: r.categoria_nome ?? null,
      unidade: r.unidade, ativo: r.ativo, preco: Number(r.preco),
    }));
  }

  async definir(schema: string, produtoId: string, preco: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".preco_base (produto_id, preco, atualizado_em) VALUES ($1,$2, now())
       ON CONFLICT (produto_id) DO UPDATE SET preco = EXCLUDED.preco, atualizado_em = now()`,
      [produtoId, preco]);
  }

  async precoDe(schema: string, produtoId: string): Promise<number> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT preco FROM "${s}".preco_base WHERE produto_id = $1`, [produtoId]))[0];
    return r ? Number(r.preco) : 0;
  }

  async produtoExiste(schema: string, produtoId: string): Promise<boolean> {
    const s = validarSchema(schema);
    const r = await this.ds.query(`SELECT 1 FROM "${s}".produto WHERE id = $1`, [produtoId]);
    return r.length > 0;
  }
}
