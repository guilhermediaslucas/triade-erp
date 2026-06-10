import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Usuario, UsuarioResumo } from '../../domain/usuario/Usuario.js';
import type { NovoUsuario, UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlUsuarioRepository implements UsuarioRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorEmail(schema: string, email: string): Promise<Usuario | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT id, nome, email, senha_hash, ativo, perfil_id, criado_em
         FROM "${s}".usuario WHERE email = $1 LIMIT 1`,
      [email],
    ))[0];
    return r ? this.mapear(r) : null;
  }

  async buscarPorId(schema: string, id: string): Promise<Usuario | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT id, nome, email, senha_hash, ativo, perfil_id, criado_em
         FROM "${s}".usuario WHERE id = $1 LIMIT 1`,
      [id],
    ))[0];
    return r ? this.mapear(r) : null;
  }

  async listar(schema: string): Promise<UsuarioResumo[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, p.nome AS perfil_nome
         FROM "${s}".usuario u
         LEFT JOIN "${s}".perfil p ON p.id = u.perfil_id
        ORDER BY u.nome`,
    );
    return linhas.map((r: any) => ({
      id: r.id, nome: r.nome, email: r.email, ativo: r.ativo,
      perfilId: r.perfil_id ?? null, perfilNome: r.perfil_nome ?? null,
    }));
  }

  async emailExiste(schema: string, email: string, excetoId?: string): Promise<boolean> {
    const s = validarSchema(schema);
    const r = await this.ds.query(
      `SELECT 1 FROM "${s}".usuario WHERE email = $1 AND ($2::uuid IS NULL OR id <> $2) LIMIT 1`,
      [email, excetoId ?? null],
    );
    return r.length > 0;
  }

  async criar(schema: string, dados: NovoUsuario): Promise<string> {
    const s = validarSchema(schema);
    const id = randomUUID();
    await this.ds.query(
      `INSERT INTO "${s}".usuario (id, nome, email, senha_hash, ativo, perfil_id)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [id, dados.nome, dados.email, dados.senhaHash, dados.perfilId],
    );
    return id;
  }

  async atualizar(schema: string, id: string, nome: string, perfilId: string | null): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".usuario SET nome = $2, perfil_id = $3 WHERE id = $1`, [id, nome, perfilId]);
  }

  async definirAtivo(schema: string, id: string, ativo: boolean): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".usuario SET ativo = $2 WHERE id = $1`, [id, ativo]);
  }

  async definirSenha(schema: string, id: string, senhaHash: string): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".usuario SET senha_hash = $2 WHERE id = $1`, [id, senhaHash]);
  }

  async capabilities(schema: string, usuarioId: string): Promise<string[]> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT pc.capability
         FROM "${s}".usuario u
         JOIN "${s}".perfil_capability pc ON pc.perfil_id = u.perfil_id
        WHERE u.id = $1`,
      [usuarioId],
    );
    return linhas.map((r: any) => r.capability);
  }

  private mapear(r: any): Usuario {
    return {
      id: r.id, nome: r.nome, email: r.email, senhaHash: r.senha_hash,
      ativo: r.ativo, perfilId: r.perfil_id ?? null, criadoEm: new Date(r.criado_em),
    };
  }
}
