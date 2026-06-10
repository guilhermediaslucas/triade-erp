import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { migrarPublic, migrarTenant } from './migrate.js';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';

export interface ResultadoSeed {
  empresa: string;
  schema: string;
  usuario: string;
  senhaPadrao?: string;
  criado: boolean;
}

// Idempotente: se a empresa demo ja existir, nao recria.
export async function seedDemo(ds: DataSource): Promise<ResultadoSeed> {
  await migrarPublic(ds);

  const codigo = 'belle';
  const schema = 't_belle';

  const existe = await ds.query(`SELECT id FROM public.empresa WHERE codigo = $1`, [codigo]);
  if (existe.length === 0) {
    await ds.query(
      `INSERT INTO public.empresa (id, codigo, nome, fantasia, schema_name, ativo)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [randomUUID(), codigo, 'Belle Distribuidora LTDA', 'Belle Distribuidora', schema],
    );
  }

  await migrarTenant(ds, schema);

  const email = 'admin@belle.com.br';
  const usuarioExiste = await ds.query(`SELECT id FROM "${schema}".usuario WHERE email = $1`, [email]);
  if (usuarioExiste.length === 0) {
    const hash = await new BcryptHashSenha().gerar('admin123');
    await ds.query(
      `INSERT INTO "${schema}".usuario (id, nome, email, senha_hash, ativo)
       VALUES ($1, $2, $3, $4, true)`,
      [randomUUID(), 'Administrador', email, hash],
    );
    return { empresa: codigo, schema, usuario: email, senhaPadrao: 'admin123', criado: true };
  }

  return { empresa: codigo, schema, usuario: email, criado: false };
}
