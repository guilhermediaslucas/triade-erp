import { Router, type Request, type Response } from 'express';
import type { GeradorToken } from '../../../domain/ports/GeradorToken.js';
import { criarAutenticar } from '../middlewares/autenticar.js';

export function rotasMe(tokens: GeradorToken): Router {
  const r = Router();
  const autenticar = criarAutenticar(tokens);

  // Rota protegida: devolve o usuario do token.
  r.get('/me', autenticar, (req: Request, res: Response) => {
    const u = req.usuario!;
    res.json({
      id: u.sub,
      nome: u.nome,
      email: u.email,
      empresa: u.empresa,
    });
  });

  return r;
}
