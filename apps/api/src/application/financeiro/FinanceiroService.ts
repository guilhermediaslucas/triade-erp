import type { LinhaConciliacao, MovimentoFluxo, PagoAgrupado, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { PedidoRepository } from '../../domain/comercial/Pedido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export type AgingFaixa = 'a_vencer' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_mais';
export interface AgingLinha {
  id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; diasAtraso: number; faixa: AgingFaixa;
}
export interface RelatorioAging { linhas: AgingLinha[]; totais: Record<AgingFaixa, number>; totalAberto: number; }

export interface SemanaProjecao { rotulo: string; de: string; ate: string; entradas: number; saidas: number; saldo: number; }
export interface RelatorioFluxoProj { saldoInicial: number; semanas: SemanaProjecao[]; }

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

// Fluxo de caixa completo: todos os títulos (data de caixa = baixa, ou vencimento se em aberto).
export interface FluxoLancamento {
  id: string; tipo: 'entrada' | 'saida'; numero: string; descricao: string; pessoaNome: string | null;
  conta: string | null; dataCaixa: string; previsto: boolean; situacao: 'baixado' | 'vencido' | 'aberto'; valor: number;
}
export interface SemanaFluxo { de: string; ate: string; rotulo: string; entradas: number; saidas: number; }
export interface RelatorioFluxo { lancamentos: FluxoLancamento[]; entradas: number; saidas: number; semanas: SemanaFluxo[]; }

function segundaDaSemana(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  const dow = d.getUTCDay(); // 0=domingo .. 6=sábado
  d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow)); // recua até a segunda
  return d.toISOString().slice(0, 10);
}
function addDias(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}

export class FinanceiroService {
  constructor(private readonly repo: TituloRepository, private readonly pedidos?: PedidoRepository) {}
  listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]> { return this.repo.listar(schema, tipo); }
  fluxo(schema: string): Promise<MovimentoFluxo[]> { return this.repo.listarPagos(schema); }

  // Fluxo completo: junta receber (entradas) + pagar (saídas), data de caixa = baixa (se pago)
  // ou vencimento (se em aberto), filtra por período e monta os totais + as semanas do gráfico.
  async fluxoCompleto(schema: string, deRaw: any, ateRaw: any): Promise<RelatorioFluxo> {
    const de = lim(deRaw), ate = lim(ateRaw);
    const receber = await this.repo.listar(schema, 'receber');
    const pagar = await this.repo.listar(schema, 'pagar');
    const hoje = new Date().toISOString().slice(0, 10);
    const lancamentos: FluxoLancamento[] = [];
    const add = (t: Titulo, tipo: 'entrada' | 'saida') => {
      const pago = t.status === 'pago';
      const dataCaixa = (pago && t.pagoEm ? String(t.pagoEm) : String(t.vencimento)).slice(0, 10);
      if (de && dataCaixa < de) return;
      if (ate && dataCaixa > ate) return;
      const situacao: 'baixado' | 'vencido' | 'aberto' = pago ? 'baixado' : (dataCaixa < hoje ? 'vencido' : 'aberto');
      // Valor efetivo de caixa = valor - desconto + multa + juros (em aberto os ajustes são 0).
      const valorEfetivo = r2(t.valor - (t.desconto ?? 0) + (t.multa ?? 0) + (t.juros ?? 0));
      lancamentos.push({ id: t.id, tipo, numero: t.numero, descricao: t.descricao, pessoaNome: t.pessoaNome, conta: t.contaCorrenteNome, dataCaixa, previsto: t.previsto, situacao, valor: valorEfetivo });
    };
    for (const t of receber) add(t, 'entrada');
    for (const t of pagar) add(t, 'saida');
    lancamentos.sort((a, b) => (a.dataCaixa < b.dataCaixa ? -1 : a.dataCaixa > b.dataCaixa ? 1 : 0));
    const soma = (filtro: (l: FluxoLancamento) => boolean) => r2(lancamentos.filter(filtro).reduce((a, l) => a + l.valor, 0));
    const entradas = soma((l) => l.tipo === 'entrada');
    const saidas = soma((l) => l.tipo === 'saida');
    // Semanas (segunda a domingo) do menor ao maior dataCaixa (ou de..ate), p/ o gráfico.
    const semanas: SemanaFluxo[] = [];
    if (lancamentos.length > 0) {
      const min = de ?? lancamentos[0]!.dataCaixa;
      const max = ate ?? lancamentos[lancamentos.length - 1]!.dataCaixa;
      let wk = segundaDaSemana(min); const fim = segundaDaSemana(max); let guard = 0;
      while (wk <= fim && guard++ < 60) {
        const wkFim = addDias(wk, 6);
        const na = (l: FluxoLancamento) => l.dataCaixa >= wk && l.dataCaixa <= wkFim;
        const [, mm, dd] = wk.split('-');
        semanas.push({ de: wk, ate: wkFim, rotulo: `${dd}/${mm}`, entradas: soma((l) => l.tipo === 'entrada' && na(l)), saidas: soma((l) => l.tipo === 'saida' && na(l)) });
        wk = addDias(wk, 7);
      }
    }
    return { lancamentos, entradas, saidas, semanas };
  }

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

  // Fluxo de caixa projetado: projeção rolling de 13 semanas (método direto).
  // Saldo inicial = caixa atual (Σ títulos pagos: receber + / pagar −). A cada semana soma os títulos
  // EM ABERTO pela data de vencimento (receber = entrada, pagar = saída). A semana 1 absorve os vencidos.
  async fluxoProjetado(schema: string): Promise<RelatorioFluxoProj> {
    const pagos = await this.repo.listarPagos(schema);
    const saldoInicial = r2(pagos.reduce((a, m) => a + (m.tipo === 'entrada' ? m.valor : -m.valor), 0));
    const receber = (await this.repo.listar(schema, 'receber')).filter((t) => t.status === 'aberto');
    const pagar = (await this.repo.listar(schema, 'pagar')).filter((t) => t.status === 'aberto');
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const add = (base: string, dias: number) => { const d = new Date(base + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + dias); return iso(d); };
    const hoje = new Date().toISOString().slice(0, 10);
    const semanas: SemanaProjecao[] = [];
    let saldo = saldoInicial;
    for (let i = 0; i < 13; i++) {
      const de = add(hoje, i * 7), ate = add(de, 6);
      const naSemana = (v: string) => (i === 0 ? v <= ate : v >= de && v <= ate);  // semana 1 inclui vencidos
      const entradas = r2(receber.filter((t) => naSemana(String(t.vencimento).slice(0, 10))).reduce((a, t) => a + t.valor, 0));
      const saidas = r2(pagar.filter((t) => naSemana(String(t.vencimento).slice(0, 10))).reduce((a, t) => a + t.valor, 0));
      saldo = r2(saldo + entradas - saidas);
      semanas.push({ rotulo: 'S' + (i + 1), de, ate, entradas, saidas, saldo });
    }
    return { saldoInicial, semanas };
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
    const emissao = (e?.emissao && String(e.emissao).trim()) || null;
    if (emissao && !/^\d{4}-\d{2}-\d{2}$/.test(emissao)) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    return this.repo.criar(schema, {
      tipo, descricao: String(e.descricao).trim(), pessoaNome: (e?.pessoaNome && String(e.pessoaNome).trim()) || null,
      valor, vencimento, categoriaFinanceiraId: (e?.categoriaFinanceiraId && String(e.categoriaFinanceiraId).trim()) || null,
      favorecidoId: (e?.favorecidoId && String(e.favorecidoId).trim()) || null,
      previsto: e?.previsto === true,
      tipoDocumento: (e?.tipoDocumento && String(e.tipoDocumento).trim()) || null,
      numeroDocumento: (e?.numeroDocumento && String(e.numeroDocumento).trim()) || null,
      emissao,
    }, 'manual', null);
  }

  // Marca/desmarca o título como previsto (provisão). Só faz sentido em título em aberto.
  async definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.previsto_so_aberto', 400);
    await this.repo.definirPrevisto(schema, id, !!previsto);
  }

  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null, dataBaixa?: string | null, ajustesRaw?: { desconto?: any; multa?: any; juros?: any }): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.ja_pago', 409);
    if (t.previsto) throw new ErroAplicacao('financeiro.previsto_nao_baixa', 400);
    const data = dataBaixa && /^\d{4}-\d{2}-\d{2}$/.test(String(dataBaixa)) ? String(dataBaixa) : null;
    // Composição do valor: desconto/multa/juros ≥ 0 e total a baixar não pode ficar negativo.
    const num = (v: any) => { const n = Number(v ?? 0); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN; };
    const desconto = num(ajustesRaw?.desconto), multa = num(ajustesRaw?.multa), juros = num(ajustesRaw?.juros);
    if (Number.isNaN(desconto) || Number.isNaN(multa) || Number.isNaN(juros)) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    if (t.valor - desconto + multa + juros < 0) throw new ErroAplicacao('financeiro.baixa_negativa', 400);
    await this.repo.baixar(schema, id, (formaPagamento && String(formaPagamento).trim()) || null, contaCorrenteId || null, data, { desconto, multa, juros });
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
        previsto: t.previsto, tipoDocumento: t.tipoDocumento,
      }, t.origem, t.pedidoId);
    }
    await this.repo.excluir(schema, id);
    return n;
  }

  // Multiplica um título (modelo do mockup): cria N novos títulos a partir do marcado,
  // somando o intervalo (vencimento e emissão) a cada repetição e aplicando a variação ao
  // valor — em $ (valor absoluto) ou % (percentual). O título original é mantido.
  async multiplicar(schema: string, id: string, e: any): Promise<number> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status !== 'aberto') throw new ErroAplicacao('parcelar.so_aberto', 400);
    const vezes = Math.trunc(Number(e?.vezes));
    if (!Number.isFinite(vezes) || vezes < 1 || vezes > 99) throw new ErroAplicacao('parcelar.parcelas_invalidas', 400);
    const variacao = Number(e?.variacao ?? 0) || 0;
    const variacaoTipo = e?.variacaoTipo === 'pct' ? 'pct' : 'valor';
    const intVenc = Math.max(1, Math.trunc(Number(e?.intervaloVenc ?? 1)) || 1);
    const intEmis = Math.max(1, Math.trunc(Number(e?.intervaloEmis ?? 1)) || 1);
    const unVenc = String(e?.unidadeVenc ?? 'mensal');
    const unEmis = String(e?.unidadeEmis ?? 'mensal');

    const addIntervalo = (iso: string, n: number, unidade: string): string => {
      const d = new Date(iso + 'T00:00:00Z');
      if (unidade === 'mensal') d.setUTCMonth(d.getUTCMonth() + n);
      else if (unidade === 'anual') d.setUTCFullYear(d.getUTCFullYear() + n);
      else { const dias = unidade === 'semanal' ? 7 : unidade === 'quinzenal' ? 15 : 1; d.setUTCDate(d.getUTCDate() + n * dias); }
      return d.toISOString().slice(0, 10);
    };
    const emissaoBase = t.emissao ?? t.vencimento;
    let criados = 0;
    for (let i = 1; i <= vezes; i++) {
      const valor = variacaoTipo === 'pct'
        ? r2(t.valor * (1 + (variacao / 100) * i))
        : r2(t.valor + variacao * i);
      await this.repo.criar(schema, {
        tipo: t.tipo, descricao: t.descricao, pessoaNome: t.pessoaNome,
        valor: valor < 0 ? 0 : valor,
        vencimento: addIntervalo(t.vencimento, i * intVenc, unVenc),
        emissao: addIntervalo(emissaoBase, i * intEmis, unEmis),
        categoriaFinanceiraId: t.categoriaFinanceiraId, favorecidoId: t.favorecidoId,
        previsto: t.previsto, tipoDocumento: t.tipoDocumento, numeroDocumento: t.numeroDocumento,
      }, t.origem, t.pedidoId);
      criados++;
    }
    return criados;
  }
}
