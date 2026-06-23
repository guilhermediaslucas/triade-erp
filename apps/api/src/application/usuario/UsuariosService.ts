import type { UsuarioResumo } from '../../domain/usuario/Usuario.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface CriarUsuarioEntrada {
  nome: string;
  email: string;
  senha: string;
  perfilId: string | null;
  foto?: string | null;
  vendedorId?: string | null;
  trocarSenha?: boolean;   // senha provisória: força troca no próximo login
}

function validarEmail(email: string): string {
  const e = (email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new ErroAplicacao('usuario.email_invalido', 400);
  return e;
}

// Normaliza a foto: vazio → null; limita ~2MB de data URI para não estourar payload.
function normalizarFoto(foto?: string | null): string | null {
  const f = (foto ?? '').trim();
  if (f === '') return null;
  if (f.length > 2_800_000) throw new ErroAplicacao('usuario.foto_grande', 400);
  return f;
}

export class UsuariosService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly perfis: PerfilRepository,
    private readonly hash: HashSenha,
  ) {}

  listar(schema: string): Promise<UsuarioResumo[]> {
    return this.usuarios.listar(schema);
  }

  private async validarPerfil(schema: string, perfilId: string | null): Promise<void> {
    if (perfilId && !(await this.perfis.buscarPorId(schema, perfilId))) {
      throw new ErroAplicacao('usuario.perfil_invalido', 400);
    }
  }

  async criar(schema: string, e: CriarUsuarioEntrada): Promise<string> {
    if (!e.nome || e.nome.trim().length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    if (!e.senha || e.senha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);
    const email = validarEmail(e.email);
    if (await this.usuarios.emailExiste(schema, email)) throw new ErroAplicacao('usuario.email_em_uso', 409);
    await this.validarPerfil(schema, e.perfilId);
    const senhaHash = await this.hash.gerar(e.senha);
    return this.usuarios.criar(schema, { nome: e.nome.trim(), email, senhaHash, perfilId: e.perfilId, foto: normalizarFoto(e.foto), vendedorId: e.vendedorId ?? null, trocarSenha: e.trocarSenha === true });
  }

  async editar(schema: string, id: string, nome: string, perfilId: string | null, foto?: string | null, vendedorId?: string | null): Promise<void> {
    if (!nome || nome.trim().length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    const u = await this.usuarios.buscarPorId(schema, id);
    if (!u) throw new ErroAplicacao('usuario.nao_encontrado', 404);
    await this.validarPerfil(schema, perfilId);
    await this.usuarios.atualizar(schema, id, nome.trim(), perfilId, normalizarFoto(foto), vendedorId ?? null);
  }

  async alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const u = await this.usuarios.buscarPorId(schema, id);
    if (!u) throw new ErroAplicacao('usuario.nao_encontrado', 404);
    await this.usuarios.definirAtivo(schema, id, ativo);
  }

  // Vincula (ou desvincula) o login a um cadastro de motoboy — usado pelo app do motoboy.
  async vincularMotoboy(schema: string, id: string, motoboyId: string | null): Promise<void> {
    const u = await this.usuarios.buscarPorId(schema, id);
    if (!u) throw new ErroAplicacao('usuario.nao_encontrado', 404);
    await this.usuarios.vincularMotoboy(schema, id, (motoboyId && String(motoboyId)) || null);
  }

  async definirSenha(schema: string, id: string, senha: string): Promise<void> {
    if (!senha || senha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);
    const u = await this.usuarios.buscarPorId(schema, id);
    if (!u) throw new ErroAplicacao('usuario.nao_encontrado', 404);
    await this.usuarios.definirSenha(schema, id, await this.hash.gerar(senha));
  }
}
