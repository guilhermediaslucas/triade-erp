import type { LinhaConciliacao, MovimentoFluxo, PagoAgrupado, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { PedidoRepository } from '../../domain/comercial/Pedido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export type AgingFaixa = 'a_vencer' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_mais';
export interface AgingLinha {
  id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; diasAtraso: number; faixa: AgingFaixa;
}
export interface RelatorioAging { linhas: AgingLinha[]; totais: Record<AgingFaixa, number>; totalAberto: number; }

export type DrePor = 'origem' | 'categoria';
export interface DreLinha { origem: string; total: number; }
export interface RelatorioDre { por: DrePor; receitas: DreLinha[]; despesas: DreLinha[]; totalReceitas: number; totalDespesas: number; resultado: number; }

export interface RelatorioConciliacao {
  linhas: LinhaConciliacao[];
  totalEntradas: number; totalSaidas: number; saldoMovimento: number;
  qtdConciliado: number; qtdPendente: number; valorConciliado: number; valorPendente: number;
}

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
  constructor(private readonly repo: TituloRepository, private readonly pedidos?: PedidoRepository) {}
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

  // DRE de caixa (resultado do período): títulos pagos no período, agrupados por origem ou categoria.
  async dre(schema: string, de: any, ate: any, por: any): Promise<RelatorioDre> {
    const grupo: DrePor = por === 'categoria' ? 'categoria' : 'origem';
    const linhas: PagoAgrupado[] = grupo === 'categoria'
      ? await this.repo.pagosPorCategoria(schema, lim(de), lim(ate))
      : await this.repo.pagosPorOrigem(schema, lim(de), lim(ate));
    const receitas = linhas.filter((l) => l.tipo === 'receber').map((l) => ({ origem: l.chave, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const despesas = linhas.filter((l) => l.tipo === 'pagar').map((l) => ({ origem: l.chave, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const totalReceitas = r2(receitas.reduce((a, l) => a + l.total, 0));
    const totalDespesas = r2(despesas.reduce((a, l) => a + l.total, 0));
    return { por: grupo, receitas, despesas, totalReceitas, totalDespesas, resultado: r2(totalReceitas - totalDespesas) };
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
      favorecidoId: (e?.favorecidoId && String(e.favorecidoId).trim()) || null,
      previsto: e?.previsto === true,
    }, 'manual', null);
  }

  // Marca/desmarca o título como previsto (provisão). Só faz sentido em título em aberto.
  async definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.previsto_so_aberto', 400);
    await this.repo.definirPrevisto(schema, id, !!previsto);
  }

  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.ja_pago', 409);
    if (t.previsto) throw new ErroAplicacao('financeiro.previsto_nao_baixa', 400);
    await this.repo.baixar(schema, id, (formaPagamento && String(formaPagamento).trim()) || null, contaCorrenteId || null);
    // Confirmação do recebimento do título de um pedido (Pix/Boleto) libera o pedido:
    // aguardando_pagamento → aprovado, ficando disponível para Separação no Kanban.
    if (this.pedidos && t.origem === 'pedido' && t.pedidoId) {
      const ped = await this.pedidos.buscarPorId(schema, t.pedidoId);
      if (ped && ped.status === 'aguardando_pagamento') {
        await this.pedidos.mudarStatus(schema, t.pedidoId, 'aprovado');
      }
    }
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

  // Conciliação bancária (manual): lançamentos pagos numa conta no período + totais.
  // Sinal por tipo: receber = entrada (+), pagar = saída (-).
  async conciliacao(schema: string, contaCorrenteId: any, de: any, ate: any): Promise<RelatorioConciliacao> {
    const conta = (contaCorrenteId && String(contaCorrenteId).trim()) || '';
    if (!conta) throw new ErroAplicacao('conciliacao.conta_obrigatoria', 400);
    const linhas = await this.repo.conciliacao(schema, conta, lim(de), lim(ate));
    let totalEntradas = 0, totalSaidas = 0, valorConciliado = 0, valorPendente = 0, qtdConciliado = 0, qtdPendente = 0;
    for (const l of linhas) {
      const sinal = l.tipo === 'receber' ? l.valor : -l.valor;
      if (l.tipo === 'receber') totalEntradas = r2(totalEntradas + l.valor);
      else totalSaidas = r2(totalSaidas + l.valor);
      if (l.conciliado) { valorConciliado = r2(valorConciliado + sinal); qtdConciliado++; }
      else { valorPendente = r2(valorPendente + sinal); qtdPendente++; }
    }
    return {
      linhas, totalEntradas, totalSaidas, saldoMovimento: r2(totalEntradas - totalSaidas),
      qtdConciliado, qtdPendente, valorConciliado, valorPendente,
    };
  }

  async marcarConciliado(schema: string, id: string, conciliado: boolean): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status !== 'pago') throw new ErroAplicacao('conciliacao.so_pago', 400);
    await this.repo.definirConciliado(schema, id, !!conciliado);
  }

  // Parcela/replica um título em aberto. modo 'dividir' reparte o valor em N parcelas;
  // 'replicar' cria N cópias com o mesmo valor (ex.: aluguel mensal). Substitui o original.
  async parcelar(schema: string, id: string, e: any): Promise<number> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status !== 'aberto') throw new ErroAplicacao('parcelar.so_aberto', 400);
    const modo = e?.modo === 'replicar' ? 'replicar' : 'dividir';
    const n = Math.trunc(Number(e?.parcelas));
    if (!Number.isFinite(n) || n < 2 || n > 99) throw new ErroAplicacao('parcelar.parcelas_invalidas', 400);
    const intervalo = Math.trunc(Number(e?.intervaloDias ?? 30));
    if (!Number.isFinite(intervalo) || intervalo < 0) throw new ErroAplicacao('parcelar.intervalo_invalido', 400);

    const base = modo === 'dividir' ? Math.floor((t.valor / n) * 100) / 100 : t.valor;
    const addDias = (iso: string, dias: number): string => {
      const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + dias);
      return d.toISOString().slice(0, 10);
    };
    for (let i = 1; i <= n; i++) {
      const valor = modo === 'dividir' && i === n ? r2(t.valor - base * (n - 1)) : base;
      await this.repo.criar(schema, {
        tipo: t.tipo, descricao: `${t.descricao} (${i}/${n})`, pessoaNome: t.pessoaNome,
        valor, vencimento: addDias(t.vencimento, (i - 1) * intervalo),
        categoriaFinanceiraId: t.categoriaFinanceiraId, favorecidoId: t.favorecidoId,
      }, t.origem, t.pedidoId);
    }
    await this.repo.excluir(schema, id);
    return n;
  }
}
