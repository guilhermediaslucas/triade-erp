import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { Recebimento, RecebimentoRepository } from '../../domain/financeiro/Recebimento.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import type { MarcaRepository } from '../../domain/cadastro/Marca.js';
import type { EtiquetaRepository } from '../../domain/estoque/Etiqueta.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function venc30(): string { return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10); }

export class ComprasService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly titulos: TituloRepository,
    private readonly recebimentos: RecebimentoRepository,
    private readonly estoque: EstoqueRepository,
    private readonly marcas: MarcaRepository,
    private readonly etiquetas: EtiquetaRepository,
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

  // Recebe a pendência em N lotes, cada um com marca (obrigatória) + bipagem das etiquetas.
  // A soma das quantidades bipadas (todos os lotes) deve bater com a quantidade da nota.
  async receber(schema: string, id: string, e: any): Promise<void> {
    const rec = await this.recebimentos.buscarPorId(schema, id);
    if (!rec || rec.status !== 'pendente') throw new ErroAplicacao('recebimento.nao_encontrado', 404);
    if (!rec.produtoId) throw new ErroAplicacao('pedido.produto_invalido', 400);

    const lotesIn = Array.isArray(e?.lotes) ? e.lotes : [];
    if (lotesIn.length === 0) throw new ErroAplicacao('recebimento.lotes_obrigatorio', 400);

    // Normaliza cada bloco: lote, validade, marca (obrigatória) e códigos bipados.
    const blocos: { lote: string | null; validade: string | null; marcaId: string; codigos: string[] }[] = [];
    const todosCodigos: string[] = [];
    for (const l of lotesIn) {
      const marcaId = (l?.marcaId && String(l.marcaId).trim()) || '';
      if (!marcaId) throw new ErroAplicacao('recebimento.marca_obrigatoria', 400);
      const marca = await this.marcas.buscarPorId(schema, marcaId);
      if (!marca) throw new ErroAplicacao('marca.invalida', 400);
      const codigos = Array.isArray(l?.codigos)
        ? l.codigos.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
        : [];
      if (codigos.length === 0) throw new ErroAplicacao('etiqueta.bipe_obrigatorio', 400);
      const validade = (l?.validade && String(l.validade).trim()) || null;
      const lote = (l?.lote && String(l.lote).trim()) || null;
      blocos.push({ lote, validade, marcaId, codigos });
      todosCodigos.push(...codigos);
    }
    // Nenhum código pode se repetir entre os lotes desta leitura.
    if (new Set(todosCodigos).size !== todosCodigos.length) throw new ErroAplicacao('etiqueta.duplicada_leitura', 400);
    // A soma das etiquetas lidas tem que bater com a quantidade da nota.
    if (todosCodigos.length !== Number(rec.quantidade)) throw new ErroAplicacao('recebimento.soma_invalida', 400);
    // Nenhum código já pode existir no estoque.
    const jaExistem = await this.etiquetas.jaExistem(schema, todosCodigos);
    if (jaExistem.length > 0) throw new ErroAplicacao('etiqueta.duplicada', 409);

    for (const b of blocos) {
      await this.estoque.registrarEntrada(schema, {
        produtoId: rec.produtoId, lote: b.lote, validade: b.validade, marcaId: b.marcaId,
        quantidade: b.codigos.length, custoUnitario: rec.custoUnitario, codigos: b.codigos,
      });
    }
    await this.recebimentos.marcarRecebido(schema, id);
  }
}
