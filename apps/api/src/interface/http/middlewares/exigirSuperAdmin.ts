import type { NextFunction, Request, Response } from 'express';

// Exige que o usuário autenticado seja o administrador global do sistema (superAdmin).
// Usado nas rotas exclusivas do super-admin (provisionar/listar empresas, trocar empresa).
export function exigirSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.usuario) { res.status(401).json({ erro: 'auth.token_ausente' }); return; }
  if (!req.usuario.superAdmin) { res.status(403).json({ erro: 'auth.sem_permissao' }); return; }
  next();
}
