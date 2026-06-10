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
  disponivel(schema: string, produtoId: string): Promise<number>;
  baixarFifo(schema: string, produtoId: string, quantidade: number, ref: string): Promise<void>;
  saldoLote(schema: string, loteId: string): Promise<{ produtoId: string; saldo: number } | null>;
  baixarLote(schema: string, loteId: string, produtoId: string, quantidade: number, motivo: string): Promise<void>;
}
