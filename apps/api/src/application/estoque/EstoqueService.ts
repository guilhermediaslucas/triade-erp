import type { EstoqueRepository, PosicaoProduto } from '../../domain/estoque/Estoque.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export class EstoqueService {
  constructor(private readonly repo: EstoqueRepository) {}
  posicao(schema: string): Promise<PosicaoProduto[]> { return this.repo.posicao(schema); }

  async entrada(schema: string, e: any): Promise<void> {
    if (!e?.produtoId || !(await this.repo.produtoExiste(schema, e.produtoId))) throw new ErroAplicacao('pedido.produto_invalido', 400);
    const quantidade = Number(e?.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
    const custo = Number(e?.custoUnitario ?? 0);
    if (!Number.isFinite(custo) || custo < 0) throw new ErroAplicacao('estoque.custo_invalido', 400);
    const validade = (e?.validade && String(e.validade).trim()) || null;
    const lote = (e?.lote && String(e.lote).trim()) || null;
    await this.repo.registrarEntrada(schema, { produtoId: e.produtoId, lote, validade, quantidade, custoUnitario: custo });
  }

  async baixaPerda(schema: string, e: any): Promise<void> {
    const quantidade = Number(e?.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
    const motivo = (e?.motivo && String(e.motivo).trim()) || '';
    if (motivo.length < 2) throw new ErroAplicacao('estoque.motivo_invalido', 400);
    const lote = await this.repo.saldoLote(schema, e?.loteId);
    if (!lote) throw new ErroAplicacao('estoque.lote_invalido', 404);
    if (quantidade > lote.saldo) throw new ErroAplicacao('estoque.insuficiente', 409);
    await this.repo.baixarLote(schema, e.loteId, lote.produtoId, quantidade, motivo);
  }
}
