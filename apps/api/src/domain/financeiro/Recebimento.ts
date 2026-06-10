export interface Recebimento {
  id: string; fornecedorNome: string | null; produtoId: string | null; produtoNome: string;
  quantidade: number; custoUnitario: number; total: number; nf: string | null; status: 'pendente' | 'recebido'; criadoEm: string;
}
export interface RecebimentoRepository {
  criar(schema: string, r: Omit<Recebimento, 'id' | 'status' | 'criadoEm'> & { tituloId: string | null }): Promise<string>;
  listarPendentes(schema: string): Promise<Recebimento[]>;
  buscarPorId(schema: string, id: string): Promise<Recebimento | null>;
  marcarRecebido(schema: string, id: string): Promise<void>;
}
