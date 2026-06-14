export interface LotePosicao {
  id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number;
  marca: string | null;
}
export interface PosicaoProduto {
  produtoId: string; produtoNome: string; unidade: string; estoqueMinimo: number;
  saldo: number; abaixoMinimo: boolean; lotes: LotePosicao[];
  reservado: number;   // comprometido em pedidos confirmados ainda não separados
  disponivel: number;  // saldo - reservado
}
export interface EntradaEstoque {
  produtoId: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number;
  // Marca do lote (opcional na entrada manual; obrigatória no recebimento de nota).
  marcaId?: string | null;
  // Códigos das etiquetas (já afixadas nos produtos) bipados nesta entrada.
  // O sistema NÃO gera etiquetas — apenas registra os códigos lidos. quantidade = codigos.length.
  codigos?: string[];
  // Origem da nota (quando a entrada vem de um recebimento de compra) — gravada na etiqueta.
  fornecedor?: string | null; nf?: string | null; emissao?: string | null;
}
export interface EstoqueRepository {
  posicao(schema: string): Promise<PosicaoProduto[]>;
  registrarEntrada(schema: string, e: EntradaEstoque): Promise<void>;
  produtoExiste(schema: string, produtoId: string): Promise<boolean>;
  disponivel(schema: string, produtoId: string): Promise<number>;
  baixarFifo(schema: string, produtoId: string, quantidade: number, ref: string): Promise<void>;
  saldoLote(schema: string, loteId: string): Promise<{ produtoId: string; saldo: number } | null>;
  baixarLote(schema: string, loteId: string, produtoId: string, quantidade: number, motivo: string): Promise<void>;
  // Baixa uma unidade de um lote especifico (saida por etiqueta na separacao).
  baixarUnidadeLote(schema: string, loteId: string, produtoId: string, ref: string): Promise<void>;
  // Baixa uma unidade de um lote como PERDA (ajuste de inventario).
  baixarUnidadeLotePerda(schema: string, loteId: string, produtoId: string, motivo: string): Promise<void>;
  // Devolve ao estoque as quantidades que saíram por um pedido (cancelamento): reverte os
  // movimentos de saída daquele ref, repondo o saldo dos lotes e registrando a devolução.
  devolverPorRef(schema: string, ref: string): Promise<void>;
}
