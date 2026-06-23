import type { DataSource } from 'typeorm';
import type { ParadaPublica, ParadaRota, RotaRepository } from '../../domain/logistica/Rota.js';
import type { PosicaoEntrega, StatusEntrega } from '../../domain/logistica/Entrega.js';
import { validarSchema } from '../tenant/validarSchema.js';

function st(v: any): StatusEntrega {
  return v === 'a_caminho' || v === 'chegou' || v === 'entregue' ? v : 'aguardando';
}
function pos(r: any): PosicaoEntrega | null {
  return r && r.lat != null && r.lng != null ? { lat: Number(r.lat), lng: Number(r.lng), criadoEm: new Date(r.pos_em).toISOString() } : null;
}

export class SqlRotaRepository implements RotaRepository {
  constructor(private readonly ds: DataSource) {}

  async entregasDoMotoboy(schema: string, motoboyId: string): Promise<ParadaRota[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, p.endereco_entrega, p.ordem_rota
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.motoboy_id = $1 AND p.forma_entrega = 'motoboy' AND p.status = 'expedido' AND p.entrega_status <> 'entregue'
        ORDER BY p.ordem_rota NULLS LAST, p.criado_em`, [motoboyId]);
    return rs.map((r: any): ParadaRota => ({
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null,
      enderecoEntrega: r.endereco_entrega ?? null, ordemRota: r.ordem_rota != null ? Number(r.ordem_rota) : null,
    }));
  }

  async definirOrdem(schema: string, itens: { pedidoId: string; ordem: number }[]): Promise<void> {
    const s = validarSchema(schema);
    for (const it of itens) {
      await this.ds.query(`UPDATE "${s}".pedido SET ordem_rota = $2 WHERE id = $1`, [it.pedidoId, it.ordem]);
    }
  }

  async garantirRotaToken(schema: string, motoboyId: string, novo: string): Promise<string | null> {
    const s = validarSchema(schema);
    // TypeORM 0.3.x retorna UPDATE...RETURNING como tupla [linhas, contagem] → a 1ª linha é res[0][0].
    const res = await this.ds.query(
      `UPDATE "${s}".motoboy SET rota_token = COALESCE(rota_token, $2) WHERE id = $1 RETURNING rota_token`,
      [motoboyId, novo]);
    const r = Array.isArray(res?.[0]) ? res[0][0] : res?.[0];
    return r?.rota_token ?? null;
  }

  async motoboyPorRotaToken(schema: string, token: string): Promise<{ id: string; nome: string } | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT id, nome FROM "${s}".motoboy WHERE rota_token = $1`, [token]))[0];
    return r ? { id: r.id, nome: r.nome } : null;
  }

  async paradasPublicas(schema: string, motoboyId: string): Promise<ParadaPublica[]> {
    const s = validarSchema(schema);
    const rs = await this.ds.query(
      `SELECT p.id, p.numero, c.nome cliente, p.endereco_entrega, p.entrega_status, p.ordem_rota,
              ep.lat, ep.lng, ep.criado_em pos_em
         FROM "${s}".pedido p
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         LEFT JOIN LATERAL (SELECT lat, lng, criado_em FROM "${s}".entrega_posicao WHERE pedido_id = p.id ORDER BY criado_em DESC LIMIT 1) ep ON true
        WHERE p.motoboy_id = $1 AND p.forma_entrega = 'motoboy' AND p.status = 'expedido' AND p.entrega_status <> 'entregue'
        ORDER BY p.ordem_rota NULLS LAST, p.criado_em`, [motoboyId]);
    return rs.map((r: any): ParadaPublica => ({
      pedidoId: r.id, numero: Number(r.numero), clienteNome: r.cliente ?? null,
      enderecoEntrega: r.endereco_entrega ?? null, status: st(r.entrega_status),
      ordemRota: r.ordem_rota != null ? Number(r.ordem_rota) : null, posicao: pos(r), eta: null,
    }));
  }
}
