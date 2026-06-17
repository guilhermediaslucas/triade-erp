// Alíquota de ICMS por origem × destino (regra geral do ICMS interestadual BR).
// - Mesma UF → alíquota INTERNA (configurada por empresa; ex.: MG = 18%).
// - Origem no Sul/Sudeste (exceto ES) → 7% p/ Norte/Nordeste/Centro-Oeste + ES; 12% p/ Sul/Sudeste exc. ES.
// - Origem no Norte/Nordeste/Centro-Oeste/ES → 12% para qualquer destino interestadual.
// (Não trata o 4% de produto importado nem DIFAL de consumidor final — fora do escopo.)

const SUL_SUDESTE_EXC_ES = new Set(['PR', 'RS', 'SC', 'SP', 'RJ', 'MG']);

export function aliquotaIcms(ufOrigem: string, ufDestino: string, aliquotaInterna: number): number {
  const o = String(ufOrigem ?? '').toUpperCase().trim();
  const d = String(ufDestino ?? '').toUpperCase().trim();
  if (!o || !d || o === d) return aliquotaInterna;       // operação interna (ou UF ausente: usa a interna)
  if (SUL_SUDESTE_EXC_ES.has(o)) return SUL_SUDESTE_EXC_ES.has(d) ? 12 : 7;
  return 12;                                              // origem N/NE/CO/ES → 12% interestadual
}
