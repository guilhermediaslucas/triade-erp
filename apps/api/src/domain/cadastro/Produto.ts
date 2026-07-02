export interface Produto {
  id: string;
  nome: string;
  categoriaId: string | null;
  unidade: string;
  estoqueMinimo: number;
  localizacao: string | null;
  registroAnvisa: string | null;
  // Fiscal (Fase 7): NCM obrigatório p/ emitir NF-e; os demais sobrescrevem o perfil padrão da empresa.
  ncm: string | null;
  cfop: string | null;
  cstFiscal: string | null;
  origemFiscal: string | null;
  ativo: boolean;
  criadoEm: Date;
}
export interface ProdutoResumo extends Produto { precoBase: number; categoriaNome: string | null }
export interface NovoProduto {
  nome: string;
  categoriaId: string | null;
  unidade: string;
  estoqueMinimo: number;
  localizacao: string | null;
  registroAnvisa: string | null;
  ncm: string | null;
  cfop: string | null;
  cstFiscal: string | null;
  origemFiscal: string | null;
}
export interface ProdutoRepository {
  listar(schema: string): Promise<ProdutoResumo[]>;
  buscarPorId(schema: string, id: string): Promise<Produto | null>;
  criar(schema: string, dados: NovoProduto): Promise<string>;
  atualizar(schema: string, id: string, dados: NovoProduto): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
