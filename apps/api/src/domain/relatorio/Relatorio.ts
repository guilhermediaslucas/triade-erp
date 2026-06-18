export interface LinhaVenda { numero: number; data: string; cliente: string | null; vendedor: string | null; status: string; total: number; }
export interface TotalVendedor { vendedor: string; quantidade: number; total: number; }
export interface RelatorioVendas { linhas: LinhaVenda[]; total: number; quantidade: number; porVendedor: TotalVendedor[]; }
export interface LinhaProduto { nome: string; quantidade: number; total: number; }
export interface LinhaValidadeLote {
  produtoId: string; produto: string; lote: string | null; validade: string | null;
  saldo: number; custoUnitario: number; valor: number;
}
export interface LinhaEstoqueParado {
  produtoId: string; produto: string; saldo: number; valor: number; ultimaSaida: string | null;
}
export interface LinhaPerda {
  produtoId: string; produto: string; lote: string | null; quantidade: number; motivo: string | null; data: string; valor: number;
}
export interface LinhaPedidoRel {
  numero: number; data: string; cliente: string | null; vendedor: string | null;
  formaEntrega: string; formaEnvio: string | null; status: string; total: number; entregueEm: string | null;
}
export type ClasseAbc = 'A' | 'B' | 'C';
export interface LinhaAbc { nome: string; quantidade: number; total: number; pct: number; acumuladoPct: number; classe: ClasseAbc; }
export interface RelatorioAbc { linhas: LinhaAbc[]; totalGeral: number; resumo: Record<ClasseAbc, { itens: number; total: number }>; }
// Relatório contábil de vendas: separa a VENDA (itens) do FRETE (cobrado/custo/absorvido).
export interface LinhaVendaContabil {
  numero: number; data: string; cliente: string | null;
  venda: number; freteCobrado: number; freteCusto: number; absorvido: number; tipoFrete: string; total: number;
  tituloId: string | null; anexosCount: number;   // título a receber do pedido (p/ ver anexos)
}
export interface RelatorioVendasContabil {
  linhas: LinhaVendaContabil[];
  venda: number; freteCobrado: number; freteCusto: number; absorvido: number; total: number;
}
export interface RelatorioRepository {
  vendas(schema: string, de: string | null, ate: string | null): Promise<RelatorioVendas>;
  vendasContabil(schema: string, de: string | null, ate: string | null): Promise<RelatorioVendasContabil>;
  produtosVendidos(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]>;
  curvaAbcProdutos(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]>;
  curvaAbcClientes(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]>;
  validadeLotes(schema: string): Promise<LinhaValidadeLote[]>;
  estoqueParado(schema: string): Promise<LinhaEstoqueParado[]>;
  perdasEstoque(schema: string, de: string | null, ate: string | null): Promise<LinhaPerda[]>;
  pedidos(schema: string, de: string | null, ate: string | null, status: string | null): Promise<LinhaPedidoRel[]>;
}
