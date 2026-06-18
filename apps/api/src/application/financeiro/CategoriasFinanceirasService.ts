import type { CategoriaFinanceira, CategoriaFinanceiraRepository, GrupoCatFin } from '../../domain/financeiro/CategoriaFinanceira.js';
import { GRUPOS_CATFIN } from '../../domain/financeiro/CategoriaFinanceira.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}
// Aceita o grupo novo; por retrocompat, deriva o grupo do tipo antigo (receita/despesa).
function validarGrupo(e: any): GrupoCatFin {
  const g = e?.grupo ?? (e?.tipo === 'receita' ? 'receita' : e?.tipo === 'despesa' ? 'despesa' : undefined);
  if (!GRUPOS_CATFIN.includes(g)) throw new ErroAplicacao('catfin.grupo_invalido', 400);
  return g;
}
const conta = (e: any): string | null => (e?.contaContabilId && String(e.contaContabilId).trim() !== '' ? String(e.contaContabilId) : null);

export class CategoriasFinanceirasService {
  constructor(private readonly repo: CategoriaFinanceiraRepository) {}
  listar(schema: string): Promise<CategoriaFinanceira[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    return this.repo.criar(schema, validarNome(e?.nome), validarGrupo(e), conta(e));
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const nome = validarNome(e?.nome); const grupo = validarGrupo(e);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, nome, grupo, conta(e));
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
