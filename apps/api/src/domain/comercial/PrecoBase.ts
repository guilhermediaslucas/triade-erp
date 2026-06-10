export interface PrecoProduto {
  produtoId: string;
  produtoNome: string;
  categoriaNome: string | null;
  unidade: string;
  ativo: boolean;
  preco: number; // 0 quando ainda não definido
}
export interface PrecoBaseRepository {
  listar(schema: string): Promise<PrecoProduto[]>;
  definir(schema: string, produtoId: string, preco: number): Promise<void>;
  produtoExiste(schema: string, produtoId: string): Promise<boolean>;
  precoDe(schema: string, produtoId: string): Promise<number>;
}
