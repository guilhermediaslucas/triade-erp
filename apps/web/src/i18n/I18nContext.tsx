import { createContext, useContext, type ReactNode } from 'react';
import { dicionario } from './dicionarios.js';

// Sistema é só pt-BR. Mantemos a função t() para não reescrever todas as telas,
// mas ela sempre resolve no dicionário português.
interface I18nCtx {
  t: (chave: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  function t(chave: string): string {
    return dicionario[chave] ?? chave;
  }
  return <Ctx.Provider value={{ t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n fora do I18nProvider');
  return c;
}
