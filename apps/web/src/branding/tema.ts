export interface Branding {
  codigo: string;
  nome: string;
  fantasia: string;
  logo: string | null;
  corPrimaria: string;
  corSecundaria: string;
  corMenuFundo: string;
  corMenuFonte: string;
  logoAltura: number;
  idiomaPadrao: string;
  timezonePadrao: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;
  logradouro: string;
  bairro: string;
  cep: string;
  uf: string;
  cidade: string;
}

const PADRAO = { corPrimaria: '#6d28d9', corSecundaria: '#2563eb', corMenuFundo: '#0f172a', corMenuFonte: '#cbd5e1', logoAltura: 44 };

// Decide texto claro/escuro conforme luminancia do fundo.
function contraste(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1e293b' : '#ffffff';
}

export function aplicarTema(b: { corPrimaria: string; corSecundaria?: string; corMenuFundo: string; corMenuFonte: string; logoAltura?: number } | null): void {
  const c = b ?? PADRAO;
  const raiz = document.documentElement.style;
  raiz.setProperty('--accent', c.corPrimaria);
  raiz.setProperty('--accent-fg', contraste(c.corPrimaria));
  raiz.setProperty('--accent2', c.corSecundaria ?? PADRAO.corSecundaria);
  raiz.setProperty('--side-bg', c.corMenuFundo);
  raiz.setProperty('--side-fg', c.corMenuFonte);
  raiz.setProperty('--logo-altura', String(c.logoAltura ?? PADRAO.logoAltura) + 'px');
}

export const TIMEZONES = [
  'America/Sao_Paulo', 'America/Manaus', 'America/Bahia', 'America/Fortaleza',
  'America/Recife', 'America/Cuiaba', 'America/New_York', 'Europe/Lisbon', 'Europe/Madrid', 'UTC',
];
