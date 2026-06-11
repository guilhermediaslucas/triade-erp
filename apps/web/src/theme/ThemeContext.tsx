import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface TemaCtx { escuro: boolean; alternar: () => void; }
const Ctx = createContext<TemaCtx>({ escuro: false, alternar: () => {} });
const CHAVE = 'triade_tema';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [escuro, setEscuro] = useState<boolean>(() => {
    try { return localStorage.getItem(CHAVE) === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    document.body.classList.toggle('theme-dark', escuro);
    try { localStorage.setItem(CHAVE, escuro ? 'dark' : 'light'); } catch { /* ignora */ }
  }, [escuro]);
  return <Ctx.Provider value={{ escuro, alternar: () => setEscuro((v) => !v) }}>{children}</Ctx.Provider>;
}

export const useTema = (): TemaCtx => useContext(Ctx);
