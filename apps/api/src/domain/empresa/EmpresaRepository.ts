import type { BrandingEmpresa, Empresa } from './Empresa.js';

export interface AtualizacaoEmpresa extends BrandingEmpresa {
  nome: string;       // razão social
  fantasia: string;
}

export interface NovaEmpresa {
  codigo: string;
  nome: string;
  fantasia: string;
  schemaName: string;
}

// Edição do cadastro (super-admin), distinta do branding (AtualizacaoEmpresa).
export interface EdicaoCadastroEmpresa {
  nome: string;
  fantasia: string;
  ativo: boolean;
}

export interface EmpresaRepository {
  buscarPorCodigo(codigo: string): Promise<Empresa | null>;
  atualizar(codigo: string, dados: AtualizacaoEmpresa): Promise<void>;
  listarTodas(): Promise<Empresa[]>;
  existeCodigo(codigo: string): Promise<boolean>;
  criar(dados: NovaEmpresa): Promise<string>;
  editarCadastro(codigo: string, dados: EdicaoCadastroEmpresa): Promise<void>;
  excluir(codigo: string): Promise<void>;
}
