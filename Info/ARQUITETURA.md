# Proposta de Arquitetura — TRIADE ERP

> Documento de planejamento. **Nenhum código de sistema foi construído** —
> os trechos abaixo são **ilustrativos**, pra você aprovar a fundação antes
> de implementarmos. Versão do plano: 0.1.0.

Sumário:

1. Visão arquitetural
2. Estratégia multi-tenant
3. Escolha do ORM (com trade-offs)
4. Estrutura de pastas
5. Exemplo de implementação (ilustrativo)
6. Docker (ambiente local)
7. Configuração da aplicação
8. Passo a passo de execução
9. Boas práticas
10. Decisões e trade-offs

---

## 1. Visão arquitetural

Proposta: **Arquitetura Hexagonal (Ports & Adapters)** combinada com
**Repository Pattern** e uma **camada de aplicação (use cases / services)**.
O backend é um **monólito modular**: um único deploy, mas dividido em
**contextos delimitados** por módulo de negócio (Cadastros, Comercial,
Estoque, Financeiro). Cada módulo tem suas próprias camadas internas.

O princípio central: **a regra de negócio (domínio) fica no centro e não
conhece o mundo externo.** Banco, ORM, framework HTTP e integrações são
detalhes que ficam "na borda" e dependem do domínio — nunca o contrário
(regra da dependência apontando pra dentro).

```
            ┌───────────────────────────────────────────────┐
            │                 INTERFACE / API                │  Express/Fastify
            │   controllers · rotas · middlewares · DTOs      │  (driving adapter)
            └───────────────────────┬───────────────────────┘
                                     │ chama
            ┌───────────────────────▼───────────────────────┐
            │              APLICAÇÃO (use cases)              │
            │   orquestra o domínio · transações · DTOs       │
            │   depende de PORTS (interfaces), não de impl.   │
            └───────────────────────┬───────────────────────┘
                                     │ usa interfaces
            ┌───────────────────────▼───────────────────────┐
            │                    DOMÍNIO                      │  ← núcleo puro
            │  entidades · value objects · regras · PORTS     │  (sem ORM, sem SQL,
            │  ex: interface ProdutoRepository                │   sem framework)
            └───────────────────────▲───────────────────────┘
                                     │ implementa
            ┌───────────────────────┴───────────────────────┐
            │              INFRAESTRUTURA                     │  (driven adapters)
            │  TypeOrmProdutoRepository · mappers · migrations│
            │  conexão · adapter de e-mail/boleto/NF-e (fase2)│
            └────────────────────────────────────────────────┘
```

**Por que essas três técnicas juntas:**

- **Ports & Adapters (Hexagonal)** dá o desacoplamento macro: o banco é um
  adapter plugável. Trocar PostgreSQL por outro relacional = escrever um novo
  adapter, sem tocar em domínio/aplicação.
- **Repository Pattern** é o *port* concreto pra persistência: o domínio
  declara `interface XRepository`; a infra implementa com o ORM. É isso que
  impede SQL de vazar pra regra de negócio.
- **Service / Use Case layer** isola o "fluxo da operação" (ex: *aprovar
  pedido* = validar limite de crédito → reservar estoque → mudar status →
  emitir evento) das entidades e do transporte HTTP.

---

## 2. Estratégia multi-tenant — schema-por-tenant

Como você pediu **isolamento forte**, a proposta é **um schema PostgreSQL por
tenant** dentro de uma mesma instância (ex: `tenant_belle`, `tenant_harmonize`),
mais um schema `public` (ou `admin`) para o catálogo de tenants e usuários
globais.

```
Postgres
├── public            → tenants, usuários globais, mapeamento tenant→schema
├── tenant_belle      → produtos, clientes, pedidos, estoque... (cópia do schema)
├── tenant_harmonize  → idem, dados isolados
└── tenant_XXXX       → ...
```

**Fluxo por request:** middleware identifica o tenant (subdomínio ou claim do
JWT) → resolve o schema → abre uma unidade de trabalho apontando o
`search_path`/`schema` pra aquele tenant → injeta nos repositórios.

**Trade-offs honestos** (já registrei isso na conversa):

- ✅ Isolamento real, backup/restore por cliente, sem risco de vazar dado
  entre tenants por bug de query.
- ⚠️ Migrations rodam **N vezes** (uma por schema) — precisa de um runner que
  itere os tenants.
- ⚠️ Seed e provisionamento de tenant novo viram um processo (criar schema +
  rodar migrations + seed base).
- ⚠️ Mais conexões / troca de contexto por request.

> **DECISÃO FECHADA (2026-05-27): schema-por-tenant.** Honra o requisito de
> isolamento forte. O "tenant resolver" (resolução de schema por request) fica
> isolado numa única peça, então **domínio e use cases não mudam** se um dia
> migrarmos pra RLS. Sinceridade de senior: a migração pra RLS *não é grátis* —
> o modelo de dados difere (RLS exige coluna `tenant_id` em toda tabela +
> políticas), então é trabalho de infra, ainda que sem tocar na regra de
> negócio.

Alternativa considerada e **descartada**: schema único + `tenant_id` + **RLS**
do Postgres — mais simples de operar, porém isolamento lógico (não físico).
Como o pedido foi isolamento forte, ficamos no schema-por-tenant.

---

## 3. Escolha do ORM

**Recomendação: TypeORM.** Alternativa elegante: MikroORM.

O requisito decisivo é a combinação **(a) trocar entre PostgreSQL / MySQL /
SQL Server + (b) schema-por-tenant dinâmico em runtime + (c) migrations
maduras + (d) TypeScript moderno**. Isso elimina os ORMs da moda:

| ORM | Postgres | MySQL | SQL Server | Schema/tenant dinâmico | Migrations | Veredito |
|---|---|---|---|---|---|---|
| **TypeORM** | ✅ | ✅ | ✅ | ✅ (DataSource/`search_path` por tenant) | ✅ CLI madura | **Recomendado** |
| **MikroORM** | ✅ | ✅ | ✅ | ✅ (1ª classe, `schema` por fork) | ✅ | Ótima alternativa (DDD mais puro) |
| Prisma | ✅ | ✅ | ✅ | ⚠️ schema é estático; tenant dinâmico exige client por tenant | ✅ | Atrito com schema-por-tenant |
| Drizzle | ✅ | ✅ | ❌ | ⚠️ manual | ✅ | **Reprovado: sem SQL Server** |
| Sequelize | ✅ | ✅ | ✅ | ⚠️ | ⚠️ tipagem fraca | Legado, TS fraco |

**Por que TypeORM e não os trendy (Prisma/Drizzle):** Prisma gera um client
a partir de um schema estático — multi-tenancy por schema dinâmico obriga a
instanciar um client por tenant (pesado) e o `multiSchema` é pra schemas
conhecidos em build-time, não pra criar tenants em runtime. Drizzle é
excelente e type-safe, mas **não suporta SQL Server**, o que viola seu
requisito explícito de poder trocar pra ele.

**Por que isso importa pouco no fim:** como a persistência está atrás de
interfaces (Repository Pattern), o ORM é um **detalhe de implementação na
infra**. Se um dia quisermos trocar o próprio ORM, mexemos só nos adapters —
domínio e use cases não enxergam o ORM. A escolha é importante, mas não é uma
jaula.

> Se você preferir a pureza DDD (Unit of Work + Identity Map mais limpos),
> trocar a recomendação pra **MikroORM** é uma decisão de baixo custo agora.

---

## 4. Estrutura de pastas

Monorepo enxuto: front, api e código compartilhado (tipos/contratos).

```
ERP_TRIADE/
├── CLAUDE.md
├── docker-compose.yml
├── .env.example
├── package.json                 # workspaces
├── Info/                         # planos e docs (saída do Claude)
│   ├── ARQUITETURA.md
│   └── history/
├── scripts/                      # scripts .sh únicos (db:up, migrate, seed...)
│
├── packages/
│   └── shared/                   # tipos/contratos compartilhados front↔api
│       └── src/
│
├── apps/
│   ├── web/                      # React (Vite + TS)
│   │   └── src/
│   │       ├── features/         # comercial, estoque, financeiro, admin
│   │       ├── i18n/             # locales pt-BR / en-US / es
│   │       ├── components/
│   │       ├── lib/ (api client + formatação de data por timezone)
│   │       └── App.tsx
│   │
│   └── api/                      # Node + TS
│       └── src/
│           ├── main.ts           # bootstrap do servidor
│           ├── config/           # env, DataSource — config centralizada
│           │   ├── env.ts
│           │   └── data-source.ts
│           ├── shared/           # kernel: erros, Result, base Entity, DI,
│           │                     #   Clock (UTC), i18n, CapabilityRegistry
│           │
│           ├── modules/
│           │   ├── cadastros/
│           │   │   ├── domain/           # ← núcleo puro
│           │   │   │   ├── produto.entity.ts
│           │   │   │   ├── produto.repository.ts   # PORT (interface)
│           │   │   │   └── value-objects/
│           │   │   ├── application/      # use cases
│           │   │   │   ├── criar-produto.usecase.ts
│           │   │   │   └── dtos/
│           │   │   ├── infra/            # ← adapters
│           │   │   │   ├── persistence/
│           │   │   │   │   ├── produto.orm-entity.ts   # mapping TypeORM
│           │   │   │   │   ├── produto.mapper.ts
│           │   │   │   │   └── typeorm-produto.repository.ts
│           │   │   │   └── module.ts     # wiring/DI do módulo
│           │   │   └── interface/        # HTTP
│           │   │       ├── produto.controller.ts
│           │   │       └── produto.routes.ts
│           │   ├── comercial/    # mesma estrutura (pedidos, aprovação...)
│           │   ├── estoque/      # (saldo, lote, validade, transferência)
│           │   ├── financeiro/   # (AR/AP, boleto interno, fluxo de caixa)
│           │   └── acesso/       # empresa, usuário, perfil, funcionalidade
│           │
│           └── infra/
│               ├── db/
│               │   ├── migrations/
│               │   ├── seeds/
│               │   └── tenant/  # resolver de tenant + runner de migrations
│               └── storage/     # FileStorage: local (dev) / S3-compatível (prod)
```

A regra visual: **dentro de cada módulo, `domain/` nunca importa de `infra/`
ou `interface/`.** As setas de dependência apontam sempre pra `domain/`.

---

## 5. Exemplo de implementação (ilustrativo)

Usando o **Produto** como fio condutor. Código só pra mostrar o padrão — não
é o sistema final.

**5.1 — Entidade de domínio (pura, sem ORM):**

```ts
// modules/cadastros/domain/produto.entity.ts
export class Produto {
  private constructor(
    public readonly id: string,
    public nome: string,
    public categoria: CategoriaProduto,
    public precoVenda: Dinheiro,    // value object
    public unidade: string,
    private _saldo: number,
  ) {}

  static criar(props: CriarProdutoProps): Produto { /* validações de regra */ }

  baixarEstoque(qtd: number): void {
    if (qtd > this._saldo) throw new EstoqueInsuficienteError(this.id);
    this._saldo -= qtd;
  }
}
```

**5.2 — Port (interface de repositório, no domínio):**

```ts
// modules/cadastros/domain/produto.repository.ts
export interface ProdutoRepository {
  salvar(produto: Produto): Promise<void>;
  porId(id: string): Promise<Produto | null>;
  listar(filtro: FiltroProduto): Promise<Produto[]>;
}
```

**5.3 — Use case (depende da interface, não do ORM):**

```ts
// modules/cadastros/application/criar-produto.usecase.ts
export class CriarProdutoUseCase {
  constructor(private readonly produtos: ProdutoRepository) {}   // ← injeção

  async executar(input: CriarProdutoDTO): Promise<{ id: string }> {
    const produto = Produto.criar(input);
    await this.produtos.salvar(produto);
    return { id: produto.id };
  }
}
```

**5.4 — Adapter concreto (infra, único lugar que conhece o ORM):**

```ts
// modules/cadastros/infra/persistence/typeorm-produto.repository.ts
export class TypeOrmProdutoRepository implements ProdutoRepository {
  constructor(private readonly em: EntityManager) {}   // já no schema do tenant

  async salvar(produto: Produto): Promise<void> {
    const orm = ProdutoMapper.toOrm(produto);           // domínio → mapping
    await this.em.getRepository(ProdutoOrmEntity).save(orm);
  }
  async porId(id: string): Promise<Produto | null> {
    const row = await this.em.getRepository(ProdutoOrmEntity).findOneBy({ id });
    return row ? ProdutoMapper.toDomain(row) : null;    // mapping → domínio
  }
  // ...
}
```

**5.5 — Injeção de dependência (wiring do módulo):**

```ts
// modules/cadastros/infra/module.ts
export function buildCadastrosModule(em: EntityManager) {
  const produtoRepo = new TypeOrmProdutoRepository(em);
  const criarProduto = new CriarProdutoUseCase(produtoRepo);
  return { controllers: [new ProdutoController(criarProduto)] };
}
```

O controller só traduz HTTP↔use case; nenhuma regra de negócio nele.

---

## 6. Docker (ambiente local)

`docker-compose.yml` (conteúdo proposto — criamos na fase de implementação):

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: triade_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - triade_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  triade_pgdata:      # persistência entre reinícios
```

Volume nomeado garante que os dados sobrevivem a `docker compose down`
(some só com `down -v`).

---

## 7. Configuração da aplicação

**`.env.example`** (versionado; o `.env` real fica no `.gitignore`):

```env
# Banco
DB_PROVIDER=postgres          # ponto único pra trocar de banco no futuro
DB_HOST=localhost
DB_PORT=5432
DB_USER=triade
DB_PASSWORD=triade_dev
DB_NAME=triade
DB_POOL_SIZE=10               # connection pooling

# App
NODE_ENV=development
API_PORT=3333
JWT_SECRET=troque-em-producao
```

**Conexão centralizada + pooling + troca de provider** (config num único
lugar — `config/data-source.ts`):

```ts
import { DataSource } from "typeorm";
import { env } from "./env";

export const AppDataSource = new DataSource({
  type: env.DB_PROVIDER,        // 'postgres' | 'mysql' | 'mssql' → 1 variável
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [/* *.orm-entity.ts */],
  migrations: ["src/infra/db/migrations/*.ts"],
  extra: { max: env.DB_POOL_SIZE },   // pool
  synchronize: false,                  // NUNCA true → sempre migrations
});
```

Trocar de banco no futuro = mudar `DB_PROVIDER` + instalar o driver. O
domínio não muda.

**Migrations** (TypeORM CLI):

```bash
npm run migration:generate -- src/infra/db/migrations/CriaProduto
npm run migration:run        # roda nos schemas dos tenants (runner itera)
```

**Inicialização do app** (`main.ts`): carrega env → inicializa DataSource →
monta módulos (DI) → registra rotas → sobe servidor.

---

## 8. Passo a passo de execução

```bash
# 1. Subir o banco
cp .env.example .env
docker compose up -d            # Postgres no ar, com volume persistente

# 2. Instalar dependências (monorepo)
npm install

# 3. Rodar migrations (cria as tabelas em cada schema de tenant)
npm run migration:run

# 4. (opcional) Seed inicial
npm run seed

# 5. Iniciar
npm run dev          # sobe api (3333) e web (5173) juntos
```

Tudo isso vai virar **um script único** (`scripts/dev-up.sh`) conforme a
regra de operação do CLAUDE.md.

---

## 9. Boas práticas (manter o backend desacoplado)

- **Não espalhar SQL.** Toda persistência passa por repositório. Zero query
  crua em controller ou use case.
- **Domínio não importa o ORM.** Entidade de domínio ≠ entidade de mapping;
  conversão por mapper. Se o domínio importar `typeorm`, o desacoplamento
  quebrou.
- **Interfaces pra repositório**, sempre. Use case depende da abstração.
- **Config de banco centralizada** num módulo único; nada de credencial ou
  string de conexão fora do `config/`.
- **Testes com fakes.** Use case testa com `InMemoryProdutoRepository`
  (implementa a mesma interface) — rápido, sem banco. Banco só nos testes de
  integração da infra.
- **Fronteiras fiscais/pagamento atrás de port.** `BoletoGateway`,
  `NotaFiscalGateway` são interfaces; no MVP têm impl. "fake/interno", na
  fase 2 ganham impl. real sem tocar no domínio.
- **Lint de arquitetura** (opcional, recomendado): regra de import que proíbe
  `domain/` de importar `infra/` (ex: `eslint-plugin-boundaries`).

---

## 10. Decisões e trade-offs (resumo)

| Decisão | Escolha | Trade-off |
|---|---|---|
| Estilo | Hexagonal + Repository + Use Cases | Mais boilerplate inicial; paga em troca de banco/testes |
| Deploy | Monólito modular | Simples de operar; se um módulo explodir, extrai-se depois |
| Multi-tenant | Schema-por-tenant | Isolamento forte; migrations rodam N× |
| ORM | TypeORM | Maduro e multi-banco; menos "type-safe" que Drizzle (que não tem SQL Server) |
| Banco | PostgreSQL | Trocável via `DB_PROVIDER`; domínio agnóstico |
| Fiscal/pgto | Fase 2, atrás de port | MVP entrega rápido; integração real isolada |
| Auth (suposição) | E-mail/senha + JWT | SSO fica pra depois |
| Datetime | UTC no banco/backend, conversão só no front | Front carrega a lógica de timezone |
| Permissões | Catálogo auto-descoberto (registry no boot) | Menos flexível que CRUD livre — e é essa a intenção |
| Branding | White-label por empresa: logo, nome fantasia, paleta de cores | Exige storage de arquivo (port) |
| Nomenclatura | Empresa = tenant · Cliente = comprador | Vocabulário alinhado à UI |

---

## 11. Identidade, Acesso e Tenancy (a área administrativa)

Contexto novo: **Acesso**. É a "área administrativa" e mora em parte no
**schema global** (catálogo de empresas/tenants e usuários globais) e em parte
no **schema do tenant** (usuários, perfis e dados daquela empresa).

> **DECISÃO FECHADA (2026-05-27): nomenclatura.** Pra eliminar a ambiguidade:
> **Empresa** = a conta/distribuidora que assina e usa o TRIADE (o **tenant**;
> seu perfil é a tela "Dados da empresa"). **Cliente** = a clínica/instituto
> que compra produtos (módulo Comercial). Esse vocabulário vale no domínio e na
> UI — alinhado com a tela "Dados da empresa" do mockup.

Entidades:

- **Empresa (tenant)** — *schema global*. razão social, nome fantasia,
  slug/subdomínio, CNPJ, **idioma padrão** (pt-BR/en-US/es), **timezone
  padrão** (IANA, ex: `America/Sao_Paulo`), **logo** e **paleta de cores**,
  status, schema mapeado.
- **Usuário** — *schema do tenant*. nome, e-mail, senha (hash **argon2**),
  **idioma e timezone pessoais opcionais** (sobrescrevem os da empresa),
  status, vínculo a um ou mais **Perfis**. O acesso à área administrativa é
  decidido por funcionalidade do perfil, não por uma flag solta.
- **Perfil** — *schema do tenant*. nome (Diretoria, Comercial, Financeiro…) e
  a lista de **Funcionalidades** vinculadas.
- **Funcionalidade** — **catálogo global gerado pelo sistema** (ver 11.1).

### 11.1 Funcionalidades auto-descobertas (não é CRUD)

Requisito-chave: as funcionalidades vinculáveis ao perfil são **geradas pelo
sistema**, não cadastradas à mão. Padrão proposto: **registry de capabilities
descoberto no boot.**

- Cada use case / rota **declara** sua funcionalidade junto do código:

  ```ts
  registerCapability({
    key: "comercial.pedido.aprovar",
    module: "comercial",
    labelKey: "cap.comercial.pedido.aprovar",   // i18n, não texto fixo
  });
  ```

- No startup, o `CapabilityRegistry` coleta todas as declarações e
  **sincroniza** o catálogo (read-only pro admin). Feature nova no código →
  funcionalidade nova aparece sozinha na tela de perfil.
- A tela de **Perfil** lista o catálogo agrupado por módulo, com um check por
  funcionalidade. O admin **vincula** — nunca cria ou edita o catálogo.
- Os guards de autorização (middleware na borda + checagem no use case)
  validam a `key` contra as funcionalidades do perfil do usuário.

Ganho: zero divergência entre "o que o código faz" e "o que dá pra liberar".
Sem permissão órfã, sem CRUD manual de permissão.

## 12. Datetime em UTC e Internacionalização (i18n)

**Regra de ouro: tudo em UTC no backend e no banco; conversão de timezone só
na borda de apresentação (frontend).**

- **Banco:** colunas de data/hora como `timestamptz`, sempre em UTC. Container
  do Postgres e processo Node com `TZ=UTC`.
- **Domínio:** um port `Clock` (`now(): Date` em UTC) injetado — nunca
  `new Date()` solto. Garante UTC e deixa o tempo testável (clock fake).
- **API:** serializa em ISO 8601 com `Z` (ex: `2026-05-27T18:30:00Z`); recebe
  sempre UTC.
- **Frontend (React):** converte UTC → timezone resolvido (**usuário >
  cliente**) na exibição, e local → UTC ao enviar. Lib `date-fns-tz` ou
  `Luxon`; moeda/número/data por locale via `Intl`.
- **Por que IANA e não offset fixo:** offset muda com horário de verão;
  guardar `America/Sao_Paulo` é correto, `-03:00` não. Recomendo armazenar
  **timezone IANA** e derivar o offset na exibição.

**i18n:** idioma resolvido por request (preferência do usuário → padrão do
cliente → `Accept-Language`). Backend usa **chaves** i18n (inclusive nos
labels de funcionalidade). Frontend: `react-i18next` com locales pt-BR /
en-US / es.

## 13. Branding — white-label por empresa

Branding é **por empresa (tenant)**, não global. Cada Empresa, na tela
**"Dados da empresa"**, define:

- **Logo** — aparece no menu lateral quando seus usuários estão logados e na
  tela de login.
- **Nome fantasia** — exibido no menu e no login.
- **Paleta de cores** — quatro grupos independentes aplicados ao layout via
  CSS variables: **Primária** (`--accent`, usada em botões e destaques),
  **Secundária** (`--accent2`, realces e saldos), **Menu — fundo** (`--side`)
  e **Menu — fonte** (`--side-ink`). Cada grupo expõe 44 cores curadas
  cobrindo 13 matizes em 3 tons cada + 5 neutros (incluindo branco e preto)
  — o mesmo conjunto nas quatro paletas, mudando só a cor inicial selecionada.

O produto traz uma identidade **padrão (TRIADE)**, usada enquanto a empresa
não personaliza. Não há tela separada de "marca do software" — a identidade
vive no perfil de cada empresa.

### 13.1 Tema claro automático no menu

Quando a empresa pinta o **fundo do menu** com uma cor clara (luminância
percebida > 170/255), o sistema detecta e:

- aplica a classe `.sidebar.is-light` no `<aside>`, ativando overrides de CSS
  (cor do brand-logo, separadores, hover/active com `color-mix(#000)` em vez
  de `#fff`);
- recalcula `--side-fg` (cor do hover/ativo) para tom escuro;
- se a **cor da fonte do menu** ficou com contraste ruim, força um fallback
  apropriado (cinza-escuro em fundo claro, cinza-claro em fundo escuro) e
  atualiza visualmente o chip selecionado na paleta.

A mesma lógica vale para a **primária**: ao escolher uma primária clara, o
JS recalcula `--accent-fg` (texto sobre botões) para escuro, evitando texto
branco em fundo branco. No backend isso é só persistência (`empresa.branding`
guardando hex + caches dos derivados); a inteligência fica no front.

**Upload de logo** entra atrás de um port `FileStorage` (adapter local em dev,
S3-compatível em prod); o domínio guarda só a referência (id/URL), nunca o
binário. Upload validado (tipo de imagem, tamanho) e — pela regra de
segurança — o sistema jamais executa nada vindo do arquivo.

## 14. Área administrativa — dois escopos

- **Super-admin (global):** provisiona Empresas (cria schema + roda migrations
  + seed) e administra o catálogo de tenants.
- **Admin da empresa (tenant):** gerencia Usuários, Perfis (com o vínculo das
  funcionalidades auto-descobertas) e os **Dados da empresa** (logo, nome
  fantasia, paleta de cores, idioma e timezone padrão).

No React, a área administrativa é um conjunto de telas sob `features/admin`,
cada ação liberada pela funcionalidade correspondente do perfil.

---

### Decisões fechadas (2026-05-27)

- **Multi-tenant:** schema-por-tenant (isolamento forte).
- **Nomenclatura:** Empresa = tenant · Cliente = comprador.
- **Branding:** white-label por empresa (logo, nome fantasia, paleta de cores).

### Decisões fechadas (2026-05-28)

- **Nome do produto:** **TRIADE / ERP TRIADE** (genérico, qualquer
  distribuidora de produtos estéticos pode adotar). A iSKINS deixa de ser a
  identidade do produto e passa a ser tratada como cliente potencial.
- **Branding — quatro grupos de cores:** Primária, Secundária, Menu (fundo)
  e Menu (fonte), independentes. Tema claro do sidebar é derivado por
  luminância, não por configuração explícita. Texto em superfícies de marca
  (botões primários, ícones do menu) adapta para garantir contraste.
- **UX do Financeiro (Contas a pagar/receber)** — convenções fechadas:
  ações por linha em ícones com tooltip; exclusão exige confirmação; filtros
  avançados em modal centralizado com 14 campos; pesquisa global na toolbar;
  ações em massa habilitadas via seleção; KPIs do topo são filtros
  interativos pré-configurados.

### Próximos passos

1. Scaffold do monorepo (`apps/web`, `apps/api`, `packages/shared`) + Docker.
2. Implementar **Acesso** (empresa, usuário, perfil, funcionalidades) +
   **Cadastros** como módulos de referência.
3. Replicar o padrão nos demais módulos.

**Fontes do levantamento:** dashboard de distribuidora estética real (screenshot de referência) e módulos de ERP de
mercado para comparação — [WK Radar ERP](https://wk.com.br/erp/),
[Gestão de Vendas](https://wk.com.br/solucao/gestao-de-vendas/),
[Gestão de Finanças](https://wk.com.br/solucao/gestao-de-financas/).
