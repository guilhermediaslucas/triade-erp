import type { Marca, MarcaRepository } from '../../domain/cadastro/Marca.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}
const fab = (v: any): string | null => (v && String(v).trim()) || null;

export class MarcasService {
  constructor(private readonly repo: MarcaRepository) {}
  listar(schema: string): Promise<Marca[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    return this.repo.criar(schema, validarNome(e?.nome), fab(e?.fabricante));
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const n = validarNome(e?.nome);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, n, fab(e?.fabricante));
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
