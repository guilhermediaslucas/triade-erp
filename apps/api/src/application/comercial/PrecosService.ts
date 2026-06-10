import type { PrecoBaseRepository, PrecoProduto } from '../../domain/comercial/PrecoBase.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class PrecosService {
  constructor(private readonly repo: PrecoBaseRepository) {}
  listar(schema: string): Promise<PrecoProduto[]> { return this.repo.listar(schema); }
  async definir(schema: string, produtoId: string, preco: number): Promise<void> {
    const p = Number(preco);
    if (!Number.isFinite(p) || p < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    if (!(await this.repo.produtoExiste(schema, produtoId))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definir(schema, produtoId, p);
  }
}
