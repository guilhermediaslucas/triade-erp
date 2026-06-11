import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasMotoboys(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/motoboys', aut, az('cadastros.motoboy.listar'), async (req, res: Response) => {
    try { res.json(await deps.motoboysService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/motoboys', aut, az('cadastros.motoboy.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.motoboysService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/motoboys/:id', aut, az('cadastros.motoboy.gerenciar'), async (req, res: Response) => {
    try { await deps.motoboysService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/motoboys/:id/ativo', aut, az('cadastros.motoboy.gerenciar'), async (req, res: Response) => {
    try { await deps.motoboysService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
