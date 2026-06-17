import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { AtualizacaoNota, FiltroNotas, NotaFiscal, NotaFiscalRepository, NotaFiscalResumo, StatusNota } from '../../domain/fiscal/NotaFiscal.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapear(r: any): NotaFiscal {
  return {
    id: r.id, pedidoId: r.pedido_id, ref: r.ref, status: (r.status as StatusNota),
    statusFocus: r.status_focus ?? null, statusSefaz: r.status_sefaz ?? null, mensagemSefaz: r.mensagem_sefaz ?? null,
    chave: r.chave ?? null, numero: r.numero ?? null, serie: r.serie ?? null,
    caminhoDanfe: r.caminho_danfe ?? null, caminhoXml: r.caminho_xml ?? null,
    criadoEm: new Date(r.criado_em), atualizadoEm: new Date(r.atualizado_em),
  };
}

export class SqlNotaFiscalRepository implements NotaFiscalRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorPedido(schema: string, pedidoId: string): Promise<NotaFiscal | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".nota_fiscal WHERE pedido_id = $1 ORDER BY criado_em DESC LIMIT 1`, [pedidoId]))[0];
    return r ? mapear(r) : null;
  }

  async buscarPorRef(schema: string, ref: string): Promise<NotaFiscal | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".nota_fiscal WHERE ref = $1 LIMIT 1`, [ref]))[0];
    return r ? mapear(r) : null;
  }

  async criar(schema: string, pedidoId: string, ref: string): Promise<NotaFiscal> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".nota_fiscal (id, pedido_id, ref, status) VALUES ($1,$2,$3,'processando')`,
      [id, pedidoId, ref]);
    return (await this.buscarPorRef(s, ref))!;
  }

  async listar(schema: string, f: FiltroNotas): Promise<NotaFiscalResumo[]> {
    const s = validarSchema(schema);
    const cond: string[] = []; const params: any[] = [];
    if (f.status) { params.push(f.status); cond.push(`n.status = $${params.length}`); }
    if (f.de) { params.push(f.de); cond.push(`n.criado_em >= $${params.length}`); }
    if (f.ate) { params.push(f.ate); cond.push(`n.criado_em < ($${params.length}::date + 1)`); }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const linhas = await this.ds.query(
      `SELECT n.id, n.pedido_id, n.status, n.mensagem_sefaz, n.chave, n.numero, n.serie, n.criado_em,
              p.numero AS pedido_numero, p.total AS pedido_total, c.nome AS cliente_nome
         FROM "${s}".nota_fiscal n
         JOIN "${s}".pedido p ON p.id = n.pedido_id
         LEFT JOIN "${s}".cliente c ON c.id = p.cliente_id
         ${where}
         ORDER BY n.criado_em DESC`, params);
    return linhas.map((r: any): NotaFiscalResumo => ({
      id: r.id, pedidoId: r.pedido_id, pedidoNumero: Number(r.pedido_numero),
      clienteNome: r.cliente_nome ?? null, status: (r.status as StatusNota),
      mensagemSefaz: r.mensagem_sefaz ?? null, chave: r.chave ?? null,
      numero: r.numero ?? null, serie: r.serie ?? null, valor: Number(r.pedido_total) || 0,
      criadoEm: new Date(r.criado_em).toISOString(),
    }));
  }

  async atualizar(schema: string, ref: string, d: AtualizacaoNota): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".nota_fiscal SET
         status=$2, status_focus=$3, status_sefaz=$4, mensagem_sefaz=$5,
         chave=$6, numero=$7, serie=$8, caminho_danfe=$9, caminho_xml=$10, atualizado_em=now()
       WHERE ref=$1`,
      [ref, d.status, d.statusFocus, d.statusSefaz, d.mensagemSefaz, d.chave, d.numero, d.serie, d.caminhoDanfe, d.caminhoXml]);
  }
}
