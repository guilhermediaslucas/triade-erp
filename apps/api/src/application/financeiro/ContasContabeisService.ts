import type { ContaContabil, ContaContabilRepository, NovaContaContabil, TipoContaContabil } from '../../domain/financeiro/ContaContabil.js';
import { TIPOS_CONTA_CONTABIL } from '../../domain/financeiro/ContaContabil.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function montar(e: any): NovaContaContabil {
  const codigo = String(e?.codigo ?? '').trim();
  if (codigo.length < 1) throw new ErroAplicacao('conta.codigo_invalido', 400);
  const descricao = String(e?.descricao ?? '').trim();
  if (descricao.length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  const tipo = e?.tipo as TipoContaContabil;
  if (!TIPOS_CONTA_CONTABIL.includes(tipo)) throw new ErroAplicacao('conta.tipo_invalido', 400);
  const paiId = e?.paiId && String(e.paiId).trim() !== '' ? String(e.paiId) : null;
  return { codigo, descricao, tipo, paiId };
}

export class ContasContabeisService {
  constructor(private readonly repo: ContaContabilRepository) {}
  listar(schema: string): Promise<ContaContabil[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> { return this.repo.criar(schema, montar(e)); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    if (e?.paiId && String(e.paiId) === id) throw new ErroAplicacao('conta.pai_invalido', 400);
    await this.repo.atualizar(schema, id, montar(e));
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
