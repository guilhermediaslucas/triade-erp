import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasCondicoes(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/condicoes', aut, az('cadastros.condicao.listar'), async (req, res: Response) => {
    try { res.json(await deps.condicoesService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/condicoes', aut, az('cadastros.condicao.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.condicoesService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/condicoes/:id', aut, az('cadastros.condicao.gerenciar'), async (req, res: Response) => {
    try { await deps.condicoesService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/condicoes/:id/ativo', aut, az('cadastros.condicao.gerenciar'), async (req, res: Response) => {
    try { await deps.condicoesService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
