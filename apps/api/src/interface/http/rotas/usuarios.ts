import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';

export function rotasUsuarios(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);
  const autorizar = criarAutorizar(deps.usuariosRepo);
  const schema = (req: Request) => req.usuario!.schema;

  r.get('/usuarios', autenticar, autorizar('acesso.usuario.listar'), async (req, res: Response) => {
    try { res.json(await deps.usuariosService.listar(schema(req))); }
    catch (e) { tratarErro(res, e); }
  });

  r.post('/usuarios', autenticar, autorizar('acesso.usuario.gerenciar'), async (req, res: Response) => {
    try {
      const { nome, email, senha, perfilId, foto, vendedorId } = req.body ?? {};
      const id = await deps.usuariosService.criar(schema(req), { nome, email, senha, perfilId: perfilId ?? null, foto: foto ?? null, vendedorId: vendedorId ?? null });
      auditar(req, { modulo: 'Segurança', entidade: 'Usuario', referencia: nome ?? email, descricao: `Criou o usuário ${nome ?? email}` });
      res.status(201).json({ id });
    } catch (e) { tratarErro(res, e); }
  });

  r.put('/usuarios/:id', autenticar, autorizar('acesso.usuario.gerenciar'), async (req, res: Response) => {
    try {
      const { nome, perfilId, foto, vendedorId } = req.body ?? {};
      await deps.usuariosService.editar(schema(req), req.params.id!, nome, perfilId ?? null, foto ?? null, vendedorId ?? null);
      auditar(req, { modulo: 'Segurança', entidade: 'Usuario', referencia: nome, descricao: `Editou o usuário ${nome}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  r.patch('/usuarios/:id/ativo', autenticar, autorizar('acesso.usuario.gerenciar'), async (req, res: Response) => {
    try {
      const ativo = !!(req.body ?? {}).ativo;
      await deps.usuariosService.alternarAtivo(schema(req), req.params.id!, ativo);
      auditar(req, { modulo: 'Segurança', entidade: 'Usuario', descricao: `${ativo ? 'Ativou' : 'Inativou'} um usuário` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  r.patch('/usuarios/:id/senha', autenticar, autorizar('acesso.usuario.gerenciar'), async (req, res: Response) => {
    try {
      await deps.usuariosService.definirSenha(schema(req), req.params.id!, (req.body ?? {}).senha);
      auditar(req, { modulo: 'Segurança', entidade: 'Usuario', descricao: 'Redefiniu a senha de um usuário' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
