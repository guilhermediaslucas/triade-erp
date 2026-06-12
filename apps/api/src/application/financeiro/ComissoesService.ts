import type { ComissaoRegra, ComissaoRepository, LinhaComissao, NovaComissaoRegra } from '../../domain/financeiro/Comissao.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
const lim = (v: any): string | null => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);

export class ComissoesService {
  constructor(private readonly repo: ComissaoRepository, private readonly titulos: TituloRepository) {}
  apurar(schema: string, de: any, ate: any): Promise<LinhaComissao[]> { return this.repo.apurar(schema, lim(de), lim(ate)); }

  // --- Regras de comissão ---
  listarRegras(schema: string): Promise<ComissaoRegra[]> { return this.repo.listarRegras(schema); }
  private validarRegra(e: any): NovaComissaoRegra {
    const nome = String(e?.nome ?? '').trim();
    if (nome.length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
    const taxa = Number(e?.taxa);
    if (!Number.isFinite(taxa) || taxa < 0 || taxa > 100) throw new ErroAplicacao('comissao.taxa_invalida', 400);
    const de = lim(e?.de), ate = lim(e?.ate);
    if (de && ate && ate < de) throw new ErroAplicacao('comissao.periodo_invalido', 400);
    const vendedorId = (e?.vendedorId && String(e.vendedorId).trim()) || null;
    return { nome, taxa: Math.round(taxa * 100) / 100, vendedorId, de, ate };
  }
  criarRegra(schema: string, e: any): Promise<string> { return this.repo.criarRegra(schema, this.validarRegra(e)); }
  async editarRegra(schema: string, id: string, e: any): Promise<void> {
    const r = this.validarRegra(e);
    if (!(await this.repo.buscarRegra(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizarRegra(schema, id, r);
  }
  async alternarAtivoRegra(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarRegra(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivoRegra(schema, id, ativo);
  }
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
