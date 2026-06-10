import type { ContaCorrente, ContaCorrenteRepository, ContaSaldo } from '../../domain/financeiro/ContaCorrente.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
const limpo = (v: any): string | null => (v && String(v).trim() !== '' ? String(v).trim() : null);

export class ContasService {
  constructor(private readonly repo: ContaCorrenteRepository) {}
  listar(schema: string): Promise<ContaCorrente[]> { return this.repo.listar(schema); }
  saldos(schema: string): Promise<ContaSaldo[]> { return this.repo.saldos(schema); }
  private norm(e: any): { nome: string; banco: string | null; saldo: number } {
    if (!e?.nome || String(e.nome).trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
    const saldo = Number(e?.saldoInicial ?? 0);
    if (!Number.isFinite(saldo)) throw new ErroAplicacao('financeiro.valor_invalido', 400);
    return { nome: String(e.nome).trim(), banco: limpo(e?.banco), saldo };
  }
  criar(schema: string, e: any): Promise<string> { const n = this.norm(e); return this.repo.criar(schema, n.nome, n.banco, n.saldo); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const n = this.norm(e);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, n.nome, n.banco, n.saldo);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
