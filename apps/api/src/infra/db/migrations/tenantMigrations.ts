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
  {
    nome: '003_cadastros',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".categoria (
        id        uuid PRIMARY KEY,
        nome      text NOT NULL,
        criado_em timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "${s}".produto (
        id             uuid PRIMARY KEY,
        nome           text NOT NULL,
        categoria_id   uuid REFERENCES "${s}".categoria(id),
        unidade        text NOT NULL DEFAULT 'UN',
        preco          numeric(14,2) NOT NULL DEFAULT 0,
        estoque_minimo integer NOT NULL DEFAULT 0,
        ativo          boolean NOT NULL DEFAULT true,
        criado_em      timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '004_pessoas',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".cliente (
        id             uuid PRIMARY KEY,
        tipo_pessoa    text NOT NULL DEFAULT 'PJ',
        nome           text NOT NULL,
        fantasia       text,
        documento      text NOT NULL,
        email          text,
        telefone       text,
        limite_credito numeric(14,2) NOT NULL DEFAULT 0,
        ativo          boolean NOT NULL DEFAULT true,
        criado_em      timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "${s}".fornecedor (
        id        uuid PRIMARY KEY,
        nome      text NOT NULL,
        fantasia  text,
        documento text NOT NULL,
        email     text,
        telefone  text,
        ativo     boolean NOT NULL DEFAULT true,
        criado_em timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "${s}".vendedor (
        id                  uuid PRIMARY KEY,
        nome                text NOT NULL,
        email               text,
        telefone            text,
        comissao_percentual numeric(5,2) NOT NULL DEFAULT 0,
        ativo               boolean NOT NULL DEFAULT true,
        criado_em           timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '005_cliente_endereco',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".cliente_endereco (
        id          uuid PRIMARY KEY,
        cliente_id  uuid NOT NULL REFERENCES "${s}".cliente(id) ON DELETE CASCADE,
        cep         text,
        logradouro  text,
        numero      text,
        complemento text,
        bairro      text,
        cidade      text,
        uf          text,
        favorito    boolean NOT NULL DEFAULT false
      );
      CREATE INDEX IF NOT EXISTS idx_${s}_cliente_endereco ON "${s}".cliente_endereco(cliente_id);
    `,
  },
  {
    nome: '006_fidelidade_mockup',
    sql: (s) => `
      ALTER TABLE "${s}".produto DROP COLUMN IF EXISTS preco;
      ALTER TABLE "${s}".produto ADD COLUMN IF NOT EXISTS localizacao text;
      ALTER TABLE "${s}".produto ADD COLUMN IF NOT EXISTS registro_anvisa text;
      ALTER TABLE "${s}".fornecedor ADD COLUMN IF NOT EXISTS cep text;
      ALTER TABLE "${s}".fornecedor ADD COLUMN IF NOT EXISTS cidade text;
      ALTER TABLE "${s}".fornecedor ADD COLUMN IF NOT EXISTS uf text;
      ALTER TABLE "${s}".vendedor ADD COLUMN IF NOT EXISTS regiao text;
      ALTER TABLE "${s}".vendedor ADD COLUMN IF NOT EXISTS meta_mensal numeric(14,2) NOT NULL DEFAULT 0;
      ALTER TABLE "${s}".vendedor ADD COLUMN IF NOT EXISTS segue_regra_geral boolean NOT NULL DEFAULT false;
    `,
  },
  {
    nome: '007_preco_base',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".preco_base (
        produto_id    uuid PRIMARY KEY REFERENCES "${s}".produto(id) ON DELETE CASCADE,
        preco         numeric(14,2) NOT NULL DEFAULT 0,
        atualizado_em timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
];
