import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { SuperAdminRepository } from '../../domain/superadmin/SuperAdmin.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import type { GeradorToken } from '../../domain/ports/GeradorToken.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface AutenticarEntrada {
  codigoEmpresa?: string;
  email: string;
  senha: string;
}

export interface AutenticarSaida {
  token: string;
  usuario: { id: string; nome: string; email: string };
  empresa: { codigo: string; fantasia: string };
  superAdmin?: boolean;
}

// Caso de uso: recebe dependencias por injecao (nunca instancia conexao/ORM).
export class AutenticarUsuario {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly hash: HashSenha,
    private readonly tokens: GeradorToken,
    private readonly superAdmins: SuperAdminRepository,
  ) {}

  async executar(entrada: AutenticarEntrada): Promise<AutenticarSaida> {
    const email = entrada.email.trim().toLowerCase();

    // 1) Administrador global do sistema (login só por e-mail). Acesso total + troca de empresa.
    if (!entrada.codigoEmpresa || !entrada.codigoEmpresa.trim()) {
      const sa = await this.superAdmins.buscarPorEmail(email);
      if (sa) {
        const ok = await this.hash.comparar(entrada.senha, sa.senhaHash);
        if (!ok) throw new ErroAplicacao('auth.credenciais_invalidas', 401);
        const empresa = (await this.empresas.listarTodas()).find((e) => e.ativo);
        if (!empresa) throw new ErroAplicacao('auth.sem_empresas', 409);
        return this.emitir(sa, empresa, true);
      }
    }

    // 2) Usuário comum de um tenant.
    let empresa = null as Awaited<ReturnType<EmpresaRepository['buscarPorCodigo']>>;
    let usuario = null as Awaited<ReturnType<UsuarioRepository['buscarPorEmail']>>;

    if (entrada.codigoEmpresa && entrada.codigoEmpresa.trim()) {
      empresa = await this.empresas.buscarPorCodigo(entrada.codigoEmpresa.trim().toLowerCase());
      if (!empresa || !empresa.ativo) throw new ErroAplicacao('auth.empresa_invalida', 401);
      usuario = await this.usuarios.buscarPorEmail(empresa.schemaName, email);
    } else {
      const todas = await this.empresas.listarTodas();
      for (const e of todas) {
        if (!e.ativo) continue;
        const u = await this.usuarios.buscarPorEmail(e.schemaName, email);
        if (u && u.ativo) { empresa = e; usuario = u; break; }
      }
    }

    if (!empresa || !empresa.ativo || !usuario || !usuario.ativo) {
      throw new ErroAplicacao('auth.credenciais_invalidas', 401);
    }
    const ok = await this.hash.comparar(entrada.senha, usuario.senhaHash);
    if (!ok) throw new ErroAplicacao('auth.credenciais_invalidas', 401);

    return this.emitir({ id: usuario.id, nome: usuario.nome, email: usuario.email }, empresa, false);
  }

  // Troca a empresa "ativa" do administrador global (emite novo token p/ o schema escolhido).
  async trocarEmpresa(sa: { id: string; nome: string; email: string }, codigo: string): Promise<AutenticarSaida> {
    const empresa = await this.empresas.buscarPorCodigo(codigo.trim().toLowerCase());
    if (!empresa || !empresa.ativo) throw new ErroAplicacao('auth.empresa_invalida', 404);
    return this.emitir(sa, empresa, true);
  }

  private emitir(
    u: { id: string; nome: string; email: string },
    empresa: { codigo: string; schemaName: string; fantasia: string },
    superAdmin: boolean,
  ): AutenticarSaida {
    const token = this.tokens.gerar({
      sub: u.id, empresa: empresa.codigo, schema: empresa.schemaName,
      nome: u.nome, email: u.email, superAdmin,
    });
    return {
      token,
      usuario: { id: u.id, nome: u.nome, email: u.email },
      empresa: { codigo: empresa.codigo, fantasia: empresa.fantasia },
      superAdmin,
    };
  }
}
