// Apuração dos fretes de motoboy por período, agrupados por motoboy (para pagamento).
export interface LinhaFreteMotoboy {
  motoboyId: string;
  motoboy: string;
  qtdPedidos: number;
  totalFrete: number;
}

// Frete de um pedido (lista detalhada do período). `frete` = valor a pagar ao motoboy.
export interface LinhaFretePedido {
  id: string;
  numero: number;
  criadoEm: string;
  clienteNome: string | null;
  formaEntrega: string;
  motoboy: string | null;
  distanciaKm: number | null;
  frete: number;       // valor a pagar ao motoboy (frete_motoboy ?? frete_custo ?? frete)
  gerado: boolean;     // true = já virou título a pagar
}

// Pedido elegível para gerar título (não gerado, entregue, motoboy).
export interface PedidoParaGerar { id: string; motoboyId: string; motoboy: string; valor: number; }

export interface GestaoFreteRepository {
  apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaFreteMotoboy[]>;
  // gerado: null = todos, false = só não gerados (padrão da tela), true = só gerados.
  listarPedidos(schema: string, de: string | null, ate: string | null, gerado: boolean | null): Promise<LinhaFretePedido[]>;
  pedidosParaGerar(schema: string, ids: string[]): Promise<PedidoParaGerar[]>;
  marcarGerado(schema: string, ids: string[], tituloId: string | null): Promise<void>;
}
