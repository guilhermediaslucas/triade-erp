import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { NovoProduto, Produto, ProdutoRepository, ProdutoResumo } from '../../domain/cadastro/Produto.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapProduto(r: any): Produto {
  return {
    id: r.id, nome: r.nome, categoriaId: r.categoria_id ?? null, unidade: r.unidade,
    estoqueMinimo: r.estoque_minimo, localizacao: r.localizacao ?? null, registroAnvisa: r.registro_anvisa ?? null,
    ncm: r.ncm ?? null, cfop: r.cfop ?? null, cstFiscal: r.cst_fiscal ?? null, origemFiscal: r.origem_fiscal ?? null,
    ativo: r.ativo, criadoEm: new Date(r.criado_em),
  };
}

export class SqlProdutoRepository implements ProdutoRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<ProdutoResumo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.*, c.nome AS categoria_nome,
              COALESCE((SELECT pb.preco FROM "${s}".preco_base pb WHERE pb.produto_id = p.id), 0) AS preco_base
         FROM "${s}".produto p
         LEFT JOIN "${s}".categoria c ON c.id = p.categoria_id
        ORDER BY p.nome`);
    return linhas.map((r: any) => ({ ...mapProduto(r), precoBase: Number(r.preco_base) || 0, categoriaNome: r.categoria_nome ?? null }));
  }
  async buscarPorId(schema: string, id: string): Promise<Produto | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".produto WHERE id = $1`, [id]))[0];
    return r ? mapProduto(r) : null;
  }
  async criar(schema: string, d: NovoProduto): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".produto (id, nome, categoria_id, unidade, estoque_minimo, localizacao, registro_anvisa, ncm, cfop, cst_fiscal, origem_fiscal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, d.nome, d.categoriaId, d.unidade, d.estoqueMinimo, d.localizacao, d.registroAnvisa, d.ncm, d.cfop, d.cstFiscal, d.origemFiscal]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoProduto): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".produto SET nome=$2, categoria_id=$3, unidade=$4, estoque_minimo=$5, localizacao=$6, registro_anvisa=$7,
         ncm=$8, cfop=$9, cst_fiscal=$10, origem_fiscal=$11 WHERE id=$1`,
      [id, d.nome, d.categoriaId, d.unidade, d.estoqueMinimo, d.localizacao, d.registroAnvisa, d.ncm, d.cfop, d.cstFiscal, d.origemFiscal]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".produto SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }
}
