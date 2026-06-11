import type { Favorecido, FavorecidoRepository, NovoFavorecido, TipoFavorecido } from '../../domain/cadastro/Favorecido.js';
import { TIPOS_FAVORECIDO } from '../../domain/cadastro/Favorecido.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const txt = (v: any): string | null => (v != null && String(v).trim()) || null;

function normalizar(e: any): NovoFavorecido {
  const nome = txt(e?.nome);
  if (!nome || nome.length < 2) throw new ErroAplicacao('cadastro.nome_invalido', 400);
  const tipoPessoa: TipoFavorecido = e?.tipoPessoa === 'PJ' ? 'PJ' : 'PF';
  if (!TIPOS_FAVORECIDO.includes(tipoPessoa)) throw new ErroAplicacao('favorecido.tipo_invalido', 400);
  return {
    nome, tipoPessoa,
    documento: txt(e?.documento), chavePix: txt(e?.chavePix),
    banco: txt(e?.banco), agencia: txt(e?.agencia), conta: txt(e?.conta),
    observacao: txt(e?.observacao),
  };
}

export class FavorecidosService {
  constructor(private readonly repo: FavorecidoRepository) {}
  listar(schema: string): Promise<Favorecido[]> { return this.repo.listar(schema); }
  criar(schema: string, e: any): Promise<string> { return this.repo.criar(schema, normalizar(e)); }
  async editar(schema: string, id: string, e: any): Promise<void> {
    const d = normalizar(e);
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.atualizar(schema, id, d);
  }
  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    if (!(await this.repo.buscarPorId(schema, id))) throw new ErroAplicacao('cadastro.nao_encontrado', 404);
    await this.repo.definirAtivo(schema, id, ativo);
  }
}
