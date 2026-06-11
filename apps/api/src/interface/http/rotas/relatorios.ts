import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasRelatorios(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/relatorios/vendas', aut, az('relatorios.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.vendas(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/produtos-vendidos', aut, az('relatorios.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.produtosVendidos(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/validade-lotes', aut, az('relatorios.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.validadeLotes(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
