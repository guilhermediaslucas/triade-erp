import type { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import type { Campanha, PrecoBaseRepository, PrecoProduto } from '../../domain/comercial/PrecoBase.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlPrecoBaseRepository implements PrecoBaseRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<PrecoProduto[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id, p.nome, p.unidade, p.ativo, c.nome AS categoria_nome,
              COALESCE(pb.preco, 0) AS preco,
              (SELECT count(*) FROM "${s}".preco_campanha pc WHERE pc.produto_id = p.id) AS campanhas_count,
              (SELECT pc.preco FROM "${s}".preco_campanha pc
                 WHERE pc.produto_id = p.id AND CURRENT_DATE BETWEEN pc.de AND pc.ate
                 ORDER BY pc.de DESC LIMIT 1) AS preco_vigente,
              (SELECT pc.motivo FROM "${s}".preco_campanha pc
                 WHERE pc.produto_id = p.id AND CURRENT_DATE BETWEEN pc.de AND pc.ate
                 ORDER BY pc.de DESC LIMIT 1) AS preco_vigente_motivo
         FROM "${s}".produto p
         LEFT JOIN "${s}".categoria c ON c.id = p.categoria_id
         LEFT JOIN "${s}".preco_base pb ON pb.produto_id = p.id
        ORDER BY p.nome`);
    return linhas.map((r: any) => ({
      produtoId: r.id, produtoNome: r.nome, categoriaNome: r.categoria_nome ?? null,
      unidade: r.unidade, ativo: r.ativo, preco: Number(r.preco),
      campanhasCount: Number(r.campanhas_count ?? 0),
      precoVigente: r.preco_vigente != null ? Number(r.preco_vigente) : null,
      precoVigenteMotivo: r.preco_vigente_motivo ?? null,
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
    const camp = (await this.ds.query(
      `SELECT preco FROM "${s}".preco_campanha
        WHERE produto_id = $1 AND CURRENT_DATE BETWEEN de AND ate
        ORDER BY de DESC LIMIT 1`, [produtoId]))[0];
    if (camp) return Number(camp.preco);
    const r = (await this.ds.query(`SELECT preco FROM "${s}".preco_base WHERE produto_id = $1`, [produtoId]))[0];
    return r ? Number(r.preco) : 0;
  }

  async listarCampanhas(schema: string, produtoId: string): Promise<Campanha[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT id, produto_id, preco, motivo, de, ate,
              (CURRENT_DATE BETWEEN de AND ate) vigente
         FROM "${s}".preco_campanha WHERE produto_id = $1 ORDER BY de DESC`, [produtoId]);
    return linhas.map((r: any) => ({
      id: r.id, produtoId: r.produto_id, preco: Number(r.preco), motivo: r.motivo ?? null,
      de: new Date(r.de).toISOString().slice(0,10), ate: new Date(r.ate).toISOString().slice(0,10), vigente: r.vigente,
    }));
  }
  async criarCampanha(schema: string, produtoId: string, preco: number, motivo: string | null, de: string, ate: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".preco_campanha (id, produto_id, preco, motivo, de, ate)
       VALUES ($1,$2,$3,$4,$5,$6)`, [randomUUID(), produtoId, preco, motivo, de, ate]);
  }
  async atualizarCampanha(schema: string, id: string, preco: number, motivo: string | null, de: string, ate: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".preco_campanha SET preco = $2, motivo = $3, de = $4, ate = $5 WHERE id = $1`,
      [id, preco, motivo, de, ate]);
  }
  async removerCampanha(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".preco_campanha WHERE id = $1`, [id]);
  }

  async produtoExiste(schema: string, produtoId: string): Promise<boolean> {
    const s = validarSchema(schema);
    const r = await this.ds.query(`SELECT 1 FROM "${s}".produto WHERE id = $1`, [produtoId]);
    return r.length > 0;
  }
}
