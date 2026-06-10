export const soDigitos = (v: string) => (v || '').replace(/\D/g, '');
export function mascaraCnpj(v: string) { const d = soDigitos(v).slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); }
export function mascaraCpf(v: string) { const d = soDigitos(v).slice(0, 11); return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'); }
export function mascaraCep(v: string) { const d = soDigitos(v).slice(0, 8); return d.replace(/^(\d{5})(\d)/, '$1-$2'); }

export interface DadosCnpj { razao: string | null; fantasia: string | null; cep: string | null; cidade: string | null; uf: string | null; }
export async function buscarCnpj(documento: string): Promise<DadosCnpj | null> {
  const d = soDigitos(documento);
  if (d.length !== 14) return null;
  const resp = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + d);
  if (!resp.ok) return null;
  const j = await resp.json();
  return { razao: j.razao_social ?? null, fantasia: j.nome_fantasia ?? null, cep: j.cep ?? null, cidade: j.municipio ?? null, uf: j.uf ?? null };
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
