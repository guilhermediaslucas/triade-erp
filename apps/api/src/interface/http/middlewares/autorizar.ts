import type { NextFunction, Request, Response } from 'express';
import type { UsuarioRepository } from '../../../domain/usuario/UsuarioRepository.js';

// Exige que o usuario autenticado possua a capability informada.
export function criarAutorizar(usuarios: UsuarioRepository) {
  return (capability: string) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const u = req.usuario;
      if (!u) {
        res.status(401).json({ erro: 'auth.token_ausente' });
        return;
      }
      if (u.superAdmin) { next(); return; }
      try {
        const caps = await usuarios.capabilities(u.schema, u.sub);
        if (!caps.includes(capability)) {
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
