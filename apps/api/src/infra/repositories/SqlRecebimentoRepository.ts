import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Recebimento, RecebimentoRepository } from '../../domain/financeiro/Recebimento.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): Recebimento {
  return {
    id: r.id, fornecedorNome: r.fornecedor_nome ?? null, produtoId: r.produto_id ?? null, produtoNome: r.produto_nome,
    quantidade: Number(r.quantidade), custoUnitario: Number(r.custo_unitario), total: Number(r.total),
    nf: r.nf ?? null, status: r.status, criadoEm: new Date(r.criado_em).toISOString(),
  };
}

export class SqlRecebimentoRepository implements RecebimentoRepository {
  constructor(private readonly ds: DataSource) {}
  async criar(schema: string, r: any): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".recebimento (id, fornecedor_nome, produto_id, produto_nome, quantidade, custo_unitario, total, nf, titulo_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, r.fornecedorNome, r.produtoId, r.produtoNome, r.quantidade, r.custoUnitario, r.total, r.nf, r.tituloId]);
    return id;
  }
  async listarPendentes(schema: string): Promise<Recebimento[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".recebimento WHERE status = 'pendente' ORDER BY criado_em`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Recebimento | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".recebimento WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async marcarRecebido(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".recebimento SET status = 'recebido' WHERE id = $1`, [id]);
  }
}
