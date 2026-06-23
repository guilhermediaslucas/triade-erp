export const STATUS_PEDIDO = ['orcamento','aguardando_pagamento','aprovado','separacao','expedido','entregue','cancelado'] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

// próximas transições possíveis (espelha o backend)
export const PROXIMOS: Record<StatusPedido, StatusPedido[]> = {
  orcamento: ['aguardando_pagamento', 'cancelado'],
  aguardando_pagamento: ['cancelado'],
  aprovado: ['separacao', 'orcamento', 'cancelado'],
  separacao: ['expedido', 'cancelado'],
  expedido: ['entregue', 'cancelado'],
  entregue: ['cancelado'],
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

// Abreviação de valores no dashboard (espelha o _fmtBig do mockup):
// >= 1 milhão → R$ X,XXM · >= mil → R$ Xk (arredondado) · senão valor cheio.
export function abrevMoeda(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return 'R$ ' + (n / 1_000_000).toFixed(2).replace('.', ',') + 'M';
  if (a >= 1_000) return 'R$ ' + Math.round(n / 1_000) + 'k';
  return moeda(n);
}
