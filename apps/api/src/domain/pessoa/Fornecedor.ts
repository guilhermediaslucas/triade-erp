export interface Fornecedor {
  id: string; nome: string; fantasia: string | null; documento: string;
  email: string | null; telefone: string | null;
  cep: string | null; cidade: string | null; uf: string | null;
  logradouro: string | null; numero: string | null; complemento: string | null; bairro: string | null;
  ativo: boolean; criadoEm: Date;
}
export interface NovoFornecedor {
  nome: string; fantasia: string | null; documento: string; email: string | null; telefone: string | null;
  cep: string | null; cidade: string | null; uf: string | null;
  logradouro: string | null; numero: string | null; complemento: string | null; bairro: string | null;
}
export interface FornecedorRepository {
  listar(schema: string): Promise<Fornecedor[]>;
  buscarPorId(schema: string, id: string): Promise<Fornecedor | null>;
  criar(schema: string, d: NovoFornecedor): Promise<string>;
  atualizar(schema: string, id: string, d: NovoFornecedor): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
