import type { DataSource } from 'typeorm';
import type { PrecoClienteLinha, PrecoClienteRepository } from '../../domain/comercial/PrecoCliente.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlPrecoClienteRepository implements PrecoClienteRepository {
  constructor(private readonly ds: DataSource) {}

  async listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT p.id produto_id, p.nome,
              COALESCE(pb.preco, 0) base, pc.preco cliente
         FROM "${s}".produto p
         LEFT JOIN "${s}".preco_base pb ON pb.produto_id = p.id
         LEFT JOIN "${s}".preco_cliente pc ON pc.produto_id = p.id AND pc.cliente_id = $1
        WHERE p.ativo = true ORDER BY p.nome`, [clienteId]);
    return linhas.map((r: any) => ({
      produtoId: r.produto_id, produtoNome: r.nome, precoBase: Number(r.base),
      precoCliente: r.cliente != null ? Number(r.cliente) : null,
    }));
  }

  async definir(schema: string, clienteId: string, produtoId: string, preco: number): Promise<void> {
    const s = validarSchema(schema);
    if (preco > 0) {
      await this.ds.query(
        `INSERT INTO "${s}".preco_cliente (cliente_id, produto_id, preco) VALUES ($1,$2,$3)
         ON CONFLICT (cliente_id, produto_id) DO UPDATE SET preco = EXCLUDED.preco`,
        [clienteId, produtoId, preco]);
    } else {
      await this.ds.query(`DELETE FROM "${s}".preco_cliente WHERE cliente_id=$1 AND produto_id=$2`, [clienteId, produtoId]);
    }
  }

  async precoDe(schema: string, clienteId: string, produtoId: string): Promise<number | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT preco FROM "${s}".preco_cliente WHERE cliente_id=$1 AND produto_id=$2`, [clienteId, produtoId]))[0];
    return r ? Number(r.preco) : null;
  }
}
