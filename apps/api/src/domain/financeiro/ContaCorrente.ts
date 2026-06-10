export interface ContaCorrente { id: string; nome: string; banco: string | null; saldoInicial: number; ativo: boolean; }
export interface ContaSaldo extends ContaCorrente { saldo: number; }
export interface ContaCorrenteRepository {
  listar(schema: string): Promise<ContaCorrente[]>;
  saldos(schema: string): Promise<ContaSaldo[]>;
  buscarPorId(schema: string, id: string): Promise<ContaCorrente | null>;
  criar(schema: string, nome: string, banco: string | null, saldoInicial: number): Promise<string>;
  atualizar(schema: string, id: string, nome: string, banco: string | null, saldoInicial: number): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
