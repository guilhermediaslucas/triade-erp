import type { NovoProduto, ProdutoRepository, ProdutoResumo } from '../../domain/cadastro/Produto.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const limpo = (v: any): string | null => (v && String(v).trim() !== '' ? String(v).trim() : null);

export class ProdutosService {
  constructor(
    private readonly produtos: ProdutoRepository,
  ) {}
  listar(schema: string): Promise<ProdutoResumo[]> { return this.produtos.listar(schema); }

  private async validar(_schema: string, e: any): Promise<NovoProduto> {
    if (!e?.nome || String(e.nome).trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
    const estoqueMinimo = Number(e.estoqueMinimo ?? 0);
    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) throw new ErroAplicacao('produto.minimo_invalido', 400);
    // Fiscal (Fase 7): normaliza. NCM = só dígitos (opcional na 7A; obrigatório p/ emitir na 7B).
    const ncmDigitos = e.ncm ? String(e.ncm).replace(/\D/g, '') : '';
    if (ncmDigitos !== '' && ncmDigitos.length !== 8) throw new ErroAplicacao('produto.ncm_invalido', 400);
    const cfop = e.cfop ? String(e.cfop).replace(/\D/g, '') : '';
    if (cfop !== '' && cfop.length !== 4) throw new ErroAplicacao('produto.cfop_invalido', 400);
    const origem = limpo(e.origemFiscal);
    if (origem !== null && !/^[0-8]$/.test(origem)) throw new ErroAplicacao('produto.origem_invalida', 400);
    return {
      nome: String(e.nome).trim(),
      unidade: (e.unidade && String(e.unidade).trim()) || 'UN',
      estoqueMinimo, localizacao: limpo(e.localizacao), registroAnvisa: limpo(e.registroAnvisa),
      ncm: ncmDigitos || null, cfop: cfop || null, cstFiscal: limpo(e.cstFiscal), origemFiscal: origem,
    };
  }
  async criar(schema: string, e: any): Promise<string> { return this.produtos.criar(schema, await this.validar(schema, e)); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.atualizar(schema, id, await this.validar(schema, e));
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.produtos.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.produtos.definirAtivo(schema, id, ativo);
  }
}
