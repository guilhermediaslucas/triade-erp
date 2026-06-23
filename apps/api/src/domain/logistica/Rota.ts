import type { StatusEntrega, PosicaoEntrega, EtaEntrega } from './Entrega.js';

// Rota do motoboy: ordena as paradas (entregas) que a expedição montou.
export interface ParadaRota {
  pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; ordemRota: number | null;
}

// Parada na visão pública da rota (link do freelancer): traz status + posição + ETA.
export interface ParadaPublica {
  pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null;
  status: StatusEntrega; ordemRota: number | null; posicao: PosicaoEntrega | null; eta?: EtaEntrega | null;
}
export interface RotaPublica { motoboyNome: string; paradas: ParadaPublica[]; }

export interface RotaRepository {
  entregasDoMotoboy(schema: string, motoboyId: string): Promise<ParadaRota[]>;
  definirOrdem(schema: string, itens: { pedidoId: string; ordem: number }[]): Promise<void>;
  garantirRotaToken(schema: string, motoboyId: string, novo: string): Promise<string | null>;
  motoboyPorRotaToken(schema: string, token: string): Promise<{ id: string; nome: string } | null>;
  paradasPublicas(schema: string, motoboyId: string): Promise<ParadaPublica[]>;
}
