export interface ErroApi { chaveI18n: string; }

async function req<T>(metodo: string, caminho: string, token?: string, corpo?: unknown): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch('/api' + caminho, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: 'Bearer ' + token } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw { chaveI18n: 'erro.rede' } as ErroApi;
  }
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw { chaveI18n: (dados as any)?.erro ?? 'erro.interno' } as ErroApi;
  return dados as T;
}

export const api = {
  get: <T>(c: string, token?: string) => req<T>('GET', c, token),
  post: <T>(c: string, corpo: unknown, token?: string) => req<T>('POST', c, token, corpo),
  put: <T>(c: string, corpo: unknown, token?: string) => req<T>('PUT', c, token, corpo),
  patch: <T>(c: string, corpo: unknown, token?: string) => req<T>('PATCH', c, token, corpo),
  del: <T>(c: string, token?: string) => req<T>('DELETE', c, token),
};
