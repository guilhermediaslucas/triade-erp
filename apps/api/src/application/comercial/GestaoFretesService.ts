import type { GestaoFreteRepository, LinhaFreteMotoboy, LinhaFretePedido } from '../../domain/comercial/GestaoFrete.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class GestaoFretesService {
  constructor(private readonly repo: GestaoFreteRepository, private readonly titulos: TituloRepository) {}

  apurar(schema: string, de: any, ate: any): Promise<LinhaFreteMotoboy[]> {
    return this.repo.apurar(schema, lim(de), lim(ate));
  }
  // gerado: 'sim' | 'nao' | 'todos' (padrão 'nao' — só fretes ainda não gerados).
  listarPedidos(schema: string, de: any, ate: any, gerado: any): Promise<LinhaFretePedido[]> {
    const g = gerado === 'sim' ? true : gerado === 'todos' ? null : false;
    return this.repo.listarPedidos(schema, lim(de), lim(ate), g);
  }

  // Gera o título a pagar do motoboy para os pedidos SELECIONADOS (um título por motoboy).
  // Marca cada pedido como gerado (não pode gerar de novo). emissao é opcional.
  async gerar(schema: string, e: any): Promise<{ total: number; titulos: number }> {
    const venc = lim(e?.vencimento);
    if (!venc) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    const emissao = lim(e?.emissao);
    const ids: string[] = Array.isArray(e?.pedidoIds) ? e.pedidoIds.map((x: any) => String(x)) : [];
    if (!ids.length) throw new ErroAplicacao('frete.selecione_pedidos', 400);
    const pedidos = await this.repo.pedidosParaGerar(schema, ids);
    if (!pedidos.length) throw new ErroAplicacao('frete.nada_apurar', 400);
    // Agrupa por motoboy.
    const porMotoboy = new Map<string, { motoboy: string; ids: string[]; total: number }>();
    for (const p of pedidos) {
      const g = porMotoboy.get(p.motoboyId) ?? { motoboy: p.motoboy, ids: [], total: 0 };
      g.ids.push(p.id); g.total = Math.round((g.total + p.valor) * 100) / 100;
      porMotoboy.set(p.motoboyId, g);
    }
    let titulos = 0; let total = 0;
    for (const g of porMotoboy.values()) {
      if (g.total <= 0) continue;
      const tituloId = await this.titulos.criar(schema,
        { tipo: 'pagar', descricao: 'Fretes - ' + g.motoboy, pessoaNome: g.motoboy, valor: g.total, vencimento: venc, emissao: emissao ?? undefined },
        'frete', null);
      await this.repo.marcarGerado(schema, g.ids, typeof tituloId === 'string' ? tituloId : null);
      titulos++; total = Math.round((total + g.total) * 100) / 100;
    }
    return { total, titulos };
  }
}
