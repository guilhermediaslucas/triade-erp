import type { LlmProvider, FerramentaDef, MensagemLlm } from '../../domain/ia/LlmProvider.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Serviços usados pelas ferramentas (tipagem estrutural — bate com os serviços
// reais sem importar as classes concretas).
export interface ServicosIA {
  dashboard: { resumo(schema: string): Promise<unknown> };
  pedidos: {
    listar(schema: string): Promise<unknown[]>;
    criar(schema: string, e: unknown, ator: { usuarioId: string; superAdmin: boolean }): Promise<{ id: string; numero: number }>;
  };
  estoque: { posicao(schema: string): Promise<unknown[]> };
  financeiro: {
    listar(schema: string, tipo: 'receber' | 'pagar'): Promise<unknown[]>;
    criar(schema: string, tipo: 'receber' | 'pagar', e: unknown): Promise<string>;
  };
  clientes: { criar(schema: string, e: unknown): Promise<string>; listar(schema: string): Promise<unknown[]> };
  produtos: { listar(schema: string): Promise<unknown[]> };
  categoriasFinanceiras: { listar(schema: string): Promise<unknown[]> };
}

interface Ferramenta {
  def: FerramentaDef;
  caps: string[] | null; // any-of (null = livre p/ quem usa o assistente)
  run: (schema: string, input: Record<string, unknown>) => Promise<unknown>;
}

export interface Proposta { tipo: string; titulo: string; resumo: [string, string][]; dados: Record<string, unknown> }
export interface ContextoIA { schema: string; sub: string; superAdmin: boolean }
export interface RespostaIA { resposta: string; modelo: string; proposta?: Proposta }

const OBJ_VAZIO = { type: 'object', properties: {} } as Record<string, unknown>;
const brl = (v: unknown) => 'R$ ' + Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export class AssistenteService {
  private readonly tools: Ferramenta[];

  constructor(
    private readonly llm: LlmProvider,
    private readonly configurado: boolean,
    private readonly usuarios: UsuarioRepository,
    private readonly serv: ServicosIA,
    private readonly modeloBase: string,
    private readonly modeloAvancado: string,
  ) {
    this.tools = [
      // ---- Leitura ----
      { def: { name: 'resumo_geral', description: 'Visão geral do mês: faturamento, nº de pedidos, ticket médio, a receber/pagar, estoque baixo e top produtos.', input_schema: OBJ_VAZIO },
        caps: ['dashboard.ver'], run: (s) => serv.dashboard.resumo(s) },
      { def: { name: 'listar_pedidos', description: 'Lista os pedidos (nº, cliente, vendedor, status, total).', input_schema: OBJ_VAZIO },
        caps: ['comercial.pedido.listar'], run: async (s) => (await serv.pedidos.listar(s)).slice(0, 60) },
      { def: { name: 'estoque_posicao', description: 'Saldo de estoque por produto, incluindo quais estão abaixo do mínimo.', input_schema: OBJ_VAZIO },
        caps: ['estoque.saldo.ver'], run: async (s) => (await serv.estoque.posicao(s)).slice(0, 80) },
      { def: { name: 'titulos_financeiros', description: 'Títulos a receber ou a pagar (valor, vencimento, status). Informe o tipo.',
          input_schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['receber', 'pagar'] } }, required: ['tipo'] } },
        caps: ['financeiro.receber.listar', 'financeiro.pagar.listar'],
        run: async (s, i) => (await serv.financeiro.listar(s, i?.tipo === 'pagar' ? 'pagar' : 'receber')).slice(0, 80) },
      { def: { name: 'listar_clientes', description: 'Lista clientes com id e nome — use para achar o id de um cliente pelo nome antes de criar um pedido.', input_schema: OBJ_VAZIO },
        caps: ['cadastros.cliente.listar'], run: async (s) => (await serv.clientes.listar(s)).slice(0, 120) },
      { def: { name: 'listar_produtos', description: 'Lista produtos com id, nome e preço — use para achar o id de um produto pelo nome antes de criar um pedido.', input_schema: OBJ_VAZIO },
        caps: ['cadastros.produto.listar'], run: async (s) => (await serv.produtos.listar(s)).slice(0, 200) },
      { def: { name: 'listar_categorias_financeiras', description: 'Lista as categorias financeiras com id e nome — use para achar o categoriaFinanceiraId antes de criar um título.', input_schema: OBJ_VAZIO },
        caps: ['cadastros.catfin.listar'], run: async (s) => (await serv.categoriasFinanceiras.listar(s)).slice(0, 120) },

      // ---- Ações (propõem; só aplicam após confirmação) ----
      { def: { name: 'propor_criar_cliente', description: 'Propõe cadastrar um novo cliente. NÃO confirma sozinho — retorna proposta para o usuário confirmar.',
          input_schema: { type: 'object', properties: {
            nome: { type: 'string' }, tipoPessoa: { type: 'string', enum: ['PF', 'PJ'] },
            documento: { type: 'string' }, email: { type: 'string' }, telefone: { type: 'string' }, limiteCredito: { type: 'number' },
          }, required: ['nome'] } },
        caps: ['cadastros.cliente.gerenciar'], run: async (_s, i) => ({ __proposta: this.propostaCliente(i) }) },
      { def: { name: 'propor_criar_pedido', description: 'Propõe criar um pedido. Antes, use listar_clientes e listar_produtos para achar os ids. Passe clienteId + itens (produtoId e quantidade), e também os nomes para o resumo.',
          input_schema: { type: 'object', properties: {
            clienteId: { type: 'string' }, clienteNome: { type: 'string' },
            itens: { type: 'array', items: { type: 'object', properties: { produtoId: { type: 'string' }, produtoNome: { type: 'string' }, quantidade: { type: 'number' } }, required: ['produtoId', 'quantidade'] } },
            formaPagamento: { type: 'string' },
          }, required: ['clienteId', 'itens'] } },
        caps: ['comercial.pedido.criar'], run: async (_s, i) => ({ __proposta: this.propostaPedido(i) }) },
      { def: { name: 'propor_criar_titulo', description: 'Propõe criar um título financeiro (a pagar/receber). Antes, use listar_categorias_financeiras para achar o categoriaFinanceiraId. emissao no formato AAAA-MM-DD (use hoje se não informado).',
          input_schema: { type: 'object', properties: {
            tipo: { type: 'string', enum: ['receber', 'pagar'] }, descricao: { type: 'string' }, pessoaNome: { type: 'string' },
            valor: { type: 'number' }, vencimento: { type: 'string' }, emissao: { type: 'string' },
            tipoDocumento: { type: 'string' }, numeroDocumento: { type: 'string' },
            categoriaFinanceiraId: { type: 'string' }, categoriaNome: { type: 'string' },
          }, required: ['tipo', 'descricao', 'pessoaNome', 'valor', 'vencimento', 'tipoDocumento', 'numeroDocumento', 'categoriaFinanceiraId'] } },
        caps: ['financeiro.pagar.gerenciar', 'financeiro.receber.gerenciar'], run: async (_s, i) => ({ __proposta: this.propostaTitulo(i) }) },
    ];
  }

  private propostaCliente(input: Record<string, unknown>): Proposta {
    const tipoPessoa = input.tipoPessoa === 'PF' ? 'PF' : 'PJ';
    const resumo: [string, string][] = [['Nome', String(input.nome ?? '')], ['Tipo', tipoPessoa === 'PF' ? 'Pessoa física' : 'Pessoa jurídica']];
    if (input.documento) resumo.push(['Documento', String(input.documento)]);
    if (input.email) resumo.push(['E-mail', String(input.email)]);
    if (input.telefone) resumo.push(['Telefone', String(input.telefone)]);
    if (input.limiteCredito) resumo.push(['Limite de crédito', brl(input.limiteCredito)]);
    return { tipo: 'criar_cliente', titulo: 'Criar cliente', resumo, dados: { ...input, tipoPessoa } };
  }

  private propostaPedido(input: Record<string, unknown>): Proposta {
    const itens = Array.isArray(input.itens) ? (input.itens as Record<string, unknown>[]) : [];
    const resumo: [string, string][] = [['Cliente', String(input.clienteNome ?? input.clienteId ?? '')]];
    for (const it of itens) resumo.push(['Item', `${Number(it.quantidade ?? 1)}x ${String(it.produtoNome ?? it.produtoId ?? '')}`]);
    if (input.formaPagamento) resumo.push(['Pagamento', String(input.formaPagamento)]);
    const dados = {
      clienteId: input.clienteId,
      itens: itens.map((it) => ({ produtoId: it.produtoId, quantidade: Number(it.quantidade ?? 1) })),
      formaPagamento: input.formaPagamento,
    };
    return { tipo: 'criar_pedido', titulo: 'Criar pedido', resumo, dados };
  }

  private propostaTitulo(input: Record<string, unknown>): Proposta {
    const tipo = input.tipo === 'pagar' ? 'pagar' : 'receber';
    const hoje = new Date().toISOString().slice(0, 10);
    const dados = { ...input, tipo, emissao: (input.emissao && String(input.emissao)) || hoje };
    const resumo: [string, string][] = [
      ['Tipo', tipo === 'pagar' ? 'A pagar' : 'A receber'],
      ['Descrição', String(input.descricao ?? '')],
      ['Pessoa', String(input.pessoaNome ?? '')],
      ['Valor', brl(input.valor)],
      ['Vencimento', String(input.vencimento ?? '')],
    ];
    if (input.categoriaNome) resumo.push(['Categoria', String(input.categoriaNome)]);
    return { tipo: 'criar_titulo', titulo: tipo === 'pagar' ? 'Criar conta a pagar' : 'Criar conta a receber', resumo, dados };
  }

  private system(podeAgir: boolean): string {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const base = [
      'Você é o assistente do TRÍADE ERP (distribuição B2B de produtos estéticos).',
      `Hoje é ${hoje}. Responda SEMPRE em português do Brasil, de forma curta e direta.`,
      'Use as ferramentas para buscar os dados reais antes de responder — nunca invente números. Formate valores em R$.',
    ];
    if (podeAgir) base.push('Para CRIAR algo (cliente, pedido ou título): primeiro use as ferramentas de listagem (listar_clientes, listar_produtos, listar_categorias_financeiras) para achar os ids necessários; depois chame a ferramenta propor_* correspondente passando ids e nomes. NUNCA diga que já criou — é uma proposta que o usuário confirma na tela.');
    else base.push('Esta versão é só de CONSULTA: se pedirem para criar/editar/excluir, explique que por enquanto você apenas responde.');
    return base.join(' ');
  }

  async perguntar(ctx: ContextoIA, texto: string, historico: MensagemLlm[] = []): Promise<RespostaIA> {
    if (!this.configurado) throw new ErroAplicacao('ia.nao_configurada', 503);
    if (!texto || !texto.trim()) throw new ErroAplicacao('ia.pergunta_vazia', 400);

    const caps = ctx.superAdmin ? null : await this.usuarios.capabilities(ctx.schema, ctx.sub);
    const tem = (c: string) => ctx.superAdmin || (caps?.includes(c) ?? false);
    const modelo = tem('ia.modelo_avancado') ? this.modeloAvancado : this.modeloBase;
    const ferramentas = this.tools.filter((f) => !f.caps || f.caps.some(tem));
    const podeAgir = ferramentas.some((f) => f.def.name.startsWith('propor_'));
    const defs = ferramentas.map((f) => f.def);

    const mensagens: MensagemLlm[] = [...historico.slice(-8), { role: 'user', content: texto.trim() }];

    for (let i = 0; i < 6; i++) {
      const r = await this.llm.chamar(modelo, this.system(podeAgir), mensagens, defs);
      if (r.usos.length === 0) return { resposta: r.texto || '(sem resposta)', modelo };

      const blocosAssist: unknown[] = [];
      if (r.texto) blocosAssist.push({ type: 'text', text: r.texto });
      for (const u of r.usos) blocosAssist.push({ type: 'tool_use', id: u.id, name: u.name, input: u.input });
      mensagens.push({ role: 'assistant', content: blocosAssist });

      const resultados: unknown[] = [];
      for (const u of r.usos) {
        const f = ferramentas.find((x) => x.def.name === u.name);
        let saida: unknown;
        try { saida = f ? await f.run(ctx.schema, u.input) : { erro: 'ferramenta indisponível' }; }
        catch (e) { saida = { erro: String((e as Error)?.message ?? e) }; }
        const prop = (saida as { __proposta?: Proposta })?.__proposta;
        if (prop) return { resposta: r.texto || 'Revise a ação abaixo e confirme:', modelo, proposta: prop };
        resultados.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(saida).slice(0, 6000) });
      }
      mensagens.push({ role: 'user', content: resultados });
    }
    return { resposta: 'Não consegui concluir a consulta agora.', modelo };
  }

  /** Aplica uma proposta confirmada pelo usuário (gate pela capability de escrita). */
  async aplicar(ctx: ContextoIA, proposta: Proposta): Promise<{ mensagem: string }> {
    const caps = ctx.superAdmin ? null : await this.usuarios.capabilities(ctx.schema, ctx.sub);
    const tem = (c: string) => ctx.superAdmin || (caps?.includes(c) ?? false);
    const nega = () => { throw new ErroAplicacao('auth.sem_permissao', 403); };

    if (proposta?.tipo === 'criar_cliente') {
      if (!tem('cadastros.cliente.gerenciar')) nega();
      await this.serv.clientes.criar(ctx.schema, proposta.dados);
      return { mensagem: `Cliente "${String(proposta.dados?.nome ?? '')}" criado com sucesso.` };
    }
    if (proposta?.tipo === 'criar_pedido') {
      if (!tem('comercial.pedido.criar')) nega();
      const out = await this.serv.pedidos.criar(ctx.schema, proposta.dados, { usuarioId: ctx.sub, superAdmin: ctx.superAdmin });
      return { mensagem: `Pedido nº ${out.numero} criado com sucesso.` };
    }
    if (proposta?.tipo === 'criar_titulo') {
      const tipo = proposta.dados?.tipo === 'pagar' ? 'pagar' : 'receber';
      if (!tem(tipo === 'pagar' ? 'financeiro.pagar.gerenciar' : 'financeiro.receber.gerenciar')) nega();
      await this.serv.financeiro.criar(ctx.schema, tipo, proposta.dados);
      return { mensagem: `Título (${tipo === 'pagar' ? 'a pagar' : 'a receber'}) criado com sucesso.` };
    }
    throw new ErroAplicacao('ia.acao_desconhecida', 400);
  }
}
