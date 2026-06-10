import { AppDataSource } from '../infra/db/data-source.js';
import { env } from '../infra/config/env.js';
import { SqlEmpresaRepository } from '../infra/repositories/SqlEmpresaRepository.js';
import { SqlUsuarioRepository } from '../infra/repositories/SqlUsuarioRepository.js';
import { SqlPerfilRepository } from '../infra/repositories/SqlPerfilRepository.js';
import { BcryptHashSenha } from '../infra/security/BcryptHashSenha.js';
import { JwtGeradorToken } from '../infra/security/JwtGeradorToken.js';
import { AutenticarUsuario } from '../application/auth/AutenticarUsuario.js';
import { UsuariosService } from '../application/usuario/UsuariosService.js';
import { PerfisService } from '../application/perfil/PerfisService.js';
import { EmpresaService } from '../application/empresa/EmpresaService.js';

export function montarDependencias() {
  const empresasRepo = new SqlEmpresaRepository(AppDataSource);
  const usuariosRepo = new SqlUsuarioRepository(AppDataSource);
  const perfisRepo = new SqlPerfilRepository(AppDataSource);
  const hash = new BcryptHashSenha();
  const tokens = new JwtGeradorToken(env.jwtSecret);

  return {
    tokens,
    usuariosRepo,
    autenticarUsuario: new AutenticarUsuario(empresasRepo, usuariosRepo, hash, tokens),
    usuariosService: new UsuariosService(usuariosRepo, perfisRepo, hash),
    perfisService: new PerfisService(perfisRepo),
    empresaService: new EmpresaService(empresasRepo),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
