import type { LlmProvider, FerramentaDef, MensagemLlm } from '../../domain/ia/LlmProvider.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Serviços de LEITURA que viram ferramentas (tipagem estrutural — bate com os
// serviços reais sem precisar importar as classes concretas).
export interface ServicosLeitura {
  dashboard: { resumo(schema: string): Promise<unknown> };
  pedidos: { listar(schema: string): Promise<unknown[]> };
  estoque: { posicao(schema: string): Promise<unknown[]> };
  financeiro: { listar(schema: string, tipo: 'receber' | 'pagar'): Promise<unknown[]> };
}

interface Ferramenta {
  def: FerramentaDef;
  /** any-of: basta ter UMA das caps (null = livre p/ quem usa o assistente). */
  caps: string[] | null;
  run: (schema: string, input: Record<string, unknown>) => Promise<unknown>;
}

export interface ContextoIA { schema: string; sub: string; superAdmin: boolean }
export interface RespostaIA { resposta: string; modelo: string }

const OBJ_VAZIO = { type: 'object', properties: {} } as Record<string, unknown>;

export class AssistenteService {
  private readonly tools: Ferramenta[];

  constructor(
    private readonly llm: LlmProvider,
    private readonly configurado: boolean,
    private readonly usuarios: UsuarioRepository,
    serv: ServicosLeitura,
    private readonly modeloBase: string,
    private readonly modeloAvancado: string,
  ) {
    this.tools = [
      {
        def: { name: 'resumo_geral', description: 'Visão geral do mês: faturamento, nº de pedidos, ticket médio, a receber/pagar, estoque baixo e top produtos.', input_schema: OBJ_VAZIO },
        caps: ['dashboard.ver'],
        run: (schema) => serv.dashboard.resumo(schema),
      },
      {
        def: { name: 'listar_pedidos', description: 'Lista os pedidos (nº, cliente, vendedor, status, total). Use para perguntas sobre pedidos/vendas por status ou cliente.', input_schema: OBJ_VAZIO },
        caps: ['comercial.pedido.listar'],
        run: async (schema) => (await serv.pedidos.listar(schema)).slice(0, 60),
      },
      {
        def: { name: 'estoque_posicao', description: 'Saldo de estoque por produto, incluindo quais estão abaixo do mínimo.', input_schema: OBJ_VAZIO },
        caps: ['estoque.saldo.ver'],
        run: async (schema) => (await serv.estoque.posicao(schema)).slice(0, 80),
      },
      {
        def: {
          name: 'titulos_financeiros',
          description: 'Títulos a receber ou a pagar (valor, vencimento, status). Informe o tipo.',
          input_schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['receber', 'pagar'] } }, required: ['tipo'] },
        },
        caps: ['financeiro.receber.listar', 'financeiro.pagar.listar'],
        run: async (schema, input) => {
          const tipo = input?.tipo === 'pagar' ? 'pagar' : 'receber';
          return (await serv.financeiro.listar(schema, tipo)).slice(0, 80);
        },
      },
    ];
  }

  private system(): string {
    const hoje = new Date().toLocaleDateString('pt-BR');
    return [
      'Você é o assistente do TRÍADE ERP (distribuição B2B de produtos estéticos).',
      `Hoje é ${hoje}. Responda SEMPRE em português do Brasil, de forma curta e direta.`,
      'Use as ferramentas para buscar os dados reais da empresa antes de responder — nunca invente números.',
      'Formate valores em reais (R$). Se não houver dados, diga que não há.',
      'Esta versão é só de CONSULTA: se pedirem para criar/editar/excluir algo, explique que por enquanto você apenas responde, e que ações virão numa próxima versão.',
    ].join(' ');
  }

  async perguntar(ctx: ContextoIA, texto: string, historico: MensagemLlm[] = []): Promise<RespostaIA> {
    if (!this.configurado) throw new ErroAplicacao('ia.nao_configurada', 503);
    if (!texto || !texto.trim()) throw new ErroAplicacao('ia.pergunta_vazia', 400);

    const caps = ctx.superAdmin ? null : await this.usuarios.capabilities(ctx.schema, ctx.sub);
    const tem = (c: string) => ctx.superAdmin || (caps?.includes(c) ?? false);
    const modelo = tem('ia.modelo_avancado') ? this.modeloAvancado : this.modeloBase;
    const ferramentas = this.tools.filter((f) => !f.caps || f.caps.some(tem));
    const defs = ferramentas.map((f) => f.def);

    const mensagens: MensagemLlm[] = [...historico.slice(-8), { role: 'user', content: texto.trim() }];

    for (let i = 0; i < 5; i++) {
      const r = await this.llm.chamar(modelo, this.system(), mensagens, defs);
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
        resultados.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(saida).slice(0, 6000) });
      }
      mensagens.push({ role: 'user', content: resultados });
    }
    return { resposta: 'Não consegui concluir a consulta agora.', modelo };
  }
}
