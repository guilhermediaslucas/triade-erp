import { Router, type Request, type Response } from 'express';
import { CAPABILITIES } from '@triade/shared';
import type { GeradorToken } from '../../../domain/ports/GeradorToken.js';
import { criarAutenticar } from '../middlewares/autenticar.js';

export function rotasCapabilities(tokens: GeradorToken): Router {
  const r = Router();
  const autenticar = criarAutenticar(tokens);
  r.get('/capabilities', autenticar, (_req: Request, res: Response) => {
    res.json(CAPABILITIES);
  });
  return r;
}
