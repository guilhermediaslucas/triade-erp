import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { Recebimento, RecebimentoRepository } from '../../domain/financeiro/Recebimento.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import type { EtiquetaRepository } from '../../domain/estoque/Etiqueta.js';
import type { CategoriaFinanceiraRepository } from '../../domain/financeiro/CategoriaFinanceira.js';
import { CATEGORIA_COMPRA_MERCADORIA } from '../../domain/financeiro/CategoriaFinanceira.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function venc30(): string { return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10); }
const r2 = (n: number) => Math.round(n * 100) / 100;
const isoOk = (v: any) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v))) ? String(v) : null;

export class ComprasService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly titulos: TituloRepository,
    private readonly recebimentos: RecebimentoRepository,
    private readonly estoque: EstoqueRepository,
    private readonly etiquetas: EtiquetaRepository,
    private readonly categorias: CategoriaFinanceiraRepository,
  ) {}

  // Lança a nota com 1+ produtos: cria UM título a pagar (valor total) + UMA pendência
  // de recebimento por produto (todas ligadas ao mesmo título). Aceita e.itens[] ou,
  // por retrocompat, um único produto (e.produtoId/quantidade/custoUnitario).
  async lancarNota(schema: string, e: any): Promise<{ recebimentoIds: string[] }> {
    const itensRaw = Array.isArray(e?.itens) && e.itens.length > 0
      ? e.itens
      : [{ produtoId: e?.produtoId, quantidade: e?.quantidade, custoUnitario: e?.custoUnitario }];
    const itens: { produtoId: string; produtoNome: string; quantidade: number; custoUnitario: number; total: number }[] = [];
    for (const it of itensRaw) {
      const prod = await this.produtos.buscarPorId(schema, it?.produtoId);
      if (!prod) throw new ErroAplicacao('pedido.produto_invalido', 400);
      const quantidade = Number(it?.quantidade);
      if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
      const custo = Number(it?.custoUnitario);
      if (!Number.isFinite(custo) || custo < 0) throw new ErroAplicacao('estoque.custo_invalido', 400);
      itens.push({ produtoId: prod.id, produtoNome: prod.nome, quantidade, custoUnitario: custo, total: r2(quantidade * custo) });
    }
    const fornecedorNome = (e?.fornecedorNome && String(e.fornecedorNome).trim()) || null;
    const nf = (e?.nf && String(e.nf).trim()) || null;
    const serie = (e?.serie && String(e.serie).trim()) || null;
    const numeroDocumento = nf ? (serie ? `${nf} / ${serie}` : nf) : serie;
    const emissao = isoOk(e?.emissao);
    const vencimento = isoOk(e?.vencimento) ?? venc30();
    const total = r2(itens.reduce((a, i) => a + i.total, 0));

    const descricao = 'Compra' + (fornecedorNome ? ' - ' + fornecedorNome : '') + (nf ? ' (NF ' + nf + ')' : '');
    // Enquadra o título de compra na categoria "Compra de mercadorias para revenda"
    // (grupo Custo de aquisição de mercadoria na DRE). Best-effort: se a categoria não
    // existir no tenant, segue sem categoria (não bloqueia o lançamento da nota).
    const catCompra = await this.categorias.buscarPorNome(schema, CATEGORIA_COMPRA_MERCADORIA).catch(() => null);
    const tituloId = await this.titulos.criar(schema,
      { tipo: 'pagar', descricao, pessoaNome: fornecedorNome, valor: total, vencimento, emissao, numeroDocumento, categoriaFinanceiraId: catCompra?.id ?? null }, 'compra', null);

    const recebimentoIds: string[] = [];
    for (const it of itens) {
      const recId = await this.recebimentos.criar(schema, {
        fornecedorNome, produtoId: it.produtoId, produtoNome: it.produtoNome, quantidade: it.quantidade,
        custoUnitario: it.custoUnitario, total: it.total, nf, tituloId,
      });
      recebimentoIds.push(recId);
    }
    return { recebimentoIds };
  }

  listarPendentes(schema: string): Promise<Recebimento[]> { return this.recebimentos.listarPendentes(schema); }
  listarNotas(schema: string, de: any, ate: any): Promise<Recebimento[]> {
    const lim = (v: any) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v))) ? String(v) : null;
    return this.recebimentos.listar(schema, lim(de), lim(ate));
  }

  // Editar um item da nota — só enquanto pendente. Atualiza a linha e recalcula o
  // total do título a pagar (soma de todos os itens da mesma nota/título).
  async editarNota(schema: string, id: string, e: any): Promise<void> {
    const rec = await this.recebimentos.buscarPorId(schema, id);
    if (!rec) throw new ErroAplicacao('recebimento.nao_encontrado', 404);
    if (rec.status !== 'pendente') throw new ErroAplicacao('recebimento.so_pendente', 400);
    const quantidade = Number(e?.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('estoque.qtd_invalida', 400);
    const custo = Number(e?.custoUnitario);
    if (!Number.isFinite(custo) || custo < 0) throw new ErroAplicacao('estoque.custo_invalido', 400);
    const fornecedorNome = (e?.fornecedorNome && String(e.fornecedorNome).trim()) || null;
    const nf = (e?.nf && String(e.nf).trim()) || null;
    const serie = (e?.serie && String(e.serie).trim()) || null;
    const numeroDocumento = nf ? (serie ? `${nf} / ${serie}` : nf) : serie;
    const vencimento = isoOk(e?.vencimento) ?? venc30();
    const total = r2(quantidade * custo);
    await this.recebimentos.atualizar(schema, id, { fornecedorNome, quantidade, custoUnitario: custo, total, nf });
    if (rec.tituloId) {
      const irmaos = await this.recebimentos.listarPorTitulo(schema, rec.tituloId);
      const valorTitulo = r2(irmaos.reduce((a, x) => a + (x.id === id ? total : x.total), 0));
      const descricao = 'Compra' + (fornecedorNome ? ' - ' + fornecedorNome : '') + (nf ? ' (NF ' + nf + ')' : '');
      await this.titulos.atualizarCompra(schema, rec.tituloId, { descricao, pessoaNome: fornecedorNome, valor: valorTitulo, vencimento, numeroDocumento });
    }
  }

  // Excluir um item da nota — só enquanto pendente. Se for o último item do título,
  // remove o título; senão, recalcula o total do título com os itens restantes.
  async excluirNota(schema: string, id: string): Promise<void> {
    const rec = await this.recebimentos.buscarPorId(schema, id);
    if (!rec) throw new ErroAplicacao('recebimento.nao_encontrado', 404);
    if (rec.status !== 'pendente') throw new ErroAplicacao('recebimento.so_pendente', 400);
    if (rec.tituloId) {
      const irmaos = await this.recebimentos.listarPorTitulo(schema, rec.tituloId);
      const restantes = irmaos.filter((x) => x.id !== id);
      if (restantes.length === 0) {
        await this.titulos.excluir(schema, rec.tituloId);
      } else {
        const tit = await this.titulos.buscarPorId(schema, rec.tituloId);
        if (tit) {
          const valorTitulo = r2(restantes.reduce((a, x) => a + x.total, 0));
          await this.titulos.atualizarCompra(schema, rec.tituloId, { descricao: tit.descricao, pessoaNome: tit.pessoaNome, valor: valorTitulo, vencimento: String(tit.vencimento).slice(0, 10), numeroDocumento: tit.numeroDocumento });
        }
      }
    }
    await this.recebimentos.excluir(schema, id);
  }

  // Recebe a pendência em N lotes (lote/validade + bipagem das etiquetas).
  // A soma das quantidades bipadas (todos os lotes) deve bater com a quantidade da nota.
  async receber(schema: string, id: string, e: any): Promise<void> {
    const rec = await this.recebimentos.buscarPorId(schema, id);
    if (!rec || rec.status !== 'pendente') throw new ErroAplicacao('recebimento.nao_encontrado', 404);
    if (!rec.produtoId) throw new ErroAplicacao('pedido.produto_invalido', 400);

    const lotesIn = Array.isArray(e?.lotes) ? e.lotes : [];
    if (lotesIn.length === 0) throw new ErroAplicacao('recebimento.lotes_obrigatorio', 400);

    // Normaliza cada bloco: lote, validade e códigos bipados.
    const blocos: { lote: string | null; validade: string | null; codigos: string[] }[] = [];
    const todosCodigos: string[] = [];
    for (const l of lotesIn) {
      const codigos = Array.isArray(l?.codigos)
        ? l.codigos.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
        : [];
      if (codigos.length === 0) throw new ErroAplicacao('etiqueta.bipe_obrigatorio', 400);
      const validade = (l?.validade && String(l.validade).trim()) || null;
      const lote = (l?.lote && String(l.lote).trim()) || null;
      blocos.push({ lote, validade, codigos });
      todosCodigos.push(...codigos);
    }
    // Nenhum código pode se repetir entre os lotes desta leitura.
    if (new Set(todosCodigos).size !== todosCodigos.length) throw new ErroAplicacao('etiqueta.duplicada_leitura', 400);
    // A soma das etiquetas lidas tem que bater com a quantidade da nota.
    if (todosCodigos.length !== Number(rec.quantidade)) throw new ErroAplicacao('recebimento.soma_invalida', 400);
    // Nenhum código já pode existir no estoque.
    const jaExistem = await this.etiquetas.jaExistem(schema, todosCodigos);
    if (jaExistem.length > 0) throw new ErroAplicacao('etiqueta.duplicada', 409, jaExistem.join(', '));

    // Origem da nota gravada nas etiquetas (fornecedor / NF / emissão — emissão vem do título).
    const tit = rec.tituloId ? await this.titulos.buscarPorId(schema, rec.tituloId) : null;
    const emissao = tit?.emissao ?? null;
    for (const b of blocos) {
      await this.estoque.registrarEntrada(schema, {
        produtoId: rec.produtoId, lote: b.lote, validade: b.validade,
        quantidade: b.codigos.length, custoUnitario: rec.custoUnitario, codigos: b.codigos,
        fornecedor: rec.fornecedorNome ?? null, nf: rec.nf ?? null, emissao,
      });
    }
    await this.recebimentos.marcarRecebido(schema, id);
  }
}
