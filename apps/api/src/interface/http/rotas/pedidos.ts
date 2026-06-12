import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasPedidos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/pedidos', aut, az('comercial.pedido.listar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/pedidos/:id', aut, az('comercial.pedido.listar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.obter(sch(req), req.params.id!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/pedidos', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.status(201).json(await deps.pedidosService.criar(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/pedidos/:id/status', aut, az('comercial.pedido.gerenciar'), async (req, res: Response) => {
    try { const b = req.body ?? {}; await deps.pedidosService.mudarStatus(sch(req), req.params.id!, b.status, { formaEnvio: b.formaEnvio, formaEnvioDetalhe: b.formaEnvioDetalhe, entregueEm: b.entregueEm }); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.post('/pedidos/:id/separar', aut, az('comercial.pedido.gerenciar'), async (req, res: Response) => {
    try { await deps.pedidosService.separarBipando(sch(req), req.params.id!, (req.body ?? {}).codigos); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
