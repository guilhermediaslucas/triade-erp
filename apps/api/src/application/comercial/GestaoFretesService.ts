import type { GestaoFreteRepository, LinhaFreteMotoboy, LinhaFretePedido } from '../../domain/comercial/GestaoFrete.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class GestaoFretesService {
  constructor(private readonly repo: GestaoFreteRepository, private readonly titulos: TituloRepository) {}

  apurar(schema: string, de: any, ate: any): Promise<LinhaFreteMotoboy[]> {
    return this.repo.apurar(schema, lim(de), lim(ate));
  }
  listarPedidos(schema: string, de: any, ate: any): Promise<LinhaFretePedido[]> {
    return this.repo.listarPedidos(schema, lim(de), lim(ate));
  }

  // Fecha a competência: gera um título a pagar por motoboy com o frete acumulado no período.
  async fechar(schema: string, e: any): Promise<{ total: number; titulos: number }> {
    const de = lim(e?.de), ate = lim(e?.ate);
    const venc = lim(e?.vencimento);
    if (!venc) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    const linhas = await this.repo.apurar(schema, de, ate);
    const total = Math.round(linhas.reduce((a, l) => a + l.totalFrete, 0) * 100) / 100;
    if (total <= 0) throw new ErroAplicacao('frete.nada_apurar', 400);
    const ref = (de ?? '') + ' a ' + (ate ?? '');
    let titulos = 0;
    for (const l of linhas) {
      if (l.totalFrete <= 0) continue;
      await this.titulos.criar(schema,
        { tipo: 'pagar', descricao: 'Fretes ' + ref + ' - ' + l.motoboy, pessoaNome: l.motoboy, valor: l.totalFrete, vencimento: venc },
        'frete', null);
      titulos++;
    }
    return { total, titulos };
  }
}
