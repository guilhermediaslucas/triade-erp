import type { NextFunction, Request, Response } from 'express';
import type { GeradorToken, TokenPayload } from '../../../domain/ports/GeradorToken.js';

// Estende o Request com o usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export function criarAutenticar(tokens: GeradorToken) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ erro: 'auth.token_ausente' });
      return;
    }
    try {
      req.usuario = tokens.verificar(header.slice(7));
      next();
    } catch {
      res.status(401).json({ erro: 'auth.token_invalido' });
    }
  };
}
