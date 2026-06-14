import type { NextFunction, Request, Response } from 'express';
import type { UsuarioRepository } from '../../../domain/usuario/UsuarioRepository.js';

// Exige que o usuario autenticado possua a capability informada. Aceita uma cap
// (string) ou um conjunto (array) — nesse caso basta possuir QUALQUER uma delas.
// Usado para granularizar ações mantendo retrocompatibilidade com a cap "guarda-chuva".
export function criarAutorizar(usuarios: UsuarioRepository) {
  return (capability: string | string[]) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const u = req.usuario;
      if (!u) {
        res.status(401).json({ erro: 'auth.token_ausente' });
        return;
      }
      if (u.superAdmin) { next(); return; }
      const querer = Array.isArray(capability) ? capability : [capability];
      try {
        const caps = await usuarios.capabilities(u.schema, u.sub);
        if (!querer.some((c) => caps.includes(c))) {
          res.status(403).json({ erro: 'auth.sem_permissao' });
          return;
        }
        next();
      } catch (e) {
        console.error('[autorizar] erro:', e);
        res.status(500).json({ erro: 'erro.interno' });
      }
    };
}

// Checagem programática de caps dentro de um handler (para autorização que depende
// do corpo da requisição — ex.: cancelar pedido exige cap diferente de mudar status).
export function criarTemCaps(usuarios: UsuarioRepository) {
  return async (req: Request, querer: string[]): Promise<boolean> => {
    const u = req.usuario;
    if (!u) return false;
    if (u.superAdmin) return true;
    const caps = await usuarios.capabilities(u.schema, u.sub);
    return querer.some((c) => caps.includes(c));
  };
}
