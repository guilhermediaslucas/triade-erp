import type { DataSource } from 'typeorm';
import type { MetaDia, MetaMes, MetaRepository } from '../../domain/comercial/Meta.js';
import { validarSchema } from '../tenant/validarSchema.js';

function linhaZero(mes: number): MetaMes { return { mes, valor: 0, metaDiaUtil: 0, metaSabado: 0 }; }

export class SqlMetaRepository implements MetaRepository {
  constructor(private readonly ds: DataSource) {}

  async listarAno(schema: string, ano: number): Promise<MetaMes[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT mes, valor, meta_dia_util, meta_sabado FROM "${s}".meta_mensal WHERE ano = $1`, [ano]);
    const mapa = new Map<number, MetaMes>();
    for (const r of linhas) {
      mapa.set(Number(r.mes), {
        mes: Number(r.mes), valor: Number(r.valor) || 0,
        metaDiaUtil: Number(r.meta_dia_util) || 0, metaSabado: Number(r.meta_sabado) || 0,
      });
    }
    return Array.from({ length: 12 }, (_, i) => mapa.get(i + 1) ?? linhaZero(i + 1));
  }

  async salvarAno(schema: string, ano: number, meses: MetaMes[]): Promise<void> {
    const s = validarSchema(schema);
    for (const m of meses) {
      await this.ds.query(
        `INSERT INTO "${s}".meta_mensal (ano, mes, valor, meta_dia_util, meta_sabado)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (ano, mes) DO UPDATE SET valor = EXCLUDED.valor,
           meta_dia_util = EXCLUDED.meta_dia_util, meta_sabado = EXCLUDED.meta_sabado`,
        [ano, m.mes, m.valor, m.metaDiaUtil, m.metaSabado]);
    }
  }

  async listarDiasAno(schema: string, ano: number): Promise<MetaDia[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT mes, dia, valor, feriado FROM "${s}".meta_dia WHERE ano = $1 ORDER BY mes, dia`, [ano]);
    return linhas.map((r: any) => ({
      mes: Number(r.mes), dia: Number(r.dia), valor: Number(r.valor) || 0, feriado: !!r.feriado,
    }));
  }

  async salvarDiasAno(schema: string, ano: number, dias: MetaDia[]): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".meta_dia WHERE ano = $1`, [ano]);
    for (const d of dias) {
      await this.ds.query(
        `INSERT INTO "${s}".meta_dia (ano, mes, dia, valor, feriado) VALUES ($1,$2,$3,$4,$5)`,
        [ano, d.mes, d.dia, d.valor, d.feriado]);
    }
  }

  async obterMes(schema: string, ano: number, mes: number): Promise<MetaMes> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT mes, valor, meta_dia_util, meta_sabado FROM "${s}".meta_mensal WHERE ano = $1 AND mes = $2`,
      [ano, mes]))[0];
    return r
      ? { mes, valor: Number(r.valor) || 0, metaDiaUtil: Number(r.meta_dia_util) || 0, metaSabado: Number(r.meta_sabado) || 0 }
      : linhaZero(mes);
  }

  async valoresPorMes(schema: string, meses: { ano: number; mes: number }[]): Promise<Record<string, number>> {
    const s = validarSchema(schema);
    if (meses.length === 0) return {};
    const linhas = await this.ds.query(`SELECT ano, mes, valor FROM "${s}".meta_mensal`);
    const out: Record<string, number> = {};
    for (const r of linhas) {
      out[`${r.ano}-${String(r.mes).padStart(2, '0')}`] = Number(r.valor) || 0;
    }
    return out;
  }
}
