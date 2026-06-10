import type { Categoria, CategoriaRepository } from '../../domain/cadastro/Categoria.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}

export class CategoriasService {
  constructor(private readonly repo: CategoriaRepository) {}
  listar(schema: string): Promise<Categoria[]> { return this.repo.listar(schema); }
  criar(schema: string, nome: string): Promise<Categoria> { return this.repo.criar(schema, validarNome(nome)); }
  async editar(schema: string, id: string, nome: string): Promise<void> {
    const n = validarNome(nome);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, n);
  }
}
