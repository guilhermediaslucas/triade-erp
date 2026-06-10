import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { ContaCorrente, ContaCorrenteRepository, ContaSaldo } from '../../domain/financeiro/ContaCorrente.js';
import { validarSchema } from '../tenant/validarSchema.js';

const map = (r: any): ContaCorrente => ({ id: r.id, nome: r.nome, banco: r.banco ?? null, saldoInicial: Number(r.saldo_inicial), ativo: r.ativo });

export class SqlContaCorrenteRepository implements ContaCorrenteRepository {
  constructor(private readonly ds: DataSource) {}
  async listar(schema: string): Promise<ContaCorrente[]> {
    const s = validarSchema(schema);
    return (await this.ds.query(`SELECT * FROM "${s}".conta_corrente ORDER BY nome`)).map(map);
  }
  async saldos(schema: string): Promise<ContaSaldo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT c.*,
              c.saldo_inicial
                + COALESCE((SELECT SUM(valor) FROM "${s}".titulo t WHERE t.conta_corrente_id=c.id AND t.status='pago' AND t.tipo='receber'),0)
                - COALESCE((SELECT SUM(valor) FROM "${s}".titulo t WHERE t.conta_corrente_id=c.id AND t.status='pago' AND t.tipo='pagar'),0) AS saldo
         FROM "${s}".conta_corrente c WHERE c.ativo = true ORDER BY c.nome`);
    return linhas.map((r: any) => ({ ...map(r), saldo: Number(r.saldo) }));
  }
  async buscarPorId(schema: string, id: string): Promise<ContaCorrente | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".conta_corrente WHERE id=$1`, [id]))[0];
    return r ? map(r) : null;
  }
  async criar(schema: string, nome: string, banco: string | null, saldoInicial: number): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".conta_corrente (id,nome,banco,saldo_inicial) VALUES ($1,$2,$3,$4)`, [id, nome, banco, saldoInicial]);
    return id;
  }
  async atualizar(schema: string, id: string, nome: string, banco: string | null, saldoInicial: number): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".conta_corrente SET nome=$2,banco=$3,saldo_inicial=$4 WHERE id=$1`, [id, nome, banco, saldoInicial]);
  }
  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".conta_corrente SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
