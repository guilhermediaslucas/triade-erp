import { CAPABILITY_IDS } from '@triade/shared';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import type { Migrador } from '../../domain/ports/Migrador.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface ProvisionarEntrada {
  codigo: string;
  nome: string;
  fantasia: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

export interface ProvisionarSaida {
  codigo: string;
  schema: string;
  admin: string;
}

const SLUG = /^[a-z][a-z0-9]{1,30}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class ProvisionarEmpresa {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly migrador: Migrador,
    private readonly perfis: PerfilRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly hash: HashSenha,
  ) {}

  async executar(e: ProvisionarEntrada): Promise<ProvisionarSaida> {
    const codigo = (e.codigo ?? '').trim().toLowerCase();
    if (!SLUG.test(codigo)) throw new ErroAplicacao('empresa.codigo_invalido', 400);
    if (!e.nome || e.nome.trim().length < 2) throw new ErroAplicacao('empresa.nome_invalido', 400);
    if (!e.fantasia || e.fantasia.trim().length < 2) throw new ErroAplicacao('empresa.fantasia_invalida', 400);
    if (!e.adminNome || e.adminNome.trim().length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    const adminEmail = (e.adminEmail ?? '').trim().toLowerCase();
    if (!EMAIL.test(adminEmail)) throw new ErroAplicacao('usuario.email_invalido', 400);
    if (!e.adminSenha || e.adminSenha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);
    if (await this.empresas.existeCodigo(codigo)) throw new ErroAplicacao('empresa.codigo_em_uso', 409);

    const schema = 't_' + codigo;
    await this.empresas.criar({ codigo, nome: e.nome.trim(), fantasia: e.fantasia.trim(), schemaName: schema });
    await this.migrador.migrarTenant(schema);

    const perfil = await this.perfis.criar(schema, 'Administrador', CAPABILITY_IDS);
    const senhaHash = await this.hash.gerar(e.adminSenha);
    await this.usuarios.criar(schema, { nome: e.adminNome.trim(), email: adminEmail, senhaHash, perfilId: perfil.id });

    return { codigo, schema, admin: adminEmail };
  }
}
