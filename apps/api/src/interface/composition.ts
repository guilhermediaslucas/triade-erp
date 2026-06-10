import { AppDataSource } from '../infra/db/data-source.js';
import { env } from '../infra/config/env.js';
import { SqlEmpresaRepository } from '../infra/repositories/SqlEmpresaRepository.js';
import { SqlUsuarioRepository } from '../infra/repositories/SqlUsuarioRepository.js';
import { BcryptHashSenha } from '../infra/security/BcryptHashSenha.js';
import { JwtGeradorToken } from '../infra/security/JwtGeradorToken.js';
import { AutenticarUsuario } from '../application/auth/AutenticarUsuario.js';

// Ponto unico onde concretos sao ligados aos casos de uso (injecao de dependencia).
export function montarDependencias() {
  const empresas = new SqlEmpresaRepository(AppDataSource);
  const usuarios = new SqlUsuarioRepository(AppDataSource);
  const hash = new BcryptHashSenha();
  const tokens = new JwtGeradorToken(env.jwtSecret);

  return {
    tokens,
    autenticarUsuario: new AutenticarUsuario(empresas, usuarios, hash, tokens),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
