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
  {
    nome: '008_pedido',
    sql: (s) => `
      CREATE SEQUENCE IF NOT EXISTS "${s}".pedido_numero_seq START 1;
      CREATE TABLE IF NOT EXISTS "${s}".pedido (
        id              uuid PRIMARY KEY,
        numero          integer NOT NULL,
        cliente_id      uuid REFERENCES "${s}".cliente(id),
        vendedor_id     uuid REFERENCES "${s}".vendedor(id),
        status          text NOT NULL DEFAULT 'orcamento',
        forma_pagamento text,
        observacao      text,
        endereco_entrega text,
        subtotal        numeric(14,2) NOT NULL DEFAULT 0,
        frete           numeric(14,2) NOT NULL DEFAULT 0,
        total           numeric(14,2) NOT NULL DEFAULT 0,
        criado_em       timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "${s}".pedido_item (
        id             uuid PRIMARY KEY,
        pedido_id      uuid NOT NULL REFERENCES "${s}".pedido(id) ON DELETE CASCADE,
        produto_id     uuid REFERENCES "${s}".produto(id),
        produto_nome   text NOT NULL,
        quantidade     numeric(14,3) NOT NULL,
        preco_unitario numeric(14,2) NOT NULL,
        subtotal       numeric(14,2) NOT NULL
      );
    `,
  },
  {
    nome: '009_estoque',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".estoque_lote (
        id             uuid PRIMARY KEY,
        produto_id     uuid NOT NULL REFERENCES "${s}".produto(id),
        lote           text,
        validade       date,
        quantidade     numeric(14,3) NOT NULL DEFAULT 0,
        custo_unitario numeric(14,2) NOT NULL DEFAULT 0,
        criado_em      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_${s}_estoque_lote_prod ON "${s}".estoque_lote(produto_id);
      CREATE TABLE IF NOT EXISTS "${s}".estoque_movimento (
        id         uuid PRIMARY KEY,
        produto_id uuid NOT NULL REFERENCES "${s}".produto(id),
        lote_id    uuid REFERENCES "${s}".estoque_lote(id),
        tipo       text NOT NULL,
        quantidade numeric(14,3) NOT NULL,
        observacao text,
        criado_em  timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '010_financeiro',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".titulo (
        id              uuid PRIMARY KEY,
        tipo            text NOT NULL,
        descricao       text NOT NULL,
        pessoa_nome     text,
        valor           numeric(14,2) NOT NULL,
        vencimento      date NOT NULL,
        status          text NOT NULL DEFAULT 'aberto',
        forma_pagamento text,
        pago_em         timestamptz,
        origem          text NOT NULL DEFAULT 'manual',
        pedido_id       uuid,
        criado_em       timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_${s}_titulo_tipo ON "${s}".titulo(tipo);
    `,
  },
  {
    nome: '011_recebimento',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".recebimento (
        id             uuid PRIMARY KEY,
        fornecedor_nome text,
        produto_id     uuid REFERENCES "${s}".produto(id),
        produto_nome   text NOT NULL,
        quantidade     numeric(14,3) NOT NULL,
        custo_unitario numeric(14,2) NOT NULL,
        total          numeric(14,2) NOT NULL,
        nf             text,
        titulo_id      uuid,
        status         text NOT NULL DEFAULT 'pendente',
        criado_em      timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
  {
    nome: '012_preco_cliente',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".preco_cliente (
        cliente_id uuid NOT NULL REFERENCES "${s}".cliente(id) ON DELETE CASCADE,
        produto_id uuid NOT NULL REFERENCES "${s}".produto(id) ON DELETE CASCADE,
        preco      numeric(14,2) NOT NULL,
        PRIMARY KEY (cliente_id, produto_id)
      );
    `,
  },
  {
    nome: '013_preco_campanha',
    sql: (s) => `
      CREATE TABLE IF NOT EXISTS "${s}".preco_campanha (
        id         uuid PRIMARY KEY,
        produto_id uuid NOT NULL REFERENCES "${s}".produto(id) ON DELETE CASCADE,
        preco      numeric(14,2) NOT NULL,
        motivo     text,
        de         date NOT NULL,
        ate        date NOT NULL,
        criado_em  timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_${s}_campanha_prod ON "${s}".preco_campanha(produto_id);
    `,
  },
];
