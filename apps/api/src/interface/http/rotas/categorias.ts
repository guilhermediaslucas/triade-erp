import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasCategorias(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/categorias', aut, az('cadastros.categoria.listar'), async (req, res: Response) => {
    try { res.json(await deps.categoriasService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/categorias', aut, az('cadastros.categoria.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json(await deps.categoriasService.criar(sch(req), (req.body ?? {}).nome)); } catch (e) { tratarErro(res, e); }
  });
  r.put('/categorias/:id', aut, az('cadastros.categoria.gerenciar'), async (req, res: Response) => {
    try { await deps.categoriasService.editar(sch(req), req.params.id!, (req.body ?? {}).nome); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
