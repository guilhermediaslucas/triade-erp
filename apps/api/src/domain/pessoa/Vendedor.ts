export interface Vendedor {
  id: string; nome: string; email: string | null; telefone: string | null;
  regiao: string | null; metaMensal: number; comissaoPercentual: number;
  segueRegraGeral: boolean; ativo: boolean; criadoEm: Date;
  vendasMes: number;
}
export interface NovoVendedor {
  nome: string; email: string | null; telefone: string | null;
  regiao: string | null; metaMensal: number; comissaoPercentual: number; segueRegraGeral: boolean;
}
export interface VendedorRepository {
  listar(schema: string): Promise<Vendedor[]>;
  buscarPorId(schema: string, id: string): Promise<Vendedor | null>;
  criar(schema: string, d: NovoVendedor): Promise<string>;
  atualizar(schema: string, id: string, d: NovoVendedor): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
