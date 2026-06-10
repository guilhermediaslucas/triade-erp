export interface MigracaoPublic { nome: string; sql: string; }

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
  {
    nome: '002_empresa_branding',
    sql: `
      ALTER TABLE public.empresa
        ADD COLUMN IF NOT EXISTS logo            text,
        ADD COLUMN IF NOT EXISTS cor_primaria    text NOT NULL DEFAULT '#6d28d9',
        ADD COLUMN IF NOT EXISTS cor_menu_fundo  text NOT NULL DEFAULT '#0f172a',
        ADD COLUMN IF NOT EXISTS cor_menu_fonte  text NOT NULL DEFAULT '#cbd5e1',
        ADD COLUMN IF NOT EXISTS idioma_padrao   text NOT NULL DEFAULT 'pt-BR',
        ADD COLUMN IF NOT EXISTS timezone_padrao text NOT NULL DEFAULT 'America/Sao_Paulo';
    `,
  },
];
