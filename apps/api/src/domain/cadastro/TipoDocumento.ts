// Cadastro simples de tipos de documento (NF-e, Boleto, Fatura, Recibo…),
// usado no campo "Tipo de documento" ao lançar um título no Financeiro.
export interface TipoDocumento { id: string; nome: string; ativo: boolean; }

export interface TipoDocumentoRepository {
  listar(schema: string): Promise<TipoDocumento[]>;
  buscarPorId(schema: string, id: string): Promise<TipoDocumento | null>;
  criar(schema: string, nome: string): Promise<string>;
  atualizar(schema: string, id: string, nome: string): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
