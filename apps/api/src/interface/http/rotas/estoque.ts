import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasEstoque(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/estoque', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.posicao(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/entrada', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try { await deps.estoqueService.entrada(sch(req), req.body ?? {}); res.status(201).json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/baixa', aut, az('estoque.baixa.criar'), async (req, res: Response) => {
    try { await deps.estoqueService.baixaPerda(sch(req), req.body ?? {}); res.status(201).json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/lotes/:loteId/etiquetas', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.etiquetasDoLote(sch(req), req.params.loteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/etiquetas/:codigo', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.consultarEtiqueta(sch(req), req.params.codigo!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/inventario', aut, az('estoque.inventario.ver'), async (req, res: Response) => {
    try { res.json(await deps.inventarioService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/inventario/:id/faltantes', aut, az('estoque.inventario.ver'), async (req, res: Response) => {
    try { res.json(await deps.inventarioService.faltantesDe(sch(req), req.params.id!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/inventario', aut, az('estoque.inventario.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json(await deps.inventarioService.finalizar(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/recebimentos', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try { res.json(await deps.comprasService.listarPendentes(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/recebimentos/:id/receber', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try { await deps.comprasService.receber(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
