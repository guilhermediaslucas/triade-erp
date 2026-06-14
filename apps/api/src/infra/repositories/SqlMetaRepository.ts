import type { DataSource } from 'typeorm';
import type { MetaRepository, Metas, PeriodoMeta } from '../../domain/comercial/Meta.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlMetaRepository implements MetaRepository {
  constructor(private readonly ds: DataSource) {}

  async obter(schema: string): Promise<Metas> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(`SELECT periodo, valor FROM "${s}".meta`);
    const m: Metas = { dia: 0, semana: 0, mes: 0, ano: 0 };
    for (const r of linhas) {
      if (r.periodo in m) (m as any)[r.periodo] = Number(r.valor) || 0;
    }
    return m;
  }

  async definir(schema: string, periodo: PeriodoMeta, valor: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".meta (periodo, valor) VALUES ($1, $2)
       ON CONFLICT (periodo) DO UPDATE SET valor = EXCLUDED.valor`,
      [periodo, valor]);
  }
}
