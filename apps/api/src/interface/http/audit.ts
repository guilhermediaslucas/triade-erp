import type { Request } from 'express';

// Informação de auditoria rica que uma rota pode anexar ao request; o middleware
// de auditoria grava isso (em vez do log genérico) ao final da requisição.
export interface AuditInfo {
  descricao: string;            // texto pronto para humano (ex.: "Baixou REC-000142 (R$ 800)")
  modulo?: string;              // sobrescreve o módulo derivado do caminho
  entidade?: string;            // ex.: "Titulo", "Pedido"
  referencia?: string;          // ex.: "REC-000142"
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { audit?: AuditInfo; }
  }
}

// Anexa um registro de auditoria rico ao request (best-effort, nunca lança).
export function auditar(req: Request, info: AuditInfo): void {
  try { req.audit = info; } catch { /* ignore */ }
}
