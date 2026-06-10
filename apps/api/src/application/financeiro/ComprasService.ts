import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { Recebimento, RecebimentoRepository } from '../../domain/financeiro/Recebimento.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function venc30(): string { return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10); }

export class ComprasService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly titulos: TituloRepository,
    private readonly recebimentos: RecebimentoRepository,
    private readonly estoque: EstoqueRepository,
  ) {}

  // Lança a nota: cria título a pagar + pendência de recebimento.
  async lancarNota(schema: string, e: any): Promise<{ recebimentoId: string }> {
    const prod = await this.produtos.buscarPorId(schema, e?.produtoId);
    if (!prod) throw new ErroAplicacao('pedido.produto_invalido', 400);
    const quantidade = Number(e?.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
    const custo = Number(e?.custoUnitario);
    if (!Number.isFinite(custo) || custo < 0) throw new ErroAplicacao('estoque.custo_invalido', 400);
    const fornecedorNome = (e?.fornecedorNome && String(e.fornecedorNome).trim()) || null;
    const nf = (e?.nf && String(e.nf).trim()) || null;
    const total = Math.round(quantidade * custo * 100) / 100;

    const descricao = 'Compra' + (fornecedorNome ? ' - ' + fornecedorNome : '') + (nf ? ' (NF ' + nf + ')' : '');
    const tituloId = await this.titulos.criar(schema,
      { tipo: 'pagar', descricao, pessoaNome: fornecedorNome, valor: total, vencimento: venc30() }, 'compra', null);

    const recebimentoId = await this.recebimentos.criar(schema, {
      fornecedorNome, produtoId: prod.id, produtoNome: prod.nome, quantidade, custoUnitario: custo, total, nf, tituloId,
    });
    return { recebimentoId };
  }

  listarPendentes(schema: string): Promise<Recebimento[]> { return this.recebimentos.listarPendentes(schema); }

  // Recebe a pendência: dá entrada no estoque (lote/validade) e marca como recebido.
  async receber(schema: string, id: string, e: any): Promise<void> {
    const rec = await this.recebimentos.buscarPorId(schema, id);
    if (!rec || rec.status !== 'pendente') throw new ErroAplicacao('recebimento.nao_encontrado', 404);
    if (!rec.produtoId) throw new ErroAplicacao('pedido.produto_invalido', 400);
    const validade = (e?.validade && String(e.validade).trim()) || null;
    const lote = (e?.lote && String(e.lote).trim()) || null;
    await this.estoque.registrarEntrada(schema, {
      produtoId: rec.produtoId, lote, validade, quantidade: rec.quantidade, custoUnitario: rec.custoUnitario,
    });
    await this.recebimentos.marcarRecebido(schema, id);
  }
}
