export type StatusEtiqueta = 'estoque' | 'saida' | 'perda';

export interface Etiqueta {
  id: string; codigo: string; status: StatusEtiqueta; criadoEm: string;
}

// Visão de consulta (ao bipar um código): resolve produto + lote + validade.
export interface EtiquetaConsulta {
  codigo: string; status: StatusEtiqueta;
  produtoId: string; produtoNome: string;
  loteId: string; lote: string | null; validade: string | null;
}

export interface EtiquetaRepository {
  listarPorLote(schema: string, loteId: string): Promise<Etiqueta[]>;
  buscarPorCodigo(schema: string, codigo: string): Promise<EtiquetaConsulta | null>;
  // Todas as etiquetas atualmente em estoque (esperadas no inventario).
  listarEmEstoque(schema: string): Promise<EtiquetaConsulta[]>;
  // Dado um conjunto de códigos, retorna os que JÁ existem no estoque (para recusar duplicidade na entrada).
  jaExistem(schema: string, codigos: string[]): Promise<string[]>;
  // Marca a etiqueta como consumida (saida na separação, perda na baixa). Usado nas fases seguintes.
  consumir(schema: string, codigo: string, status: StatusEtiqueta): Promise<void>;
}
