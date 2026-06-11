import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasFavorecidos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/favorecidos', aut, az('cadastros.favorecido.listar'), async (req, res: Response) => {
    try { res.json(await deps.favorecidosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/favorecidos', aut, az('cadastros.favorecido.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.favorecidosService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/favorecidos/:id', aut, az('cadastros.favorecido.gerenciar'), async (req, res: Response) => {
    try { await deps.favorecidosService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/favorecidos/:id/ativo', aut, az('cadastros.favorecido.gerenciar'), async (req, res: Response) => {
    try { await deps.favorecidosService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
