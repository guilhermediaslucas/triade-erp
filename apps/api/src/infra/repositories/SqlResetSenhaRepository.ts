import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { NovoResetSenha, ResetSenha, ResetSenhaRepository } from '../../domain/auth/ResetSenha.js';

function mapear(r: any): ResetSenha {
  return {
    id: r.id,
    tokenHash: r.token_hash,
    email: r.email,
    schemaName: r.schema_name ?? null,
    usuarioId: r.usuario_id ?? null,
    expiraEm: new Date(r.expira_em),
    usadoEm: r.usado_em ? new Date(r.usado_em) : null,
  };
}

export class SqlResetSenhaRepository implements ResetSenhaRepository {
  constructor(private readonly ds: DataSource) {}

  async criar(d: NovoResetSenha): Promise<void> {
    await this.ds.query(
      `INSERT INTO public.reset_senha (id, token_hash, email, schema_name, usuario_id, expira_em)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), d.tokenHash, d.email, d.schemaName, d.usuarioId, d.expiraEm.toISOString()],
    );
  }

  async buscarPorTokenHash(tokenHash: string): Promise<ResetSenha | null> {
    const r = (await this.ds.query(`SELECT * FROM public.reset_senha WHERE token_hash = $1 LIMIT 1`, [tokenHash]))[0];
    return r ? mapear(r) : null;
  }

  async marcarUsado(id: string): Promise<void> {
    await this.ds.query(`UPDATE public.reset_senha SET usado_em = now() WHERE id = $1`, [id]);
  }
}
