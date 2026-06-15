import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { ErroAplicacao } from '../../../domain/erros/ErroAplicacao.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { exigirSuperAdmin } from '../middlewares/exigirSuperAdmin.js';

// Rate limit simples em memória p/ o login (anti brute force / credential stuffing).
// Janela de 15 min, máx. 10 tentativas por IP+e-mail. Suficiente p/ 1 instância;
// para múltiplas instâncias, trocar por store compartilhado (Redis) depois.
const TENTATIVAS = new Map<string, { n: number; ate: number }>();
const LIMITE = 10;
const JANELA_MS = 15 * 60 * 1000;
function limiteLogin(req: Request, res: Response, next: () => void): void {
  const ip = req.ip ?? 'desconhecido';
  const email = String((req.body ?? {}).email ?? '').toLowerCase();
  const chave = ip + '|' + email;
  const agora = Date.now();
  const reg = TENTATIVAS.get(chave);
  if (reg && agora > reg.ate) { TENTATIVAS.delete(chave); }
  const atual = TENTATIVAS.get(chave);
  if (atual && atual.n >= LIMITE) { res.status(429).json({ erro: 'auth.muitas_tentativas' }); return; }
  next();
}
function registrarFalhaLogin(req: Request): void {
  const ip = req.ip ?? 'desconhecido';
  const email = String((req.body ?? {}).email ?? '').toLowerCase();
  const chave = ip + '|' + email;
  const agora = Date.now();
  const reg = TENTATIVAS.get(chave);
  if (!reg || agora > reg.ate) { TENTATIVAS.set(chave, { n: 1, ate: agora + JANELA_MS }); }
  else { reg.n++; }
}

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

  // Esqueci a senha: dispara o e-mail com o link de redefinição. Resposta SEMPRE
  // neutra (não revela se o e-mail existe). Rate limit reusa o do login (por IP+e-mail).
  r.post('/auth/esqueci-senha', limiteLogin, async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    try {
      await deps.recuperarSenha.solicitar(String(email ?? ''));
    } catch (e) {
      console.error('[auth] esqueci-senha:', e);   // não vaza erro ao cliente
    }
    res.json({ ok: true });
  });

  // Redefinir a senha com o token recebido por e-mail.
  r.post('/auth/redefinir-senha', async (req: Request, res: Response) => {
    const { token, novaSenha } = req.body ?? {};
    try {
      await deps.recuperarSenha.redefinir(String(token ?? ''), String(novaSenha ?? ''));
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof ErroAplicacao) { res.status(e.status).json({ erro: e.chaveI18n }); return; }
      console.error('[auth] redefinir-senha:', e);
      res.status(500).json({ erro: 'erro.interno' });
    }
  });

  r.post('/auth/login', limiteLogin, async (req: Request, res: Response) => {
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
        registrarFalhaLogin(req); // conta a tentativa malsucedida
        res.status(e.status).json({ erro: e.chaveI18n });
        return;
      }
      console.error('[auth] erro inesperado:', e);
      res.status(500).json({ erro: 'erro.interno' });
    }
  });

  return r;
}
