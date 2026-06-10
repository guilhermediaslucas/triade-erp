import type { Response } from 'express';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export function tratarErro(res: Response, e: unknown): void {
  if (e instanceof ErroAplicacao) {
    res.status(e.status).json({ erro: e.chaveI18n });
    return;
  }
  console.error('[http] erro inesperado:', e);
  res.status(500).json({ erro: 'erro.interno' });
}
