import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasMetas(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const metas = deps.metasService;

  r.get('/metas', aut, az('comercial.meta.ver'), async (req, res: Response) => {
    try { res.json(await metas.obter(sch(req), req.query.ano ?? new Date().getFullYear())); } catch (e) { tratarErro(res, e); }
  });
  r.get('/metas/atual', aut, az('comercial.meta.ver'), async (req, res: Response) => {
    try { res.json(await metas.atual(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.put('/metas', aut, az('comercial.meta.gerenciar'), async (req, res: Response) => {
    try { await metas.salvar(sch(req), req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });

  return r;
}
