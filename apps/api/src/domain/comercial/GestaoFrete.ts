// Apuração dos fretes de motoboy por período, agrupados por motoboy (para pagamento).
export interface LinhaFreteMotoboy {
  motoboyId: string;
  motoboy: string;
  qtdPedidos: number;
  totalFrete: number;
}

// Frete de um pedido (lista detalhada do período).
export interface LinhaFretePedido {
  numero: number;
  criadoEm: string;
  clienteNome: string | null;
  formaEntrega: string;
  motoboy: string | null;
  distanciaKm: number | null;
  frete: number;
}

export interface GestaoFreteRepository {
  apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaFreteMotoboy[]>;
  listarPedidos(schema: string, de: string | null, ate: string | null): Promise<LinhaFretePedido[]>;
}
