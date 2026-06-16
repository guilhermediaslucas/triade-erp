import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type {
  CrmRepository, EstagioOportunidade, Interacao, ItemCliente, NovaInteracao, NovaOportunidade,
  Oportunidade, PedidoTimeline, VendaCliente,
} from '../../domain/comercial/Crm.js';
import { validarSchema } from '../tenant/validarSchema.js';

const VALIDO = `status NOT IN ('orcamento','cancelado')`;

function mapOport(r: any): Oportunidade {
  return {
    id: r.id, clienteId: r.cliente_id ?? null, clienteNome: r.cliente_nome,
    titulo: r.titulo ?? null, valor: Number(r.valor),
    vendedorId: r.vendedor_id ?? null, vendedorNome: r.vendedor_nome ?? null,
    estagio: r.estagio, previsao: r.previsao ? new Date(r.previsao).toISOString().slice(0, 10) : null,
    pedidoId: r.pedido_id ?? null, pedidoNumero: r.pedido_numero != null ? Number(r.pedido_numero) : null,
    perdido: !!r.perdido,
    contato: r.contato ?? null, email: r.email ?? null, telefone: r.telefone ?? null, origem: r.origem ?? null,
  };
}
function mapInter(r: any): Interacao {
  return {
    id: r.id, clienteId: r.cliente_id ?? null, oportunidadeId: r.oportunidade_id ?? null, tipo: r.tipo,
    data: r.data ? new Date(r.data).toISOString().slice(0, 10) : '', nota: r.nota ?? null,
  };
}

export class SqlCrmRepository implements CrmRepository {
  constructor(private readonly ds: DataSource) {}

  // ---- Oportunidades ----
  async listarOportunidades(schema: string): Promise<Oportunidade[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT o.*, v.nome AS vendedor_nome, p.numero AS pedido_numero
         FROM "${s}".oportunidade o
         LEFT JOIN "${s}".vendedor v ON v.id = o.vendedor_id
         LEFT JOIN "${s}".pedido p ON p.id = o.pedido_id
        ORDER BY o.criado_em DESC`);
    return linhas.map(mapOport);
  }
  async buscarOportunidade(schema: string, id: string): Promise<Oportunidade | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT o.*, v.nome AS vendedor_nome, p.numero AS pedido_numero
         FROM "${s}".oportunidade o
         LEFT JOIN "${s}".vendedor v ON v.id = o.vendedor_id
         LEFT JOIN "${s}".pedido p ON p.id = o.pedido_id
        WHERE o.id = $1`, [id]))[0];
    return r ? mapOport(r) : null;
  }
  async criarOportunidade(schema: string, o: NovaOportunidade): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".oportunidade (id, cliente_id, cliente_nome, titulo, valor, vendedor_id, estagio, previsao, contato, email, telefone, origem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [id, o.clienteId, o.clienteNome, o.titulo, o.valor, o.vendedorId, o.estagio, o.previsao, o.contato, o.email, o.telefone, o.origem]);
    return id;
  }
  async mudarEstagio(schema: string, id: string, estagio: EstagioOportunidade): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".oportunidade SET estagio = $2, perdido = false WHERE id = $1`, [id, estagio]);
  }
  async marcarPerdido(schema: string, id: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".oportunidade SET perdido = true, estagio = 'perdido' WHERE id = $1`, [id]);
  }
  async vincularPedido(schema: string, id: string, pedidoId: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".oportunidade SET pedido_id = $2 WHERE id = $1`, [id, pedidoId]);
  }
  async vincularCliente(schema: string, id: string, clienteId: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".oportunidade SET cliente_id = $2 WHERE id = $1`, [id, clienteId]);
  }

  // ---- Interações ----
  async listarInteracoes(schema: string, clienteId: string): Promise<Interacao[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT id, cliente_id, oportunidade_id, tipo, data, nota FROM "${s}".interacao WHERE cliente_id = $1 ORDER BY data DESC, criado_em DESC`, [clienteId]);
    return linhas.map(mapInter);
  }
  async listarInteracoesOportunidade(schema: string, oportunidadeId: string): Promise<Interacao[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT id, cliente_id, oportunidade_id, tipo, data, nota FROM "${s}".interacao WHERE oportunidade_id = $1 ORDER BY data DESC, criado_em DESC`, [oportunidadeId]);
    return linhas.map(mapInter);
  }
  async criarInteracao(schema: string, i: NovaInteracao): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".interacao (id, cliente_id, oportunidade_id, tipo, data, nota) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, i.clienteId, i.oportunidadeId, i.tipo, i.data, i.nota]);
    return id;
  }
  async migrarInteracoesParaCliente(schema: string, oportunidadeId: string, clienteId: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".interacao SET cliente_id = $2 WHERE oportunidade_id = $1`, [oportunidadeId, clienteId]);
  }
  async contarInteracoes(schema: string): Promise<number> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT COUNT(*)::int n FROM "${s}".interacao`))[0];
    return Number(r.n);
  }

  // ---- Analytics ----
  async resumoBase(schema: string): Promise<{ clientesAtivos: number; clientesAtendidos: number; ticketMedio: number }> {
    const s = validarSchema(schema);
    const ativos = (await this.ds.query(`SELECT COUNT(*)::int n FROM "${s}".cliente WHERE ativo`))[0];
    const at = (await this.ds.query(
      `SELECT COUNT(DISTINCT cliente_id)::int n, COALESCE(AVG(total),0) tm
         FROM "${s}".pedido WHERE ${VALIDO} AND cliente_id IS NOT NULL`))[0];
    return { clientesAtivos: Number(ativos.n), clientesAtendidos: Number(at.n), ticketMedio: Number(at.tm) };
  }
  async vendasPorCliente(schema: string): Promise<VendaCliente[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.cliente_id, c.nome AS cliente, p.criado_em::date AS data, p.total
         FROM "${s}".pedido p JOIN "${s}".cliente c ON c.id = p.cliente_id
        WHERE p.${VALIDO} AND p.cliente_id IS NOT NULL
        ORDER BY p.cliente_id, p.criado_em`);
    return linhas.map((r: any) => ({
      clienteId: r.cliente_id, cliente: r.cliente,
      data: new Date(r.data).toISOString().slice(0, 10), total: Number(r.total),
    }));
  }
  async topItensPorCliente(schema: string): Promise<ItemCliente[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.cliente_id, pi.produto_nome AS produto, SUM(pi.quantidade) AS qtd
         FROM "${s}".pedido_item pi JOIN "${s}".pedido p ON p.id = pi.pedido_id
        WHERE p.${VALIDO} AND p.cliente_id IS NOT NULL
        GROUP BY p.cliente_id, pi.produto_nome`);
    return linhas.map((r: any) => ({ clienteId: r.cliente_id, produto: r.produto, qtd: Number(r.qtd) }));
  }
  async pedidosDoCliente(schema: string, clienteId: string): Promise<PedidoTimeline[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT numero, total, status, criado_em::date AS data
         FROM "${s}".pedido WHERE cliente_id = $1 ORDER BY criado_em DESC`, [clienteId]);
    return linhas.map((r: any) => ({
      numero: Number(r.numero), total: Number(r.total), status: r.status,
      data: new Date(r.data).toISOString().slice(0, 10),
    }));
  }
}
