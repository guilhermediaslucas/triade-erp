import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { tratarErro } from '../responder.js';

export function rotasMe(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);

  r.get('/me', autenticar, async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      const capabilities = u.superAdmin ? [] : await deps.usuariosRepo.capabilities(u.schema, u.sub);
      res.json({ id: u.sub, nome: u.nome, email: u.email, empresa: u.empresa, capabilities, superAdmin: u.superAdmin === true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
