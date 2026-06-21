import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { tratarErro } from '../responder.js';

// Preferências de UI do próprio usuário (chaveadas por token.sub). Qualquer usuário
// logado salva/lê as suas — sem capability (cada um só acessa as próprias).
export function rotasPreferencias(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const ctx = (req: Request) => ({ schema: req.usuario!.schema, sub: req.usuario!.sub });

  r.get('/preferencias/:chave', aut, async (req: Request, res: Response) => {
    try {
      const { schema, sub } = ctx(req);
      res.json({ valor: await deps.preferenciasService.obter(schema, sub, req.params.chave!) });
    } catch (e) { tratarErro(res, e); }
  });

  r.put('/preferencias/:chave', aut, async (req: Request, res: Response) => {
    try {
      const { schema, sub } = ctx(req);
      await deps.preferenciasService.salvar(schema, sub, req.params.chave!, (req.body ?? {}).valor);
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
