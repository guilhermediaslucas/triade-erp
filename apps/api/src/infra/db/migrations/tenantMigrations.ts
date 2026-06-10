// Migrations aplicadas DENTRO do schema de cada tenant.
export interface MigracaoTenant {
  nome: string;
  sql: (schema: string) => string;
}

export const tenantMigrations: MigracaoTenant[] = [
  {
    nome: '001_usuario',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".usuario (
        id         uuid PRIMARY KEY,
        nome       text NOT NULL,
        email      text UNIQUE NOT NULL,
        senha_hash text NOT NULL,
        ativo      boolean NOT NULL DEFAULT true,
        criado_em  timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '002_perfil',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".perfil (
        id        uuid PRIMARY KEY,
        nome      text NOT NULL,
        criado_em timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "${s}".perfil_capability (
        perfil_id  uuid NOT NULL REFERENCES "${s}".perfil(id) ON DELETE CASCADE,
        capability text NOT NULL,
        PRIMARY KEY (perfil_id, capability)
      );
      ALTER TABLE "${s}".usuario
        ADD COLUMN IF NOT EXISTS perfil_id uuid REFERENCES "${s}".perfil(id);
    `,
  },
];
