import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasRelatorios(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/relatorios/vendas', aut, az('relatorios.vendas.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.vendas(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/vendas-contabil', aut, az(['relatorios.vendas.ver', 'relatorios.contabil.vendas.ver']), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.vendasContabil(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/produtos-vendidos', aut, az('relatorios.produtos.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.produtosVendidos(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/curva-abc', aut, az('relatorios.abc.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.curvaAbc(sch(req), req.query.de, req.query.ate, req.query.por)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/validade-lotes', aut, az('relatorios.validade.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.validadeLotes(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/estoque-parado', aut, az('relatorios.parado.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.estoqueParado(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/perdas-estoque', aut, az('relatorios.perdas.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.perdasEstoque(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/relatorios/pedidos', aut, az('relatorios.pedidos.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.pedidos(sch(req), req.query.de, req.query.ate, req.query.status)); } catch (e) { tratarErro(res, e); }
  });
  // Volume de entregas (Logística): reusa a cap de entregas, sem cap nova.
  r.get('/relatorios/volume-entregas', aut, az('logistica.volume.ver'), async (req, res: Response) => {
    try { res.json(await deps.relatoriosService.volumeEntregas(sch(req), req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
