export type StatusEtiqueta = 'estoque' | 'saida' | 'perda';

export interface Etiqueta {
  id: string; codigo: string; status: StatusEtiqueta; criadoEm: string;
}

// Visão de consulta (ao bipar um código): resolve produto + lote + validade + marca,
// saldo/custo do lote e a origem (fornecedor / nº da nota / emissão).
export interface EtiquetaConsulta {
  codigo: string; status: StatusEtiqueta;
  produtoId: string; produtoNome: string; unidade: string | null;
  loteId: string; lote: string | null; validade: string | null;
  marca: string | null; saldoLote: number; custoUnitario: number;
  fornecedor: string | null; nf: string | null; emissao: string | null;
}

export interface EtiquetaRepository {
  listarPorLote(schema: string, loteId: string): Promise<Etiqueta[]>;
  buscarPorCodigo(schema: string, codigo: string): Promise<EtiquetaConsulta | null>;
  // Todas as etiquetas atualmente em estoque (esperadas no inventario).
  listarEmEstoque(schema: string): Promise<EtiquetaConsulta[]>;
  // Dado um conjunto de códigos, retorna os que JÁ existem no estoque (para recusar duplicidade na entrada).
  jaExistem(schema: string, codigos: string[]): Promise<string[]>;
  // Marca a etiqueta como consumida (saida na separação, perda na baixa).
  // pedidoRef vincula a etiqueta ao pedido (permite devolvê-la no cancelamento).
  consumir(schema: string, codigo: string, status: StatusEtiqueta, pedidoRef?: string | null): Promise<void>;
  // Devolve ao estoque as etiquetas consumidas por um pedido (cancelamento).
  reverterPorPedido(schema: string, pedidoRef: string): Promise<void>;
}
