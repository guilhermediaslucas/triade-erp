import type { Condicao, CondicaoRepository } from '../../domain/comercial/Condicao.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function valida(nome: string, parcelas: number, intervalo: number): void {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 99) throw new ErroAplicacao('condicao.parcelas_invalida', 400);
  if (!Number.isInteger(intervalo) || intervalo < 0) throw new ErroAplicacao('condicao.intervalo_invalido', 400);
}
export class CondicoesService {
  constructor(private readonly repo: CondicaoRepository) {}
  listar(schema: string): Promise<Condicao[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    const p = Number(e?.parcelas), i = Number(e?.intervaloDias);
    valida(e?.nome, p, i); return this.repo.criar(schema, String(e.nome).trim(), p, i);
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const p = Number(e?.parcelas), i = Number(e?.intervaloDias);
    valida(e?.nome, p, i);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, String(e.nome).trim(), p, i);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
