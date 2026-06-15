// Formas de pagamento — fonte única (evita listas duplicadas/divergentes).
// No PEDIDO o cliente escolhe entre estas; na BAIXA do Financeiro há ainda "Transferência".
export const FORMAS_PAGAMENTO = ['Pix', 'Cartão', 'Dinheiro', 'Link', 'Boleto'];
export const FORMAS_BAIXA = ['Pix', 'Cartão', 'Dinheiro', 'Link', 'Boleto', 'Transferência'];

const norm = (f: string) => f.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Pix e Link travam a condição em "à vista" (pagamento imediato).
export function ehAVista(f: string | null): boolean {
  const k = norm(f ?? '');
  return k.includes('pix') || k.includes('link');
}
