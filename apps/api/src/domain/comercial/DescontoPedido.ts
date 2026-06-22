// Campanha de desconto no PEDIDO quando o subtotal (produtos) ≥ minimo, com período.
// tipo: 'percentual' (% sobre o subtotal) | 'fixo' (abate um valor fixo).
export const TIPOS_DESCONTO_PEDIDO = ['percentual', 'fixo'] as const;
export type TipoDescontoPedido = (typeof TIPOS_DESCONTO_PEDIDO)[number];

export interface DescontoPedido {
  id: string;
  clienteId: string | null;   // null = vale para todos
  clienteNome: string | null;
  tipo: TipoDescontoPedido;
  valor: number;
  minimo: number;             // subtotal mínimo do pedido para o desconto valer
  motivo: string | null;
  de: string;
  ate: string;
  vigente: boolean;
}

export interface DadosDescontoPedido { clienteId: string | null; tipo: TipoDescontoPedido; valor: number; minimo: number; motivo: string | null; de: string; ate: string; }

export interface DescontoPedidoRepository {
  listar(schema: string): Promise<DescontoPedido[]>;
  criar(schema: string, d: DadosDescontoPedido): Promise<void>;
  atualizar(schema: string, id: string, d: DadosDescontoPedido): Promise<void>;
  remover(schema: string, id: string): Promise<void>;
  // Valor a abater do pedido conforme a campanha vigente (específica do cliente vence a geral).
  descontoVigente(schema: string, clienteId: string, subtotal: number): Promise<number>;
}
