import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { exigirSuperAdmin } from '../middlewares/exigirSuperAdmin.js';
import { tratarErro } from '../responder.js';

export function rotasEmpresas(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);

  r.get('/empresas', autenticar, exigirSuperAdmin, async (_req: Request, res: Response) => {
    try {
      const lista = (await deps.empresasRepo.listarTodas()).map((e) => ({
        codigo: e.codigo, nome: e.nome, fantasia: e.fantasia, ativo: e.ativo,
      }));
      res.json(lista);
    } catch (e) { tratarErro(res, e); }
  });

  r.post('/empresas', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      const saida = await deps.provisionarEmpresa.executar({
        codigo: b.codigo, nome: b.nome, fantasia: b.fantasia,
        adminNome: b.adminNome, adminEmail: b.adminEmail, adminSenha: b.adminSenha,
      });
      res.status(201).json(saida);
    } catch (e) { tratarErro(res, e); }
  });

  r.put('/empresas/:codigo', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      await deps.empresaService.editar(req.params.codigo!, { nome: b.nome, fantasia: b.fantasia, ativo: b.ativo });
      res.status(204).end();
    } catch (e) { tratarErro(res, e); }
  });

  r.get('/empresas/:codigo/admin', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try { res.json(await deps.empresaService.obterAdmin(req.params.codigo!)); } catch (e) { tratarErro(res, e); }
  });
  r.put('/empresas/:codigo/admin', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      await deps.empresaService.editarAdmin(req.params.codigo!, { nome: b.nome, email: b.email, senha: b.senha });
      res.status(204).end();
    } catch (e) { tratarErro(res, e); }
  });

  r.delete('/empresas/:codigo', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      await deps.empresaService.excluir(req.params.codigo!);
      res.status(204).end();
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
