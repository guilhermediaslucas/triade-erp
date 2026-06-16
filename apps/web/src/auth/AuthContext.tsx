import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type ErroApi } from '../api/client.js';

export interface UsuarioLogado { id: string; nome: string; email: string; empresa: string; foto: string | null; vendedorId: string | null; vendedorNome: string | null; }
interface LoginResp { token: string; usuario: { id: string; nome: string; email: string }; empresa: { codigo: string; fantasia: string }; superAdmin?: boolean; }
interface MeResp { id: string; nome: string; email: string; empresa: string; capabilities: string[]; superAdmin?: boolean; foto?: string | null; vendedorId?: string | null; vendedorNome?: string | null; empresas?: EmpresaAcesso[]; }
export interface EmpresaAcesso { codigo: string; fantasia: string; }

interface AuthCtx {
  token: string | null;
  usuario: UsuarioLogado | null;
  empresaFantasia: string | null;
  capabilities: string[];
  superAdmin: boolean;
  empresas: EmpresaAcesso[];
  temCapability: (id: string) => boolean;
  login: (email: string, senha: string, lembrar?: boolean) => Promise<void>;
  trocarEmpresa: (codigo: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const CHAVE = 'triade_sessao';

interface Sessao { token: string; usuario: UsuarioLogado; empresaFantasia: string; capabilities: string[]; superAdmin: boolean; empresas: EmpresaAcesso[]; }

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
    let vendedorId: string | null = null, vendedorNome: string | null = null;
    let empresas: EmpresaAcesso[] = (r as any).empresas ?? [];
    try { const me = await api.get<MeResp>('/me', r.token); capabilities = me.capabilities; superAdmin = me.superAdmin === true; foto = me.foto ?? null; vendedorId = me.vendedorId ?? null; vendedorNome = me.vendedorNome ?? null; empresas = me.empresas ?? empresas; } catch { /* ignora */ }
    salvar({
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo, foto, vendedorId, vendedorNome },
      empresaFantasia: r.empresa.fantasia,
      capabilities, superAdmin, empresas,
    }, lembrar);
  }

  async function trocarEmpresa(codigo: string): Promise<void> {
    if (!sessao) return;
    const r = await api.post<LoginResp>('/auth/trocar-empresa', { codigo }, sessao.token);
    let capabilities: string[] = [];
    let foto: string | null = null; let superAdmin = sessao.superAdmin;
    let vendedorId: string | null = null, vendedorNome: string | null = null;
    let empresas: EmpresaAcesso[] = sessao.empresas;
    try { const me = await api.get<MeResp>('/me', r.token); capabilities = me.capabilities; foto = me.foto ?? null; superAdmin = me.superAdmin === true; vendedorId = me.vendedorId ?? null; vendedorNome = me.vendedorNome ?? null; empresas = me.empresas ?? empresas; } catch { /* ignora */ }
    salvar({
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo, foto, vendedorId, vendedorNome },
      empresaFantasia: r.empresa.fantasia,
      capabilities, superAdmin, empresas,
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
        const vendedorId = me.vendedorId ?? null;
        const vendedorNome = me.vendedorNome ?? null;
        const empresas = me.empresas ?? [];
        if (JSON.stringify(me.capabilities) !== JSON.stringify(sessao.capabilities) || sa !== sessao.superAdmin || foto !== sessao.usuario.foto
            || vendedorId !== sessao.usuario.vendedorId || JSON.stringify(empresas) !== JSON.stringify(sessao.empresas ?? [])) {
          salvar({ ...sessao, capabilities: me.capabilities, superAdmin: sa, empresas, usuario: { ...sessao.usuario, foto, vendedorId, vendedorNome } }, persist);
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
      empresas: sessao?.empresas ?? [],
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
