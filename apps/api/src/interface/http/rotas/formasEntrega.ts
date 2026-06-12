import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasFormasEntrega(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/formas-entrega', aut, az('cadastros.forma_entrega.listar'), async (req, res: Response) => {
    try { res.json(await deps.formasEntregaService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/formas-entrega', aut, az('cadastros.forma_entrega.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.formasEntregaService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/formas-entrega/:id', aut, az('cadastros.forma_entrega.gerenciar'), async (req, res: Response) => {
    try { await deps.formasEntregaService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/formas-entrega/:id/ativo', aut, az('cadastros.forma_entrega.gerenciar'), async (req, res: Response) => {
    try { await deps.formasEntregaService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
