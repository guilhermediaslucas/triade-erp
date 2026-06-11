import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasMarcas(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/marcas', aut, az('cadastros.marca.listar'), async (req, res: Response) => {
    try { res.json(await deps.marcasService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/marcas', aut, az('cadastros.marca.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.marcasService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/marcas/:id', aut, az('cadastros.marca.gerenciar'), async (req, res: Response) => {
    try { await deps.marcasService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/marcas/:id/ativo', aut, az('cadastros.marca.gerenciar'), async (req, res: Response) => {
    try { await deps.marcasService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
