import { createContext, useContext, useState, type ReactNode } from 'react';
import { IDIOMA_PADRAO, IDIOMAS, type Idioma } from '@triade/shared';
import { dicionarios } from './dicionarios.js';

interface I18nCtx {
  idioma: Idioma;
  idiomas: readonly Idioma[];
  setIdioma: (i: Idioma) => void;
  t: (chave: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const CHAVE = 'triade_idioma';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>(() => {
    const salvo = localStorage.getItem(CHAVE) as Idioma | null;
    return salvo && IDIOMAS.includes(salvo) ? salvo : IDIOMA_PADRAO;
  });

  function setIdioma(i: Idioma) {
    localStorage.setItem(CHAVE, i);
    setIdiomaState(i);
  }

  function t(chave: string): string {
    return dicionarios[idioma][chave] ?? dicionarios[IDIOMA_PADRAO][chave] ?? chave;
  }

  return <Ctx.Provider value={{ idioma, idiomas: IDIOMAS, setIdioma, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n fora do I18nProvider');
  return c;
}
