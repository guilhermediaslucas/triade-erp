import { randomUUID } from 'node:crypto';
import type { ClienteAnexo, ClienteAnexoRepository } from '../../domain/pessoa/ClienteAnexo.js';
import type { ArquivoStorage, ArquivoBaixado } from '../../domain/ports/ArquivoStorage.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const TIPOS_OK = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const LIMITE_BYTES = 10 * 1024 * 1024;   // 10 MB

function nomeSeguro(nome: string): string {
  return (nome || 'arquivo').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
}

// Anexos de documentos no cadastro de cliente — espelha o AnexosService dos títulos.
export class ClienteAnexosService {
  constructor(
    private readonly repo: ClienteAnexoRepository,
    private readonly storage: ArquivoStorage,
  ) {}

  habilitado(): boolean { return this.storage.configurado(); }

  listar(schema: string, clienteId: string): Promise<ClienteAnexo[]> {
    return this.repo.listarPorCliente(schema, clienteId);
  }

  async anexar(schema: string, clienteId: string, e: any, usuarioNome: string | null): Promise<ClienteAnexo> {
    if (!this.storage.configurado()) throw new ErroAplicacao('anexo.indisponivel', 503);
    if (!clienteId) throw new ErroAplicacao('anexo.cliente_invalido', 400);
    const nome = nomeSeguro(String(e?.nomeArquivo ?? '').trim());
    const bruto = String(e?.conteudoBase64 ?? '');
    const m = bruto.match(/^data:([^;]+);base64,(.+)$/);
    const tipo = (m ? m[1] : String(e?.tipo ?? '')).toLowerCase();
    const base64 = m ? m[2]! : bruto;
    if (!TIPOS_OK.includes(tipo)) throw new ErroAplicacao('anexo.tipo_invalido', 400);
    let buffer: Buffer;
    try { buffer = Buffer.from(base64, 'base64'); } catch { throw new ErroAplicacao('anexo.conteudo_invalido', 400); }
    if (buffer.length === 0) throw new ErroAplicacao('anexo.conteudo_invalido', 400);
    if (buffer.length > LIMITE_BYTES) throw new ErroAplicacao('anexo.muito_grande', 400);

    const chave = `${schema}/clientes/${clienteId}/${randomUUID()}-${nome}`;
    await this.storage.enviar(chave, buffer, tipo);
    const id = await this.repo.criar(schema, { clienteId, nomeArquivo: nome, tipo, tamanho: buffer.length, chave, usuarioNome });
    return { id, clienteId, nomeArquivo: nome, tipo, tamanho: buffer.length, chave, usuarioNome, criadoEm: new Date().toISOString() };
  }

  async baixar(schema: string, anexoId: string): Promise<ArquivoBaixado & { nomeArquivo: string }> {
    if (!this.storage.configurado()) throw new ErroAplicacao('anexo.indisponivel', 503);
    const a = await this.repo.buscarPorId(schema, anexoId);
    if (!a) throw new ErroAplicacao('anexo.nao_encontrado', 404);
    const out = await this.storage.baixar(a.chave);
    return { ...out, nomeArquivo: a.nomeArquivo };
  }

  async remover(schema: string, anexoId: string): Promise<void> {
    const a = await this.repo.buscarPorId(schema, anexoId);
    if (!a) throw new ErroAplicacao('anexo.nao_encontrado', 404);
    try { await this.storage.remover(a.chave); } catch { /* se falhar no R2, remove a ficha mesmo assim */ }
    await this.repo.remover(schema, anexoId);
  }
}
