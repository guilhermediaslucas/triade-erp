export const soDigitos = (v: string) => (v || '').replace(/\D/g, '');
export function mascaraCnpj(v: string) { const d = soDigitos(v).slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); }
export function mascaraCpf(v: string) { const d = soDigitos(v).slice(0, 11); return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'); }
export function mascaraCep(v: string) { const d = soDigitos(v).slice(0, 8); return d.replace(/^(\d{5})(\d)/, '$1-$2'); }
// Telefone BR: formata (xx)xxxx-xxxx (fixo, 10 díg.) ou (xx)xxxxx-xxxx (celular, 11 díg.).
// Detecta automaticamente fixo/celular pela quantidade de dígitos — serve para os dois.
export function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1');
  const meio = d.length <= 10 ? 4 : 5;   // fixo: 4 dígitos antes do hífen; celular: 5
  const ddd = d.slice(0, 2), p1 = d.slice(2, 2 + meio), p2 = d.slice(2 + meio);
  return p2 ? `(${ddd})${p1}-${p2}` : `(${ddd})${p1}`;
}

export interface DadosCnpj { razao: string | null; fantasia: string | null; cep: string | null; cidade: string | null; uf: string | null; }
export async function buscarCnpj(documento: string): Promise<DadosCnpj | null> {
  const d = soDigitos(documento);
  if (d.length !== 14) return null;
  const resp = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + d);
  if (!resp.ok) return null;
  const j = await resp.json();
  return { razao: j.razao_social ?? null, fantasia: j.nome_fantasia ?? null, cep: j.cep ?? null, cidade: j.municipio ?? null, uf: j.uf ?? null };
}
// 27 unidades federativas (siglas) — para o select de UF nos endereços.
export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] as const;

// Municípios de uma UF via API do IBGE (localidades). Retorna os nomes ordenados.
const _cacheMun: Record<string, string[]> = {};
export async function buscarMunicipios(uf: string): Promise<string[]> {
  const sigla = (uf || '').toUpperCase();
  if (!(UFS as readonly string[]).includes(sigla)) return [];
  if (_cacheMun[sigla]) return _cacheMun[sigla]!;
  try {
    const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios?orderBy=nome`);
    if (!resp.ok) return [];
    const j = await resp.json();
    const nomes = Array.isArray(j) ? j.map((m: any) => String(m?.nome ?? '')).filter(Boolean) : [];
    _cacheMun[sigla] = nomes;
    return nomes;
  } catch { return []; }
}

export interface DadosCep { logradouro: string | null; bairro: string | null; cidade: string | null; uf: string | null; }
export async function buscarCep(cep: string): Promise<DadosCep | null> {
  const d = soDigitos(cep);
  if (d.length !== 8) return null;
  const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`);
  if (!resp.ok) return null;
  const j = await resp.json();
  if (j.erro) return null;
  return { logradouro: j.logradouro ?? null, bairro: j.bairro ?? null, cidade: j.localidade ?? null, uf: j.uf ?? null };
}
