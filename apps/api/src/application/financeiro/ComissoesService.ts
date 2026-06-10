import type { ComissaoRepository, LinhaComissao } from '../../domain/financeiro/Comissao.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class ComissoesService {
  constructor(private readonly repo: ComissaoRepository, private readonly titulos: TituloRepository) {}
  apurar(schema: string, de: any, ate: any): Promise<LinhaComissao[]> { return this.repo.apurar(schema, lim(de), lim(ate)); }
  async fechar(schema: string, e: any): Promise<{ total: number }> {
    const de = lim(e?.de), ate = lim(e?.ate);
    const venc = lim(e?.vencimento);
    if (!venc) throw new ErroAplicacao('financeiro.vencimento_invalido', 400);
    const linhas = await this.repo.apurar(schema, de, ate);
    const total = Math.round(linhas.reduce((a, l) => a + l.comissao, 0) * 100) / 100;
    if (total <= 0) throw new ErroAplicacao('comissao.nada_apurar', 400);
    const ref = (de ?? '') + ' a ' + (ate ?? '');
    await this.titulos.criar(schema, { tipo: 'pagar', descricao: 'Comissões ' + ref, pessoaNome: 'Comissões (vendedores)', valor: total, vencimento: venc }, 'comissao', null);
    return { total };
  }
}
