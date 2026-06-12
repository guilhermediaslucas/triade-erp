import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasBancos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/bancos', aut, az('cadastros.banco.listar'), async (req, res: Response) => {
    try { res.json(await deps.bancosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/bancos', aut, az('cadastros.banco.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.bancosService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/bancos/:id', aut, az('cadastros.banco.gerenciar'), async (req, res: Response) => {
    try { await deps.bancosService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/bancos/:id/ativo', aut, az('cadastros.banco.gerenciar'), async (req, res: Response) => {
    try { await deps.bancosService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
