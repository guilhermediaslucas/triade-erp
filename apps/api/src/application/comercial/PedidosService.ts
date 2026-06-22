import type { NovoPedido, Pedido, PedidoItem, PedidoRepository, PedidoResumo, StatusPedido } from '../../domain/comercial/Pedido.js';
import type { PrecoBaseRepository } from '../../domain/comercial/PrecoBase.js';
import type { PrecoClienteRepository } from '../../domain/comercial/PrecoCliente.js';
import type { ProdutoRepository } from '../../domain/cadastro/Produto.js';
import type { ClienteRepository, EnderecoCliente } from '../../domain/pessoa/Cliente.js';
import type { MotoboyRepository } from '../../domain/pessoa/Motoboy.js';
import type { EstoqueRepository } from '../../domain/estoque/Estoque.js';
import type { EtiquetaRepository } from '../../domain/estoque/Etiqueta.js';
import type { TituloRepository } from '../../domain/financeiro/Titulo.js';
import type { CondicaoRepository } from '../../domain/comercial/Condicao.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { FreteCampanhaRepository } from '../../domain/comercial/FreteCampanha.js';
import type { DescontoPedidoRepository } from '../../domain/comercial/DescontoPedido.js';
import { FORMAS_ENTREGA } from '../../domain/comercial/FreteConfig.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Quem está criando o pedido (vem do token). Usado para travar o vendedor:
// quem não tem a capability "comercial.pedido.vendedor_qualquer" e está vinculado
// a um Vendedor só cria pedido para si mesmo.
export interface AtorPedido { usuarioId: string; superAdmin: boolean; }
const CAP_VENDEDOR_QUALQUER = 'comercial.pedido.vendedor_qualquer';

// IMPORTANTE: 'aguardando_pagamento' → 'aprovado' NÃO é transição manual. A aprovação
// só acontece pela BAIXA do título no Financeiro (FinanceiroService.baixar) ou direto
// p/ Cartão/Dinheiro (liberaDireto), ambos via repositório. Assim o Estoque não consegue
// mandar um pedido para separação sem o aval do Financeiro.
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  orcamento: ['aguardando_pagamento', 'cancelado'],
  aguardando_pagamento: ['orcamento', 'cancelado'],
  aprovado: ['separacao', 'orcamento', 'cancelado'],
  separacao: ['expedido', 'orcamento', 'cancelado'],
  expedido: ['entregue', 'orcamento', 'cancelado'],
  entregue: ['orcamento', 'cancelado'],
  cancelado: [],
};

function normalizarForma(forma: string | null): string {
  return (forma ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function liberaDireto(forma: string | null): boolean {
  const f = normalizarForma(forma);
  return f === 'cartao' || f === 'dinheiro';
}

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
    private readonly etiquetas: EtiquetaRepository,
    private readonly titulos: TituloRepository,
    private readonly condicoes: CondicaoRepository,
    private readonly motoboys: MotoboyRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly freteCampanhas: FreteCampanhaRepository,
    private readonly descontos: DescontoPedidoRepository,
  ) {}

  // Resolve o vendedor efetivo do pedido aplicando a trava:
  // - super-admin ou quem tem a cap "vendedor_qualquer" → usa o vendedor escolhido (livre);
  // - sem a cap, mas vinculado a um Vendedor → FORÇA o próprio (ignora o escolhido);
  // - sem a cap e sem vínculo → livre (não quebra quem já usa hoje).
  private async resolverVendedor(schema: string, ator: AtorPedido | undefined, vendedorSolicitado: string | null): Promise<string | null> {
    if (!ator || ator.superAdmin) return vendedorSolicitado;
    const caps = await this.usuarios.capabilities(schema, ator.usuarioId);
    if (caps.includes(CAP_VENDEDOR_QUALQUER)) return vendedorSolicitado;
    const usr = await this.usuarios.buscarPorId(schema, ator.usuarioId);
    return usr?.vendedorId ?? vendedorSolicitado;
  }

  listar(schema: string): Promise<PedidoResumo[]> { return this.pedidos.listar(schema); }

  async obter(schema: string, id: string): Promise<Pedido> {
    const p = await this.pedidos.buscarPorId(schema, id);
    if (!p) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    return this.comTitulos(schema, p);
  }

  // Consulta por número do pedido (aceita "142" ou "PE-000142").
  async obterPorNumero(schema: string, raw: string): Promise<Pedido> {
    const numero = Number(String(raw ?? '').replace(/\D/g, ''));
    if (!Number.isFinite(numero) || numero <= 0) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    const p = await this.pedidos.buscarPorNumero(schema, numero);
    if (!p) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    return this.comTitulos(schema, p);
  }

  // Anexa o resumo dos títulos a receber do pedido (bloco Financeiro do detalhe).
  private async comTitulos(schema: string, p: Pedido): Promise<Pedido> {
    const tits = await this.titulos.listarPorPedido(schema, p.id);
    p.titulos = tits.map((t) => ({
      id: t.id, tipo: t.tipo,
      numero: t.numero, valor: t.valor, vencimento: t.vencimento,
      status: t.status, pagoEm: t.pagoEm, formaPagamento: t.formaPagamento,
    }));
    return p;
  }

  // Monta e valida o NovoPedido (preços/itens/frete/endereço) a partir do corpo da
  // requisição. Reusado pelo criar e pelo editar (orçamento).
  private async montar(schema: string, e: any, ator?: AtorPedido): Promise<NovoPedido> {
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
      // Bloqueia pedido/orçamento sem estoque suficiente (decisão do Gui).
      const disp = await this.estoque.disponivel(schema, prod.id);
      if (quantidade > disp) throw new ErroAplicacao('estoque.insuficiente', 409);
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

    // Forma de entrega + frete. O cálculo do frete é feito no front (via /frete/calcular);
    // aqui validamos a forma e normalizamos (retirada sempre zera o frete).
    // O MOTOBOY NÃO é escolhido no pedido — ele é definido na EXPEDIÇÃO (etapa Expedido),
    // e é ali que o frete passa a ser atribuído ao motoboy (Gestão de fretes).
    const formaEntrega = String(e?.formaEntrega ?? 'retirada');
    if (!FORMAS_ENTREGA.includes(formaEntrega as any)) throw new ErroAplicacao('frete.forma_invalida', 400);
    const motoboyId: string | null = null;
    const distanciaKm: number | null = formaEntrega === 'motoboy' && e?.distanciaKm != null && Number.isFinite(Number(e.distanciaKm)) ? Number(e.distanciaKm) : null;
    // O frete informado pelo front é o CUSTO real (motoboy/correios). A campanha
    // vigente do cliente determina o que ele PAGA (cobrado); a diferença a empresa absorve.
    const freteInformado = Number(e?.frete ?? 0) || 0;
    const freteCusto = formaEntrega === 'retirada' ? 0 : (freteInformado >= 0 ? freteInformado : 0);
    // cobrado = o que o cliente paga (campanha); motoboy = quanto a empresa paga ao motoboy (conforme 'absorve').
    const resolv = freteCusto > 0 ? await this.freteCampanhas.resolverFrete(schema, cliente.id, freteCusto, subtotal) : { cobrado: 0, motoboy: 0 };
    const frete = resolv.cobrado;
    const freteMotoboy = resolv.motoboy;
    // Desconto no pedido por total (campanha vigente: subtotal ≥ mínimo).
    const desconto = subtotal > 0 ? await this.descontos.descontoVigente(schema, cliente.id, subtotal) : 0;
    const total = Math.round((subtotal - desconto + frete) * 100) / 100;

    let endereco: string | null = (e?.enderecoEntrega && String(e.enderecoEntrega).trim()) || null;
    if (!endereco) {
      const fav = cliente.enderecos.find((x) => x.favorito) ?? cliente.enderecos[0];
      if (fav) endereco = enderecoTexto(fav);
    }

    const vendedorId = await this.resolverVendedor(schema, ator, e?.vendedorId || null);
    return {
      clienteId: cliente.id, vendedorId,
      formaPagamento: (e?.formaPagamento && String(e.formaPagamento).trim()) || null,
      observacao: (e?.observacao && String(e.observacao).trim()) || null,
      enderecoEntrega: endereco, formaEntrega, motoboyId, distanciaKm,
      frete, freteCusto, freteMotoboy, desconto, itens, subtotal, total, condicaoParcelas: condParcelas, condicaoIntervalo: condIntervalo,
    };
  }

  async criar(schema: string, e: any, ator?: AtorPedido): Promise<{ id: string; numero: number }> {
    const novo = await this.montar(schema, e, ator);
    const numero = await this.pedidos.proximoNumero(schema);
    const id = await this.pedidos.criar(schema, numero, novo);
    return { id, numero };
  }

  // Edita um pedido — só permitido enquanto ele é ORÇAMENTO (rascunho). Recalcula
  // preços/itens/totais com a tabela de preço atual e regrava. Depois disso o usuário
  // pode confirmar (orçamento → aguardando pagamento) e ele "vira pedido".
  async editar(schema: string, id: string, e: any, ator?: AtorPedido): Promise<{ id: string }> {
    const pedido = await this.pedidos.buscarPorId(schema, id);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    if (pedido.status !== 'orcamento') throw new ErroAplicacao('pedido.so_orcamento_edita', 400);
    const novo = await this.montar(schema, e, ator);
    await this.pedidos.editar(schema, id, novo);
    return { id };
  }

  async mudarStatus(schema: string, id: string, novo: StatusPedido, dados?: { formaEnvio?: any; formaEnvioDetalhe?: any; entregueEm?: any; recebidoPor?: any; motoboyId?: any }, ator?: string | null): Promise<void> {
    const pedido = await this.pedidos.buscarPorId(schema, id);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    const permitidos = TRANSICOES[pedido.status] ?? [];
    if (!permitidos.includes(novo)) throw new ErroAplicacao('pedido.transicao_invalida', 400);

    // Expedir exige a forma de envio; entregar exige a data de entrega (espelha o mockup).
    const formaEnvio = String(dados?.formaEnvio ?? '').trim();
    const entregueEm = dados?.entregueEm && /^\d{4}-\d{2}-\d{2}$/.test(String(dados.entregueEm)) ? String(dados.entregueEm) : '';
    const recebidoPor = (dados?.recebidoPor && String(dados.recebidoPor).trim()) || null;
    if (novo === 'expedido' && !formaEnvio) throw new ErroAplicacao('pedido.forma_envio_obrigatoria', 400);
    if (novo === 'entregue' && !entregueEm) throw new ErroAplicacao('pedido.data_entrega_obrigatoria', 400);
    if (novo === 'entregue' && !recebidoPor) throw new ErroAplicacao('pedido.recebido_obrigatorio', 400);

    // Entrega por MOTOBOY: o motoboy é escolhido AGORA (na expedição), de um cadastro
    // existente. O frete do pedido passa a ser atribuído a ele (Gestão de fretes).
    let motoboyExpedicao: string | null = null;
    if (novo === 'expedido' && pedido.formaEntrega === 'motoboy') {
      motoboyExpedicao = (dados?.motoboyId && String(dados.motoboyId).trim()) || null;
      if (!motoboyExpedicao) throw new ErroAplicacao('pedido.motoboy_obrigatorio', 400);
      const mb = await this.motoboys.buscarPorId(schema, motoboyExpedicao);
      if (!mb) throw new ErroAplicacao('pedido.motoboy_invalido', 400);
    }

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

    // Cancelar (de qualquer etapa): devolve estoque + etiquetas e cancela os títulos do pedido.
    // Se algum título já estiver pago, bloqueia (precisa cancelar a baixa no Financeiro antes).
    if (novo === 'cancelado') {
      const ref = 'Pedido PE-' + String(pedido.numero).padStart(6, '0');
      const tits = await this.titulos.listarPorPedido(schema, pedido.id);
      if (tits.some((t) => t.status === 'pago')) throw new ErroAplicacao('pedido.cancelar_baixa_antes', 409);
      await this.estoque.devolverPorRef(schema, ref);
      await this.etiquetas.reverterPorPedido(schema, ref);
      for (const t of tits) await this.titulos.excluir(schema, t.id);
    }

    // Voltar para orçamento (de qualquer etapa): segue a mesma lógica do cancelar —
    // devolve estoque + etiquetas e remove os títulos do pedido (mas o pedido volta a
    // ser orçamento, não cancelado). Se algum título já foi baixado, bloqueia.
    if (novo === 'orcamento') {
      const ref = 'Pedido PE-' + String(pedido.numero).padStart(6, '0');
      const tits = await this.titulos.listarPorPedido(schema, pedido.id);
      if (tits.some((t) => t.status === 'pago')) throw new ErroAplicacao('pedido.voltar_baixa_antes', 409);
      await this.estoque.devolverPorRef(schema, ref);
      await this.etiquetas.reverterPorPedido(schema, ref);
      for (const t of tits) await this.titulos.excluir(schema, t.id);
    }

    await this.pedidos.mudarStatus(schema, id, novo);
    if (novo === 'expedido') {
      await this.pedidos.definirExpedicao(schema, id, formaEnvio, (String(dados?.formaEnvioDetalhe ?? '').trim()) || null);
      if (motoboyExpedicao) await this.pedidos.definirMotoboy(schema, id, motoboyExpedicao);
      await this.pedidos.logExpedicao(schema, id, ator ?? null);
    }
    if (novo === 'entregue') await this.pedidos.definirEntrega(schema, id, entregueEm, recebidoPor);

    // Gate por forma de pagamento (espelha o mockup): Cartão/Dinheiro liberam direto
    // (pulam a espera → já vão para 'aprovado'); Pix/Boleto ficam em 'aguardando_pagamento'
    // até a baixa do título no Financeiro (ver FinanceiroService.baixar).
    if (novo === 'aguardando_pagamento' && liberaDireto(pedido.formaPagamento)) {
      await this.pedidos.mudarStatus(schema, id, 'aprovado');
    }
  }

  // Expedição pode trocar a forma de entrega mediante justificativa (registra quem fez no histórico).
  async alterarFormaEntrega(schema: string, id: string, dados: any, ator?: string | null): Promise<void> {
    const pedido = await this.pedidos.buscarPorId(schema, id);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    const forma = String(dados?.formaEntrega ?? '').trim();
    if (!FORMAS_ENTREGA.includes(forma as any)) throw new ErroAplicacao('frete.forma_invalida', 400);
    const justificativa = String(dados?.justificativa ?? '').trim();
    if (justificativa.length < 3) throw new ErroAplicacao('pedido.justificativa_obrigatoria', 400);
    let motoboyId: string | null = null;
    if (forma === 'motoboy') {
      motoboyId = String(dados?.motoboyId ?? '').trim() || null;
      if (!motoboyId) throw new ErroAplicacao('pedido.motoboy_obrigatorio', 400);
      if (!(await this.motoboys.buscarPorId(schema, motoboyId))) throw new ErroAplicacao('pedido.motoboy_invalido', 400);
    }
    await this.pedidos.alterarFormaEntrega(schema, id, forma, motoboyId, {
      de: pedido.formaEntrega, para: forma, justificativa, usuarioNome: ator ?? null, criadoEm: new Date().toISOString(),
    });
  }
  historicoFormaEntrega(schema: string, id: string) { return this.pedidos.historicoFormaEntrega(schema, id); }

  // Separacao por BIPAGEM: le a etiqueta de cada item; o codigo traz produto/lote/validade.
  // Casa com o pedido pelo produto, da baixa do lote especifico da etiqueta e consome a etiqueta.
  // Exige que TODOS os itens sejam bipados na quantidade certa. Move o pedido para 'separacao'.
  async separarBipando(schema: string, id: string, codigosRaw: any, ator?: string | null): Promise<void> {
    const pedido = await this.pedidos.buscarPorId(schema, id);
    if (!pedido) throw new ErroAplicacao('pedido.nao_encontrado', 404);
    if (!(TRANSICOES[pedido.status] ?? []).includes('separacao')) throw new ErroAplicacao('pedido.transicao_invalida', 400);

    const codigos: string[] = Array.isArray(codigosRaw)
      ? codigosRaw.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
      : [];
    if (codigos.length === 0) throw new ErroAplicacao('etiqueta.bipe_obrigatorio', 400);
    if (new Set(codigos).size !== codigos.length) throw new ErroAplicacao('etiqueta.duplicada_leitura', 400);

    // Resolve cada etiqueta e valida contra o pedido + estoque.
    const resolvidas: Array<{ codigo: string; loteId: string; produtoId: string }> = [];
    const porProduto = new Map<string, number>();
    for (const codigo of codigos) {
      const et = await this.etiquetas.buscarPorCodigo(schema, codigo);
      if (!et) throw new ErroAplicacao('etiqueta.nao_encontrada', 404);
      if (et.status !== 'estoque') throw new ErroAplicacao('etiqueta.fora_estoque', 409);
      const item = pedido.itens.find((i) => i.produtoId === et.produtoId);
      if (!item) throw new ErroAplicacao('etiqueta.fora_pedido', 400);
      porProduto.set(et.produtoId, (porProduto.get(et.produtoId) ?? 0) + 1);
      resolvidas.push({ codigo, loteId: et.loteId, produtoId: et.produtoId });
    }
    // Cada item do pedido precisa estar bipado na quantidade exata.
    for (const it of pedido.itens) {
      if (!it.produtoId) continue;
      if ((porProduto.get(it.produtoId) ?? 0) !== it.quantidade) throw new ErroAplicacao('separacao.incompleta', 400);
    }

    const ref = 'Pedido PE-' + String(pedido.numero).padStart(6, '0');
    for (const r of resolvidas) {
      await this.estoque.baixarUnidadeLote(schema, r.loteId, r.produtoId, ref);
      await this.etiquetas.consumir(schema, r.codigo, 'saida', ref);
    }
    await this.pedidos.mudarStatus(schema, id, 'separacao');
    await this.pedidos.logSeparacao(schema, id, ator ?? null);
  }
}
