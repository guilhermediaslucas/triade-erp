import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasPrecos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/precos', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.definir(sch(req), req.params.produtoId!, (req.body ?? {}).preco); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/cliente/:clienteId', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarCliente(sch(req), req.params.clienteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/cliente/:clienteId/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try {
      await deps.precosService.definirCliente(sch(req), req.params.clienteId!, req.params.produtoId!, req.body ?? {},
        { usuarioId: req.usuario!.sub, usuarioNome: req.usuario!.nome });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/cliente/:clienteId/historico', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarHistoricoCliente(sch(req), req.params.clienteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/campanhas/:produtoId', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarCampanhas(sch(req), req.params.produtoId!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/precos/campanhas/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.criarCampanha(sch(req), req.params.produtoId!, req.body ?? {}); res.status(201).json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/campanhas/item/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.atualizarCampanha(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete('/precos/campanhas/item/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.removerCampanha(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
