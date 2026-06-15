import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasFrete(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/frete/config', aut, az('cadastros.motoboy.listar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.obterConfig(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.put('/frete/config', aut, az('cadastros.motoboy.gerenciar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.salvarConfig(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  // Cálculo usado pelo Novo pedido (qualquer um que possa criar pedido).
  r.post('/frete/calcular', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.calcular(sch(req), req.usuario!.empresa, req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });

  // Campanhas de frete por cliente (grátis / fixo / desconto %), com período.
  r.get('/frete/campanhas', aut, az('logistica.frete.ver'), async (req, res: Response) => {
    try { res.json(await deps.freteCampanhasService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/frete/campanhas', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try { await deps.freteCampanhasService.criar(sch(req), req.body ?? {}); res.status(201).json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete('/frete/campanhas/:id', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try { await deps.freteCampanhasService.remover(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
