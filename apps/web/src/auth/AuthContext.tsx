import { createContext, useContext, useState, type ReactNode } from 'react';
import { postJson } from '../api/client.js';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  empresa: string;
}

interface LoginResp {
  token: string;
  usuario: { id: string; nome: string; email: string };
  empresa: { codigo: string; fantasia: string };
}

interface AuthCtx {
  token: string | null;
  usuario: UsuarioLogado | null;
  empresaFantasia: string | null;
  login: (codigoEmpresa: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const CHAVE = 'triade_sessao';

interface Sessao {
  token: string;
  usuario: UsuarioLogado;
  empresaFantasia: string;
}

function carregar(): Sessao | null {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(carregar);

  async function login(codigoEmpresa: string, email: string, senha: string): Promise<void> {
    const r = await postJson<LoginResp>('/auth/login', { codigoEmpresa, email, senha });
    const nova: Sessao = {
      token: r.token,
      usuario: { ...r.usuario, empresa: r.empresa.codigo },
      empresaFantasia: r.empresa.fantasia,
    };
    localStorage.setItem(CHAVE, JSON.stringify(nova));
    setSessao(nova);
  }

  function logout(): void {
    localStorage.removeItem(CHAVE);
    setSessao(null);
  }

  return (
    <Ctx.Provider
      value={{
        token: sessao?.token ?? null,
        usuario: sessao?.usuario ?? null,
        empresaFantasia: sessao?.empresaFantasia ?? null,
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}
