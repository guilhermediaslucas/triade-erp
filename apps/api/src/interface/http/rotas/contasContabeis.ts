import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

// Plano de contas (conta contábil). Reusa as caps de categorias financeiras.
export function rotasContasContabeis(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/contas-contabeis', aut, az('cadastros.catfin.listar'), async (req, res: Response) => {
    try { res.json(await deps.contasContabeisService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/contas-contabeis', aut, az('cadastros.catfin.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.contasContabeisService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/contas-contabeis/:id', aut, az('cadastros.catfin.gerenciar'), async (req, res: Response) => {
    try { await deps.contasContabeisService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/contas-contabeis/:id/ativo', aut, az('cadastros.catfin.gerenciar'), async (req, res: Response) => {
    try { await deps.contasContabeisService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
