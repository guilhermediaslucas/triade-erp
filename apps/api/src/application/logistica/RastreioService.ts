import { randomBytes } from 'node:crypto';
import type { EntregaAtiva, EntregaFreelancer, EntregaMotoboy, EtaEntrega, RastreioPublico, RastreioRepository, StatusEntrega } from '../../domain/logistica/Entrega.js';
import { STATUS_ENTREGA } from '../../domain/logistica/Entrega.js';
import type { PedidoRepository } from '../../domain/comercial/Pedido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Distância + tempo restantes via Distance Matrix (reusa GOOGLE_MAPS_API_KEY do servidor).
async function distanciaTempoGoogle(origem: string, destino: string): Promise<EtaEntrega | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !origem.trim() || !destino.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving`
      + `&origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&key=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const j: any = await resp.json();
    const el = j?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== 'OK' || !el.distance || !el.duration) return null;
    return { km: Math.round((el.distance.value / 1000) * 10) / 10, min: Math.round(el.duration.value / 60) };
  } catch { return null; }
}

export class RastreioService {
  constructor(private readonly repo: RastreioRepository, private readonly pedidos: PedidoRepository) {}

  // Cache do ETA por entrega — limita as chamadas ao Distance Matrix a ~1 a cada 2 min.
  private etaCache = new Map<string, { eta: EtaEntrega | null; em: number }>();
  private async calcEta(chave: string, lat: number, lng: number, destino: string | null): Promise<EtaEntrega | null> {
    if (!destino) return null;
    const c = this.etaCache.get(chave);
    if (c && Date.now() - c.em < 120_000) return c.eta;
    const eta = await distanciaTempoGoogle(`${lat},${lng}`, destino);
    this.etaCache.set(chave, { eta, em: Date.now() });
    return eta;
  }

  async minhasEntregas(schema: string, usuarioId: string): Promise<EntregaMotoboy[]> {
    const mb = await this.repo.motoboyDoUsuario(schema, usuarioId);
    if (!mb) return [];
    const lista = await this.repo.minhasEntregas(schema, mb);
    for (const e of lista) {
      if (e.posicao && (e.status === 'a_caminho' || e.status === 'chegou')) e.eta = await this.calcEta(e.pedidoId, e.posicao.lat, e.posicao.lng, e.enderecoEntrega);
    }
    return lista;
  }

  private async donoChecado(schema: string, usuarioId: string, pedidoId: string) {
    const mb = await this.repo.motoboyDoUsuario(schema, usuarioId);
    if (!mb) throw new ErroAplicacao('entrega.sem_motoboy', 403);
    const d = await this.repo.dono(schema, pedidoId);
    if (!d) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    if (d.motoboyId !== mb) throw new ErroAplicacao('entrega.nao_sua', 403);
    return d;
  }

  async mudarStatus(schema: string, usuarioId: string, pedidoId: string, status: any, recebidoPor: any): Promise<void> {
    if (!STATUS_ENTREGA.includes(status as StatusEntrega)) throw new ErroAplicacao('entrega.status_invalido', 400);
    const d = await this.donoChecado(schema, usuarioId, pedidoId);
    let token = d.token;
    // Token público = "<codigo da empresa>.<aleatório>" — assim o link /rastreio/:token
    // já carrega o tenant (codigo = schema sem o prefixo t_).
    if (status === 'a_caminho' && !token) token = schema.replace(/^t_/, '') + '.' + randomBytes(8).toString('hex');
    if (status === 'entregue') {
      const quem = String(recebidoPor ?? '').trim();
      if (!quem) throw new ErroAplicacao('pedido.recebido_obrigatorio', 400);
      await this.repo.definirStatus(schema, pedidoId, 'entregue', token);
      const hoje = new Date().toISOString().slice(0, 10);
      await this.pedidos.definirEntrega(schema, pedidoId, hoje, quem);
      if (d.pedidoStatus === 'expedido') await this.pedidos.mudarStatus(schema, pedidoId, 'entregue');
      return;
    }
    await this.repo.definirStatus(schema, pedidoId, status as StatusEntrega, token);
  }

  async registrarPosicao(schema: string, usuarioId: string, pedidoId: string, lat: any, lng: any): Promise<void> {
    const la = Number(lat), ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) throw new ErroAplicacao('entrega.posicao_invalida', 400);
    const d = await this.donoChecado(schema, usuarioId, pedidoId);
    if (d.status !== 'a_caminho' && d.status !== 'chegou') return; // só rastreia em rota
    await this.repo.registrarPosicao(schema, pedidoId, la, ln);
  }

  async ativas(schema: string): Promise<EntregaAtiva[]> {
    const lista = await this.repo.ativas(schema);
    for (const e of lista) if (e.posicao) e.eta = await this.calcEta(e.pedidoId, e.posicao.lat, e.posicao.lng, e.enderecoEntrega);
    return lista;
  }
  async publico(schema: string, token: any): Promise<RastreioPublico | null> {
    const d = await this.repo.publicoPorToken(schema, String(token ?? ''));
    if (d && d.posicao && (d.status === 'a_caminho' || d.status === 'chegou')) d.eta = await this.calcEta('pub:' + String(token ?? ''), d.posicao.lat, d.posicao.lng, d.destino);
    return d;
  }

  // ===== Motoboy AVULSO (freelancer, sem login): atualiza pelo token =====
  async gerarLinkMotoboy(schema: string, pedidoId: string): Promise<string> {
    const novo = schema.replace(/^t_/, '') + '.' + randomBytes(8).toString('hex');
    const tok = await this.repo.garantirMotoboyToken(schema, pedidoId, novo);
    if (!tok) throw new ErroAplicacao('entrega.nao_motoboy', 400);
    return tok;
  }
  async freelancerEntrega(schema: string, token: any): Promise<EntregaFreelancer | null> {
    const d = await this.repo.buscarPorMotoboyToken(schema, String(token ?? ''));
    if (d && d.posicao && (d.status === 'a_caminho' || d.status === 'chegou')) d.eta = await this.calcEta('mb:' + String(token ?? ''), d.posicao.lat, d.posicao.lng, d.enderecoEntrega);
    return d;
  }
  async freelancerStatus(schema: string, token: any, status: any, recebidoPor: any): Promise<void> {
    if (!STATUS_ENTREGA.includes(status as StatusEntrega)) throw new ErroAplicacao('entrega.status_invalido', 400);
    const d = await this.repo.buscarPorMotoboyToken(schema, String(token ?? ''));
    if (!d) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    let rt = d.rastreioToken;
    if (status === 'a_caminho' && !rt) rt = schema.replace(/^t_/, '') + '.' + randomBytes(8).toString('hex');
    if (status === 'entregue') {
      const quem = String(recebidoPor ?? '').trim();
      if (!quem) throw new ErroAplicacao('pedido.recebido_obrigatorio', 400);
      await this.repo.definirStatus(schema, d.pedidoId, 'entregue', rt);
      const hoje = new Date().toISOString().slice(0, 10);
      await this.pedidos.definirEntrega(schema, d.pedidoId, hoje, quem);
      if (d.pedidoStatus === 'expedido') await this.pedidos.mudarStatus(schema, d.pedidoId, 'entregue');
      return;
    }
    await this.repo.definirStatus(schema, d.pedidoId, status as StatusEntrega, rt);
  }
  async freelancerPosicao(schema: string, token: any, lat: any, lng: any): Promise<void> {
    const la = Number(lat), ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) throw new ErroAplicacao('entrega.posicao_invalida', 400);
    const d = await this.repo.buscarPorMotoboyToken(schema, String(token ?? ''));
    if (!d) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    if (d.status !== 'a_caminho' && d.status !== 'chegou') return;
    await this.repo.registrarPosicao(schema, d.pedidoId, la, ln);
  }
}
