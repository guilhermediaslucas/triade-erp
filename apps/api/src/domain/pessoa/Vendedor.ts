export interface Vendedor {
  id: string; nome: string; email: string | null; telefone: string | null;
  comissaoPercentual: number; ativo: boolean; criadoEm: Date;
}
export interface NovoVendedor {
  nome: string; email: string | null; telefone: string | null; comissaoPercentual: number;
}
export interface VendedorRepository {
  listar(schema: string): Promise<Vendedor[]>;
  buscarPorId(schema: string, id: string): Promise<Vendedor | null>;
  criar(schema: string, d: NovoVendedor): Promise<string>;
  atualizar(schema: string, id: string, d: NovoVendedor): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
