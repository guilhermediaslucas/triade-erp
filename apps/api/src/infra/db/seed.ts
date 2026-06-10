import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS } from '@triade/shared';
import { migrarPublic, migrarTenant } from './migrate.js';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';

export interface ResultadoSeed {
  empresa: string;
  schema: string;
  usuario: string;
  senhaPadrao?: string;
  criado: boolean;
}

// Idempotente. Tambem SINCRONIZA as capabilities do perfil Administrador
// (assim novas permissoes criadas em versoes futuras passam a valer ao re-seedar).
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

  // Garante o perfil Administrador.
  let perfilAdmin = (await ds.query(`SELECT id FROM "${schema}".perfil WHERE nome = $1`, ['Administrador']))[0];
  if (!perfilAdmin) {
    const pid = randomUUID();
    await ds.query(`INSERT INTO "${schema}".perfil (id, nome) VALUES ($1, $2)`, [pid, 'Administrador']);
    perfilAdmin = { id: pid };
  }
  // SINCRONIZA todas as capabilities atuais no perfil Administrador (adiciona as que faltam).
  for (const cap of CAPABILITY_IDS) {
    await ds.query(
      `INSERT INTO "${schema}".perfil_capability (perfil_id, capability) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [perfilAdmin.id, cap],
    );
  }

  const email = 'admin@belle.com.br';
  const usuario = (await ds.query(`SELECT id, perfil_id FROM "${schema}".usuario WHERE email = $1`, [email]))[0];
  if (!usuario) {
    const hash = await new BcryptHashSenha().gerar('admin123');
    await ds.query(
      `INSERT INTO "${schema}".usuario (id, nome, email, senha_hash, ativo, perfil_id)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [randomUUID(), 'Administrador', email, hash, perfilAdmin.id],
    );
    return { empresa: codigo, schema, usuario: email, senhaPadrao: 'admin123', criado: true };
  }

  if (!usuario.perfil_id) {
    await ds.query(`UPDATE "${schema}".usuario SET perfil_id = $2 WHERE id = $1`, [usuario.id, perfilAdmin.id]);
  }

  return { empresa: codigo, schema, usuario: email, criado: false };
}
