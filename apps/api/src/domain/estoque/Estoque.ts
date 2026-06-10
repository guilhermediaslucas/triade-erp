export interface LotePosicao {
  id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number;
}
export interface PosicaoProduto {
  produtoId: string; produtoNome: string; unidade: string; estoqueMinimo: number;
  saldo: number; abaixoMinimo: boolean; lotes: LotePosicao[];
}
export interface EntradaEstoque {
  produtoId: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number;
}
export interface EstoqueRepository {
  posicao(schema: string): Promise<PosicaoProduto[]>;
  registrarEntrada(schema: string, e: EntradaEstoque): Promise<void>;
  produtoExiste(schema: string, produtoId: string): Promise<boolean>;
}
