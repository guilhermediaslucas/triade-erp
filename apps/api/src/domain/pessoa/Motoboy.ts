export interface Motoboy { id: string; nome: string; telefone: string | null; cpf: string | null; chavePix: string | null; ativo: boolean; }
export interface NovoMotoboy { nome: string; telefone: string | null; cpf: string | null; chavePix: string | null; }

export interface MotoboyRepository {
  listar(schema: string): Promise<Motoboy[]>;
  buscarPorId(schema: string, id: string): Promise<Motoboy | null>;
  criar(schema: string, m: NovoMotoboy): Promise<string>;
  atualizar(schema: string, id: string, m: NovoMotoboy): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
