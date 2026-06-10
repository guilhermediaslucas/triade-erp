import type { NovoPedido, Pedido, PedidoItem, PedidoRepository, PedidoResumo, StatusPedido } from '../../domain/comercial/Pedido.js';
import type { PrecoBaseRepository } from '../../domain/comercial/PrecoBase.js';
import type { PrecoClienteRepository } from '../../domain/comercial/PrecoCliente.js';
import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { ClienteRepository, EnderecoCliente } from '../../domain/pessoa/Cliente.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { CondicaoRepository } from '../../domain/comercial/Condicao.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  orcamento: ['aguardando_pagamento', 'cancelado'],
  aguardando_pagamento: ['aprovado', 'cancelado'],
  aprovado: ['separacao', 'cancelado'],
  separacao: ['expedido'],
  expedido: ['entregue'],
  entregue: [],
  cancelado: [],
};

function enderecoTexto(e: EnderecoCliente): string {
  const p1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const p2 = [e.bairro, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  return [p1, p2].filter(Boolean).join(' - ');
}

export class PedidosService {
  constructor(
    private readonly pedidos: PedidoRepository,
    private readonly produtos: ProdutoRepository,
    private readonly precos: PrecoBaseRepository,
    private readonly precosCliente: PrecoClienteRepository,
    private readonly clientes: ClienteRepository,
    private readonly estoque: EstoqueRepository,
    private readonly titulos: TituloRepository,
    private readonly condicoes: CondicaoRepository,
  ) {}

  listar(schema: string): Promise<PedidoResumo[]> { return this.pedidos.listar(schema); }

  async obter(schema: string, id: string): Promise<Pedido> {
    const p = await this.pedidos.buscarPorId(schema, id);
    if (!p) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    return p;
  }

  async criar(schema: string, e: any): Promise<{ id: string; numero: number }> {
    if (!e?.clienteId) throw new ErroAplicacao('pedido.cliente_obrigatorio', 400);
    const cliente = await this.clientes.buscarPorId(schema, e.clienteId);
    if (!cliente) throw new ErroAplicacao('pedido.cliente_obrigatorio', 400);
    const itensEntrada = Array.isArray(e?.itens) ? e.itens : [];
    if (itensEntrada.length === 0) throw new ErroAplicacao('pedido.sem_itens', 400);

    const itens: PedidoItem[] = [];
    for (const it of itensEntrada) {
      const prod = await this.produtos.buscarPorId(schema, it?.produtoId);
      if (!prod) throw new ErroAplicacao('pedido.produto_invalido', 400);
      const quantidade = Number(it?.quantidade);
      if (!Number.isFinite(quantidade) || quantidade <= 0) throw new ErroAplicacao('pedido.qtd_invalida', 400);
      const precoUnitario = (await this.precosCliente.precoDe(schema, cliente.id, prod.id)) ?? (await this.precos.precoDe(schema, prod.id));
      const subtotal = Math.round(quantidade * precoUnitario * 100) / 100;
      itens.push({ produtoId: prod.id, produtoNome: prod.nome, quantidade, precoUnitario, subtotal });
    }

    let condParcelas = 1, condIntervalo = 30;
    if (e?.condicaoId) {
      const c = await this.condicoes.buscarPorId(schema, e.condicaoId);
      if (c) { condParcelas = c.parcelas; condIntervalo = c.intervaloDias; }
    }
    const subtotal = Math.round(itens.reduce((acc, i) => acc + i.subtotal, 0) * 100) / 100;
    const frete = Number(e?.frete ?? 0) || 0;
    const total = Math.round((subtotal + frete) * 100) / 100;

    let endereco: string | null = (e?.enderecoEntrega && String(e.enderecoEntrega).trim()) || null;
    if (!endereco) {
      const fav = cliente.enderecos.find((x) => x.favorito) ?? cliente.enderecos[0];
      if (fav) endereco = enderecoTexto(fav);
    }

    const novo: NovoPedido = {
      clienteId: cliente.id, vendedorId: e?.vendedorId || null,
      formaPagamento: (e?.formaPagamento && String(e.formaPagamento).trim()) || null,
      observacao: (e?.observacao && String(e.observacao).trim()) || null,
      enderecoEntrega: endereco, frete, itens, subtotal, total, condicaoParcelas: condParcelas, condicaoIntervalo: condIntervalo,
    };
    const numero = await this.pedidos.proximoNumero(schema);
    const id = await this.pedidos.criar(schema, numero, novo);
    return { id, numero };
  }

  async mudarStatus(schema: string, id: string, novo: StatusPedido): Promise<void> {
    const pedido = await this.pedidos.buscarPorId(schema, id);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    const permitidos = TRANSICOES[pedido.status] ?? [];
    if (!permitidos.includes(novo)) throw new ErroAplicacao('pedido.transicao_invalida', 400);

    // Confirmar (orçamento → aguardando pagamento) comita crédito: checa limite.
    if (novo === 'aguardando_pagamento' && pedido.clienteId) {
      const cliente = await this.clientes.buscarPorId(schema, pedido.clienteId);
      if (cliente && cliente.limiteCredito > 0) {
        const usado = await this.pedidos.somaEmAberto(schema, cliente.id, pedido.id);
        if (usado + pedido.total > cliente.limiteCredito) throw new ErroAplicacao('pedido.limite_estourado', 409);
      }
      // Gera o título a receber do pedido (vencimento padrão em 30 dias).
      const ref = 'Pedido PE-' + String(pedido.numero).padStart(6, '0');
      await this.titulos.criarParcelasDePedido(schema, ref, pedido.clienteNome, pedido.total, pedido.id, pedido.condicaoParcelas, pedido.condicaoIntervalo);
    }
    // Baixa de estoque ao enviar para separação (consome lotes por validade — FIFO).
    if (novo === 'separacao') {
      for (const it of pedido.itens) {
        if (!it.produtoId) continue;
        const disp = await this.estoque.disponivel(schema, it.produtoId);
        if (disp < it.quantidade) throw new ErroAplicacao('estoque.insuficiente', 409);
      }
      const ref = 'Pedido PE-' + String(pedido.numero).padStart(6, '0');
      for (const it of pedido.itens) {
        if (!it.produtoId) continue;
        await this.estoque.baixarFifo(schema, it.produtoId, it.quantidade, ref);
      }
    }

    await this.pedidos.mudarStatus(schema, id, novo);
  }
}
