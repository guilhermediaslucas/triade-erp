import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasLogistica(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/logistica/fretes', aut, az('logistica.frete.ver'), async (req, res: Response) => {
    try { res.json(await deps.gestaoFretesService.apurar(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/logistica/fretes/pedidos', aut, az('logistica.frete.ver'), async (req, res: Response) => {
    try { res.json(await deps.gestaoFretesService.listarPedidos(sch(req), req.query.de, req.query.ate, req.query.gerado)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/logistica/fretes/gerar', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json(await deps.gestaoFretesService.gerar(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
