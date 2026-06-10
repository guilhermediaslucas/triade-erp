import type { DataSource } from 'typeorm';
import { validarSchema } from '../tenant/validarSchema.js';
import { publicMigrations } from './migrations/publicMigrations.js';
import { tenantMigrations } from './migrations/tenantMigrations.js';

async function garantirLedger(ds: DataSource, schema: string): Promise<void> {
  await ds.query(
    `CREATE TABLE IF NOT EXISTS "${schema}".migracao (
       nome text PRIMARY KEY,
       aplicada_em timestamptz NOT NULL DEFAULT now()
     );`,
  );
}

async function jaAplicada(ds: DataSource, schema: string, nome: string): Promise<boolean> {
  const r = await ds.query(`SELECT 1 FROM "${schema}".migracao WHERE nome = $1`, [nome]);
  return r.length > 0;
}

async function registrar(ds: DataSource, schema: string, nome: string): Promise<void> {
  await ds.query(`INSERT INTO "${schema}".migracao (nome) VALUES ($1)`, [nome]);
}

// Aplica as migrations do schema public (registro de empresas).
export async function migrarPublic(ds: DataSource): Promise<string[]> {
  await garantirLedger(ds, 'public');
  const aplicadas: string[] = [];
  for (const m of publicMigrations) {
    if (await jaAplicada(ds, 'public', m.nome)) continue;
    await ds.query(m.sql);
    await registrar(ds, 'public', m.nome);
    aplicadas.push(`public/${m.nome}`);
  }
  return aplicadas;
}

// Garante a existencia do schema do tenant.
export async function garantirSchema(ds: DataSource, schema: string): Promise<void> {
  const s = validarSchema(schema);
  await ds.query(`CREATE SCHEMA IF NOT EXISTS "${s}"`);
}

// Aplica as migrations dentro do schema de um tenant.
export async function migrarTenant(ds: DataSource, schema: string): Promise<string[]> {
  const s = validarSchema(schema);
  await garantirSchema(ds, s);
  await garantirLedger(ds, s);
  const aplicadas: string[] = [];
  for (const m of tenantMigrations) {
    if (await jaAplicada(ds, s, m.nome)) continue;
    await ds.query(m.sql(s));
    await registrar(ds, s, m.nome);
    aplicadas.push(`${s}/${m.nome}`);
  }
  return aplicadas;
}

// Migra o public e, em seguida, todos os tenants ja registrados.
export async function migrarTudo(ds: DataSource): Promise<string[]> {
  const todas: string[] = [];
  todas.push(...(await migrarPublic(ds)));
  const empresas: Array<{ schema_name: string }> = await ds.query(
    `SELECT schema_name FROM public.empresa WHERE ativo = true`,
  );
  for (const e of empresas) {
    todas.push(...(await migrarTenant(ds, e.schema_name)));
  }
  return todas;
}
