import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { DataSource } from 'typeorm';
import { validarSchema } from '../../../infra/tenant/validarSchema.js';

const MUTANTES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const VERBO: Record<string, string> = { POST: 'Criou', PUT: 'Editou', PATCH: 'Alterou', DELETE: 'Removeu' };
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// Mapeia o 1º segmento do caminho para um módulo legível (rótulo na tela de Auditoria).
function moduloDe(caminho: string): string {
  const seg = caminho.replace(/^\/+/, '').split('/')[0] ?? '';
  const mapa: Record<string, string> = {
    precos: 'Preços', pedidos: 'Comercial', financeiro: 'Financeiro', contas: 'Financeiro',
    estoque: 'Estoque', inventario: 'Estoque', usuarios: 'Segurança', perfis: 'Segurança',
    auth: 'Segurança', empresas: 'Empresas', empresa: 'Empresa', clientes: 'Cadastros',
    produtos: 'Cadastros', fornecedores: 'Cadastros', vendedores: 'Cadastros', motoboys: 'Cadastros',
    favorecidos: 'Cadastros', categorias: 'Cadastros', condicoes: 'Cadastros', frete: 'Logística',
    logistica: 'Logística', metas: 'Comercial', crm: 'Comercial', suporte: 'Suporte',
    'contas-correntes': 'Cadastros', 'categorias-financeiras': 'Cadastros', 'tipos-documento': 'Cadastros',
    bancos: 'Cadastros', 'formas-entrega': 'Cadastros',
  };
  return mapa[seg] ?? (seg ? seg : 'Outro');
}

// Fallback genérico legível: "Alterou financeiro/receber/…/cancelar" (sem UUID).
function descricaoGenerica(metodo: string, caminho: string): string {
  const limpo = caminho.replace(/^\/+/, '').replace(UUID_RE, '…');
  return `${VERBO[metodo] ?? metodo} ${limpo}`;
}

// Middleware global de auditoria: ao final de toda alteração (POST/PUT/PATCH/DELETE)
// bem-sucedida de um usuário autenticado, grava um registro em <schema>.log_acao.
// Usa a descrição RICA anexada pela rota (req.audit) quando houver; senão, o fallback
// genérico legível. Best-effort: nunca interfere na resposta nem lança para o cliente.
export function criarAuditoria(ds: DataSource) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!MUTANTES.has(req.method)) { next(); return; }
    res.on('finish', () => {
      try {
        const u = req.usuario;
        if (!u || !u.schema) return;
        if (res.statusCode < 200 || res.statusCode >= 300) return;
        const caminho = (req.originalUrl || req.url || '').split('?')[0]!;
        if (caminho.startsWith('/auth/login')) return;
        const a = req.audit;
        const modulo = a?.modulo ?? moduloDe(caminho);
        const descricao = a?.descricao ?? descricaoGenerica(req.method, caminho);
        const s = validarSchema(u.schema);
        void ds.query(
          `INSERT INTO "${s}".log_acao (id, usuario_id, usuario_nome, metodo, caminho, modulo, acao, status, descricao, entidade, referencia)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [randomUUID(), u.sub, u.nome, req.method, caminho, modulo, `${req.method} ${caminho}`, res.statusCode,
            descricao, a?.entidade ?? null, a?.referencia ?? null],
        ).catch(() => { /* best-effort */ });
      } catch { /* best-effort */ }
    });
    next();
  };
}
