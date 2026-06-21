import type { DataSource } from 'typeorm';
import type { PreferenciaUsuarioRepository } from '../../domain/preferencia/PreferenciaUsuario.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlPreferenciaUsuarioRepository implements PreferenciaUsuarioRepository {
  constructor(private readonly ds: DataSource) {}

  async obter(schema: string, usuarioId: string, chave: string): Promise<unknown | null> {
    const s = validarSchema(schema);
    const r = (await this.ds.query(
      `SELECT valor FROM "${s}".usuario_preferencia WHERE usuario_id = $1 AND chave = $2`,
      [usuarioId, chave],
    ))[0];
    // jsonb já volta desserializado (objeto/array) do driver pg.
    return r ? (r.valor ?? null) : null;
  }

  async salvar(schema: string, usuarioId: string, chave: string, valor: unknown): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(
      `INSERT INTO "${s}".usuario_preferencia (usuario_id, chave, valor, atualizado_em)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (usuario_id, chave)
       DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()`,
      [usuarioId, chave, JSON.stringify(valor)],
    );
  }
}
