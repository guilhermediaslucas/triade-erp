import { moeda } from './pedido.js';

// Toast ao lançar uma nota de entrada: avisa que ficou pendente de recebimento no Estoque.
// (Aparece na sessão de quem lançou; o pessoal do Estoque vê a pendência no Sino.)
export function notificarRecebimentoPendente(qtdItens: number, fornecedor: string | null, total: number, t: (k: string) => string): void {
  window.dispatchEvent(new CustomEvent('toast-acao', {
    detail: {
      titulo: t('toastreceb.titulo'),
      corpo: t('toastreceb.corpo').replace('{n}', String(qtdItens)).replace('{f}', fornecedor ?? '').replace('{v}', moeda(total)),
      href: '/estoque/recebimento',
    },
  }));
}
