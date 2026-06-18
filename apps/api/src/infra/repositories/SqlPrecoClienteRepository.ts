import type { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import type { PrecoClienteEntrada, PrecoClienteHistorico, PrecoClienteLinha, PrecoClienteRepository, RegistroHistoricoPrecoCliente } from '../../domain/comercial/PrecoCliente.js';
import { validarSchema } from '../tenant/validarSchema.js';

const iso = (v: any): string | null => (v ? new Date(v).toISOString().slice(0, 10) : null);

export class SqlPrecoClienteRepository implements PrecoClienteRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id produto_id, p.nome,
              COALESCE(pb.preco, 0) base, pc.preco cliente, pc.tipo, pc.de, pc.ate
         FROM "${s}".produto p
         LEFT JOIN "${s}".preco_base pb ON pb.produto_id = p.id
         LEFT JOIN "${s}".preco_cliente pc ON pc.produto_id = p.id AND pc.cliente_id = $1
        WHERE p.ativo = true ORDER BY p.nome`, [clienteId]);
    return linhas.map((r: any) => ({
      produtoId: r.produto_id, produtoNome: r.nome,
      precoBase: Number(r.base), precoCliente: r.cliente != null ? Number(r.cliente) : null,
      tipo: r.tipo === 'periodo' ? 'periodo' : 'fixo', de: iso(r.de), ate: iso(r.ate),
    }));
  }

  async definir(schema: string, clienteId: string, produtoId: string, dados: PrecoClienteEntrada): Promise<void> {
    const s = validarSchema(schema);
    if (dados.preco > 0) {
      const periodo = dados.tipo === 'periodo';
      await this.ds.query(
        `INSERT INTO "${s}".preco_cliente (cliente_id, produto_id, preco, tipo, de, ate) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (cliente_id, produto_id) DO UPDATE SET preco = EXCLUDED.preco, tipo = EXCLUDED.tipo, de = EXCLUDED.de, ate = EXCLUDED.ate`,
        [clienteId, produtoId, dados.preco, periodo ? 'periodo' : 'fixo', periodo ? dados.de : null, periodo ? dados.ate : null]);
    } else {
      await this.ds.query(`DELETE FROM "${s}".preco_cliente WHERE cliente_id=$1 AND produto_id=$2`, [clienteId, produtoId]);
    }
  }

  // Preço negociado do cliente. 'periodo' só vale se hoje estiver dentro do intervalo; senão null (cai no base/campanha).
  async precoDe(schema: string, clienteId: string, produtoId: string): Promise<number | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT preco FROM "${s}".preco_cliente
        WHERE cliente_id=$1 AND produto_id=$2
          AND (tipo = 'fixo' OR (tipo = 'periodo' AND CURRENT_DATE BETWEEN de AND ate))`,
      [clienteId, produtoId]))[0];
    return r ? Number(r.preco) : null;
  }

  async registrarHistorico(schema: string, r: RegistroHistoricoPrecoCliente): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".preco_cliente_historico (id, cliente_id, produto_id, preco, tipo, de, ate, usuario_id, usuario_nome)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [randomUUID(), r.clienteId, r.produtoId, r.preco, r.tipo, r.de, r.ate, r.usuarioId, r.usuarioNome]);
  }

  async listarHistorico(schema: string, clienteId: string): Promise<PrecoClienteHistorico[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT h.preco, h.tipo, h.de, h.ate, h.usuario_nome, h.criado_em, p.nome produto_nome
         FROM "${s}".preco_cliente_historico h
         LEFT JOIN "${s}".produto p ON p.id = h.produto_id
        WHERE h.cliente_id = $1 ORDER BY h.criado_em DESC`, [clienteId]);
    return linhas.map((r: any) => ({
      produtoNome: r.produto_nome ?? '—', preco: Number(r.preco), tipo: r.tipo,
      de: iso(r.de), ate: iso(r.ate), usuarioNome: r.usuario_nome ?? null,
      criadoEm: new Date(r.criado_em).toISOString(),
    }));
  }
}
