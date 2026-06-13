import { CAPABILITY_IDS_GERAIS } from '@triade/shared';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import type { HashSenha } from '../../domain/ports/HashSenha.js';
import type { Migrador } from '../../domain/ports/Migrador.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface ProvisionarEntrada {
  codigo?: string;   // opcional: se vazio, é gerado a partir do nome (slug interno do schema)
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
    if (!e.nome || e.nome.trim().length < 2) throw new ErroAplicacao('empresa.nome_invalido', 400);
    if (!e.fantasia || e.fantasia.trim().length < 2) throw new ErroAplicacao('empresa.fantasia_invalida', 400);
    if (!e.adminNome || e.adminNome.trim().length < 2) throw new ErroAplicacao('usuario.nome_invalido', 400);
    const adminEmail = (e.adminEmail ?? '').trim().toLowerCase();
    if (!EMAIL.test(adminEmail)) throw new ErroAplicacao('usuario.email_invalido', 400);
    if (!e.adminSenha || e.adminSenha.length < 6) throw new ErroAplicacao('usuario.senha_curta', 400);

    // Código = identificador interno do schema. Se o cliente mandou um, valida e usa
    // (compat); senão, gera um slug único a partir do nome — não aparece mais na UI.
    let codigo = (e.codigo ?? '').trim().toLowerCase();
    if (codigo) {
      if (!SLUG.test(codigo)) throw new ErroAplicacao('empresa.codigo_invalido', 400);
      if (await this.empresas.existeCodigo(codigo)) throw new ErroAplicacao('empresa.codigo_em_uso', 409);
    } else {
      codigo = await this.gerarCodigo(e.nome);
    }

    const schema = 't_' + codigo;
    await this.empresas.criar({ codigo, nome: e.nome.trim(), fantasia: e.fantasia.trim(), schemaName: schema });
    await this.migrador.migrarTenant(schema);

    const perfil = await this.perfis.criar(schema, 'Administrador', 'Acesso total ao sistema', true, CAPABILITY_IDS_GERAIS);
    const senhaHash = await this.hash.gerar(e.adminSenha);
    await this.usuarios.criar(schema, { nome: e.adminNome.trim(), email: adminEmail, senhaHash, perfilId: perfil.id });

    return { codigo, schema, admin: adminEmail };
  }

  // Gera um slug único (só [a-z0-9], começa com letra, 2..30 chars) a partir do nome.
  private async gerarCodigo(nome: string): Promise<string> {
    let raiz = nome.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
    if (!/^[a-z]/.test(raiz)) raiz = 'e' + raiz;     // precisa começar com letra
    if (raiz.length < 2) raiz = (raiz + 'empresa').slice(0, 24);
    let cand = raiz;
    let i = 1;
    while (await this.empresas.existeCodigo(cand)) { i += 1; cand = (raiz + i).slice(0, 30); }
    return cand;
  }
}
