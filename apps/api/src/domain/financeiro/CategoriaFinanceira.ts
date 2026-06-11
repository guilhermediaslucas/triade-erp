export type TipoCatFin = 'receita' | 'despesa';
export const TIPOS_CATFIN: TipoCatFin[] = ['receita', 'despesa'];

export interface CategoriaFinanceira { id: string; nome: string; tipo: TipoCatFin; ativo: boolean; }

export interface CategoriaFinanceiraRepository {
  listar(schema: string): Promise<CategoriaFinanceira[]>;
  buscarPorId(schema: string, id: string): Promise<CategoriaFinanceira | null>;
  criar(schema: string, nome: string, tipo: TipoCatFin): Promise<string>;
  atualizar(schema: string, id: string, nome: string, tipo: TipoCatFin): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
