import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { ErroAplicacao } from '../../../domain/erros/ErroAplicacao.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { exigirSuperAdmin } from '../middlewares/exigirSuperAdmin.js';

export function rotasAuth(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);

  // Admin global troca a empresa "ativa" (emite novo token p/ o schema escolhido).
  r.post('/auth/trocar-empresa', autenticar, exigirSuperAdmin, async (req: Request, res: Response) => {
    const u = req.usuario!;
    const codigo = (req.body ?? {}).codigo;
    if (!codigo) { res.status(400).json({ erro: 'auth.campos_obrigatorios' }); return; }
    try {
      const saida = await deps.autenticarUsuario.trocarEmpresa({ id: u.sub, nome: u.nome, email: u.email }, String(codigo));
      res.json(saida);
    } catch (e) {
      if (e instanceof ErroAplicacao) { res.status(e.status).json({ erro: e.chaveI18n }); return; }
      console.error('[auth] erro inesperado:', e);
      res.status(500).json({ erro: 'erro.interno' });
    }
  });

  // Usuário logado troca a própria senha (super-admin ou usuário de tenant).
  r.put('/auth/senha', autenticar, async (req: Request, res: Response) => {
    const u = req.usuario!;
    const { senhaAtual, novaSenha } = req.body ?? {};
    try {
      await deps.autenticarUsuario.trocarSenha(
        { superAdmin: !!u.superAdmin, email: u.email, schema: u.schema, sub: u.sub },
        senhaAtual, novaSenha);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof ErroAplicacao) { res.status(e.status).json({ erro: e.chaveI18n }); return; }
      console.error('[auth] erro inesperado:', e);
      res.status(500).json({ erro: 'erro.interno' });
    }
  });

  r.post('/auth/login', async (req: Request, res: Response) => {
    const { codigoEmpresa, email, senha } = req.body ?? {};
    if (!email || !senha) {
      res.status(400).json({ erro: 'auth.campos_obrigatorios' });
      return;
    }
    try {
      const saida = await deps.autenticarUsuario.executar({ codigoEmpresa, email, senha });
      res.json(saida);
    } catch (e) {
      if (e instanceof ErroAplicacao) {
        res.status(e.status).json({ erro: e.chaveI18n });
        return;
      }
      console.error('[auth] erro inesperado:', e);
      res.status(500).json({ erro: 'erro.interno' });
    }
  });

  return r;
}
