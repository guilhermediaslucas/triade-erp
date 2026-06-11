import type { CategoriaFinanceira, CategoriaFinanceiraRepository, TipoCatFin } from '../../domain/financeiro/CategoriaFinanceira.js';
import { TIPOS_CATFIN } from '../../domain/financeiro/CategoriaFinanceira.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}
function validarTipo(tipo: any): TipoCatFin {
  if (!TIPOS_CATFIN.includes(tipo)) throw new ErroAplicacao('catfin.tipo_invalido', 400);
  return tipo;
}

export class CategoriasFinanceirasService {
  constructor(private readonly repo: CategoriaFinanceiraRepository) {}
  listar(schema: string): Promise<CategoriaFinanceira[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    return this.repo.criar(schema, validarNome(e?.nome), validarTipo(e?.tipo));
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const nome = validarNome(e?.nome); const tipo = validarTipo(e?.tipo);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, nome, tipo);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
