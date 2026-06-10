import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Condicao, CondicaoRepository } from '../../domain/comercial/Condicao.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): Condicao => ({ id: r.id, nome: r.nome, parcelas: r.parcelas, intervaloDias: r.intervalo_dias, ativo: r.ativo });

export class SqlCondicaoRepository implements CondicaoRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Condicao[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".condicao_pagamento ORDER BY parcelas, nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Condicao | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".condicao_pagamento WHERE id=$1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, parcelas: number, intervaloDias: number): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".condicao_pagamento (id,nome,parcelas,intervalo_dias) VALUES ($1,$2,$3,$4)`, [id, nome, parcelas, intervaloDias]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, parcelas: number, intervaloDias: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".condicao_pagamento SET nome=$2,parcelas=$3,intervalo_dias=$4 WHERE id=$1`, [id, nome, parcelas, intervaloDias]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".condicao_pagamento SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
