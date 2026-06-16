// Porta para armazenamento de arquivos (impl. com Cloudflare R2 / S3 na infra).
// O domínio/aplicação não conhece o provedor.
export interface ArquivoBaixado {
  body: unknown;            // stream (Readable) do conteúdo do arquivo
  contentType: string;
}

export interface ArquivoStorage {
  // true quando há credenciais configuradas (recurso de anexos habilitado).
  configurado(): boolean;
  enviar(chave: string, conteudo: Buffer, contentType: string): Promise<void>;
  baixar(chave: string): Promise<ArquivoBaixado>;
  remover(chave: string): Promise<void>;
}
