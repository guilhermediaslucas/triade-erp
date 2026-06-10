import type { NovoProduto, ProdutoRepository, ProdutoResumo } from '../../domain/cadastro/Produto.js';
import type { CategoriaRepository } from '../../domain/cadastro/Categoria.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class ProdutosService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly categorias: CategoriaRepository,
  ) {}

  listar(schema: string): Promise<ProdutoResumo[]> { return this.produtos.listar(schema); }

  private async validar(schema: string, e: any): Promise<NovoProduto> {
    if (!e?.nome || String(e.nome).trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
    const preco = Number(e.preco);
    if (!Number.isFinite(preco) || preco < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    const estoqueMinimo = Number(e.estoqueMinimo ?? 0);
    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) throw new ErroAplicacao('produto.minimo_invalido', 400);
    const categoriaId = e.categoriaId || null;
    if (categoriaId && !(await this.categorias.buscarPorId(schema, categoriaId))) {
      throw new ErroAplicacao('produto.categoria_invalida', 400);
    }
    return {
      nome: String(e.nome).trim(),
      categoriaId,
      unidade: (e.unidade && String(e.unidade).trim()) || 'UN',
      preco, estoqueMinimo,
    };
  }

  async criar(schema: string, e: any): Promise<string> {
    return this.produtos.criar(schema, await this.validar(schema, e));
  }

  async editar(schema: string, id: string, e: any): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.atualizar(schema, id, await this.validar(schema, e));
  }

  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.definirAtivo(schema, id, ativo);
  }
}
