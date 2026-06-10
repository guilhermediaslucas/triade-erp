import type { DataSource } from 'typeorm';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { AtualizacaoEmpresa, EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';

export class SqlEmpresaRepository implements EmpresaRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorCodigo(codigo: string): Promise<Empresa | null> {
    const r = (await this.ds.query(
      `SELECT id, codigo, nome, fantasia, schema_name, ativo, criado_em,
              logo, cor_primaria, cor_menu_fundo, cor_menu_fonte, idioma_padrao, timezone_padrao
         FROM public.empresa WHERE codigo = $1 LIMIT 1`,
      [codigo],
    ))[0];
    if (!r) return null;
    return {
      id: r.id, codigo: r.codigo, nome: r.nome, fantasia: r.fantasia,
      schemaName: r.schema_name, ativo: r.ativo, criadoEm: new Date(r.criado_em),
      logo: r.logo ?? null,
      corPrimaria: r.cor_primaria, corMenuFundo: r.cor_menu_fundo, corMenuFonte: r.cor_menu_fonte,
      idiomaPadrao: r.idioma_padrao, timezonePadrao: r.timezone_padrao,
    };
  }

  async atualizar(codigo: string, d: AtualizacaoEmpresa): Promise<void> {
    await this.ds.query(
      `UPDATE public.empresa SET
         fantasia = $2, logo = $3, cor_primaria = $4, cor_menu_fundo = $5,
         cor_menu_fonte = $6, idioma_padrao = $7, timezone_padrao = $8
       WHERE codigo = $1`,
      [codigo, d.fantasia, d.logo, d.corPrimaria, d.corMenuFundo, d.corMenuFonte, d.idiomaPadrao, d.timezonePadrao],
    );
  }
}
