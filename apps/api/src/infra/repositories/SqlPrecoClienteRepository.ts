import type { DataSource } from 'typeorm';
import type { PrecoClienteEntrada, PrecoClienteLinha, PrecoClienteRepository } from '../../domain/comercial/PrecoCliente.js';
import { validarSchema } from '../tenant/validarSchema.js';

const iso = (v: any): string | null => (v ? new Date(v).toISOString().slice(0, 10) : null);

export class SqlPrecoClienteRepository implements PrecoClienteRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id produto_id, p.nome, cat.nome AS categoria_nome,
              COALESCE(pb.preco, 0) base, pc.preco cliente, pc.tipo, pc.de, pc.ate
         FROM "${s}".produto p
         LEFT JOIN "${s}".categoria cat ON cat.id = p.categoria_id
         LEFT JOIN "${s}".preco_base pb ON pb.produto_id = p.id
         LEFT JOIN "${s}".preco_cliente pc ON pc.produto_id = p.id AND pc.cliente_id = $1
        WHERE p.ativo = true ORDER BY p.nome`, [clienteId]);
    return linhas.map((r: any) => ({
      produtoId: r.produto_id, produtoNome: r.nome, categoriaNome: r.categoria_nome ?? null,
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
}
