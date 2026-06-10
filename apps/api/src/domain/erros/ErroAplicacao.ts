// Erro de negocio. A mensagem ao usuario vem por CHAVE i18n (nunca string fixa).
export class ErroAplicacao extends Error {
  constructor(
    public readonly chaveI18n: string,
    public readonly status = 400,
  ) {
    super(chaveI18n);
    this.name = 'ErroAplicacao';
  }
}
