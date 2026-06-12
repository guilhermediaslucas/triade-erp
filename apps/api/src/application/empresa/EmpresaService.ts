import { IDIOMAS } from '@triade/shared';
import type { Empresa } from '../../domain/empresa/Empresa.js';
import type { AtualizacaoEmpresa, EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { Migrador } from '../../domain/ports/Migrador.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const HEX = /^#[0-9a-fA-F]{6}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class EmpresaService {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly migrador: Migrador,
    private readonly usuarios: UsuarioRepository,
    private readonly hash: HashSenha,
  ) {}

  // Administrador inicial do tenant (usuário mais antigo) — para o super-admin editar.
  async obterAdmin(codigo: string): Promise<{ nome: string; email: string } | null> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    const u = await this.usuarios.buscarPrimeiro(e.schemaName);
    return u ? { nome: u.nome, email: u.email } : null;
  }

  async editarAdmin(codigo: string, d: { nome?: string; email?: string; senha?: string }): Promise<void> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    const u = await this.usuarios.buscarPrimeiro(e.schemaName);
    if (!u) throw new ErroAplicacao('usuario.nao_encontrado', 404);
    if (!d.nome || d.nome.trim().length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    const email = (d.email ?? '').trim().toLowerCase();
    if (!EMAIL.test(email)) throw new ErroAplicacao('usuario.email_invalido', 400);
    if (email !== u.email && await this.usuarios.emailExiste(e.schemaName, email, u.id)) throw new ErroAplicacao('usuario.email_em_uso', 409);
    await this.usuarios.atualizarNomeEmail(e.schemaName, u.id, d.nome.trim(), email);
    if (d.senha && d.senha.length > 0) {
      if (d.senha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);
      await this.usuarios.definirSenha(e.schemaName, u.id, await this.hash.gerar(d.senha));
    }
  }

  async obter(codigo: string): Promise<Empresa> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    return e;
  }

  async atualizar(codigo: string, d: AtualizacaoEmpresa): Promise<void> {
    if (!d.fantasia || d.fantasia.trim().length < 2) throw new ErroAplicacao('empresa.fantasia_invalida', 400);
    for (const cor of [d.corPrimaria, d.corMenuFundo, d.corMenuFonte]) {
      if (!HEX.test(cor)) throw new ErroAplicacao('empresa.cor_invalida', 400);
    }
    if (!IDIOMAS.includes(d.idiomaPadrao as any)) throw new ErroAplicacao('empresa.idioma_invalido', 400);
    if (!d.timezonePadrao || d.timezonePadrao.trim() === '') throw new ErroAplicacao('empresa.timezone_invalido', 400);
    await this.empresas.atualizar(codigo, {
      fantasia: d.fantasia.trim(),
      logo: d.logo && d.logo.trim() !== '' ? d.logo : null,
      corPrimaria: d.corPrimaria, corMenuFundo: d.corMenuFundo, corMenuFonte: d.corMenuFonte,
      idiomaPadrao: d.idiomaPadrao, timezonePadrao: d.timezonePadrao.trim(),
    });
  }

  // Edição do cadastro pelo super-admin (razão social, nome fantasia, ativo).
  async editar(codigo: string, d: { nome?: string; fantasia?: string; ativo?: boolean }): Promise<void> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    if (!d.nome || d.nome.trim().length < 2) throw new ErroAplicacao('empresa.nome_invalido', 400);
    if (!d.fantasia || d.fantasia.trim().length < 2) throw new ErroAplicacao('empresa.fantasia_invalida', 400);
    await this.empresas.editarCadastro(codigo, {
      nome: d.nome.trim(), fantasia: d.fantasia.trim(), ativo: d.ativo !== false,
    });
  }

  // Exclui a empresa: remove o registro em public.empresa e dropa o schema do tenant.
  async excluir(codigo: string): Promise<void> {
    const e = await this.empresas.buscarPorCodigo(codigo);
    if (!e) throw new ErroAplicacao('empresa.nao_encontrada', 404);
    await this.empresas.excluir(codigo);
    await this.migrador.removerTenant(e.schemaName);
  }
}
