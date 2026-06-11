export interface FaltanteInventario {
  codigo: string; produtoNome: string; lote: string | null; validade: string | null;
}
export interface InventarioResumo {
  id: string; responsavel: string | null;
  esperadas: number; encontradas: number; faltantes: number;
  baixouPerda: boolean; criadoEm: string;
}
export interface NovoInventario {
  responsavel: string | null; esperadas: number; encontradas: number; faltantes: number; baixouPerda: boolean;
}
export interface InventarioRepository {
  criar(schema: string, dados: NovoInventario, faltantes: FaltanteInventario[]): Promise<string>;
  listar(schema: string): Promise<InventarioResumo[]>;
  faltantesDe(schema: string, id: string): Promise<FaltanteInventario[]>;
}
