import type { LlmProvider, FerramentaDef, MensagemLlm, RespostaLlm, UsoFerramenta } from '../../domain/ia/LlmProvider.js';

// Adapter da Anthropic Messages API (tool-calling) via fetch nativo (Node 20+).
// Sem dependência nova. Sem a chave, `configurado()` é false e o serviço recusa.
const URL = 'https://api.anthropic.com/v1/messages';

interface BlocoResp { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }

export class ClaudeProvider implements LlmProvider {
  constructor(private readonly apiKey: string) {}

  configurado(): boolean { return this.apiKey.trim().length > 0; }

  async chamar(modelo: string, system: string, mensagens: MensagemLlm[], ferramentas: FerramentaDef[]): Promise<RespostaLlm> {
    const resp = await fetch(URL, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 1024,
        system,
        messages: mensagens,
        tools: ferramentas.length ? ferramentas : undefined,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Anthropic ${resp.status}: ${txt.slice(0, 300)}`);
    }
    const data = (await resp.json()) as { content?: BlocoResp[]; stop_reason?: string };
    const blocos = data.content ?? [];
    const texto = blocos.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim();
    const usos: UsoFerramenta[] = blocos
      .filter((b) => b.type === 'tool_use')
      .map((b) => ({ id: b.id ?? '', name: b.name ?? '', input: b.input ?? {} }));
    return { texto, usos, stopReason: data.stop_reason ?? 'end_turn' };
  }
}
