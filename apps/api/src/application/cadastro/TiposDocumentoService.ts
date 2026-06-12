import type { TipoDocumento, TipoDocumentoRepository } from '../../domain/cadastro/TipoDocumento.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}

export class TiposDocumentoService {
  constructor(private readonly repo: TipoDocumentoRepository) {}
  listar(schema: string): Promise<TipoDocumento[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> { return this.repo.criar(schema, validarNome(e?.nome)); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const nome = validarNome(e?.nome);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, nome);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
