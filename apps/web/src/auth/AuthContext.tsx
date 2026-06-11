import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client.js';

export interface UsuarioLogado { id: string; nome: string; email: string; empresa: string; }
interface LoginResp { token: string; usuario: { id: string; nome: string; email: string }; empresa: { codigo: string; fantasia: string }; }
interface MeResp { id: string; nome: string; email: string; empresa: string; capabilities: string[]; }

interface AuthCtx {
  token: string | null;
  usuario: UsuarioLogado | null;
  empresaFantasia: string | null;
  capabilities: string[];
  temCapability: (id: string) => boolean;
  login: (email: string, senha: string, lembrar?: boolean) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const CHAVE = 'triade_sessao';

interface Sessao { token: string; usuario: UsuarioLogado; empresaFantasia: string; capabilities: string[]; }

// "Lembrar-me": sessão persiste em localStorage; senão, só em sessionStorage (cai ao fechar o navegador).
function carregar(): Sessao | null {
  try {
    const raw = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(carregar);

  function salvar(s: Sessao | null, lembrar = true) {
    localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE);
    if (s) (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(s));
    setSessao(s);
  }

  async function login(email: string, senha: string, lembrar = true): Promise<void> {
    const r = await api.post<LoginResp>('/auth/login', { email, senha });
    let capabilities: string[] = [];
    try { capabilities = (await api.get<MeResp>('/me', r.token)).capabilities; } catch { /* ignora */ }
    salvar({
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo },
      empresaFantasia: r.empresa.fantasia,
      capabilities,
    }, lembrar);
  }

  // Ao recarregar com sessao salva, revalida e atualiza capabilities (token expirado -> logout).
  useEffect(() => {
    if (!sessao?.token) return;
    const persistido = localStorage.getItem(CHAVE) != null;
    api.get<MeResp>('/me', sessao.token)
      .then((me) => { if (JSON.stringify(me.capabilities) !== JSON.stringify(sessao.capabilities)) salvar({ ...sessao, capabilities: me.capabilities }, persistido); })
      .catch(() => salvar(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{
      token: sessao?.token ?? null,
      usuario: sessao?.usuario ?? null,
      empresaFantasia: sessao?.empresaFantasia ?? null,
      capabilities: sessao?.capabilities ?? [],
      temCapability: (id) => (sessao?.capabilities ?? []).includes(id),
      login,
      logout: () => salvar(null),
    }}>{children}</Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}
