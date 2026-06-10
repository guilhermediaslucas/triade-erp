export const STATUS_PEDIDO = ['orcamento','aguardando_pagamento','aprovado','separacao','expedido','entregue','cancelado'] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

// próximas transições possíveis (espelha o backend)
export const PROXIMOS: Record<StatusPedido, StatusPedido[]> = {
  orcamento: ['aguardando_pagamento', 'cancelado'],
  aguardando_pagamento: ['aprovado', 'cancelado'],
  aprovado: ['separacao', 'cancelado'],
  separacao: ['expedido'],
  expedido: ['entregue'],
  entregue: [],
  cancelado: [],
};

export function corStatus(s: StatusPedido): string {
  switch (s) {
    case 'orcamento': return 'st-cinza';
    case 'aguardando_pagamento': return 'st-laranja';
    case 'aprovado': return 'st-azul';
    case 'separacao': return 'st-roxo';
    case 'expedido': return 'st-ciano';
    case 'entregue': return 'st-verde';
    case 'cancelado': return 'st-vermelho';
  }
}

export const numeroPedido = (n: number) => 'PE-' + String(n).padStart(6, '0');
export const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
