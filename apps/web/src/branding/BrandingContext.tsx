import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Idioma } from '@triade/shared';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { aplicarTema, type Branding } from './tema.js';

interface BrandingCtx { branding: Branding | null; definir: (b: Branding) => void; }
const Ctx = createContext<BrandingCtx | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { idiomas, setIdioma } = useI18n();
  const [branding, setBranding] = useState<Branding | null>(null);

  function definir(b: Branding) {
    setBranding(b); aplicarTema(b);
    // Persiste logo/fantasia p/ o gerador de Excel (lib/excel.ts) embutir no relatório.
    try {
      if (b.logo) localStorage.setItem('triade_logo', b.logo); else localStorage.removeItem('triade_logo');
      if (b.fantasia) localStorage.setItem('triade_fantasia', b.fantasia); else localStorage.removeItem('triade_fantasia');
    } catch { /* ignora */ }
  }

  useEffect(() => {
    if (!token) { setBranding(null); aplicarTema(null); try { localStorage.removeItem('triade_logo'); } catch { /* ignora */ } return; }
    api.get<Branding>('/empresa', token).then((b) => {
      definir(b);
      // Se o usuario ainda nao escolheu idioma manualmente, usa o padrao da empresa.
      if (!localStorage.getItem('triade_idioma') && idiomas.includes(b.idiomaPadrao as Idioma)) {
        setIdioma(b.idiomaPadrao as Idioma);
      }
    }).catch(() => { /* mantem tema padrao */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <Ctx.Provider value={{ branding, definir }}>{children}</Ctx.Provider>;
}

export function useBranding(): BrandingCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useBranding fora do BrandingProvider');
  return c;
}
