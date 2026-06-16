// Formatadores usados nas descrições de auditoria (texto pronto para humano).
export function brl(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function dataBR(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = String(iso).slice(0, 10);
  const [a, m, d] = s.split('-');
  return d && m && a ? `${d}/${m}/${a}` : s;
}
