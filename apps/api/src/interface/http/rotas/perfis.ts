import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { exigirSuperAdmin } from '../middlewares/exigirSuperAdmin.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';

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

  // ===== Perfil multi-empresa (super-admin): replica um perfil em várias empresas =====
  r.get('/superadmin/perfis/empresas', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try { res.json(await deps.perfilMultiEmpresa.situacao(String(req.query.nome ?? ''))); }
    catch (e) { tratarErro(res, e); }
  });

  r.put('/superadmin/perfis/empresas', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      const out = await deps.perfilMultiEmpresa.sincronizar({
        nome: b.nome, descricao: b.descricao ?? '',
        capabilities: Array.isArray(b.capabilities) ? b.capabilities : [],
        empresas: Array.isArray(b.empresas) ? b.empresas : [],
      });
      auditar(req, { modulo: 'Segurança', entidade: 'Perfil', referencia: b.nome, descricao: `Aplicou o perfil "${b.nome}" em ${out.criadas.length + out.atualizadas.length} empresa(s) (multi-empresa)` });
      res.json(out);
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
