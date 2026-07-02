import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { NotaRecebida, NotaRecebidaRepository, NovaNotaRecebida } from '../../domain/fiscal/NotaRecebida.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapear(r: any): NotaRecebida {
  return {
    id: r.id, chave: r.chave,
    emitenteCnpj: r.emitente_cnpj ?? null, emitenteNome: r.emitente_nome ?? null,
    numero: r.numero ?? null, serie: r.serie ?? null,
    emissao: r.emissao ? new Date(r.emissao).toISOString().slice(0, 10) : null,
    valor: Number(r.valor) || 0, status: r.status, tituloId: r.titulo_id ?? null,
    itens: Array.isArray(r.itens) ? r.itens : (typeof r.itens === 'string' ? JSON.parse(r.itens) : []),
    criadoEm: new Date(r.criado_em),
  };
}

export class SqlNFeRecebidaRepository implements NotaRecebidaRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string, filtro: { status?: string | null; de?: string | null; ate?: string | null }): Promise<NotaRecebida[]> {
    const s = validarSchema(schema);
    const cond: string[] = []; const p: any[] = [];
    if (filtro.status) { p.push(filtro.status); cond.push(`status = $${p.length}`); }
    if (filtro.de) { p.push(filtro.de); cond.push(`emissao >= $${p.length}`); }
    if (filtro.ate) { p.push(filtro.ate); cond.push(`emissao <= $${p.length}`); }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const rows = await this.ds.query(`SELECT * FROM "${s}".nfe_recebida ${where} ORDER BY emissao DESC NULLS LAST, criado_em DESC`, p);
    return rows.map(mapear);
  }

  async buscarPorChave(schema: string, chave: string): Promise<NotaRecebida | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".nfe_recebida WHERE chave = $1`, [chave]))[0];
    return r ? mapear(r) : null;
  }

  async upsert(schema: string, n: NovaNotaRecebida): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".nfe_recebida (id, chave, emitente_cnpj, emitente_nome, numero, serie, emissao, valor, itens)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       ON CONFLICT (chave) DO UPDATE SET emitente_cnpj=EXCLUDED.emitente_cnpj, emitente_nome=EXCLUDED.emitente_nome,
         numero=EXCLUDED.numero, serie=EXCLUDED.serie, emissao=EXCLUDED.emissao, valor=EXCLUDED.valor, itens=EXCLUDED.itens`,
      [randomUUID(), n.chave, n.emitenteCnpj, n.emitenteNome, n.numero, n.serie, n.emissao, n.valor, JSON.stringify(n.itens ?? [])]);
  }

  async marcarImportada(schema: string, chave: string, tituloId: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".nfe_recebida SET status='importada', titulo_id=$2 WHERE chave=$1`, [chave, tituloId]);
  }

  async mapaFornecedor(schema: string, cnpj: string): Promise<Record<string, string>> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(`SELECT codigo_item, produto_id FROM "${s}".nfe_map_item WHERE emitente_cnpj = $1`, [cnpj]);
    const m: Record<string, string> = {};
    for (const r of rows) m[r.codigo_item] = r.produto_id;
    return m;
  }

  async salvarMapa(schema: string, cnpj: string, codigo: string, produtoId: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".nfe_map_item (id, emitente_cnpj, codigo_item, produto_id) VALUES ($1,$2,$3,$4)
       ON CONFLICT (emitente_cnpj, codigo_item) DO UPDATE SET produto_id = EXCLUDED.produto_id`,
      [randomUUID(), cnpj, codigo, produtoId]);
  }
}
