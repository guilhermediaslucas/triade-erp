import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasDescontos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/comercial/descontos', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.descontosPedidoService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  // Resolve o desconto vigente p/ o Novo pedido (qualquer quem pode criar pedido).
  r.get('/comercial/descontos/resolver', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.json({ desconto: await deps.descontosPedidoService.resolver(sch(req), String(req.query.clienteId ?? ''), Number(req.query.subtotal ?? 0)) }); } catch (e) { tratarErro(res, e); }
  });
  r.post('/comercial/descontos', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.descontosPedidoService.criar(sch(req), req.body ?? {}); res.status(201).json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/comercial/descontos/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.descontosPedidoService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete('/comercial/descontos/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.descontosPedidoService.remover(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
