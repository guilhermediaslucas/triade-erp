export interface Produto {
  id: string;
  nome: string;
  categoriaId: string | null;
  unidade: string;
  preco: number;
  estoqueMinimo: number;
  ativo: boolean;
  criadoEm: Date;
}

// Para listagem com o nome da categoria resolvido.
export interface ProdutoResumo extends Produto { categoriaNome: string | null; }

export interface NovoProduto {
  nome: string;
  categoriaId: string | null;
  unidade: string;
  preco: number;
  estoqueMinimo: number;
}

export interface ProdutoRepository {
  listar(schema: string): Promise<ProdutoResumo[]>;
  buscarPorId(schema: string, id: string): Promise<Produto | null>;
  criar(schema: string, dados: NovoProduto): Promise<string>;
  atualizar(schema: string, id: string, dados: NovoProduto): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
