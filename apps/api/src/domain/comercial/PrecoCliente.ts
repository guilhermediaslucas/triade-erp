export interface PrecoClienteLinha { produtoId: string; produtoNome: string; precoBase: number; precoCliente: number | null; }
export interface PrecoClienteRepository {
  listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]>;
  definir(schema: string, clienteId: string, produtoId: string, preco: number): Promise<void>;
  precoDe(schema: string, clienteId: string, produtoId: string): Promise<number | null>;
}
