import type { CrmRepository, EstagioOportunidade, Oportunidade } from '../../domain/comercial/Crm.js';
import { ESTAGIOS } from '../../domain/comercial/Crm.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TIPOS_INTERACAO = ['Ligação', 'Visita', 'E-mail', 'WhatsApp', 'Reunião', 'Outro'];
const DAY = 86400000;
const dISO = (iso: string) => { const p = iso.split('-'); const d = new Date(+p[0]!, +p[1]! - 1, +p[2]!); d.setHours(0, 0, 0, 0); return d; };
const toISO = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export interface CrmResumo { clientesAtivos: number; clientesAtendidos: number; ticketMedio: number; interacoes: number; }
export interface RecompraLinha { clienteId: string; cliente: string; ultima: string; ciclo: number; proxima: string; diasParaProxima: number; sugestao: string[]; }
export interface InativoLinha { clienteId: string; cliente: string; ultima: string; diasSemComprar: number; ciclo: number | null; }
export interface EventoTimeline { tipo: 'pedido' | 'interacao'; titulo: string; valor: number | null; status: string | null; data: string; icone: string; }

export class CrmService {
  constructor(private readonly repo: CrmRepository) {}

  async resumo(schema: string): Promise<CrmResumo> {
    const base = await this.repo.resumoBase(schema);
    const interacoes = await this.repo.contarInteracoes(schema);
    return { ...base, interacoes };
  }

  // ---- Oportunidades ----
  listarOportunidades(schema: string): Promise<Oportunidade[]> { return this.repo.listarOportunidades(schema); }
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
    });
    return { id };
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
  async criarInteracao(schema: string, e: any): Promise<{ id: string }> {
    const clienteId = (e?.clienteId && String(e.clienteId)) || '';
    if (!clienteId) throw new ErroAplicacao('crm.cliente_obrigatorio', 400);
    const tipo = TIPOS_INTERACAO.includes(e?.tipo) ? e.tipo : 'Outro';
    const data = e?.data && /^\d{4}-\d{2}-\d{2}$/.test(String(e.data)) ? String(e.data) : toISO(new Date());
    const id = await this.repo.criarInteracao(schema, { clienteId, tipo, data, nota: (e?.nota && String(e.nota).trim()) || null });
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
}
