import type { Motoboy, MotoboyRepository } from '../../domain/pessoa/Motoboy.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}
const tel = (v: any): string | null => (v && String(v).trim()) || null;
const dados = (e: any) => ({ nome: validarNome(e?.nome), telefone: tel(e?.telefone), cpf: tel(e?.cpf), chavePix: tel(e?.chavePix) });

export class MotoboysService {
  constructor(private readonly repo: MotoboyRepository) {}
  listar(schema: string): Promise<Motoboy[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    return this.repo.criar(schema, dados(e));
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const d = dados(e);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, d);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
