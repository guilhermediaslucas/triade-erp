import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { DonoEntrega, EntregaAtiva, EntregaFreelancer, EntregaMotoboy, PosicaoEntrega, RastreioPublico, RastreioRepository, StatusEntrega } from '../../domain/logistica/Entrega.js';
import { validarSchema } from '../tenant/validarSchema.js';

function st(v: any): StatusEntrega {
  return v === 'a_caminho' || v === 'chegou' || v === 'entregue' ? v : 'aguardando';
}
function pos(r: any): PosicaoEntrega | null {
  return r && r.lat != null && r.lng != null ? { lat: Number(r.lat), lng: Number(r.lng), criadoEm: new Date(r.pos_em).toISOString() } : null;
}

export class SqlRastreioRepository implements RastreioRepository {
  constructor(private readonly ds: DataSource) {}

  async motoboyDoUsuario(schema: string, usuarioId: string): Promise<string | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT motoboy_id FROM "${s}".usuario WHERE id = $1`, [usuarioId]))[0];
    return r?.motoboy_id ?? null;
  }

  async minhasEntregas(schema: string, motoboyId: string): Promise<EntregaMotoboy[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, p.endereco_entrega, p.entrega_status, p.rastreio_token, p.total, p.criado_em,
              ep.lat, ep.lng, ep.criado_em pos_em
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN LATERAL (SELECT lat, lng, criado_em FROM "${s}".entrega_posicao WHERE pedido_id = p.id ORDER BY criado_em DESC LIMIT 1) ep ON true
        WHERE p.motoboy_id = $1 AND p.forma_entrega = 'motoboy'
          AND p.status NOT IN ('cancelado','orcamento','aguardando_pagamento')
          AND p.entrega_status <> 'entregue'
        ORDER BY p.ordem_rota NULLS LAST, p.criado_em DESC`, [motoboyId]);
    return rs.map((r: any): EntregaMotoboy => ({
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null,
      enderecoEntrega: r.endereco_entrega ?? null, status: st(r.entrega_status), rastreioToken: r.rastreio_token ?? null,
      total: Number(r.total), criadoEm: new Date(r.criado_em).toISOString(), posicao: pos(r), eta: null,
    }));
  }

  async garantirMotoboyToken(schema: string, pedidoId: string, novo: string): Promise<string | null> {
    const s = validarSchema(schema);
    // TypeORM 0.3.x retorna UPDATE...RETURNING como tupla [linhas, contagem] → a 1ª linha é res[0][0].
    const res = await this.ds.query(
      `UPDATE "${s}".pedido SET motoboy_token = COALESCE(motoboy_token, $2) WHERE id = $1 AND forma_entrega = 'motoboy' RETURNING motoboy_token`,
      [pedidoId, novo]);
    const r = Array.isArray(res?.[0]) ? res[0][0] : res?.[0];
    return r?.motoboy_token ?? null;
  }

  async buscarPorMotoboyToken(schema: string, token: string): Promise<EntregaFreelancer | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, p.endereco_entrega, p.entrega_status, p.rastreio_token, p.total, p.criado_em, p.status pedido_status,
              ep.lat, ep.lng, ep.criado_em pos_em
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN LATERAL (SELECT lat, lng, criado_em FROM "${s}".entrega_posicao WHERE pedido_id = p.id ORDER BY criado_em DESC LIMIT 1) ep ON true
        WHERE p.motoboy_token = $1 LIMIT 1`, [token]))[0];
    if (!r) return null;
    return {
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null, enderecoEntrega: r.endereco_entrega ?? null,
      status: st(r.entrega_status), rastreioToken: r.rastreio_token ?? null, total: Number(r.total),
      criadoEm: new Date(r.criado_em).toISOString(), posicao: pos(r), eta: null, pedidoStatus: r.pedido_status,
    };
  }

  async dono(schema: string, pedidoId: string): Promise<DonoEntrega | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT motoboy_id, entrega_status, rastreio_token, status FROM "${s}".pedido WHERE id = $1`, [pedidoId]))[0];
    return r ? { motoboyId: r.motoboy_id ?? null, status: st(r.entrega_status), token: r.rastreio_token ?? null, pedidoStatus: r.status } : null;
  }

  async telefoneClienteDoPedido(schema: string, pedidoId: string): Promise<string | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT c.telefone FROM "${s}".pedido p LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id WHERE p.id = $1`,
      [pedidoId]))[0];
    return r?.telefone ?? null;
  }

  async definirStatus(schema: string, pedidoId: string, status: StatusEntrega, token: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".pedido SET entrega_status = $2, rastreio_token = COALESCE(rastreio_token, $3) WHERE id = $1`,
      [pedidoId, status, token]);
  }

  async registrarPosicao(schema: string, pedidoId: string, lat: number, lng: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`INSERT INTO "${s}".entrega_posicao (id, pedido_id, lat, lng) VALUES ($1,$2,$3,$4)`, [randomUUID(), pedidoId, lat, lng]);
  }

  async ativas(schema: string): Promise<EntregaAtiva[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, mb.nome motoboy, p.entrega_status, p.rastreio_token, p.endereco_entrega,
              ep.lat, ep.lng, ep.criado_em pos_em
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
         LEFT JOIN LATERAL (SELECT lat, lng, criado_em FROM "${s}".entrega_posicao WHERE pedido_id = p.id ORDER BY criado_em DESC LIMIT 1) ep ON true
        WHERE p.forma_entrega = 'motoboy' AND p.entrega_status IN ('a_caminho','chegou')
        ORDER BY p.criado_em DESC`);
    return rs.map((r: any): EntregaAtiva => ({
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null, motoboy: r.motoboy ?? null,
      status: st(r.entrega_status), rastreioToken: r.rastreio_token ?? null, enderecoEntrega: r.endereco_entrega ?? null, posicao: pos(r), eta: null,
    }));
  }

  async publicoPorToken(schema: string, token: string): Promise<RastreioPublico | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT p.numero, p.entrega_status, p.endereco_entrega, mb.nome motoboy,
              ep.lat, ep.lng, ep.criado_em pos_em
         FROM "${s}".pedido p
         LEFT JOIN "${s}".motoboy mb ON mb.id = p.motoboy_id
         LEFT JOIN LATERAL (SELECT lat, lng, criado_em FROM "${s}".entrega_posicao WHERE pedido_id = p.id ORDER BY criado_em DESC LIMIT 1) ep ON true
        WHERE p.rastreio_token = $1 LIMIT 1`, [token]))[0];
    if (!r) return null;
    return { numero: Number(r.numero), status: st(r.entrega_status), destino: r.endereco_entrega ?? null, motoboy: r.motoboy ?? null, posicao: pos(r), eta: null };
  }
}
