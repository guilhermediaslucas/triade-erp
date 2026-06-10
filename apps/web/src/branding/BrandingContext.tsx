import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { aplicarTema, type Branding } from './tema.js';

interface BrandingCtx {
  branding: Branding | null;
  definir: (b: Branding) => void;
}

const Ctx = createContext<BrandingCtx | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [branding, setBranding] = useState<Branding | null>(null);

  function definir(b: Branding) {
    setBranding(b);
    aplicarTema(b);
  }

  useEffect(() => {
    if (!token) { setBranding(null); aplicarTema(null); return; }
    api.get<Branding>('/empresa', token).then(definir).catch(() => { /* mantem tema padrao */ });
  }, [token]);

  return <Ctx.Provider value={{ branding, definir }}>{children}</Ctx.Provider>;
}

export function useBranding(): BrandingCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useBranding fora do BrandingProvider');
  return c;
}
