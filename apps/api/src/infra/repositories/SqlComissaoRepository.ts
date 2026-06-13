import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { ComissaoRegra, ComissaoRepository, LinhaComissao, NovaComissaoRegra } from '../../domain/financeiro/Comissao.js';
import { validarSchema } from '../tenant/validarSchema.js';

const mapRegra = (r: any): ComissaoRegra => ({
  id: r.id, nome: r.nome, taxa: Number(r.taxa),
  vendedorId: r.vendedor_id ?? null, vendedorNome: r.vendedor_nome ?? null,
  de: r.de ? new Date(r.de).toISOString().slice(0, 10) : null,
  ate: r.ate ? new Date(r.ate).toISOString().slice(0, 10) : null,
  ativo: r.ativo,
});

export class SqlComissaoRepository implements ComissaoRepository {
  constructor(private readonly ds: DataSource) {}

  async apurar(schema: string, de: string | null, ate: string | null): Promise<LinhaComissao[]> {
    const s = validarSchema(schema);
    // Taxa efetiva por pedido: regra do vendedor vigente → regra geral vigente → % individual do vendedor.
    // "vigente" = ativa e a data do pedido dentro do período (ou período indeterminado). Entre as candidatas,
    // a com período definido tem prioridade sobre a indeterminada (e a de início mais recente vence).
    const regraVendedor =
      `(SELECT r.taxa FROM "${s}".comissao_regra r
          WHERE r.ativo AND r.vendedor_id = p.vendedor_id
            AND (r.de IS NULL OR r.de <= p.criado_em::date)
            AND (r.ate IS NULL OR r.ate >= p.criado_em::date)
          ORDER BY (r.de IS NOT NULL) DESC, r.de DESC NULLS LAST LIMIT 1)`;
    const regraGeral =
      `(SELECT r.taxa FROM "${s}".comissao_regra r
          WHERE r.ativo AND r.vendedor_id IS NULL
            AND (r.de IS NULL OR r.de <= p.criado_em::date)
            AND (r.ate IS NULL OR r.ate >= p.criado_em::date)
          ORDER BY (r.de IS NOT NULL) DESC, r.de DESC NULLS LAST LIMIT 1)`;
    const taxa = `COALESCE(${regraVendedor}, ${regraGeral}, v.comissao_percentual, 0)`;

    // A comissão é calculada sobre o SUBTOTAL (mercadoria), NÃO sobre o total — o
    // frete não compõe a base de comissão. "Vendido" também passa a ser o subtotal,
    // para o percentual efetivo exibido ficar coerente.
    const linhas = await this.ds.query(
      `SELECT v.id, v.nome,
              COALESCE(SUM(p.subtotal),0) vendido,
              COALESCE(SUM(p.subtotal * (${taxa}) / 100.0),0) comissao
         FROM "${s}".vendedor v
         JOIN "${s}".pedido p ON p.vendedor_id = v.id AND p.status = 'entregue'
        WHERE ($1::date IS NULL OR p.criado_em::date >= $1)
          AND ($2::date IS NULL OR p.criado_em::date <= $2)
        GROUP BY v.id, v.nome
        HAVING SUM(p.subtotal) > 0
        ORDER BY v.nome`, [de, ate]);
    return linhas.map((r: any) => {
      const vendido = Number(r.vendido);
      const comissao = Math.round(Number(r.comissao) * 100) / 100;
      const percentual = vendido > 0 ? Math.round((comissao / vendido) * 10000) / 100 : 0;
      return { vendedorId: r.id, vendedor: r.nome, percentual, vendido, comissao };
    });
  }

  async listarRegras(schema: string): Promise<ComissaoRegra[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT cr.*, ve.nome AS vendedor_nome
         FROM "${s}".comissao_regra cr
         LEFT JOIN "${s}".vendedor ve ON ve.id = cr.vendedor_id
        ORDER BY cr.ativo DESC, cr.nome`);
    return linhas.map(mapRegra);
  }
  async buscarRegra(schema: string, id: string): Promise<ComissaoRegra | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(`SELECT * FROM "${s}".comissao_regra WHERE id = $1`, [id]))[0];
    return r ? mapRegra(r) : null;
  }
  async criarRegra(schema: string, r: NovaComissaoRegra): Promise<string> {
    const s = validarSchema(schema); const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".comissao_regra (id, nome, taxa, vendedor_id, de, ate) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, r.nome, r.taxa, r.vendedorId, r.de, r.ate]);
    return id;
  }
  async atualizarRegra(schema: string, id: string, r: NovaComissaoRegra): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `UPDATE "${s}".comissao_regra SET nome=$2, taxa=$3, vendedor_id=$4, de=$5, ate=$6 WHERE id=$1`,
      [id, r.nome, r.taxa, r.vendedorId, r.de, r.ate]);
  }
  async definirAtivoRegra(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".comissao_regra SET ativo=$2 WHERE id=$1`, [id, ativo]);
  }
}
