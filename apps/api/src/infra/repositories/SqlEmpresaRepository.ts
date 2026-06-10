import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { AtualizacaoEmpresa, EmpresaRepository, NovaEmpresa } from '../../domain/empresa/EmpresaRepository.js';

const COLS = `id, codigo, nome, fantasia, schema_name, ativo, criado_em,
              logo, cor_primaria, cor_menu_fundo, cor_menu_fonte, idioma_padrao, timezone_padrao`;

function mapear(r: any): Empresa {
  return {
    id: r.id, codigo: r.codigo, nome: r.nome, fantasia: r.fantasia,
    schemaName: r.schema_name, ativo: r.ativo, criadoEm: new Date(r.criado_em),
    logo: r.logo ?? null, corPrimaria: r.cor_primaria, corMenuFundo: r.cor_menu_fundo,
    corMenuFonte: r.cor_menu_fonte, idiomaPadrao: r.idioma_padrao, timezonePadrao: r.timezone_padrao,
  };
}

export class SqlEmpresaRepository implements EmpresaRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorCodigo(codigo: string): Promise<Empresa | null> {
    const r = (await this.ds.query(`SELECT ${COLS} FROM public.empresa WHERE codigo = $1 LIMIT 1`, [codigo]))[0];
    return r ? mapear(r) : null;
  }

  async listarTodas(): Promise<Empresa[]> {
    const linhas = await this.ds.query(`SELECT ${COLS} FROM public.empresa ORDER BY fantasia`);
    return linhas.map(mapear);
  }

  async existeCodigo(codigo: string): Promise<boolean> {
    const r = await this.ds.query(`SELECT 1 FROM public.empresa WHERE codigo = $1 LIMIT 1`, [codigo]);
    return r.length > 0;
  }

  async criar(d: NovaEmpresa): Promise<string> {
    const id = randomUUID();
    await this.ds.query(
      `INSERT INTO public.empresa (id, codigo, nome, fantasia, schema_name, ativo)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [id, d.codigo, d.nome, d.fantasia, d.schemaName],
    );
    return id;
  }

  async atualizar(codigo: string, d: AtualizacaoEmpresa): Promise<void> {
    await this.ds.query(
      `UPDATE public.empresa SET fantasia=$2, logo=$3, cor_primaria=$4, cor_menu_fundo=$5,
         cor_menu_fonte=$6, idioma_padrao=$7, timezone_padrao=$8 WHERE codigo=$1`,
      [codigo, d.fantasia, d.logo, d.corPrimaria, d.corMenuFundo, d.corMenuFonte, d.idiomaPadrao, d.timezonePadrao],
    );
  }
}
