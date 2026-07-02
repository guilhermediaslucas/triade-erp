import type { NovoProduto, ProdutoRepository, ProdutoResumo } from '../../domain/cadastro/Produto.js';
import type { CategoriaRepository } from '../../domain/cadastro/Categoria.js';
import type { PrecoBaseRepository } from '../../domain/comercial/PrecoBase.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const limpo = (v: any): string | null => (v && String(v).trim() !== '' ? String(v).trim() : null);

export class ProdutosService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly categorias: CategoriaRepository,
    // Preço base (mesma fonte da Tabela de preço) — o cadastro de produto grava aqui.
    private readonly precoBase?: PrecoBaseRepository,
  ) {}

  // Grava o preço base (compartilhado com a Tabela de preço) quando o campo veio no payload.
  private async definirPreco(schema: string, id: string, e: any): Promise<void> {
    if (!this.precoBase || e?.preco === undefined || e?.preco === null || e?.preco === '') return;
    const p = Number(e.preco);
    if (!Number.isFinite(p) || p < 0) throw new ErroAplicacao('produto.preco_invalido', 400);
    await this.precoBase.definir(schema, id, p);
  }
  listar(schema: string): Promise<ProdutoResumo[]> { return this.produtos.listar(schema); }

  private async validar(schema: string, e: any): Promise<NovoProduto> {
    if (!e?.nome || String(e.nome).trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
    const estoqueMinimo = Number(e.estoqueMinimo ?? 0);
    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) throw new ErroAplicacao('produto.minimo_invalido', 400);
    const categoriaId = e.categoriaId || null;
    if (categoriaId && !(await this.categorias.buscarPorId(schema, categoriaId))) {
      throw new ErroAplicacao('produto.categoria_invalida', 400);
    }
    // Fiscal (Fase 7): normaliza. NCM = só dígitos (opcional na 7A; obrigatório p/ emitir na 7B).
    const ncmDigitos = e.ncm ? String(e.ncm).replace(/\D/g, '') : '';
    if (ncmDigitos !== '' && ncmDigitos.length !== 8) throw new ErroAplicacao('produto.ncm_invalido', 400);
    const cfop = e.cfop ? String(e.cfop).replace(/\D/g, '') : '';
    if (cfop !== '' && cfop.length !== 4) throw new ErroAplicacao('produto.cfop_invalido', 400);
    const origem = limpo(e.origemFiscal);
    if (origem !== null && !/^[0-8]$/.test(origem)) throw new ErroAplicacao('produto.origem_invalida', 400);
    return {
      nome: String(e.nome).trim(), categoriaId,
      unidade: (e.unidade && String(e.unidade).trim()) || 'UN',
      estoqueMinimo, localizacao: limpo(e.localizacao), registroAnvisa: limpo(e.registroAnvisa),
      ncm: ncmDigitos || null, cfop: cfop || null, cstFiscal: limpo(e.cstFiscal), origemFiscal: origem,
    };
  }
  async criar(schema: string, e: any): Promise<string> {
    const id = await this.produtos.criar(schema, await this.validar(schema, e));
    await this.definirPreco(schema, id, e);
    return id;
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.atualizar(schema, id, await this.validar(schema, e));
    await this.definirPreco(schema, id, e);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.definirAtivo(schema, id, ativo);
  }

  // Importação em lote (CSV/XLSX normalizado no front). Dedup por nome (produto não
  // tem documento). Erro por linha não aborta o lote.
  async importar(schema: string, linhas: any[]): Promise<{ criados: number; ignorados: number; erros: { linha: number; motivo: string }[] }> {
    const lista = Array.isArray(linhas) ? linhas : [];
    const nomes = new Set((await this.produtos.listar(schema)).map((p) => p.nome.toLowerCase().trim()));
    let criados = 0, ignorados = 0; const erros: { linha: number; motivo: string }[] = [];
    for (let i = 0; i < lista.length; i++) {
      try {
        const novo = await this.validar(schema, lista[i] ?? {});
        const nomeN = novo.nome.toLowerCase().trim();
        if (nomes.has(nomeN)) { ignorados++; continue; }
        await this.produtos.criar(schema, novo);
        nomes.add(nomeN);
        criados++;
      } catch (err) {
        erros.push({ linha: i + 1, motivo: err instanceof ErroAplicacao ? err.chaveI18n : 'cadastro.import_erro_linha' });
      }
    }
    return { criados, ignorados, erros };
  }
}
