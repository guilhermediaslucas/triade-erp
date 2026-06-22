import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasTaxasCartao(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/taxas-cartao', aut, az('cadastros.taxa_cartao.listar'), async (req, res: Response) => {
    try { res.json(await deps.taxasCartaoService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/taxas-cartao', aut, az('cadastros.taxa_cartao.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.taxasCartaoService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/taxas-cartao/:id', aut, az('cadastros.taxa_cartao.gerenciar'), async (req, res: Response) => {
    try { await deps.taxasCartaoService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/taxas-cartao/:id/ativo', aut, az('cadastros.taxa_cartao.gerenciar'), async (req, res: Response) => {
    try { await deps.taxasCartaoService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
