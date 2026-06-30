import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasIa(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);

  // Assistente (IA) — só consulta nesta versão. Gateado por capability.
  r.post('/ia/perguntar', aut, az('ia.assistente.usar'), async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      const { texto, historico } = req.body ?? {};
      const out = await deps.assistenteService.perguntar(
        { schema: u.schema, sub: u.sub, superAdmin: !!u.superAdmin },
        String(texto ?? ''),
        Array.isArray(historico) ? historico : [],
      );
      res.json(out);
    } catch (e) {
      tratarErro(res, e);
    }
  });

  // Aplica uma ação proposta pela IA, após o usuário confirmar (gate da escrita
  // é feito dentro do serviço, pela capability da ação).
  r.post('/ia/aplicar', aut, az('ia.assistente.usar'), async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      const { proposta } = req.body ?? {};
      const out = await deps.assistenteService.aplicar(
        { schema: u.schema, sub: u.sub, superAdmin: !!u.superAdmin },
        proposta,
      );
      res.json(out);
    } catch (e) {
      tratarErro(res, e);
    }
  });

  return r;
}
