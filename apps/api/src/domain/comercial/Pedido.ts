export type StatusPedido =
  | 'orcamento' | 'aguardando_pagamento' | 'aprovado' | 'separacao' | 'expedido' | 'entregue' | 'cancelado';

export interface PedidoItem {
  id?: string;
  produtoId: string | null;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  numero: number;
  clienteId: string | null;
  clienteNome: string | null;
  vendedorId: string | null;
  vendedorNome: string | null;
  status: StatusPedido;
  formaPagamento: string | null;
  observacao: string | null;
  enderecoEntrega: string | null;
  subtotal: number;
  frete: number;
  total: number;
  condicaoParcelas: number;
  condicaoIntervalo: number;
  criadoEm: Date;
  itens: PedidoItem[];
}

export interface PedidoResumo {
  id: string; numero: number; clienteNome: string | null; vendedorNome: string | null;
  status: StatusPedido; total: number; criadoEm: Date;
}

export interface NovoPedido {
  clienteId: string | null;
  vendedorId: string | null;
  formaPagamento: string | null;
  observacao: string | null;
  enderecoEntrega: string | null;
  frete: number;
  itens: PedidoItem[];
  subtotal: number;
  total: number;
  condicaoParcelas: number;
  condicaoIntervalo: number;
}

export interface PedidoRepository {
  proximoNumero(schema: string): Promise<number>;
  criar(schema: string, numero: number, p: NovoPedido): Promise<string>;
  listar(schema: string): Promise<PedidoResumo[]>;
  buscarPorId(schema: string, id: string): Promise<Pedido | null>;
  mudarStatus(schema: string, id: string, status: StatusPedido): Promise<void>;
  somaEmAberto(schema: string, clienteId: string, excetoPedidoId: string): Promise<number>;
}
