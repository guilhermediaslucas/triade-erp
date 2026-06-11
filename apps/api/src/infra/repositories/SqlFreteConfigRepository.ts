import type { DataSource } from 'typeorm';
import type { FreteConfig, FreteConfigRepository } from '../../domain/comercial/FreteConfig.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlFreteConfigRepository implements FreteConfigRepository {
  constructor(private readonly ds: DataSource) {}
  async obter(schema: string): Promise<FreteConfig> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT km_rate, min_motoboy FROM "${s}".frete_config WHERE id = 'unico'`))[0];
    // Defaults caso a linha ainda não exista (defensivo).
    return { kmRate: r ? Number(r.km_rate) : 2, minMotoboy: r ? Number(r.min_motoboy) : 20 };
  }
  async salvar(schema: string, c: FreteConfig): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".frete_config (id, km_rate, min_motoboy) VALUES ('unico', $1, $2)
       ON CONFLICT (id) DO UPDATE SET km_rate = $1, min_motoboy = $2`,
      [c.kmRate, c.minMotoboy]);
  }
}
