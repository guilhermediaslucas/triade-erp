// Migrations do schema public (registro de tenants). SQL versionado e explicito.
export interface MigracaoPublic {
  nome: string;
  sql: string;
}

export const publicMigrations: MigracaoPublic[] = [
  {
    nome: '001_empresa',
    sql: `
      CREATE TABLE IF NOT EXISTS public.empresa (
        id          uuid PRIMARY KEY,
        codigo      text UNIQUE NOT NULL,
        nome        text NOT NULL,
        fantasia    text NOT NULL,
        schema_name text UNIQUE NOT NULL,
        ativo       boolean NOT NULL DEFAULT true,
        criado_em   timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
];
