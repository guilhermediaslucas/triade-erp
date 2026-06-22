import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { FormaPagamentoTaxa, FormaPagamentoTaxaRepository } from '../../domain/financeiro/FormaPagamentoTaxa.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): FormaPagamentoTaxa => ({ id: r.id, forma: r.forma, percentual: Number(r.percentual), ativo: r.ativo });

export class SqlFormaPagamentoTaxaRepository implements FormaPagamentoTaxaRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<FormaPagamentoTaxa[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".forma_pagamento_taxa ORDER BY forma`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<FormaPagamentoTaxa | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".forma_pagamento_taxa WHERE id = $1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, forma: string, percentual: number): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".forma_pagamento_taxa (id, forma, percentual) VALUES ($1,$2,$3)`, [id, forma, percentual]);
    return id;
  }
  async atualizar(schema: string, id: string, forma: string, percentual: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".forma_pagamento_taxa SET forma=$2, percentual=$3 WHERE id=$1`, [id, forma, percentual]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".forma_pagamento_taxa SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
