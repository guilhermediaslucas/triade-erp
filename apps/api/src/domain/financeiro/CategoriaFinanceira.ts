export type TipoCatFin = 'receita' | 'despesa';
export const TIPOS_CATFIN: TipoCatFin[] = ['receita', 'despesa'];

// Grupo da DRE gerencial (ordem da demonstração). O tipo (receber/pagar) é
// derivado do grupo: 'receita' → receita; os demais → despesa.
export type GrupoCatFin = 'receita' | 'custo_mercadoria' | 'custo_operacional' | 'despesa';
export const GRUPOS_CATFIN: GrupoCatFin[] = ['receita', 'custo_mercadoria', 'custo_operacional', 'despesa'];
export function tipoDoGrupo(g: GrupoCatFin): TipoCatFin { return g === 'receita' ? 'receita' : 'despesa'; }

// Categoria de compra de mercadoria — a nota de entrada usa esta categoria (por nome)
// para enquadrar os títulos a pagar de compra no grupo "Custo de aquisição de mercadoria".
export const CATEGORIA_COMPRA_MERCADORIA = 'Compra de mercadorias para revenda';

export interface CategoriaFinanceira { id: string; nome: string; tipo: TipoCatFin; grupo: GrupoCatFin; ativo: boolean; contaContabilId: string | null; }

export interface CategoriaFinanceiraRepository {
  listar(schema: string): Promise<CategoriaFinanceira[]>;
  buscarPorId(schema: string, id: string): Promise<CategoriaFinanceira | null>;
  buscarPorNome(schema: string, nome: string): Promise<CategoriaFinanceira | null>;
  criar(schema: string, nome: string, grupo: GrupoCatFin, contaContabilId: string | null): Promise<string>;
  atualizar(schema: string, id: string, nome: string, grupo: GrupoCatFin, contaContabilId: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
