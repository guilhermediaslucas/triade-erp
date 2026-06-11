export interface Motoboy { id: string; nome: string; telefone: string | null; ativo: boolean; }

export interface MotoboyRepository {
  listar(schema: string): Promise<Motoboy[]>;
  buscarPorId(schema: string, id: string): Promise<Motoboy | null>;
  criar(schema: string, nome: string, telefone: string | null): Promise<string>;
  atualizar(schema: string, id: string, nome: string, telefone: string | null): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
