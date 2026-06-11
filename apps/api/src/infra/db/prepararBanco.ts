import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS } from '@triade/shared';
import { migrarTudo } from './migrate.js';
import { validarSchema } from '../tenant/validarSchema.js';

// Roda no boot da API (produção): aplica as migrations pendentes em public +
// todos os tenants e sincroniza as capabilities atuais no perfil Administrador
// de cada tenant ativo (assim permissões novas passam a valer sem passo manual).
// Tudo idempotente — seguro de rodar a cada deploy.
export async function prepararBanco(ds: DataSource): Promise<void> {
  const aplicadas = await migrarTudo(ds);
  if (aplicadas.length) console.log(`[db] migrations aplicadas no boot:\n - ${aplicadas.join('\n - ')}`);
  else console.log('[db] migrations: tudo já atualizado.');

  const empresas: Array<{ schema_name: string }> = await ds.query(
    `SELECT schema_name FROM public.empresa WHERE ativo = true`);
  let tenants = 0;
  for (const e of empresas) {
    const s = validarSchema(e.schema_name);
    const perfil = (await ds.query(`SELECT id FROM "${s}".perfil WHERE nome = $1`, ['Administrador']))[0];
    if (!perfil) continue;
    for (const cap of CAPABILITY_IDS) {
      await ds.query(
        `INSERT INTO "${s}".perfil_capability (perfil_id, capability) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [perfil.id, cap]);
    }
    tenants++;
  }
  console.log(`[db] capabilities sincronizadas no perfil Administrador de ${tenants} tenant(s).`);
}
