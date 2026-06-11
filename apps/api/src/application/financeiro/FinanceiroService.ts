import type { MovimentoFluxo, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export type AgingFaixa = 'a_vencer' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_mais';
export interface AgingLinha {
  id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; diasAtraso: number; faixa: AgingFaixa;
}
export interface RelatorioAging { linhas: AgingLinha[]; totais: Record<AgingFaixa, number>; totalAberto: number; }

export interface DreLinha { origem: string; total: number; }
export interface RelatorioDre { receitas: DreLinha[]; despesas: DreLinha[]; totalReceitas: number; totalDespesas: number; resultado: number; }

function faixaDe(dias: number): AgingFaixa {
  if (dias <= 0) return 'a_vencer';
  if (dias <= 30) return 'd1_30';
  if (dias <= 60) return 'd31_60';
  if (dias <= 90) return 'd61_90';
  return 'd90_mais';
}
const r2 = (n: number) => Math.round(n * 100) / 100;
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class FinanceiroService {
  constructor(private readonly repo: TituloRepository) {}
  listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]> { return this.repo.listar(schema, tipo); }
  fluxo(schema: string): Promise<MovimentoFluxo[]> { return this.repo.listarPagos(schema); }

  // Aging: títulos em aberto agrupados por faixa de atraso (relativo a hoje).
  async aging(schema: string, tipo: TipoTitulo): Promise<RelatorioAging> {
    const todos = await this.repo.listar(schema, tipo);
    const hoje = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00').getTime();
    const linhas: AgingLinha[] = todos
      .filter((t) => t.status === 'aberto')
      .map((t) => {
        const venc = new Date(String(t.vencimento).slice(0, 10) + 'T00:00:00').getTime();
        const diasAtraso = Math.round((hoje - venc) / 86400000);
        return {
          id: t.id, descricao: t.descricao, pessoaNome: t.pessoaNome, valor: t.valor,
          vencimento: String(t.vencimento).slice(0, 10), diasAtraso, faixa: faixaDe(diasAtraso),
        };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);
    const totais: Record<AgingFaixa, number> = { a_vencer: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_mais: 0 };
    for (const l of linhas) totais[l.faixa] += l.valor;
    (Object.keys(totais) as AgingFaixa[]).forEach((k) => { totais[k] = r2(totais[k]); });
    return { linhas, totais, totalAberto: r2(linhas.reduce((a, l) => a + l.valor, 0)) };
  }

  // DRE de caixa (resultado do período): títulos pagos no período, agrupados por origem.
  async dre(schema: string, de: any, ate: any): Promise<RelatorioDre> {
    const linhas = await this.repo.pagosPorOrigem(schema, lim(de), lim(ate));
    const receitas = linhas.filter((l) => l.tipo === 'receber').map((l) => ({ origem: l.origem, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const despesas = linhas.filter((l) => l.tipo === 'pagar').map((l) => ({ origem: l.origem, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const totalReceitas = r2(receitas.reduce((a, l) => a + l.total, 0));
    const totalDespesas = r2(despesas.reduce((a, l) => a + l.total, 0));
    return { receitas, despesas, totalReceitas, totalDespesas, resultado: r2(totalReceitas - totalDespesas) };
  }

  async criar(schema: string, tipo: TipoTitulo, e: any): Promise<string> {
    if (!e?.descricao || String(e.descricao).trim().length < 2) throw new ErroAplicacao('financeiro.descricao_invalida', 400);
    const valor = Number(e?.valor);
    if (!Number.isFinite(valor) || valor <= 0) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    const vencimento = (e?.vencimento && String(e.vencimento).trim()) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimento)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    return this.repo.criar(schema, {
      tipo, descricao: String(e.descricao).trim(), pessoaNome: (e?.pessoaNome && String(e.pessoaNome).trim()) || null,
      valor, vencimento, categoriaFinanceiraId: (e?.categoriaFinanceiraId && String(e.categoriaFinanceiraId).trim()) || null,
    }, 'manual', null);
  }

  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.ja_pago', 409);
    await this.repo.baixar(schema, id, (formaPagamento && String(formaPagamento).trim()) || null, contaCorrenteId || null);
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
