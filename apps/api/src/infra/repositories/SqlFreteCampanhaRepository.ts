import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { FreteCampanha, FreteCampanhaRepository, TipoFreteCampanha } from '../../domain/comercial/FreteCampanha.js';
import { validarSchema } from '../tenant/validarSchema.js';

function mapear(r: any): FreteCampanha {
  return {
    id: r.id, clienteId: r.cliente_id, clienteNome: r.cliente_nome ?? null,
    tipo: r.tipo, valor: Number(r.valor), motivo: r.motivo ?? null,
    de: r.de instanceof Date ? r.de.toISOString().slice(0, 10) : String(r.de).slice(0, 10),
    ate: r.ate instanceof Date ? r.ate.toISOString().slice(0, 10) : String(r.ate).slice(0, 10),
    vigente: r.vigente === true,
  };
}

export class SqlFreteCampanhaRepository implements FreteCampanhaRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<FreteCampanha[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT fc.*, c.nome cliente_nome,
              (CURRENT_DATE BETWEEN fc.de AND fc.ate) vigente
         FROM "${s}".frete_campanha fc
         LEFT JOIN "${s}".cliente c ON c.id = fc.cliente_id
        ORDER BY fc.de DESC`);
    return linhas.map(mapear);
  }

  async criar(schema: string, d: { clienteId: string | null; tipo: TipoFreteCampanha; valor: number; motivo: string | null; de: string; ate: string }): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".frete_campanha (id, cliente_id, tipo, valor, motivo, de, ate)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [randomUUID(), d.clienteId, d.tipo, d.valor, d.motivo, d.de, d.ate]);
  }

  async remover(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`DELETE FROM "${s}".frete_campanha WHERE id = $1`, [id]);
  }

  async freteCobrado(schema: string, clienteId: string, custo: number, subtotal: number): Promise<number> {
    const s = validarSchema(schema);
    // Vigentes do cliente OU gerais (cliente_id IS NULL). A específica do cliente vence a geral.
    const r = (await this.ds.query(
      `SELECT tipo, valor FROM "${s}".frete_campanha
        WHERE (cliente_id = $1 OR cliente_id IS NULL) AND CURRENT_DATE BETWEEN de AND ate
        ORDER BY (cliente_id IS NOT NULL) DESC, de DESC LIMIT 1`, [clienteId]))[0];
    if (!r) return custo;
    if (r.tipo === 'gratis') return 0;
    if (r.tipo === 'fixo') return Math.max(0, Number(r.valor));
    if (r.tipo === 'percentual') return Math.max(0, Math.round(custo * (1 - Number(r.valor) / 100) * 100) / 100);
    if (r.tipo === 'gratis_acima') return subtotal >= Number(r.valor) ? 0 : custo;
    return custo;
  }
}
