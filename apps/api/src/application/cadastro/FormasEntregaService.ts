import { TIPOS_FORMA_ENTREGA, type FormaEntrega, type FormaEntregaRepository } from '../../domain/cadastro/FormaEntrega.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): string {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  return nome.trim();
}
function validarTipo(tipo: any): string {
  const t = String(tipo ?? '').trim();
  if (!(TIPOS_FORMA_ENTREGA as readonly string[]).includes(t)) throw new ErroAplicacao('forma_entrega.tipo_invalido', 400);
  return t;
}
const opc = (v: any): string | null => (v && String(v).trim()) || null;

export class FormasEntregaService {
  constructor(private readonly repo: FormaEntregaRepository) {}
  listar(schema: string): Promise<FormaEntrega[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> {
    return this.repo.criar(schema, validarNome(e?.nome), validarTipo(e?.tipo), opc(e?.prazo), opc(e?.observacao));
  }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const nome = validarNome(e?.nome); const tipo = validarTipo(e?.tipo);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, nome, tipo, opc(e?.prazo), opc(e?.observacao));
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
