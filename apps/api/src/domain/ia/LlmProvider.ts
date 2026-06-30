// Porta (agnóstica) para um provedor de LLM com tool-calling. O domínio/aplicação
// não conhece a API concreta — o adapter (infra/ia) implementa esta interface.

export interface FerramentaDef {
  name: string;
  description: string;
  /** JSON Schema dos parâmetros (objeto). */
  input_schema: Record<string, unknown>;
}

export interface UsoFerramenta {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// Mensagem no formato de blocos (compatível com a Messages API): content pode ser
// string (texto) ou um array de blocos (text / tool_use / tool_result).
export interface MensagemLlm {
  role: 'user' | 'assistant';
  content: unknown;
}

export interface RespostaLlm {
  texto: string;
  usos: UsoFerramenta[];
  stopReason: string;
}

export interface LlmProvider {
  /** Uma chamada ao modelo. Retorna texto e/ou pedidos de ferramenta (tool_use). */
  chamar(modelo: string, system: string, mensagens: MensagemLlm[], ferramentas: FerramentaDef[]): Promise<RespostaLlm>;
}
