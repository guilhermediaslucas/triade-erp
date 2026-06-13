export interface Recebimento {
  id: string; fornecedorNome: string | null; produtoId: string | null; produtoNome: string;
  quantidade: number; custoUnitario: number; total: number; nf: string | null; status: 'pendente' | 'recebido'; criadoEm: string;
  tituloId: string | null;
}
export interface AtualizacaoRecebimento {
  fornecedorNome: string | null; quantidade: number; custoUnitario: number; total: number; nf: string | null;
}
export interface RecebimentoRepository {
  criar(schema: string, r: Omit<Recebimento, 'id' | 'status' | 'criadoEm' | 'tituloId'> & { tituloId: string | null }): Promise<string>;
  listarPendentes(schema: string): Promise<Recebimento[]>;
  listar(schema: string, de: string | null, ate: string | null): Promise<Recebimento[]>;
  buscarPorId(schema: string, id: string): Promise<Recebimento | null>;
  marcarRecebido(schema: string, id: string): Promise<void>;
  atualizar(schema: string, id: string, r: AtualizacaoRecebimento): Promise<void>;
  excluir(schema: string, id: string): Promise<void>;
}
