// Tipos e contratos compartilhados entre API e Web.
// Idiomas suportados (i18n) — fonte unica de verdade.
export const IDIOMAS = ['pt-BR', 'en-US', 'es'] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_PADRAO: Idioma = 'pt-BR';

// Resposta padrao da API para erros.
export interface ApiErro {
  erro: string;
  detalhe?: string;
}

// Resultado do login (sera usado na Fase 0/1).
export interface LoginResposta {
  token: string;
  usuario: { id: string; nome: string; email: string };
}

export * from './capabilities.js';
