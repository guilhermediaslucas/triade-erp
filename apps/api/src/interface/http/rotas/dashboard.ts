import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasDashboard(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  r.get('/dashboard', aut, az('dashboard.ver'), async (req: Request, res: Response) => {
    try { res.json(await deps.dashboardService.resumo(req.usuario!.schema)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/dashboard/serie', aut, az('dashboard.ver'), async (req: Request, res: Response) => {
    try { res.json(await deps.dashboardService.serie(req.usuario!.schema, req.query.tipo, req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/dashboard/drill', aut, az('dashboard.ver'), async (req: Request, res: Response) => {
    try { res.json(await deps.dashboardService.drillFaturamento(req.usuario!.schema, req.query.mes)); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
