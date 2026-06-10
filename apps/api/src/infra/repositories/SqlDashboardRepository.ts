import type { DataSource } from 'typeorm';
import type { DashboardRepository, ResumoDashboard } from '../../domain/dashboard/Dashboard.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlDashboardRepository implements DashboardRepository {
  constructor(private readonly ds: DataSource) {}

  async resumo(schema: string): Promise<ResumoDashboard> {
    const s = validarSchema(schema);
    const um = (v: any) => Number(v ?? 0);

    const vendas = (await this.ds.query(
      `SELECT COALESCE(SUM(total),0) v FROM "${s}".pedido
        WHERE status NOT IN ('orcamento','cancelado')
          AND date_trunc('month', criado_em) = date_trunc('month', now())`))[0];

    const porStatus = await this.ds.query(
      `SELECT status, COUNT(*)::int q FROM "${s}".pedido GROUP BY status`);

    const rec = (await this.ds.query(
      `SELECT COALESCE(SUM(valor) FILTER (WHERE status='aberto'),0) ab,
              COALESCE(SUM(valor) FILTER (WHERE status='aberto' AND vencimento < CURRENT_DATE),0) vc
         FROM "${s}".titulo WHERE tipo='receber'`))[0];
    const pag = (await this.ds.query(
      `SELECT COALESCE(SUM(valor) FILTER (WHERE status='aberto'),0) ab,
              COALESCE(SUM(valor) FILTER (WHERE status='aberto' AND vencimento < CURRENT_DATE),0) vc
         FROM "${s}".titulo WHERE tipo='pagar'`))[0];

    const baixo = (await this.ds.query(
      `SELECT COUNT(*)::int q FROM (
         SELECT p.id, p.estoque_minimo, COALESCE(SUM(l.quantidade),0) saldo
           FROM "${s}".produto p
           LEFT JOIN "${s}".estoque_lote l ON l.produto_id = p.id
          WHERE p.ativo GROUP BY p.id, p.estoque_minimo
       ) x WHERE x.saldo < x.estoque_minimo`))[0];

    const caixa = (await this.ds.query(
      `SELECT COALESCE(SUM(CASE WHEN tipo='receber' THEN valor ELSE -valor END),0) s
         FROM "${s}".titulo WHERE status='pago'`))[0];

    const top = await this.ds.query(
      `SELECT produto_nome nome, SUM(quantidade)::numeric q
         FROM "${s}".pedido_item GROUP BY produto_nome ORDER BY q DESC LIMIT 5`);

    return {
      vendasMes: um(vendas.v),
      pedidosPorStatus: porStatus.map((r: any) => ({ status: r.status, quantidade: r.q })),
      receberAberto: um(rec.ab), receberVencido: um(rec.vc),
      pagarAberto: um(pag.ab), pagarVencido: um(pag.vc),
      estoqueBaixo: um(baixo.q),
      saldoCaixa: um(caixa.s),
      topProdutos: top.map((r: any) => ({ nome: r.nome, quantidade: um(r.q) })),
    };
  }
}
