import type { ParadaRota, RotaRepository } from '../../domain/logistica/Rota.js';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';

// Otimização de waypoints via Directions API (uma chamada por rota montada — barato).
// Retorna a nova ordem (índices nas paradas enviadas) ou null em qualquer falha.
async function otimizarGoogle(origem: string, paradas: string[]): Promise<number[] | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !origem.trim() || paradas.length < 2) return null;
  try {
    const wp = 'optimize:true|' + paradas.map((p) => encodeURIComponent(p)).join('|');
    const url = `https://maps.googleapis.com/maps/api/directions/json?mode=driving`
      + `&origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(origem)}&waypoints=${wp}&key=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const j: any = await resp.json();
    const ord = j?.routes?.[0]?.waypoint_order;
    return Array.isArray(ord) && ord.length === paradas.length ? ord.map((n: any) => Number(n)) : null;
  } catch { return null; }
}

export class RotaService {
  constructor(private readonly repo: RotaRepository, private readonly empresas: EmpresaRepository) {}

  listar(schema: string, motoboyId: string): Promise<ParadaRota[]> {
    return this.repo.entregasDoMotoboy(schema, String(motoboyId ?? ''));
  }

  async salvar(schema: string, motoboyId: string, pedidoIds: any): Promise<void> {
    const ids = Array.isArray(pedidoIds) ? pedidoIds.map((x: any) => String(x)) : [];
    await this.repo.definirOrdem(schema, ids.map((pedidoId, i) => ({ pedidoId, ordem: i + 1 })));
  }

  // Reordena pelo caminho mais curto (não salva — devolve a ordem sugerida).
  async otimizar(schema: string, motoboyId: string, pedidoIds: any): Promise<string[]> {
    const ids = Array.isArray(pedidoIds) ? pedidoIds.map((x: any) => String(x)) : [];
    if (ids.length < 2) return ids;
    const paradas = await this.repo.entregasDoMotoboy(schema, String(motoboyId ?? ''));
    const byId = new Map(paradas.map((p) => [p.pedidoId, p]));
    const sel = ids.map((id) => byId.get(id)).filter((p): p is ParadaRota => !!p);
    const enderecos = sel.map((p) => p.enderecoEntrega ?? '');
    if (sel.length !== ids.length || enderecos.some((e) => !e.trim())) return ids;
    const emp = await this.empresas.buscarPorCodigo(schema.replace(/^t_/, '')).catch(() => null);
    const origem = emp ? ([emp.logradouro, emp.cidade, emp.uf].filter(Boolean).join(', ') || emp.cep || '') : '';
    if (!origem.trim()) return ids;
    const order = await otimizarGoogle(origem, enderecos);
    if (!order) return ids;
    return order.map((i) => ids[i]!).filter(Boolean);
  }
}
