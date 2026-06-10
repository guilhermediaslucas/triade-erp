import type { MovimentoFluxo, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class FinanceiroService {
  constructor(private readonly repo: TituloRepository) {}
  listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]> { return this.repo.listar(schema, tipo); }
  fluxo(schema: string): Promise<MovimentoFluxo[]> { return this.repo.listarPagos(schema); }

  async criar(schema: string, tipo: TipoTitulo, e: any): Promise<string> {
    if (!e?.descricao || String(e.descricao).trim().length < 2) throw new ErroAplicacao('financeiro.descricao_invalida', 400);
    const valor = Number(e?.valor);
    if (!Number.isFinite(valor) || valor <= 0) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    const vencimento = (e?.vencimento && String(e.vencimento).trim()) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimento)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    return this.repo.criar(schema, {
      tipo, descricao: String(e.descricao).trim(), pessoaNome: (e?.pessoaNome && String(e.pessoaNome).trim()) || null,
      valor, vencimento,
    }, 'manual', null);
  }

  async baixar(schema: string, id: string, formaPagamento: string | null): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.ja_pago', 409);
    await this.repo.baixar(schema, id, (formaPagamento && String(formaPagamento).trim()) || null);
  }
  async cancelarBaixa(schema: string, id: string): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    await this.repo.cancelarBaixa(schema, id);
  }
  async excluir(schema: string, id: string): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    await this.repo.excluir(schema, id);
  }
}
