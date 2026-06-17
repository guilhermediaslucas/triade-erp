export type TipoCatFin = 'receita' | 'despesa';
export const TIPOS_CATFIN: TipoCatFin[] = ['receita', 'despesa'];

export interface CategoriaFinanceira { id: string; nome: string; tipo: TipoCatFin; ativo: boolean; contaContabilId: string | null; }

export interface CategoriaFinanceiraRepository {
  listar(schema: string): Promise<CategoriaFinanceira[]>;
  buscarPorId(schema: string, id: string): Promise<CategoriaFinanceira | null>;
  criar(schema: string, nome: string, tipo: TipoCatFin, contaContabilId: string | null): Promise<string>;
  atualizar(schema: string, id: string, nome: string, tipo: TipoCatFin, contaContabilId: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
