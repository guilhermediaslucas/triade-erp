// Rota do motoboy: ordena as paradas (entregas) que a expedição montou.
export interface ParadaRota {
  pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; ordemRota: number | null;
}

export interface RotaRepository {
  entregasDoMotoboy(schema: string, motoboyId: string): Promise<ParadaRota[]>;
  definirOrdem(schema: string, itens: { pedidoId: string; ordem: number }[]): Promise<void>;
}
