export type TipoPessoa = 'PJ' | 'PF';

export interface Cliente {
  id: string; tipoPessoa: TipoPessoa; nome: string; fantasia: string | null;
  documento: string; email: string | null; telefone: string | null;
  limiteCredito: number; ativo: boolean; criadoEm: Date;
}
export interface NovoCliente {
  tipoPessoa: TipoPessoa; nome: string; fantasia: string | null;
  documento: string; email: string | null; telefone: string | null; limiteCredito: number;
}
export interface ClienteRepository {
  listar(schema: string): Promise<Cliente[]>;
  buscarPorId(schema: string, id: string): Promise<Cliente | null>;
  criar(schema: string, d: NovoCliente): Promise<string>;
  atualizar(schema: string, id: string, d: NovoCliente): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
