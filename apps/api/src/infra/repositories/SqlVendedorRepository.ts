import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Vendedor, VendedorRepository, NovoVendedor } from '../../domain/pessoa/Vendedor.js';
import { validarSchema } from '../tenant/validarSchema.js';

function map(r: any): Vendedor {
  return { id: r.id, nome: r.nome, email: r.email ?? null, telefone: r.telefone ?? null,
    regiao: r.regiao ?? null, metaMensal: Number(r.meta_mensal), comissaoPercentual: Number(r.comissao_percentual),
    segueRegraGeral: r.segue_regra_geral, ativo: r.ativo, criadoEm: new Date(r.criado_em) };
}
export class SqlVendedorRepository implements VendedorRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<Vendedor[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".vendedor ORDER BY nome`)).map(map);
  }
  async buscarPorId(schema: string, id: string): Promise<Vendedor | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".vendedor WHERE id=$1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, d: NovoVendedor): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".vendedor (id,nome,email,telefone,regiao,meta_mensal,comissao_percentual,segue_regra_geral) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, d.nome, d.email, d.telefone, d.regiao, d.metaMensal, d.comissaoPercentual, d.segueRegraGeral]);
    return id;
  }
  async atualizar(schema: string, id: string, d: NovoVendedor): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".vendedor SET nome=$2,email=$3,telefone=$4,regiao=$5,meta_mensal=$6,comissao_percentual=$7,segue_regra_geral=$8 WHERE id=$1`,
      [id, d.nome, d.email, d.telefone, d.regiao, d.metaMensal, d.comissaoPercentual, d.segueRegraGeral]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".vendedor SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
