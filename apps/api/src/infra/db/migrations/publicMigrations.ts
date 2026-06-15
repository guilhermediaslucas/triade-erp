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
  {
    nome: '003_super_admin',
    sql: `
      CREATE TABLE IF NOT EXISTS public.super_admin (
        id         uuid PRIMARY KEY,
        email      text UNIQUE NOT NULL,
        senha_hash text NOT NULL,
        nome       text NOT NULL,
        criado_em  timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '004_empresa_identificacao',
    sql: `
      ALTER TABLE public.empresa
        ADD COLUMN IF NOT EXISTS cor_secundaria     text NOT NULL DEFAULT '#2563eb',
        ADD COLUMN IF NOT EXISTS logo_altura        int  NOT NULL DEFAULT 44,
        ADD COLUMN IF NOT EXISTS cnpj               text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS inscricao_estadual text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS telefone           text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS email              text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS logradouro         text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS bairro             text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS cep                text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS uf                 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS cidade             text NOT NULL DEFAULT '';
    `,
  },
  {
    nome: '005_chamado_suporte',
    sql: `
      CREATE TABLE IF NOT EXISTS public.chamado_suporte (
        id             uuid PRIMARY KEY,
        tipo           text NOT NULL,
        assunto        text NOT NULL,
        descricao      text NOT NULL,
        print          text,
        tela           text NOT NULL DEFAULT '',
        versao         text NOT NULL DEFAULT '',
        empresa_codigo text NOT NULL DEFAULT '',
        usuario_nome   text NOT NULL DEFAULT '',
        usuario_email  text NOT NULL DEFAULT '',
        status         text NOT NULL DEFAULT 'aberto',
        criado_em      timestamptz NOT NULL DEFAULT now(),
        resolvido_em   timestamptz
      );
      CREATE INDEX IF NOT EXISTS idx_chamado_status ON public.chamado_suporte (status, criado_em DESC);
    `,
  },
  {
    nome: '006_reset_senha',
    sql: `
      CREATE TABLE IF NOT EXISTS public.reset_senha (
        id          uuid PRIMARY KEY,
        token_hash  text NOT NULL,
        email       text NOT NULL,
        schema_name text,
        usuario_id  uuid,
        expira_em   timestamptz NOT NULL,
        usado_em    timestamptz,
        criado_em   timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_reset_token ON public.reset_senha (token_hash);
    `,
  },
];
