// Rastreio da entrega (última milha). Estados:
//   aguardando (pronto, não saiu) → a_caminho (motoboy saiu, GPS ativo) → chegou → entregue.
export const STATUS_ENTREGA = ['aguardando', 'a_caminho', 'chegou', 'entregue'] as const;
export type StatusEntrega = (typeof STATUS_ENTREGA)[number];

export interface PosicaoEntrega { lat: number; lng: number; criadoEm: string; }
export interface EtaEntrega { km: number; min: number; }   // distância e tempo restantes (Distance Matrix)

// Entrega na visão do motoboy (as atribuídas a ele, em rota).
export interface EntregaMotoboy {
  pedidoId: string; numero: number; clienteNome: string | null;
  enderecoEntrega: string | null; status: StatusEntrega; rastreioToken: string | null;
  total: number; criadoEm: string; posicao: PosicaoEntrega | null; eta: EtaEntrega | null;
}

// Entrega ativa (painel da empresa).
export interface EntregaAtiva {
  pedidoId: string; numero: number; clienteNome: string | null; motoboy: string | null;
  status: StatusEntrega; rastreioToken: string | null; enderecoEntrega: string | null; posicao: PosicaoEntrega | null; eta: EtaEntrega | null;
}

// Payload público (link do cliente, sem login).
export interface RastreioPublico {
  numero: number; status: StatusEntrega; destino: string | null; motoboy: string | null; posicao: PosicaoEntrega | null; eta: EtaEntrega | null;
}

export interface DonoEntrega { motoboyId: string | null; status: StatusEntrega; token: string | null; pedidoStatus: string; }

export interface RastreioRepository {
  motoboyDoUsuario(schema: string, usuarioId: string): Promise<string | null>;
  minhasEntregas(schema: string, motoboyId: string): Promise<EntregaMotoboy[]>;
  dono(schema: string, pedidoId: string): Promise<DonoEntrega | null>;
  definirStatus(schema: string, pedidoId: string, status: StatusEntrega, token: string | null): Promise<void>;
  registrarPosicao(schema: string, pedidoId: string, lat: number, lng: number): Promise<void>;
  ativas(schema: string): Promise<EntregaAtiva[]>;
  publicoPorToken(schema: string, token: string): Promise<RastreioPublico | null>;
}
