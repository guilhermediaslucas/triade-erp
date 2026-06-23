// Erro de negocio. A mensagem ao usuario vem por CHAVE i18n (nunca string fixa).
export class ErroAplicacao extends Error {
  constructor(
    public readonly chaveI18n: string,
    public readonly status = 400,
    // Detalhe opcional em texto livre (ex.: quais etiquetas duplicaram). NÃO é i18n —
    // é um dado operacional anexado à mensagem (códigos, nomes). O front mostra t(chave) + detalhe.
    public readonly detalhe?: string,
  ) {
    super(chaveI18n);
    this.name = 'ErroAplicacao';
  }
}
