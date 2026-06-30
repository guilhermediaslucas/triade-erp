import type { LlmProvider, FerramentaDef, MensagemLlm } from '../../domain/ia/LlmProvider.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Serviços usados pelas ferramentas (tipagem estrutural — bate com os serviços
// reais sem importar as classes concretas).
export interface ServicosIA {
  dashboard: { resumo(schema: string): Promise<unknown> };
  pedidos: { listar(schema: string): Promise<unknown[]> };
  estoque: { posicao(schema: string): Promise<unknown[]> };
  financeiro: { listar(schema: string, tipo: 'receber' | 'pagar'): Promise<unknown[]> };
  clientes: { criar(schema: string, e: unknown): Promise<string> };
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
      { def: { name: 'resumo_geral', description: 'Visão geral do mês: faturamento, nº de pedidos, ticket médio, a receber/pagar, estoque baixo e top produtos.', input_schema: OBJ_VAZIO },
        caps: ['dashboard.ver'], run: (s) => serv.dashboard.resumo(s) },
      { def: { name: 'listar_pedidos', description: 'Lista os pedidos (nº, cliente, vendedor, status, total). Use para perguntas sobre pedidos/vendas por status ou cliente.', input_schema: OBJ_VAZIO },
        caps: ['comercial.pedido.listar'], run: async (s) => (await serv.pedidos.listar(s)).slice(0, 60) },
      { def: { name: 'estoque_posicao', description: 'Saldo de estoque por produto, incluindo quais estão abaixo do mínimo.', input_schema: OBJ_VAZIO },
        caps: ['estoque.saldo.ver'], run: async (s) => (await serv.estoque.posicao(s)).slice(0, 80) },
      { def: { name: 'titulos_financeiros', description: 'Títulos a receber ou a pagar (valor, vencimento, status). Informe o tipo.',
          input_schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['receber', 'pagar'] } }, required: ['tipo'] } },
        caps: ['financeiro.receber.listar', 'financeiro.pagar.listar'],
        run: async (s, i) => (await serv.financeiro.listar(s, i?.tipo === 'pagar' ? 'pagar' : 'receber')).slice(0, 80) },

      // ---- AÇÃO (Fase 2): propõe; só aplica após confirmação do usuário ----
      { def: {
          name: 'propor_criar_cliente',
          description: 'Propõe cadastrar um novo cliente (clínica). Use quando o usuário pedir para criar/cadastrar um cliente. NÃO confirma sozinho — retorna uma proposta para o usuário confirmar na tela.',
          input_schema: { type: 'object', properties: {
            nome: { type: 'string', description: 'Razão social ou nome' },
            tipoPessoa: { type: 'string', enum: ['PF', 'PJ'] },
            documento: { type: 'string', description: 'CPF ou CNPJ' },
            email: { type: 'string' }, telefone: { type: 'string' },
            limiteCredito: { type: 'number' },
          }, required: ['nome'] } },
        caps: ['cadastros.cliente.gerenciar'],
        run: async (_s, input) => ({ __proposta: this.propostaCliente(input) }) },
    ];
  }

  private propostaCliente(input: Record<string, unknown>): Proposta {
    const tipoPessoa = input.tipoPessoa === 'PF' ? 'PF' : 'PJ';
    const resumo: [string, string][] = [
      ['Nome', String(input.nome ?? '')],
      ['Tipo', tipoPessoa === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'],
    ];
    if (input.documento) resumo.push(['Documento', String(input.documento)]);
    if (input.email) resumo.push(['E-mail', String(input.email)]);
    if (input.telefone) resumo.push(['Telefone', String(input.telefone)]);
    if (input.limiteCredito) resumo.push(['Limite de crédito', 'R$ ' + Number(input.limiteCredito).toLocaleString('pt-BR')]);
    return { tipo: 'criar_cliente', titulo: 'Criar cliente', resumo, dados: { ...input, tipoPessoa } };
  }

  private system(podeAgir: boolean): string {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const base = [
      'Você é o assistente do TRÍADE ERP (distribuição B2B de produtos estéticos).',
      `Hoje é ${hoje}. Responda SEMPRE em português do Brasil, de forma curta e direta.`,
      'Use as ferramentas para buscar os dados reais da empresa antes de responder — nunca invente números. Formate valores em R$.',
    ];
    if (podeAgir) base.push('Se o usuário pedir para CRIAR/CADASTRAR um cliente, chame propor_criar_cliente com os dados que extrair — NÃO diga que já criou; é uma proposta que o usuário confirma na tela. Para criar pedidos/títulos/produtos, diga que essas ações chegam numa próxima versão.');
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

    for (let i = 0; i < 5; i++) {
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
        // ação proposta: interrompe e devolve para o usuário confirmar.
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

    if (proposta?.tipo === 'criar_cliente') {
      if (!tem('cadastros.cliente.gerenciar')) throw new ErroAplicacao('auth.sem_permissao', 403);
      await this.serv.clientes.criar(ctx.schema, proposta.dados);
      return { mensagem: `Cliente "${String(proposta.dados?.nome ?? '')}" criado com sucesso.` };
    }
    throw new ErroAplicacao('ia.acao_desconhecida', 400);
  }
}
