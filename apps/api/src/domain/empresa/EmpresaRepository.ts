import type { BrandingEmpresa, Empresa } from './Empresa.js';

export interface AtualizacaoEmpresa extends BrandingEmpresa {
  fantasia: string;
}

export interface EmpresaRepository {
  buscarPorCodigo(codigo: string): Promise<Empresa | null>;
  atualizar(codigo: string, dados: AtualizacaoEmpresa): Promise<void>;
}
