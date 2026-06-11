import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { FaltanteInventario, InventarioRepository, InventarioResumo, NovoInventario } from '../../domain/estoque/Inventario.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlInventarioRepository implements InventarioRepository {
  constructor(private readonly ds: DataSource) {}

  async criar(schema: string, d: NovoInventario, faltantes: FaltanteInventario[]): Promise<string> {
    const s = validarSchema(schema);
    const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".inventario (id, responsavel, esperadas, encontradas, faltantes, baixou_perda)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, d.responsavel, d.esperadas, d.encontradas, d.faltantes, d.baixouPerda]);
    for (const f of faltantes) {
      await this.ds.query(
        `INSERT INTO "${s}".inventario_faltante (id, inventario_id, codigo, produto_nome, lote, validade)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [randomUUID(), id, f.codigo, f.produtoNome, f.lote, f.validade]);
    }
    return id;
  }

  async listar(schema: string): Promise<InventarioResumo[]> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(
      `SELECT id, responsavel, esperadas, encontradas, faltantes, baixou_perda, criado_em
         FROM "${s}".inventario ORDER BY criado_em DESC`);
    return rows.map((r: any) => ({
      id: r.id, responsavel: r.responsavel ?? null,
      esperadas: Number(r.esperadas), encontradas: Number(r.encontradas), faltantes: Number(r.faltantes),
      baixouPerda: r.baixou_perda, criadoEm: new Date(r.criado_em).toISOString(),
    }));
  }

  async faltantesDe(schema: string, id: string): Promise<FaltanteInventario[]> {
    const s = validarSchema(schema);
    const rows = await this.ds.query(
      `SELECT codigo, produto_nome, lote, validade FROM "${s}".inventario_faltante
        WHERE inventario_id = $1 ORDER BY produto_nome, codigo`, [id]);
    return rows.map((r: any) => ({
      codigo: r.codigo, produtoNome: r.produto_nome ?? '—', lote: r.lote ?? null,
      validade: r.validade ? new Date(r.validade).toISOString().slice(0, 10) : null,
    }));
  }
}
