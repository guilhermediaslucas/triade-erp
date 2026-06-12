import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { AtualizacaoEmpresa, EdicaoCadastroEmpresa, EmpresaRepository, NovaEmpresa } from '../../domain/empresa/EmpresaRepository.js';

const COLS = `id, codigo, nome, fantasia, schema_name, ativo, criado_em,
              logo, cor_primaria, cor_secundaria, cor_menu_fundo, cor_menu_fonte, logo_altura,
              idioma_padrao, timezone_padrao,
              cnpj, inscricao_estadual, telefone, email, logradouro, bairro, cep, uf, cidade`;

function mapear(r: any): Empresa {
  return {
    id: r.id, codigo: r.codigo, nome: r.nome, fantasia: r.fantasia,
    schemaName: r.schema_name, ativo: r.ativo, criadoEm: new Date(r.criado_em),
    logo: r.logo ?? null, corPrimaria: r.cor_primaria, corSecundaria: r.cor_secundaria ?? '#2563eb',
    corMenuFundo: r.cor_menu_fundo, corMenuFonte: r.cor_menu_fonte,
    logoAltura: Number(r.logo_altura ?? 44),
    idiomaPadrao: r.idioma_padrao, timezonePadrao: r.timezone_padrao,
    cnpj: r.cnpj ?? '', inscricaoEstadual: r.inscricao_estadual ?? '', telefone: r.telefone ?? '',
    email: r.email ?? '', logradouro: r.logradouro ?? '', bairro: r.bairro ?? '',
    cep: r.cep ?? '', uf: r.uf ?? '', cidade: r.cidade ?? '',
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
      `UPDATE public.empresa SET
         nome=$2, fantasia=$3, logo=$4, cor_primaria=$5, cor_secundaria=$6, cor_menu_fundo=$7,
         cor_menu_fonte=$8, logo_altura=$9, idioma_padrao=$10, timezone_padrao=$11,
         cnpj=$12, inscricao_estadual=$13, telefone=$14, email=$15, logradouro=$16,
         bairro=$17, cep=$18, uf=$19, cidade=$20
       WHERE codigo=$1`,
      [codigo, d.nome, d.fantasia, d.logo, d.corPrimaria, d.corSecundaria, d.corMenuFundo,
        d.corMenuFonte, d.logoAltura, d.idiomaPadrao, d.timezonePadrao,
        d.cnpj, d.inscricaoEstadual, d.telefone, d.email, d.logradouro,
        d.bairro, d.cep, d.uf, d.cidade],
    );
  }

  async editarCadastro(codigo: string, d: EdicaoCadastroEmpresa): Promise<void> {
    await this.ds.query(
      `UPDATE public.empresa SET nome=$2, fantasia=$3, ativo=$4 WHERE codigo=$1`,
      [codigo, d.nome, d.fantasia, d.ativo],
    );
  }

  async excluir(codigo: string): Promise<void> {
    await this.ds.query(`DELETE FROM public.empresa WHERE codigo=$1`, [codigo]);
  }
}
