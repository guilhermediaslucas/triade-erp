export interface Categoria { id: string; nome: string; criadoEm: Date; }

export interface CategoriaRepository {
  listar(schema: string): Promise<Categoria[]>;
  buscarPorId(schema: string, id: string): Promise<Categoria | null>;
  criar(schema: string, nome: string): Promise<Categoria>;
  atualizar(schema: string, id: string, nome: string): Promise<void>;
}
