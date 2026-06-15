import type { EmailSender, MensagemEmail } from '../../domain/ports/EmailSender.js';

// Adapter de envio via Resend (https://resend.com), usando o fetch nativo do
// Node (sem dependência nova). Sem API key → no-op (loga e segue), então
// dev/local e ambientes não configurados não quebram.
export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly remetente: string,
  ) {}

  async enviar(msg: MensagemEmail): Promise<void> {
    if (!this.apiKey) {
      console.warn(`[email] RESEND_API_KEY ausente — e-mail "${msg.assunto}" para ${msg.para} NÃO enviado (no-op).`);
      return;
    }
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.remetente,
          to: [msg.para],
          subject: msg.assunto,
          html: msg.html,
          ...(msg.texto ? { text: msg.texto } : {}),
        }),
      });
      if (!resp.ok) {
        const detalhe = await resp.text().catch(() => '');
        console.error(`[email] Resend respondeu ${resp.status}: ${detalhe}`);
      }
    } catch (e) {
      // Best-effort: nunca derruba o fluxo principal (ex.: abrir chamado).
      console.error('[email] falha ao enviar via Resend:', e);
    }
  }
}
