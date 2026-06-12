export type TipoPessoa = 'PJ' | 'PF';

export interface EnderecoCliente {
  id?: string;
  cep: string | null; logradouro: string | null; numero: string | null;
  complemento: string | null; bairro: string | null; cidade: string | null; uf: string | null;
  favorito: boolean;
}

export interface Cliente {
  id: string; tipoPessoa: TipoPessoa; nome: string; fantasia: string | null;
  documento: string; email: string | null; telefone: string | null;
  limiteCredito: number; ativo: boolean; criadoEm: Date;
  enderecos: EnderecoCliente[];
  emAberto: number;
}
export interface NovoCliente {
  tipoPessoa: TipoPessoa; nome: string; fantasia: string | null;
  documento: string; email: string | null; telefone: string | null; limiteCredito: number;
  enderecos: EnderecoCliente[];
}
export interface ClienteRepository {
  listar(schema: string): Promise<Cliente[]>;
  buscarPorId(schema: string, id: string): Promise<Cliente | null>;
  criar(schema: string, d: NovoCliente): Promise<string>;
  atualizar(schema: string, id: string, d: NovoCliente): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
