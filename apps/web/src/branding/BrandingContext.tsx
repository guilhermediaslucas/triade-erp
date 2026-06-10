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

  function definir(b: Branding) { setBranding(b); aplicarTema(b); }

  useEffect(() => {
    if (!token) { setBranding(null); aplicarTema(null); return; }
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
