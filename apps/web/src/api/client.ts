export interface ErroApi { chaveI18n: string; status?: number; }

// Base da API.
// - Produção (Cloudflare Pages / Vercel): defina a variável de build VITE_API_URL
//   com a URL da API no Render (ex.: https://triade-api.onrender.com). O site chama
//   a API direto (CORS já habilitado na API).
// - Dev/local (VITE_API_URL vazio): usa o proxy /api -> localhost:3333 do Vite.
const API_BASE = String((import.meta as any).env?.VITE_API_URL ?? '').replace(/\/+$/, '');
const montarUrl = (caminho: string) => (API_BASE ? API_BASE + caminho : '/api' + caminho);

async function req<T>(metodo: string, caminho: string, token?: string, corpo?: unknown): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(montarUrl(caminho), {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: 'Bearer ' + token } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw { chaveI18n: 'erro.rede', status: 0 } as ErroApi;
  }
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw { chaveI18n: (dados as any)?.erro ?? 'erro.interno', status: resp.status } as ErroApi;
  return dados as T;
}

async function baixarBlob(caminho: string, token?: string): Promise<Blob> {
  const resp = await fetch(montarUrl(caminho), { headers: token ? { authorization: 'Bearer ' + token } : {} });
  if (!resp.ok) throw { chaveI18n: 'erro.interno', status: resp.status } as ErroApi;
  return resp.blob();
}

export const api = {
  get: <T>(c: string, token?: string) => req<T>('GET', c, token),
  blob: baixarBlob,
  post: <T>(c: string, corpo: unknown, token?: string) => req<T>('POST', c, token, corpo),
  put: <T>(c: string, corpo: unknown, token?: string) => req<T>('PUT', c, token, corpo),
  patch: <T>(c: string, corpo: unknown, token?: string) => req<T>('PATCH', c, token, corpo),
  del: <T>(c: string, token?: string) => req<T>('DELETE', c, token),
};
