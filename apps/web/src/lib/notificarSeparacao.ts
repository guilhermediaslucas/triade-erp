import { moeda, numeroPedido } from './pedido.js';

// Toast quando um pedido é aprovado e fica disponível para separação (Expedição).
// Dispara para quem fez a ação (baixa do Financeiro, ou confirmação Cartão/Dinheiro).
export function notificarLiberadoSeparacao(numero: number, cliente: string | null, total: number, t: (k: string) => string): void {
  window.dispatchEvent(new CustomEvent('toast-acao', {
    detail: {
      titulo: t('toastsep.titulo'),
      corpo: t('toastsep.corpo').replace('{n}', numeroPedido(numero)).replace('{c}', cliente ?? '').replace('{v}', moeda(total)),
      href: '/estoque/expedicao',
    },
  }));
}
