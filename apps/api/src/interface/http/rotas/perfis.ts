import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasPerfis(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);
  const autorizar = criarAutorizar(deps.usuariosRepo);

  r.get('/perfis', autenticar, autorizar('acesso.perfil.listar'), async (req: Request, res: Response) => {
    try { res.json(await deps.perfisService.listar(req.usuario!.schema)); }
    catch (e) { tratarErro(res, e); }
  });

  r.post('/perfis', autenticar, autorizar('acesso.perfil.gerenciar'), async (req: Request, res: Response) => {
    try {
      const { nome, descricao, ativo, capabilities } = req.body ?? {};
      const p = await deps.perfisService.criar(req.usuario!.schema, nome, descricao ?? '', ativo !== false, Array.isArray(capabilities) ? capabilities : []);
      res.status(201).json(p);
    } catch (e) { tratarErro(res, e); }
  });

  r.put('/perfis/:id', autenticar, autorizar('acesso.perfil.gerenciar'), async (req: Request, res: Response) => {
    try {
      const { nome, descricao, ativo, capabilities } = req.body ?? {};
      await deps.perfisService.editar(req.usuario!.schema, req.params.id!, nome, descricao ?? '', ativo !== false, Array.isArray(capabilities) ? capabilities : []);
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
