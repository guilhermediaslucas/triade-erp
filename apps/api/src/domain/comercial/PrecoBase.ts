export interface PrecoProduto {
  produtoId: string;
  produtoNome: string;
  categoriaNome: string | null;
  unidade: string;
  ativo: boolean;
  preco: number; // 0 quando ainda não definido
}
export interface Campanha {
  id: string; produtoId: string; preco: number; motivo: string | null; de: string; ate: string; vigente: boolean;
}

export interface PrecoBaseRepository {
  listarCampanhas(schema: string, produtoId: string): Promise<Campanha[]>;
  criarCampanha(schema: string, produtoId: string, preco: number, motivo: string | null, de: string, ate: string): Promise<void>;
  removerCampanha(schema: string, id: string): Promise<void>;
  listar(schema: string): Promise<PrecoProduto[]>;
  definir(schema: string, produtoId: string, preco: number): Promise<void>;
  produtoExiste(schema: string, produtoId: string): Promise<boolean>;
  precoDe(schema: string, produtoId: string): Promise<number>;
}
