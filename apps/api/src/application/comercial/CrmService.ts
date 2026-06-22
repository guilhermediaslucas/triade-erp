import type {
  AlertaCliente, CrmRepository, EstagioOportunidade, Oportunidade, RelatorioAlertas,
  ResultadoImportacao, RitmoCliente,
} from '../../domain/comercial/Crm.js';
import { ESTAGIOS } from '../../domain/comercial/Crm.js';
import type { ClienteRepository } from '../../domain/pessoa/Cliente.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TIPOS_INTERACAO = ['Ligação', 'Visita', 'E-mail', 'WhatsApp', 'Reunião', 'Outro'];
const DAY = 86400000;
const dISO = (iso: string) => { const p = iso.split('-'); const d = new Date(+p[0]!, +p[1]! - 1, +p[2]!); d.setHours(0, 0, 0, 0); return d; };
const toISO = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const soDigitos = (v: any) => String(v ?? '').replace(/\D/g, '');
const limpo = (v: any): string | null => (v != null && String(v).trim() !== '' ? String(v).trim() : null);

function ritmoDe(ciclo: number | null): RitmoCliente {
  if (ciclo == null) return 'esporadico';
  if (ciclo <= 10) return 'semanal';
  if (ciclo <= 20) return 'quinzenal';
  if (ciclo <= 45) return 'mensal';
  return 'esporadico';
}

export interface CrmResumo { clientesAtivos: number; clientesAtendidos: number; ticketMedio: number; interacoes: number; }
export interface RecompraLinha { clienteId: string; cliente: string; ultima: string; ciclo: number; proxima: string; diasParaProxima: number; sugestao: string[]; }
export interface InativoLinha { clienteId: string; cliente: string; ultima: string; diasSemComprar: number; ciclo: number | null; }
export interface EventoTimeline { tipo: 'pedido' | 'interacao'; titulo: string; valor: number | null; status: string | null; data: string; icone: string; }

export class CrmService {
  constructor(private readonly repo: CrmRepository, private readonly clientes: ClienteRepository) {}

  async resumo(schema: string): Promise<CrmResumo> {
    const base = await this.repo.resumoBase(schema);
    const interacoes = await this.repo.contarInteracoes(schema);
    return { ...base, interacoes };
  }

  // ---- Oportunidades ----
  listarOportunidades(schema: string): Promise<Oportunidade[]> { return this.repo.listarOportunidades(schema); }
  // Exclui várias oportunidades (ex.: leads selecionados). As interações saem em cascata.
  excluirOportunidades(schema: string, ids: any): Promise<void> {
    const lista = Array.isArray(ids) ? ids.map((x: any) => String(x)).filter(Boolean) : [];
    return this.repo.removerOportunidades(schema, lista);
  }
  // Exclui TODOS os leads (estágio 'lead'). Retorna quantos foram removidos.
  excluirLeads(schema: string): Promise<number> { return this.repo.removerLeads(schema); }
  async criarOportunidade(schema: string, e: any): Promise<{ id: string }> {
    const clienteNome = (e?.clienteNome && String(e.clienteNome).trim()) || '';
    if (clienteNome.length < 2) throw new ErroAplicacao('crm.cliente_obrigatorio', 400);
    const valor = Number(e?.valor ?? 0) || 0;
    if (valor < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    const estagio: EstagioOportunidade = ESTAGIOS.includes(e?.estagio) ? e.estagio : 'lead';
    const previsao = e?.previsao && /^\d{4}-\d{2}-\d{2}$/.test(String(e.previsao)) ? String(e.previsao) : null;
    const id = await this.repo.criarOportunidade(schema, {
      clienteId: (e?.clienteId && String(e.clienteId)) || null, clienteNome,
      titulo: (e?.titulo && String(e.titulo).trim()) || null, valor,
      vendedorId: (e?.vendedorId && String(e.vendedorId)) || null, estagio, previsao,
      contato: limpo(e?.contato), email: limpo(e?.email), telefone: limpo(e?.telefone), origem: limpo(e?.origem),
    });
    return { id };
  }

  // Importa leads em lote (oportunidades estágio 'lead'). Dedup por nome+telefone.
  async importarLeads(schema: string, linhas: any[]): Promise<ResultadoImportacao> {
    const lista = Array.isArray(linhas) ? linhas : [];
    const existentes = await this.repo.listarOportunidades(schema);
    const chave = (nome: string, tel: string | null) => nome.toLowerCase().trim() + '|' + soDigitos(tel);
    const vistos = new Set(existentes.map((o) => chave(o.clienteNome, o.telefone)));
    let criados = 0, ignorados = 0; const erros: { linha: number; motivo: string }[] = [];
    for (let i = 0; i < lista.length; i++) {
      const e = lista[i] ?? {};
      try {
        const nome = (e?.clienteNome ?? e?.nome) ? String(e.clienteNome ?? e.nome).trim() : '';
        if (nome.length < 2) throw new ErroAplicacao('crm.cliente_obrigatorio', 400);
        const telefone = limpo(e?.telefone);
        const k = chave(nome, telefone);
        if (vistos.has(k)) { ignorados++; continue; }
        const valor = Number(e?.valor ?? 0) || 0;
        await this.repo.criarOportunidade(schema, {
          clienteId: null, clienteNome: nome,
          titulo: limpo(e?.titulo), valor: valor < 0 ? 0 : valor,
          vendedorId: (e?.vendedorId && String(e.vendedorId)) || null, estagio: 'lead', previsao: null,
          contato: limpo(e?.contato), email: limpo(e?.email), telefone, origem: limpo(e?.origem),
        });
        vistos.add(k); criados++;
      } catch (err) {
        erros.push({ linha: i + 1, motivo: err instanceof ErroAplicacao ? err.chaveI18n : 'crm.import_erro_linha' });
      }
    }
    return { criados, ignorados, erros };
  }

  // Converte um lead/oportunidade em cliente cadastrado: cria o cliente (PJ),
  // vincula a oportunidade e migra as interações do lead para o novo cliente.
  async converterEmCliente(schema: string, oppId: string): Promise<{ clienteId: string }> {
    const o = await this.repo.buscarOportunidade(schema, oppId);
    if (!o) throw new ErroAplicacao('crm.oportunidade_nao_encontrada', 404);
    if (o.clienteId) return { clienteId: o.clienteId };
    const clienteId = await this.clientes.criar(schema, {
      tipoPessoa: 'PJ', nome: o.clienteNome, fantasia: null, documento: '',
      email: o.email, telefone: o.telefone, limiteCredito: 0, enderecos: [],
    });
    await this.repo.vincularCliente(schema, oppId, clienteId);
    await this.repo.migrarInteracoesParaCliente(schema, oppId, clienteId);
    return { clienteId };
  }
  async mudarEstagio(schema: string, id: string, estagio: any): Promise<void> {
    if (!ESTAGIOS.includes(estagio)) throw new ErroAplicacao('pedido.transicao_invalida', 400);
    if (!(await this.repo.buscarOportunidade(schema, id))) throw new ErroAplicacao('crm.oportunidade_nao_encontrada', 404);
    await this.repo.mudarEstagio(schema, id, estagio);
  }
  async marcarPerdido(schema: string, id: string): Promise<void> {
    if (!(await this.repo.buscarOportunidade(schema, id))) throw new ErroAplicacao('crm.oportunidade_nao_encontrada', 404);
    await this.repo.marcarPerdido(schema, id);
  }
  vincularPedido(schema: string, id: string, pedidoId: string): Promise<void> { return this.repo.vincularPedido(schema, id, pedidoId); }

  // ---- Interações ----
  listarInteracoes(schema: string, clienteId: string): Promise<any> { return this.repo.listarInteracoes(schema, clienteId); }
  listarInteracoesOportunidade(schema: string, oportunidadeId: string): Promise<any> { return this.repo.listarInteracoesOportunidade(schema, oportunidadeId); }
  async criarInteracao(schema: string, e: any): Promise<{ id: string }> {
    const clienteId = (e?.clienteId && String(e.clienteId)) || null;
    const oportunidadeId = (e?.oportunidadeId && String(e.oportunidadeId)) || null;
    if (!clienteId && !oportunidadeId) throw new ErroAplicacao('crm.cliente_obrigatorio', 400);
    const tipo = TIPOS_INTERACAO.includes(e?.tipo) ? e.tipo : 'Outro';
    const data = e?.data && /^\d{4}-\d{2}-\d{2}$/.test(String(e.data)) ? String(e.data) : toISO(new Date());
    const id = await this.repo.criarInteracao(schema, { clienteId, oportunidadeId, tipo, data, nota: (e?.nota && String(e.nota).trim()) || null });
    return { id };
  }

  // ---- Timeline do cliente (pedidos + interações) ----
  async timeline(schema: string, clienteId: string): Promise<EventoTimeline[]> {
    const peds = await this.repo.pedidosDoCliente(schema, clienteId);
    const inter = await this.repo.listarInteracoes(schema, clienteId);
    const ev: (EventoTimeline & { ordem: number })[] = [];
    for (const p of peds) {
      const rotulo = (p.status === 'orcamento' ? 'Orçamento' : 'Pedido') + ' PE-' + String(p.numero).padStart(6, '0');
      ev.push({ tipo: 'pedido', titulo: rotulo, valor: p.total, status: p.status, data: p.data, icone: 'i-cart', ordem: p.data ? +p.data.replace(/-/g, '') : 0 });
    }
    for (const i of inter) {
      ev.push({ tipo: 'interacao', titulo: i.tipo + (i.nota ? ' — ' + i.nota : ''), valor: null, status: null, data: i.data, icone: 'i-clip', ordem: i.data ? +i.data.replace(/-/g, '') : 0 });
    }
    ev.sort((a, b) => b.ordem - a.ordem);
    return ev;   // o campo extra "ordem" é ignorado pelo frontend
  }

  // ---- Analytics: recompra + inativos (espelha a lógica do mockup) ----
  private async stats(schema: string) {
    const vendas = await this.repo.vendasPorCliente(schema);
    const itens = await this.repo.topItensPorCliente(schema);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    type S = { cliente: string; datas: Date[]; count: number; ultima: Date | null; diasSemComprar: number | null; ciclo: number | null; proxima: Date | null; diasParaProxima: number | null; top: string[] };
    const map = new Map<string, S>();
    for (const v of vendas) {
      const c = map.get(v.clienteId) ?? { cliente: v.cliente, datas: [], count: 0, ultima: null, diasSemComprar: null, ciclo: null, proxima: null, diasParaProxima: null, top: [] };
      c.datas.push(dISO(v.data)); map.set(v.clienteId, c);
    }
    const itensPorCli = new Map<string, { produto: string; qtd: number }[]>();
    for (const it of itens) { const a = itensPorCli.get(it.clienteId) ?? []; a.push({ produto: it.produto, qtd: it.qtd }); itensPorCli.set(it.clienteId, a); }
    for (const [id, c] of map) {
      c.datas.sort((a, b) => a.getTime() - b.getTime());
      c.count = c.datas.length;
      c.ultima = c.count ? c.datas[c.count - 1]! : null;
      c.diasSemComprar = c.ultima ? Math.floor((hoje.getTime() - c.ultima.getTime()) / DAY) : null;
      if (c.count >= 2) {
        let soma = 0; for (let i = 1; i < c.datas.length; i++) soma += (c.datas[i]!.getTime() - c.datas[i - 1]!.getTime()) / DAY;
        c.ciclo = Math.round(soma / (c.count - 1));
        c.proxima = new Date(c.ultima!.getTime() + c.ciclo * DAY);
        c.diasParaProxima = Math.round((c.proxima.getTime() - hoje.getTime()) / DAY);
      }
      c.top = (itensPorCli.get(id) ?? []).sort((a, b) => b.qtd - a.qtd).slice(0, 3).map((x) => x.produto);
    }
    return map;
  }
  async recompra(schema: string): Promise<RecompraLinha[]> {
    const st = await this.stats(schema);
    const out: RecompraLinha[] = [];
    for (const [id, c] of st) {
      if (c.ciclo == null || c.proxima == null || c.ultima == null) continue;
      out.push({ clienteId: id, cliente: c.cliente, ultima: toISO(c.ultima), ciclo: c.ciclo, proxima: toISO(c.proxima), diasParaProxima: c.diasParaProxima!, sugestao: c.top });
    }
    out.sort((a, b) => a.diasParaProxima - b.diasParaProxima);
    return out;
  }
  async inativos(schema: string, dias: number): Promise<InativoLinha[]> {
    const lim = Number.isFinite(dias) && dias >= 1 ? dias : 60;
    const st = await this.stats(schema);
    const out: InativoLinha[] = [];
    for (const [id, c] of st) {
      if (c.diasSemComprar != null && c.diasSemComprar > lim && c.ultima) {
        out.push({ clienteId: id, cliente: c.cliente, ultima: toISO(c.ultima), diasSemComprar: c.diasSemComprar, ciclo: c.ciclo });
      }
    }
    out.sort((a, b) => b.diasSemComprar - a.diasSemComprar);
    return out;
  }

  // ---- Alertas adaptativos (Frente 4) ----
  // Cada cliente é comparado pelo SEU ritmo: a janela de comparação acompanha o
  // ciclo médio (semanal x mensal). Combina três sinais num painel só.
  async alertas(schema: string, opts: { k?: number; limite?: number; inativoDias?: number } = {}): Promise<RelatorioAlertas> {
    const K = Number.isFinite(opts.k) && (opts.k as number) > 0 ? (opts.k as number) : 4;
    const LIMITE = Number.isFinite(opts.limite) && (opts.limite as number) > 0 ? (opts.limite as number) : 30;
    const INATIVO = Number.isFinite(opts.inativoDias) && (opts.inativoDias as number) >= 1 ? (opts.inativoDias as number) : 90;
    const MIN = 14, MAX = 180;
    const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n));

    const vendas = await this.repo.vendasPorCliente(schema);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    type V = { cliente: string; itens: { d: Date; total: number }[] };
    const map = new Map<string, V>();
    for (const v of vendas) {
      const c = map.get(v.clienteId) ?? { cliente: v.cliente, itens: [] };
      c.itens.push({ d: dISO(v.data), total: v.total }); map.set(v.clienteId, c);
    }

    const linhas: AlertaCliente[] = [];
    for (const [id, c] of map) {
      c.itens.sort((a, b) => a.d.getTime() - b.d.getTime());
      const datas = c.itens.map((x) => x.d);
      const count = datas.length;
      const ultima = count ? datas[count - 1]! : null;
      const diasSemComprar = ultima ? Math.floor((hoje.getTime() - ultima.getTime()) / DAY) : null;
      let ciclo: number | null = null, proxima: Date | null = null, diasParaProxima: number | null = null;
      if (count >= 2) {
        let soma = 0; for (let i = 1; i < datas.length; i++) soma += (datas[i]!.getTime() - datas[i - 1]!.getTime()) / DAY;
        ciclo = Math.round(soma / (count - 1));
        proxima = new Date(ultima!.getTime() + ciclo * DAY);
        diasParaProxima = Math.round((proxima.getTime() - hoje.getTime()) / DAY);
      }
      const janela = clamp((ciclo ?? 30) * K);
      const ini1 = hoje.getTime() - janela * DAY;       // janela recente: [hoje-janela, hoje]
      const ini2 = hoje.getTime() - 2 * janela * DAY;   // janela anterior: [hoje-2janela, hoje-janela]
      let valorRecente = 0, valorAnterior = 0, freqRecente = 0, freqAnterior = 0;
      for (const it of c.itens) {
        const tt = it.d.getTime();
        if (tt > ini1 && tt <= hoje.getTime()) { valorRecente += it.total; freqRecente++; }
        else if (tt > ini2 && tt <= ini1) { valorAnterior += it.total; freqAnterior++; }
      }
      const quedaValorPct = valorAnterior > 0 ? Math.round(((valorRecente - valorAnterior) / valorAnterior) * 100) : null;
      const quedaFreqPct = freqAnterior > 0 ? Math.round(((freqRecente - freqAnterior) / freqAnterior) * 100) : null;
      linhas.push({
        clienteId: id, cliente: c.cliente, ritmo: ritmoDe(ciclo), ciclo,
        ultima: ultima ? toISO(ultima) : null, diasSemComprar,
        proxima: proxima ? toISO(proxima) : null, diasParaProxima,
        janela, valorRecente, valorAnterior, quedaValorPct, freqRecente, freqAnterior, quedaFreqPct,
      });
    }

    const emQueda = linhas.filter((l) =>
      (l.quedaValorPct != null && l.quedaValorPct <= -LIMITE) ||
      (l.freqAnterior >= 2 && l.freqRecente < l.freqAnterior && l.quedaFreqPct != null && l.quedaFreqPct <= -LIMITE),
    ).sort((a, b) => (a.quedaValorPct ?? 0) - (b.quedaValorPct ?? 0));
    const atrasados = linhas.filter((l) => l.ciclo != null && l.diasParaProxima != null && l.diasParaProxima < 0)
      .sort((a, b) => (a.diasParaProxima ?? 0) - (b.diasParaProxima ?? 0));
    const inativos = linhas.filter((l) => l.diasSemComprar != null && l.diasSemComprar > INATIVO)
      .sort((a, b) => (b.diasSemComprar ?? 0) - (a.diasSemComprar ?? 0));

    return { parametros: { k: K, limite: LIMITE, inativoDias: INATIVO }, emQueda, atrasados, inativos };
  }
}
