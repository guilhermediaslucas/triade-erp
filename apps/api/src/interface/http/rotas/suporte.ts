import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { exigirSuperAdmin } from '../middlewares/exigirSuperAdmin.js';
import { tratarErro } from '../responder.js';

export function rotasSuporte(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);

  // Abrir chamado: qualquer usuário logado. Empresa/usuário vêm do token (não do corpo).
  r.post('/suporte', aut, async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      const id = await deps.suporteService.abrir(
        { empresaCodigo: u.empresa, usuarioNome: u.nome, usuarioEmail: u.email },
        req.body ?? {},
      );
      res.status(201).json({ id });
    } catch (e) { tratarErro(res, e); }
  });

  // Meus chamados: qualquer usuário logado vê os próprios (filtra pelo token).
  r.get('/suporte/meus', aut, async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      res.json(await deps.suporteService.meus(u.email, u.empresa));
    } catch (e) { tratarErro(res, e); }
  });

  // Listar / contar / mudar status: só o administrador do sistema (super-admin).
  r.get('/suporte', aut, exigirSuperAdmin, async (_req: Request, res: Response) => {
    try { res.json(await deps.suporteService.listar()); } catch (e) { tratarErro(res, e); }
  });

  r.get('/suporte/abertos', aut, exigirSuperAdmin, async (_req: Request, res: Response) => {
    try { res.json({ abertos: await deps.suporteService.contarAbertos() }); } catch (e) { tratarErro(res, e); }
  });

  r.patch('/suporte/:id/status', aut, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      await deps.suporteService.mudarStatus(req.params.id!, (req.body ?? {}).status);
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
