import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { ArquivoBaixado, ArquivoStorage } from '../../domain/ports/ArquivoStorage.js';

// Adapter S3-compatível para o Cloudflare R2. Sem credenciais, fica desligado
// (configurado() = false) — o recurso de anexos simplesmente não aparece/funciona.
export class R2Storage implements ArquivoStorage {
  private readonly cliente: S3Client | null;

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    private readonly bucket: string,
  ) {
    this.cliente = accountId && accessKeyId && secretAccessKey && bucket
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId, secretAccessKey },
          // O R2 não implementa os checksums (CRC32) que o aws-sdk recente envia por
          // padrão — isso quebra o upload. Só calcular/validar quando realmente exigido.
          requestChecksumCalculation: 'WHEN_REQUIRED',
          responseChecksumValidation: 'WHEN_REQUIRED',
        })
      : null;
  }

  configurado(): boolean { return this.cliente != null; }

  async enviar(chave: string, conteudo: Buffer, contentType: string): Promise<void> {
    if (!this.cliente) throw new Error('R2 não configurado');
    await this.cliente.send(new PutObjectCommand({ Bucket: this.bucket, Key: chave, Body: conteudo, ContentType: contentType }));
  }

  async baixar(chave: string): Promise<ArquivoBaixado> {
    if (!this.cliente) throw new Error('R2 não configurado');
    const r = await this.cliente.send(new GetObjectCommand({ Bucket: this.bucket, Key: chave }));
    return { body: r.Body, contentType: r.ContentType ?? 'application/octet-stream' };
  }

  async remover(chave: string): Promise<void> {
    if (!this.cliente) return;
    await this.cliente.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: chave }));
  }
}
