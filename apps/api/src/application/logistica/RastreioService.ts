import { randomBytes } from 'node:crypto';
import type { EntregaAtiva, EntregaMotoboy, RastreioPublico, RastreioRepository, StatusEntrega } from '../../domain/logistica/Entrega.js';
import { STATUS_ENTREGA } from '../../domain/logistica/Entrega.js';
import type { PedidoRepository } from '../../domain/comercial/Pedido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class RastreioService {
  constructor(private readonly repo: RastreioRepository, private readonly pedidos: PedidoRepository) {}

  async minhasEntregas(schema: string, usuarioId: string): Promise<EntregaMotoboy[]> {
    const mb = await this.repo.motoboyDoUsuario(schema, usuarioId);
    if (!mb) return [];
    return this.repo.minhasEntregas(schema, mb);
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

  ativas(schema: string): Promise<EntregaAtiva[]> { return this.repo.ativas(schema); }
  publico(schema: string, token: any): Promise<RastreioPublico | null> { return this.repo.publicoPorToken(schema, String(token ?? '')); }
}
