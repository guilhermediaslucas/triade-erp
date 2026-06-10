// Migrations aplicadas DENTRO do schema de cada tenant.
// O nome do schema ja vem validado pelo runner.
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
];
