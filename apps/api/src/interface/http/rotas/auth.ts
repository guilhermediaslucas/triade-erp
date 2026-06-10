import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { ErroAplicacao } from '../../../domain/erros/ErroAplicacao.js';

export function rotasAuth(deps: Dependencias): Router {
  const r = Router();

  r.post('/auth/login', async (req: Request, res: Response) => {
    const { codigoEmpresa, email, senha } = req.body ?? {};
    if (!codigoEmpresa || !email || !senha) {
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
