import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
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
}

// Caso de uso: recebe dependencias por injecao (nunca instancia conexao/ORM).
export class AutenticarUsuario {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly hash: HashSenha,
    private readonly tokens: GeradorToken,
  ) {}

  async executar(entrada: AutenticarEntrada): Promise<AutenticarSaida> {
    const email = entrada.email.trim().toLowerCase();
    let empresa = null as Awaited<ReturnType<EmpresaRepository['buscarPorCodigo']>>;
    let usuario = null as Awaited<ReturnType<UsuarioRepository['buscarPorEmail']>>;

    if (entrada.codigoEmpresa && entrada.codigoEmpresa.trim()) {
      // Compatibilidade: login informando o código da empresa.
      empresa = await this.empresas.buscarPorCodigo(entrada.codigoEmpresa.trim().toLowerCase());
      if (!empresa || !empresa.ativo) throw new ErroAplicacao('auth.empresa_invalida', 401);
      usuario = await this.usuarios.buscarPorEmail(empresa.schemaName, email);
    } else {
      // Login só por e-mail: descobre a empresa procurando o usuário em cada tenant ativo.
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
    if (!ok) {
      throw new ErroAplicacao('auth.credenciais_invalidas', 401);
    }

    const token = this.tokens.gerar({
      sub: usuario.id,
      empresa: empresa.codigo,
      schema: empresa.schemaName,
      nome: usuario.nome,
      email: usuario.email,
    });

    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      empresa: { codigo: empresa.codigo, fantasia: empresa.fantasia },
    };
  }
}
