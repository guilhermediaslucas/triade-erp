import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

// Consulta do log de auditoria (gateado por gerência de usuários = nível admin).
export function rotasAuditoria(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/auditoria', aut, az('acesso.usuario.listar'), async (req, res: Response) => {
    try {
      const q = req.query as any;
      res.json(await deps.auditoriaRepo.listar(sch(req), {
        usuario: q.usuario || undefined, modulo: q.modulo || undefined, de: q.de || undefined, ate: q.ate || undefined,
      }));
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/auditoria/usuarios', aut, az('acesso.usuario.listar'), async (req, res: Response) => {
    try { res.json(await deps.auditoriaRepo.usuarios(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
