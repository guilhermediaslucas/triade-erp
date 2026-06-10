export interface Condicao { id: string; nome: string; parcelas: number; intervaloDias: number; ativo: boolean; }
export interface CondicaoRepository {
  listar(schema: string): Promise<Condicao[]>;
  buscarPorId(schema: string, id: string): Promise<Condicao | null>;
  criar(schema: string, nome: string, parcelas: number, intervaloDias: number): Promise<string>;
  atualizar(schema: string, id: string, nome: string, parcelas: number, intervaloDias: number): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
