import type { DataSource } from 'typeorm';
import type { Usuario } from '../../domain/usuario/Usuario.js';
import type { UsuarioRepository } from '../../domain/usuario/UsuarioRepository.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlUsuarioRepository implements UsuarioRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorEmail(schema: string, email: string): Promise<Usuario | null> {
    const s = validarSchema(schema);
    const linhas = await this.ds.query(
      `SELECT id, nome, email, senha_hash, ativo, criado_em
         FROM "${s}".usuario WHERE email = $1 LIMIT 1`,
      [email],
    );
    const r = linhas[0];
    if (!r) return null;
    return {
      id: r.id,
      nome: r.nome,
      email: r.email,
      senhaHash: r.senha_hash,
      ativo: r.ativo,
      criadoEm: new Date(r.criado_em),
    };
  }
}
