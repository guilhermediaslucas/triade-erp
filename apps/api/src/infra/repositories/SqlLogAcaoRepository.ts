import type { DataSource } from 'typeorm';
import { validarSchema } from '../tenant/validarSchema.js';

export interface LinhaLog {
  criadoEm: string; usuarioNome: string | null; modulo: string | null;
  metodo: string; caminho: string; status: number | null; descricao: string | null;
}
export interface FiltroLog { usuario?: string; modulo?: string; de?: string; ate?: string; }

export class SqlLogAcaoRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string, f: FiltroLog): Promise<LinhaLog[]> {
    const s = validarSchema(schema);
    const cond: string[] = []; const params: any[] = [];
    if (f.usuario) { params.push(f.usuario); cond.push(`usuario_nome = $${params.length}`); }
    if (f.modulo) { params.push(f.modulo); cond.push(`modulo = $${params.length}`); }
    if (f.de && /^\d{4}-\d{2}-\d{2}$/.test(f.de)) { params.push(f.de); cond.push(`criado_em >= $${params.length}::date`); }
    if (f.ate && /^\d{4}-\d{2}-\d{2}$/.test(f.ate)) { params.push(f.ate); cond.push(`criado_em < ($${params.length}::date + 1)`); }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    const linhas = await this.ds.query(
      `SELECT criado_em, usuario_nome, modulo, metodo, caminho, status, descricao
         FROM "${s}".log_acao ${where} ORDER BY criado_em DESC LIMIT 500`, params);
    return linhas.map((r: any) => ({
      criadoEm: new Date(r.criado_em).toISOString(), usuarioNome: r.usuario_nome ?? null,
      modulo: r.modulo ?? null, metodo: r.metodo, caminho: r.caminho, status: r.status != null ? Number(r.status) : null,
      descricao: r.descricao ?? null,
    }));
  }

  async usuarios(schema: string): Promise<string[]> {
    const s = validarSchema(schema);
    const r = await this.ds.query(`SELECT DISTINCT usuario_nome FROM "${s}".log_acao WHERE usuario_nome IS NOT NULL ORDER BY usuario_nome`);
    return r.map((x: any) => x.usuario_nome);
  }
}
