// Alíquota de ICMS por origem × destino (espelha o backend domain/fiscal/icms.ts).
// Mesma UF → interna; origem Sul/Sudeste exc. ES → 7% (N/NE/CO+ES) ou 12% (S/SE exc. ES);
// origem N/NE/CO/ES → 12% interestadual.
const SUL_SUDESTE_EXC_ES = new Set(['PR', 'RS', 'SC', 'SP', 'RJ', 'MG']);

export function aliquotaIcms(ufOrigem: string, ufDestino: string, interna: number): number {
  const o = (ufOrigem || '').toUpperCase().trim();
  const d = (ufDestino || '').toUpperCase().trim();
  if (!o || !d || o === d) return interna;
  if (SUL_SUDESTE_EXC_ES.has(o)) return SUL_SUDESTE_EXC_ES.has(d) ? 12 : 7;
  return 12;
}
