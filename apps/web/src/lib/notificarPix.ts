import { moeda, numeroPedido } from './pedido.js';

// Dispara o toast de ação persistente "Pendência de baixa" (canto inferior direito)
// quando um pedido Pix é gerado. "Abrir" leva ao Contas a receber para baixar o título.
export function notificarPixPendente(numero: number, cliente: string | null, total: number, t: (k: string) => string): void {
  window.dispatchEvent(new CustomEvent('toast-acao', {
    detail: {
      titulo: t('toastpix.titulo'),
      corpo: t('toastpix.corpo').replace('{n}', numeroPedido(numero)).replace('{c}', cliente ?? '').replace('{v}', moeda(total)),
      href: '/financeiro/receber',
    },
  }));
}
