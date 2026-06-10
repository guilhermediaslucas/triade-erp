// Cliente HTTP minimo. Base /api e encaminhada pela proxy do Vite para a API.
export interface ErroApi {
  chaveI18n: string;
}

export async function postJson<T>(caminho: string, corpo: unknown, token?: string): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch('/api' + caminho, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: 'Bearer ' + token } : {}),
      },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw { chaveI18n: 'erro.rede' } as ErroApi;
  }
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw { chaveI18n: dados?.erro ?? 'erro.interno' } as ErroApi;
  }
  return dados as T;
}

export async function getJson<T>(caminho: string, token?: string): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch('/api' + caminho, {
      headers: token ? { authorization: 'Bearer ' + token } : {},
    });
  } catch {
    throw { chaveI18n: 'erro.rede' } as ErroApi;
  }
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw { chaveI18n: dados?.erro ?? 'erro.interno' } as ErroApi;
  }
  return dados as T;
}
