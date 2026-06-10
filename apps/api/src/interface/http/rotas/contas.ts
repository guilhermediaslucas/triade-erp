import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasContas(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/contas-correntes', aut, az('cadastros.conta.listar'), async (req, res: Response) => {
    try { res.json(await deps.contasService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/contas-correntes/saldos', aut, az('cadastros.conta.listar'), async (req, res: Response) => {
    try { res.json(await deps.contasService.saldos(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/contas-correntes', aut, az('cadastros.conta.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.contasService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/contas-correntes/:id', aut, az('cadastros.conta.gerenciar'), async (req, res: Response) => {
    try { await deps.contasService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/contas-correntes/:id/ativo', aut, az('cadastros.conta.gerenciar'), async (req, res: Response) => {
    try { await deps.contasService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
