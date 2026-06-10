import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';
import type { Cliente, ClienteRepository, NovoCliente, TipoPessoa } from '../../domain/pessoa/Cliente.js';
import type { Fornecedor, FornecedorRepository, NovoFornecedor } from '../../domain/pessoa/Fornecedor.js';
import type { Vendedor, VendedorRepository, NovoVendedor } from '../../domain/pessoa/Vendedor.js';

function exigeNome(n: string): string {
  if (!n || n.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return n.trim();
}
function exigeDoc(d: string): string {
  if (!d || d.trim().length < 3) throw new ErroAplicacao('pessoa.documento_invalido', 400);
  return d.trim();
}
const limpo = (v: any): string | null => (v && String(v).trim() !== '' ? String(v).trim() : null);

export class ClientesService {
  constructor(private readonly repo: ClienteRepository) {}
  listar(s: string): Promise<Cliente[]> { return this.repo.listar(s); }
  private montar(e: any): NovoCliente {
    const tipoPessoa: TipoPessoa = e?.tipoPessoa === 'PF' ? 'PF' : 'PJ';
    const limite = Number(e?.limiteCredito ?? 0);
    if (!Number.isFinite(limite) || limite < 0) throw new ErroAplicacao('pessoa.limite_invalido', 400);
    return {
      tipoPessoa, nome: exigeNome(e?.nome), fantasia: tipoPessoa === 'PJ' ? limpo(e?.fantasia) : null,
      documento: exigeDoc(e?.documento), email: limpo(e?.email), telefone: limpo(e?.telefone), limiteCredito: limite,
    };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }
}

export class FornecedoresService {
  constructor(private readonly repo: FornecedorRepository) {}
  listar(s: string): Promise<Fornecedor[]> { return this.repo.listar(s); }
  private montar(e: any): NovoFornecedor {
    return { nome: exigeNome(e?.nome), fantasia: limpo(e?.fantasia), documento: exigeDoc(e?.documento), email: limpo(e?.email), telefone: limpo(e?.telefone) };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }
}

export class VendedoresService {
  constructor(private readonly repo: VendedorRepository) {}
  listar(s: string): Promise<Vendedor[]> { return this.repo.listar(s); }
  private montar(e: any): NovoVendedor {
    const c = Number(e?.comissaoPercentual ?? 0);
    if (!Number.isFinite(c) || c < 0 || c > 100) throw new ErroAplicacao('vendedor.comissao_invalida', 400);
    return { nome: exigeNome(e?.nome), email: limpo(e?.email), telefone: limpo(e?.telefone), comissaoPercentual: c };
  }
  criar(s: string, e: any): Promise<string> { return this.repo.criar(s, this.montar(e)); }
  async editar(s: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(s, id, this.montar(e));
  }
  async alternarAtivo(s: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(s, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(s, id, ativo);
  }
}
