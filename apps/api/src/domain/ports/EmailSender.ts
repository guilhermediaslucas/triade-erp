// Porta para envio de e-mail transacional (impl. com Resend na infra).
// O domínio/aplicação só conhece esta interface — trocar de provedor não
// afeta a regra de negócio.
export interface MensagemEmail {
  para: string;
  assunto: string;
  html: string;
  texto?: string;
}

export interface EmailSender {
  // Envia o e-mail. Best-effort: a implementação não deve lançar para o caller
  // (notificação não pode derrubar o fluxo principal); loga e segue em caso de erro.
  enviar(msg: MensagemEmail): Promise<void>;
}
