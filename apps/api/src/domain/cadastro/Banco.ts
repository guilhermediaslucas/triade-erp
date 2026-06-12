// Cadastro simples de bancos/instituições (usado na conciliação e nas contas correntes).
export interface Banco { id: string; nome: string; ativo: boolean; }

export interface BancoRepository {
  listar(schema: string): Promise<Banco[]>;
  buscarPorId(schema: string, id: string): Promise<Banco | null>;
  criar(schema: string, nome: string): Promise<string>;
  atualizar(schema: string, id: string, nome: string): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
