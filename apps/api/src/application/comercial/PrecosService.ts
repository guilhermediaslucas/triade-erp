import type { Campanha, PrecoBaseRepository, PrecoProduto } from '../../domain/comercial/PrecoBase.js';
import type { PrecoClienteLinha, PrecoClienteRepository } from '../../domain/comercial/PrecoCliente.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class PrecosService {
  constructor(private readonly repo: PrecoBaseRepository, private readonly clientes: PrecoClienteRepository) {}
  listar(schema: string): Promise<PrecoProduto[]> { return this.repo.listar(schema); }
  async definir(schema: string, produtoId: string, preco: number): Promise<void> {
    const p = Number(preco);
    if (!Number.isFinite(p) || p < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    if (!(await this.repo.produtoExiste(schema, produtoId))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definir(schema, produtoId, p);
  }

  listarCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]> { return this.clientes.listarPorCliente(schema, clienteId); }
  async definirCliente(schema: string, clienteId: string, produtoId: string, preco: number): Promise<void> {
    const p = Number(preco);
    if (!Number.isFinite(p) || p < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    if (!(await this.repo.produtoExiste(schema, produtoId))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.clientes.definir(schema, clienteId, produtoId, p);
  }

  listarCampanhas(schema: string, produtoId: string): Promise<Campanha[]> { return this.repo.listarCampanhas(schema, produtoId); }
  async criarCampanha(schema: string, produtoId: string, e: any): Promise<void> {
    const preco = Number(e?.preco);
    if (!Number.isFinite(preco) || preco < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    const de = String(e?.de ?? ''); const ate = String(e?.ate ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    if (ate < de) throw new ErroAplicacao('campanha.periodo_invalido', 400);
    if (!(await this.repo.produtoExiste(schema, produtoId))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.criarCampanha(schema, produtoId, preco, (e?.motivo && String(e.motivo).trim()) || null, de, ate);
  }
  removerCampanha(schema: string, id: string): Promise<void> { return this.repo.removerCampanha(schema, id); }
}
