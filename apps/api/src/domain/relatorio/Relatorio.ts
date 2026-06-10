export interface LinhaVenda { numero: number; data: string; cliente: string | null; vendedor: string | null; status: string; total: number; }
export interface TotalVendedor { vendedor: string; quantidade: number; total: number; }
export interface RelatorioVendas { linhas: LinhaVenda[]; total: number; quantidade: number; porVendedor: TotalVendedor[]; }
export interface LinhaProduto { nome: string; quantidade: number; total: number; }
export interface RelatorioRepository {
  vendas(schema: string, de: string | null, ate: string | null): Promise<RelatorioVendas>;
  produtosVendidos(schema: string, de: string | null, ate: string | null): Promise<LinhaProduto[]>;
}
