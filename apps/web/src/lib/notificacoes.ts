// Estado de notificações "concluídas" (dispensadas), compartilhado entre o Sino e a
// tela de Notificações. Guardado por usuário no navegador.
// Formato: { [chave]: qtdQuandoConcluiu }. Uma notificação fica OCULTA enquanto a
// quantidade atual for <= a quantidade de quando foi concluída; se chegarem itens
// novos (qtd maior), ela reaparece sozinha.
const CHAVE_LS = 'triade_notif_concluidas';
export const EVENTO_NOTIF = 'notif-mudou';

export function lerConcluidas(): Record<string, number> {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_LS) || '{}');
    // Migração do formato antigo (array de chaves) → mapa com Infinity (fica oculto até reabrir).
    if (Array.isArray(bruto)) {
      const m: Record<string, number> = {};
      for (const c of bruto) m[String(c)] = Number.POSITIVE_INFINITY;
      return m;
    }
    return bruto && typeof bruto === 'object' ? (bruto as Record<string, number>) : {};
  } catch { return {}; }
}

function salvar(m: Record<string, number>): void {
  try { localStorage.setItem(CHAVE_LS, JSON.stringify(m)); } catch { /* */ }
  try { window.dispatchEvent(new Event(EVENTO_NOTIF)); } catch { /* */ }
}

/** true se a notificação está concluída/oculta para a quantidade atual. */
export function estaOculta(m: Record<string, number>, chave: string, qtd: number): boolean {
  return m[chave] != null && qtd <= m[chave];
}

export function concluir(chave: string, qtd: number): void {
  const m = lerConcluidas(); m[chave] = qtd; salvar(m);
}
export function concluirVarias(itens: { chave: string; qtd: number }[]): void {
  const m = lerConcluidas(); for (const it of itens) m[it.chave] = it.qtd; salvar(m);
}
export function reabrir(chave: string): void {
  const m = lerConcluidas(); delete m[chave]; salvar(m);
}
