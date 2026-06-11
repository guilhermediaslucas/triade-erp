export interface Marca { id: string; nome: string; fabricante: string | null; ativo: boolean; }

export interface MarcaRepository {
  listar(schema: string): Promise<Marca[]>;
  buscarPorId(schema: string, id: string): Promise<Marca | null>;
  criar(schema: string, nome: string, fabricante: string | null): Promise<string>;
  atualizar(schema: string, id: string, nome: string, fabricante: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
