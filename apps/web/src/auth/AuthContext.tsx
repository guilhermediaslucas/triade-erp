import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type ErroApi } from '../api/client.js';

export interface UsuarioLogado { id: string; nome: string; email: string; empresa: string; foto: string | null; }
interface LoginResp { token: string; usuario: { id: string; nome: string; email: string }; empresa: { codigo: string; fantasia: string }; superAdmin?: boolean; }
interface MeResp { id: string; nome: string; email: string; empresa: string; capabilities: string[]; superAdmin?: boolean; foto?: string | null; }

interface AuthCtx {
  token: string | null;
  usuario: UsuarioLogado | null;
  empresaFantasia: string | null;
  capabilities: string[];
  superAdmin: boolean;
  temCapability: (id: string) => boolean;
  login: (email: string, senha: string, lembrar?: boolean) => Promise<void>;
  trocarEmpresa: (codigo: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const CHAVE = 'triade_sessao';

interface Sessao { token: string; usuario: UsuarioLogado; empresaFantasia: string; capabilities: string[]; superAdmin: boolean; }

// "Lembrar-me": sessão persiste em localStorage; senão, só em sessionStorage (cai ao fechar o navegador).
function carregar(): Sessao | null {
  try {
    const raw = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch { return null; }
}
const persistido = () => { try { return localStorage.getItem(CHAVE) != null; } catch { return false; } };

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
    let superAdmin = r.superAdmin === true;
    let foto: string | null = null;
    try { const me = await api.get<MeResp>('/me', r.token); capabilities = me.capabilities; superAdmin = me.superAdmin === true; foto = me.foto ?? null; } catch { /* ignora */ }
    salvar({
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo, foto },
      empresaFantasia: r.empresa.fantasia,
      capabilities, superAdmin,
    }, lembrar);
  }

  async function trocarEmpresa(codigo: string): Promise<void> {
    if (!sessao) return;
    const r = await api.post<LoginResp>('/auth/trocar-empresa', { codigo }, sessao.token);
    let capabilities: string[] = [];
    let foto: string | null = null;
    try { const me = await api.get<MeResp>('/me', r.token); capabilities = me.capabilities; foto = me.foto ?? null; } catch { /* ignora */ }
    salvar({
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo, foto },
      empresaFantasia: r.empresa.fantasia,
      capabilities, superAdmin: true,
    }, persistido());
    // Recarrega para refazer branding e dados da nova empresa.
    window.location.assign('/');
  }

  // Ao recarregar com sessao salva, revalida e atualiza capabilities/superAdmin.
  // IMPORTANTE: só desloga em 401 (token realmente inválido/expirado). Erro de rede
  // ou 5xx (ex.: API hibernando no Render) NÃO pode apagar a sessão "Lembrar-me" —
  // mantemos a sessão em cache e as capabilities salvas até uma resposta 401.
  useEffect(() => {
    if (!sessao?.token) return;
    const persist = persistido();
    api.get<MeResp>('/me', sessao.token)
      .then((me) => {
        const sa = me.superAdmin === true;
        const foto = me.foto ?? null;
        if (JSON.stringify(me.capabilities) !== JSON.stringify(sessao.capabilities) || sa !== sessao.superAdmin || foto !== sessao.usuario.foto) {
          salvar({ ...sessao, capabilities: me.capabilities, superAdmin: sa, usuario: { ...sessao.usuario, foto } }, persist);
        }
      })
      .catch((e: ErroApi) => { if (e?.status === 401) salvar(null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{
      token: sessao?.token ?? null,
      usuario: sessao?.usuario ?? null,
      empresaFantasia: sessao?.empresaFantasia ?? null,
      capabilities: sessao?.capabilities ?? [],
      superAdmin: sessao?.superAdmin ?? false,
      temCapability: (id) => (sessao?.superAdmin ? true : (sessao?.capabilities ?? []).includes(id)),
      login, trocarEmpresa,
      logout: () => salvar(null),
    }}>{children}</Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}
