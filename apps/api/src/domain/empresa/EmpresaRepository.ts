import type { BrandingEmpresa, Empresa } from './Empresa.js';

export interface AtualizacaoEmpresa extends BrandingEmpresa {
  fantasia: string;
}

export interface NovaEmpresa {
  codigo: string;
  nome: string;
  fantasia: string;
  schemaName: string;
}

export interface EmpresaRepository {
  buscarPorCodigo(codigo: string): Promise<Empresa | null>;
  atualizar(codigo: string, dados: AtualizacaoEmpresa): Promise<void>;
  listarTodas(): Promise<Empresa[]>;
  existeCodigo(codigo: string): Promise<boolean>;
  criar(dados: NovaEmpresa): Promise<string>;
}
