import type { LinhaConciliacao, MovimentoFluxo, NovoTitulo, PagoAgrupado, Titulo, TipoTitulo, TituloRepository } from '../../domain/financeiro/Titulo.js';
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
export interface DreResumo { totalReceitas: number; totalDespesas: number; resultado: number; }
export interface DreTituloDetalhe { numero: string; descricao: string; pessoaNome: string | null; pagoEm: string | null; valor: number; }
export interface RelatorioDre {
  por: DrePor; receitas: DreLinha[]; despesas: DreLinha[];
  totalReceitas: number; totalDespesas: number; resultado: number;
  anterior: DreResumo | null;   // mesmo período imediatamente anterior (comparação); null se sem datas
}
// DRE por competência (emissão) — gerencial, agrupada por grupo > categoria (com a conta contábil).
export type GrupoDre = 'receita' | 'custo_mercadoria' | 'custo_operacional' | 'despesa';
export const GRUPOS_DRE: GrupoDre[] = ['receita', 'custo_mercadoria', 'custo_operacional', 'despesa'];
export interface DreCompLinha { categoria: string; contaCodigo: string | null; contaDescricao: string | null; total: number; }
export interface DreCompGrupo { grupo: GrupoDre; total: number; linhas: DreCompLinha[]; }
// Cascata: receita → (− custo de mercadoria) = lucro bruto → (− custos operacionais − despesas) = resultado.
export interface DreCompetencia {
  grupos: DreCompGrupo[];
  totalReceita: number; custoMercadoria: number; lucroBruto: number;
  custoOperacional: number; despesa: number; resultado: number;
}
export interface DreCompTituloDetalhe { numero: string; descricao: string; pessoaNome: string | null; data: string | null; valor: number; }

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
// `granularidade`: o gráfico agrupa por semana (período curto) ou por mês (período longo),
// automaticamente, para as barras não ficarem ilegíveis quando o filtro é grande.
export interface RelatorioFluxo { lancamentos: FluxoLancamento[]; entradas: number; saidas: number; semanas: SemanaFluxo[]; granularidade: 'semana' | 'mes'; }

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function segundaDaSemana(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  const dow = d.getUTCDay(); // 0=domingo .. 6=sábado
  d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow)); // recua até a segunda
  return d.toISOString().slice(0, 10);
}
function addDias(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}
function primeiroDoMes(iso: string): string { return iso.slice(0, 7) + '-01'; }
function ultimoDoMes(iso: string): string {
  const [y, m] = iso.slice(0, 7).split('-').map(Number); return new Date(Date.UTC(y!, m!, 0)).toISOString().slice(0, 10);
}
function addMes(iso: string, n: number): string {
  const [y, m] = iso.slice(0, 7).split('-').map(Number); return new Date(Date.UTC(y!, m! - 1 + n, 1)).toISOString().slice(0, 10);
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
    // Barras do gráfico: agrupa por SEMANA (período curto) ou por MÊS (período longo,
    // > ~12 semanas), automaticamente, para não ficar ilegível com muitos pontos.
    const semanas: SemanaFluxo[] = [];
    let granularidade: 'semana' | 'mes' = 'semana';
    if (lancamentos.length > 0) {
      const min = de ?? lancamentos[0]!.dataCaixa;
      const max = ate ?? lancamentos[lancamentos.length - 1]!.dataCaixa;
      granularidade = diasEntre(min, max) > 84 ? 'mes' : 'semana';
      if (granularidade === 'mes') {
        let mk = primeiroDoMes(min); const fim = primeiroDoMes(max); let guard = 0;
        while (mk <= fim && guard++ < 120) {
          const mFim = ultimoDoMes(mk);
          const na = (l: FluxoLancamento) => l.dataCaixa >= mk && l.dataCaixa <= mFim;
          const [yy, mm] = mk.split('-');
          semanas.push({ de: mk, ate: mFim, rotulo: `${MESES_ABREV[Number(mm) - 1]}/${yy!.slice(2)}`, entradas: soma((l) => l.tipo === 'entrada' && na(l)), saidas: soma((l) => l.tipo === 'saida' && na(l)) });
          mk = addMes(mk, 1);
        }
      } else {
        let wk = segundaDaSemana(min); const fim = segundaDaSemana(max); let guard = 0;
        while (wk <= fim && guard++ < 60) {
          const wkFim = addDias(wk, 6);
          const na = (l: FluxoLancamento) => l.dataCaixa >= wk && l.dataCaixa <= wkFim;
          const [, mm, dd] = wk.split('-');
          semanas.push({ de: wk, ate: wkFim, rotulo: `${dd}/${mm}`, entradas: soma((l) => l.tipo === 'entrada' && na(l)), saidas: soma((l) => l.tipo === 'saida' && na(l)) });
          wk = addDias(wk, 7);
        }
      }
    }
    return { lancamentos, entradas, saidas, semanas, granularidade };
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

  // DRE por COMPETÊNCIA (data de emissão): receitas/despesas por categoria financeira (com conta
  // contábil) + os buckets fixos da baixa (juros/multa/desconto/taxa de cartão).
  async dreCompetencia(schema: string, de: any, ate: any): Promise<DreCompetencia> {
    const { categorias, ajustes } = await this.repo.dreCompetencia(schema, lim(de), lim(ate));
    // Acumula as linhas por grupo da DRE. Grupo desconhecido cai em 'despesa'.
    const porGrupo: Record<GrupoDre, DreCompLinha[]> = { receita: [], custo_mercadoria: [], custo_operacional: [], despesa: [] };
    const grupoOk = (g: string): GrupoDre => (GRUPOS_DRE.includes(g as GrupoDre) ? (g as GrupoDre) : 'despesa');
    for (const c of categorias) {
      porGrupo[grupoOk(c.grupo)].push({ categoria: c.categoria, contaCodigo: c.contaCodigo, contaDescricao: c.contaDescricao, total: r2(c.total) });
    }
    // Buckets fixos (composição da baixa): receita / custo operacional (taxa de cartão) / despesa.
    const bk = (g: GrupoDre, categoria: string, total: number) => { if (total > 0) porGrupo[g].push({ categoria, contaCodigo: null, contaDescricao: null, total: r2(total) }); };
    bk('receita', 'Juros recebidos', ajustes.jurosReceber);
    bk('receita', 'Multa recebida', ajustes.multaReceber);
    bk('receita', 'Desconto obtido', ajustes.descontoPagar);
    bk('custo_operacional', 'Taxa de cartão', ajustes.taxaCartao);
    bk('despesa', 'Desconto concedido', ajustes.descontoReceber);
    bk('despesa', 'Juros pagos', ajustes.jurosPagar);
    bk('despesa', 'Multa paga', ajustes.multaPagar);

    const grupos: DreCompGrupo[] = GRUPOS_DRE.map((g) => {
      const linhas = porGrupo[g].sort((a, b) => b.total - a.total);
      return { grupo: g, total: r2(linhas.reduce((a, l) => a + l.total, 0)), linhas };
    });
    const tot = (g: GrupoDre) => grupos.find((x) => x.grupo === g)!.total;
    const totalReceita = tot('receita'), custoMercadoria = tot('custo_mercadoria');
    const custoOperacional = tot('custo_operacional'), despesa = tot('despesa');
    const lucroBruto = r2(totalReceita - custoMercadoria);
    return {
      grupos, totalReceita, custoMercadoria, lucroBruto, custoOperacional, despesa,
      resultado: r2(lucroBruto - custoOperacional - despesa),
    };
  }

  // Drill da DRE por competência: títulos (por emissão) que compõem uma linha (grupo + categoria).
  async dreCompetenciaTitulos(schema: string, de: any, ate: any, grupo: any, categoria: any): Promise<DreCompTituloDetalhe[]> {
    const g = String(grupo ?? '');
    const cat = String(categoria ?? '');
    if (!g || !cat) return [];
    return this.repo.dreCompetenciaTitulos(schema, lim(de), lim(ate), g, cat);
  }

  // DRE de caixa (resultado do período): títulos pagos no período, agrupados por origem ou categoria.
  // Também devolve o resumo do MESMO período imediatamente anterior (comparação), quando há datas.
  async dre(schema: string, de: any, ate: any, por: any): Promise<RelatorioDre> {
    const grupo: DrePor = por === 'categoria' ? 'categoria' : 'origem';
    const buscar = (d: string | null, a: string | null) => grupo === 'categoria'
      ? this.repo.pagosPorCategoria(schema, d, a)
      : this.repo.pagosPorOrigem(schema, d, a);
    const linhas: PagoAgrupado[] = await buscar(lim(de), lim(ate));
    const receitas = linhas.filter((l) => l.tipo === 'receber').map((l) => ({ origem: l.chave, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const despesas = linhas.filter((l) => l.tipo === 'pagar').map((l) => ({ origem: l.chave, total: r2(l.total) })).sort((a, b) => b.total - a.total);
    const totalReceitas = r2(receitas.reduce((a, l) => a + l.total, 0));
    const totalDespesas = r2(despesas.reduce((a, l) => a + l.total, 0));

    // Período anterior de mesmo tamanho (só quando de e ate vieram).
    let anterior: DreResumo | null = null;
    const d0 = lim(de), a0 = lim(ate);
    if (d0 && a0) {
      const len = diasEntre(d0, a0);
      const prevAte = addDias(d0, -1), prevDe = addDias(d0, -(len + 1));
      const lp = await buscar(prevDe, prevAte);
      const rA = r2(lp.filter((l) => l.tipo === 'receber').reduce((a, l) => a + l.total, 0));
      const dA = r2(lp.filter((l) => l.tipo === 'pagar').reduce((a, l) => a + l.total, 0));
      anterior = { totalReceitas: rA, totalDespesas: dA, resultado: r2(rA - dA) };
    }
    return { por: grupo, receitas, despesas, totalReceitas, totalDespesas, resultado: r2(totalReceitas - totalDespesas), anterior };
  }

  // Drill da DRE: títulos pagos no período que compõem uma linha (origem ou categoria).
  async dreDetalhe(schema: string, de: any, ate: any, por: any, tipoRaw: any, chave: any): Promise<DreTituloDetalhe[]> {
    const grupo: DrePor = por === 'categoria' ? 'categoria' : 'origem';
    const tipo: TipoTitulo = tipoRaw === 'pagar' ? 'pagar' : 'receber';
    const d0 = lim(de), a0 = lim(ate);
    const alvo = String(chave ?? '');
    const titulos = await this.repo.listar(schema, tipo);
    return titulos
      .filter((t) => t.status === 'pago' && t.pagoEm)
      .filter((t) => { const pe = String(t.pagoEm).slice(0, 10); return (!d0 || pe >= d0) && (!a0 || pe <= a0); })
      .filter((t) => (grupo === 'categoria' ? (t.categoriaFinanceiraNome ?? '—') : t.origem) === alvo)
      .map((t) => ({ numero: t.numero, descricao: t.descricao, pessoaNome: t.pessoaNome, pagoEm: t.pagoEm ? String(t.pagoEm).slice(0, 10) : null, valor: r2(t.valor) }))
      .sort((a, b) => (a.pagoEm! < b.pagoEm! ? -1 : 1));
  }

  // Conferência de cartão/dinheiro: recebíveis (origem pedido) pagos em cartão ou
  // dinheiro, do dia informado (pela data do título). Confirmar NÃO dá baixa nem mexe no saldo.
  async conferenciaCartao(schema: string, dia: any): Promise<Titulo[]> {
    const d = lim(dia);
    const norm = (f: string | null) => (f ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const todos = await this.repo.listar(schema, 'receber');
    return todos.filter((t) => ['cartao', 'dinheiro'].includes(norm(t.pedidoFormaPagamento)) && (!d || String(t.criadoEm).slice(0, 10) === d));
  }
  async marcarConferido(schema: string, id: string, conferido: any): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    await this.repo.definirConferido(schema, id, !!conferido);
  }

  // Lançamento manual exige TODOS os campos (descrição, tipo/nº do documento, categoria,
  // valor, fornecedor/cliente, emissão e vencimento). Não vale para títulos automáticos
  // (pedido/compra/comissão/frete), que são criados direto pelo repositório.
  private validarManual(tipo: TipoTitulo, e: any): NovoTitulo {
    const descricao = (e?.descricao && String(e.descricao).trim()) || '';
    if (descricao.length < 2) throw new ErroAplicacao('financeiro.descricao_invalida', 400);
    const tipoDocumento = (e?.tipoDocumento && String(e.tipoDocumento).trim()) || '';
    if (!tipoDocumento) throw new ErroAplicacao('financeiro.tipodoc_obrigatorio', 400);
    const numeroDocumento = (e?.numeroDocumento && String(e.numeroDocumento).trim()) || '';
    if (!numeroDocumento) throw new ErroAplicacao('financeiro.numdoc_obrigatorio', 400);
    const categoriaFinanceiraId = (e?.categoriaFinanceiraId && String(e.categoriaFinanceiraId).trim()) || '';
    if (!categoriaFinanceiraId) throw new ErroAplicacao('financeiro.categoria_obrigatoria', 400);
    const valor = Number(e?.valor);
    if (!Number.isFinite(valor) || valor <= 0) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    const pessoaNome = (e?.pessoaNome && String(e.pessoaNome).trim()) || '';
    if (!pessoaNome) throw new ErroAplicacao('financeiro.pessoa_obrigatoria', 400);
    const emissao = (e?.emissao && String(e.emissao).trim()) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(emissao)) throw new ErroAplicacao('financeiro.emissao_obrigatoria', 400);
    const vencimento = (e?.vencimento && String(e.vencimento).trim()) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimento)) throw new ErroAplicacao('financeiro.vencimento_obrigatorio', 400);
    return { tipo, descricao, pessoaNome, valor, vencimento, categoriaFinanceiraId, previsto: e?.previsto === true, tipoDocumento, numeroDocumento, emissao };
  }

  async criar(schema: string, tipo: TipoTitulo, e: any): Promise<string> {
    const base = this.validarManual(tipo, e);
    return this.repo.criar(schema, {
      ...base,
      favorecidoId: (e?.favorecidoId && String(e.favorecidoId).trim()) || null,
      favorecidoForma: (e?.favorecidoForma && String(e.favorecidoForma).trim()) || null,
      favorecidoPagoEm: lim(e?.favorecidoPagoEm),
    }, 'manual', null);
  }

  // Edita um lançamento manual em aberto (não toca origem/baixa/favorecido).
  async atualizar(schema: string, tipo: TipoTitulo, id: string, e: any): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.origem !== 'manual') throw new ErroAplicacao('financeiro.nao_editavel', 400);
    if (t.status !== 'aberto') throw new ErroAplicacao('financeiro.nao_editavel', 400);
    await this.repo.atualizar(schema, id, this.validarManual(tipo, e));
  }

  // Marca/desmarca o título como "reembolso a terceiro" (a qualquer momento).
  // favorecidoId vazio = volta a ser pagamento normal da empresa.
  async definirReembolso(schema: string, id: string, e: any): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.tipo !== 'pagar') throw new ErroAplicacao('financeiro.valor_invalido', 400);
    const favorecidoId = (e?.favorecidoId && String(e.favorecidoId).trim()) || null;
    await this.repo.definirReembolso(schema, id, {
      favorecidoId,
      favorecidoForma: favorecidoId ? ((e?.favorecidoForma && String(e.favorecidoForma).trim()) || null) : null,
      favorecidoPagoEm: favorecidoId ? lim(e?.favorecidoPagoEm) : null,
      vencimento: lim(e?.vencimento),
    });
  }

  // Marca/desmarca o título como previsto (provisão). Só faz sentido em título em aberto.
  async definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.previsto_so_aberto', 400);
    await this.repo.definirPrevisto(schema, id, !!previsto);
  }

  async baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null, dataBaixa?: string | null, ajustesRaw?: { desconto?: any; multa?: any; juros?: any; taxaCartao?: any }): Promise<{ pedidoLiberado: number | null }> {
    const t = await this.repo.buscarPorId(schema, id);
    if (!t) throw new ErroAplicacao('financeiro.nao_encontrado', 404);
    if (t.status === 'pago') throw new ErroAplicacao('financeiro.ja_pago', 409);
    if (t.previsto) throw new ErroAplicacao('financeiro.previsto_nao_baixa', 400);
    const data = dataBaixa && /^\d{4}-\d{2}-\d{2}$/.test(String(dataBaixa)) ? String(dataBaixa) : null;
    // Composição do valor: desconto/multa/juros ≥ 0 e total a baixar não pode ficar negativo.
    const num = (v: any) => { const n = Number(v ?? 0); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN; };
    const desconto = num(ajustesRaw?.desconto), multa = num(ajustesRaw?.multa), juros = num(ajustesRaw?.juros), taxaCartao = num(ajustesRaw?.taxaCartao);
    if ([desconto, multa, juros, taxaCartao].some(Number.isNaN)) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    if (t.valor - desconto + multa + juros < 0) throw new ErroAplicacao('financeiro.baixa_negativa', 400);
    await this.repo.baixar(schema, id, (formaPagamento && String(formaPagamento).trim()) || null, contaCorrenteId || null, data, { desconto, multa, juros, taxaCartao });
    // Confirmação do recebimento do título de um pedido (Pix/Boleto) libera o pedido:
    // aguardando_pagamento → aprovado, ficando disponível para Separação no Kanban.
    let pedidoLiberado: number | null = null;
    if (this.pedidos && t.origem === 'pedido' && t.pedidoId) {
      const ped = await this.pedidos.buscarPorId(schema, t.pedidoId);
      if (ped && ped.status === 'aguardando_pagamento') {
        await this.pedidos.mudarStatus(schema, t.pedidoId, 'aprovado');
        pedidoLiberado = ped.numero;
      }
    }
    return { pedidoLiberado };
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
