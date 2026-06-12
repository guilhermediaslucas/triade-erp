# CLAUDE.md — TRIADE ERP

> **Versão atual: 0.1.0 (planejamento)** — fonte de verdade da versão.
> Sincronizar com `apps/api/package.json` e `apps/web/package.json` a cada
> release. Se divergir, este cabeçalho está desatualizado — corrigir antes
> de qualquer outra tarefa da nova sessão.
>
> Status: **Fase 1 em andamento (Acesso & Identidade).** Fase 0 concluída
> (monorepo, backend hexagonal, login ponta a ponta). **Fase 1 Entrega A feita:**
> perfis, permissões auto-descobertas (CapabilityRegistry no `packages/shared`),
> guard de autorização por capability, CRUD de Usuários e Perfis (backend + telas),
> menu respeitando permissões — tudo testado e2e contra Postgres real (12 testes PASS).
> **Fase 1 Entrega B1 feita:** branding white-label (Dados da empresa — logo,
> nome fantasia, paleta aplicada ao tema, idioma/timezone padrão da empresa),
> testado e2e (6 PASS). **Fase 1 Entrega B2 feita:** provisionar empresas
> (super-admin: cria tenant + schema + perfil Administrador + 1º usuário),
> isolamento entre tenants e idioma padrão da empresa aplicado no login —
> testado e2e (10 PASS). **Fase 1 concluída** (resta só, opcional, idioma/timezone
> por usuário — pode ir junto com Fase 2). **Fase 2 em andamento. Entrega 2A feita:**
> Categorias + Produtos. **Entrega 2B feita:** Clientes (PF/PJ, CPF/CNPJ, limite de
> crédito), Fornecedores e Vendedores (CRUD + telas sob Cadastros › Pessoas), e2e
> Postgres real (13 PASS). **Fase 2 concluída.** Menu alinhado ao mockup (Configurações
> reúne Usuários/Perfis/Dados da empresa; Cadastros com sub-rótulos Pessoas e
> Estoque/Expedição). **Fase 3 em andamento. Entrega 3A feita:** Comercial › Tabela de
> preço (preço base por produto; migration 007 `preco_base`; menu grupo Comercial), e2e
> Postgres real (6 PASS). Próximo na Fase 3: Novo pedido + lista + workflow + limite de
> crédito + reserva de estoque (3B). **Entrega 3B feita:** Novo pedido + lista + detalhe +
> workflow de status + limite de crédito (preço puxado da Tabela de preço; snapshot de item;
> endereço do favorito do cliente), e2e Postgres real (13 PASS). Reserva de estoque: gancho
> p/ Fase 4. Campanhas/preço por cliente: etapa posterior.
> Mockup em `Info/mockups/erp-mockup.html` segue como referência visual.
> Orçamento em `Info/ORCAMENTO-FASES.md`. Decidido: MVP sem fiscal (Fase 7 depois);
> banco = Postgres na nuvem (Neon).

---

## 1. O que é o TRIADE

ERP web de **distribuição B2B de produtos estéticos** (skincare, injetáveis,
cosméticos, equipamentos). Clientes finais são clínicas e institutos de
estética. A operação gira em torno de: cadastrar produtos/clientes, vender
(pedido com aprovação), separar/enviar, controlar estoque (com lote e
validade) e cobrar (financeiro).

**Módulos:** Cadastros · Comercial · Estoque/Logística · Financeiro ·
Relatórios · Configurações/Acesso.

**Características que definem a arquitetura:**

- **Multi-tenant com isolamento forte** → schema-por-tenant no PostgreSQL.
- **Backend agnóstico ao banco** → começa em PostgreSQL, preparado pra
  trocar (MySQL, SQL Server) sem reescrever regra de negócio.
- **Fiscal/pagamento (NF-e, boleto real) ficam pra fase 2**, isolados atrás
  de uma porta (adapter). No MVP são registro interno.
- Produtos têm **lote, validade e localização** (rastreabilidade) — domínio
  estético/regulado.
- **Datetime sempre em UTC** no banco/backend; conversão por timezone só na
  borda (frontend). A empresa (tenant) tem idioma e timezone padrão; usuário
  pode sobrescrever.
- **White-label por empresa:** cada empresa define logo, nome fantasia e
  paleta de cores aplicada ao layout (tela "Dados da empresa"). i18n
  pt-BR / en-US / es.
- **Permissões auto-descobertas:** as funcionalidades vinculáveis a perfil são
  geradas pelo sistema (registry no boot), **não** um CRUD manual.
- **Nomenclatura (decidido):** *Empresa* = tenant (conta que usa o sistema;
  perfil na tela "Dados da empresa"); *Cliente* = clínica compradora (módulo
  Comercial). Ver `Info/ARQUITETURA.md` §11.

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React (Vite + TypeScript) |
| Backend | Node.js + TypeScript |
| Banco | PostgreSQL (via abstração — trocável) |
| ORM | TypeORM (decisão e justificativa em `Info/ARQUITETURA.md`) |
| Infra local | Docker Compose (Postgres + pgAdmin opcional) |
| Config | variáveis de ambiente (`.env`) |

**Suposições assumidas** (stack moderna, conforme pedido): monorepo
`apps/web` + `apps/api` + `packages/shared`; TypeScript em ambos os lados;
autenticação por e-mail/senha + JWT no MVP, SSO depois. Se alguma dessas
não bater com o que você quer, me avise antes de codarmos.

## 3. Princípios de arquitetura (resumo — detalhe em Info/ARQUITETURA.md)

- **Hexagonal (Ports & Adapters)** + **Repository Pattern** + **Service/Use
  Case layer**. Separação rígida em **domínio / aplicação / infraestrutura /
  interface (API)**.
- O **domínio não conhece o ORM nem o banco**. Repositórios são **interfaces**
  (ports) no domínio; a implementação TypeORM vive na infraestrutura (adapter).
- **Zero SQL espalhado** pela aplicação. Toda persistência passa por
  repositório.
- **Config de banco centralizada** num único módulo; nada de string de
  conexão hardcoded.
- **Tenant é cidadão de primeira classe**: o schema do tenant é resolvido por
  request e injetado no contexto de persistência.

## 4. Regras de trabalho (token economy)

Aplicar em TODA sessão. Contexto é caro.

1. **Subagente pra trabalho mecânico.** Buscar/ler/contar/validar → `Agent`
   com `subagent_type: Explore` ou `general-purpose`. Reservar a thread
   principal pra design e código complexo.
2. **Respostas curtas.** Sem tabela decorativa, sem repetir resumo de coisa
   já dita.
3. **TaskCreate só pra trabalho > 3 etapas.** Coisa pequena (renomear, bump
   de versão, 1 import) faz direto.
4. **AskUserQuestion só pra decisão de produto real.** Se a resposta óbvia
   for "vai com o recomendado", segue e comenta no código.
5. **Read parcial > Read inteiro.** `Grep -A/-B/-C` pra pegar só o trecho.
   Read inteiro só se for modificar metade do arquivo.
6. **`Edit` > `Write`** em arquivo existente (Write reenvia o arquivo todo).
   Write só pra arquivo novo ou refactor > 70%. Exceção: JSONs de versão/
   config frágeis a edit acumulado → Write com overwrite.
7. **Histórico antigo** vai pra `Info/history/v0.NN.md`. Este CLAUDE.md
   mantém só o estado atual + últimos ~30 dias inline.
8. **Limpar a TaskList** periodicamente — ela vai como reminder em cada turn.
   Manter visíveis só in_progress, pending e as últimas concluídas da sprint.
9. **Avisar em ~70% da janela de contexto** e sugerir nova sessão (a memória
   persistente em `Info/` garante continuidade).

## 5. Regras de operação

### 5.1 Um script `.sh` único pra rodar — não one-liner colado
Pipelines (subir banco, migrar, seed, build, start) entram num **script
único** versionado em `scripts/`, não em comando solto no chat. Motivo: não
quebra no copy/paste, fica auditável, reexecutável.

### 5.2 Commit + push juntos
Nunca terminar sessão com working tree sujo. O que merece commit, vai
commit + push.

### 5.3 Raiz limpa
- Scripts ad-hoc → `scripts/`
- Migrations → `apps/api/src/infra/db/migrations/`
- Outputs do Claude (planos, relatórios) → `Info/`
- Logs e artefatos de build → `.gitignore`, nunca commitar

### 5.4 Decompor arquivo grande proativamente
Arquivo > **300 linhas** é decomposto **antes** de receber feature nova.
Vale dobrado pra componentes React e para use cases que cresceram demais.

### 5.5 Deploy/mudança agrupada
Vários fixes pequenos encadeados → um branch, valida com type-check, **um**
commit/deploy só. Exceção: hotfix de regressão em produção.

## 6. Convenções de código (anti-acoplamento ao banco)

- **Regra de negócio nunca importa o ORM.** Entidade de domínio é classe/
  tipo puro; entidade do ORM (mapping) vive na infra e é convertida via
  mapper.
- **Repositório sempre atrás de interface** (`ProdutoRepository` no domínio,
  `TypeOrmProdutoRepository` na infra).
- **Use case recebe repositório por injeção de dependência**, nunca instancia
  conexão.
- **Testes de domínio/aplicação usam repositório fake/in-memory** — não
  sobem banco. Banco só nos testes de integração da infra.
- TypeScript estrito (`strict: true`). Sem `any` em domínio.
- **Datetime:** banco em `timestamptz`/UTC; domínio usa port `Clock` (UTC),
  nunca `new Date()` solto. Conversão de timezone só no frontend.
- **Permissão:** toda rota/use case **declara** sua funcionalidade (capability)
  no código; o catálogo é sincronizado no boot, nunca cadastrado à mão.
- **Texto pro usuário sempre via chave i18n** — nada de string fixa em
  domínio/UI (inclui labels de funcionalidade).

## 7. Definition of Done

- [ ] Type-check passa (`tsc --noEmit`) nos dois apps
- [ ] Domínio não importa nada de `infra/` nem do ORM
- [ ] Migration criada se o schema mudou
- [ ] Testes de use case com repositório fake
- [ ] Versão sincronizada (cabeçalho ↔ package.json)
- [ ] Commit + push

## 8. Estado / histórico

- **2026-06-12** — **Paridade §6: Fluxo de caixa projetado (13 semanas, método direto).** Novo relatório
  **Financeiro › Fluxo projetado**: projeção rolling de 13 semanas a partir dos **títulos em aberto**.
  **Backend (sem migration):** `FinanceiroService.fluxoProjetado` — saldo inicial = caixa atual (Σ títulos
  pagos: receber + / pagar −, via `listarPagos`); para cada semana soma os títulos em aberto pela data de
  **vencimento** (receber=entrada, pagar=saída), com a **semana 1 absorvendo os vencidos** (`v <= ate`);
  saldo acumula semana a semana. Tipos `SemanaProjecao`/`RelatorioFluxoProj`. Rota
  `GET /financeiro/fluxo-projetado` (cap `financeiro.fluxo.ver`). **Frontend:** `RelFluxoProj.tsx` — 2 KPIs
  (saldo inicial/projetado), **gráfico SVG** do saldo (com baseline zero p/ saldo negativo) + tabela das 13
  semanas (período, entradas, saídas, saldo); menu Financeiro, i18n pt/en/es. **Validação:** **type-check
  api+web verde** + **e2e Postgres real (pglite, 6 PASS):** saldo inicial 700, vencido cai na S1 (saldo 800),
  entrada S2 (1300), saída S3 (1250), 13 semanas, saldo final 1250. **Pendente:** Gui git push.
- **2026-06-12** — **Polimento fino do dashboard (paridade pixel a pixel).** (1) **Deltas dos KPIs:** o
  `pct` do backend agora retorna **null** quando não havia período anterior (cur>0 e ant=0); o `Delta` mostra
  **"novo no período"** nesse caso. Sufixos em todos os cards ("vs ontem/sem. anterior/mês anterior/ano
  anterior"). O card **Clientes ativos** virou "X ativos no total" (sem %). (2) **Faturamento:** o gráfico
  SVG ganhou **eixo Y** com escala abreviada + **2ª série "Período anterior"** (linha tracejada/fade) — novo
  `faturamentoAnterior` no resumo (6 meses imediatamente anteriores, via `generate_series` -11..-6); legenda
  com as duas séries. (3) **"Vendas no mês" → "Vendas do mês"** (i18n). (4) **Rodapé do menu:** marca
  **TRÍADE ERP** + **Suporte · Central de ajuda** no fim da sidebar (flex column, `.sidebar-foot`). i18n
  pt/en/es. **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite, 7 PASS):** delta=null
  sem período anterior (dia/mês), faturamento atual e anterior com 6 meses, mês corrente=1000, série anterior
  zerada. **Pendente:** Gui git push + Ctrl+Shift+R.
- **2026-06-12** — **Fidelidade visual: ícones nos grupos do menu + números abreviados no dashboard.**
  Comparando as telas (sistema × mockup) o Gui apontou 2 diferenças: (1) os **grupos do menu** (Comercial,
  Financeiro, Estoque/Expedição, Logística, Relatórios, Cadastros, Configurações, Super-admin) não tinham
  **ícone** ao lado do nome — adicionado `icone` ao tipo `Grupo` + render no `nav-grupo-head` (🛒💲📦🚚📊📋⚙️🏢),
  CSS `.nav-grupo-lbl/.nav-grupo-ic`. (2) Os **números do dashboard** apareciam cheios (R$ 1.255,00) e o mockup
  **abrevia** — novo `abrevMoeda` em `lib/pedido` espelhando o `_fmtBig` do mockup (≥1M → `R$ X,XXM`; ≥mil →
  `R$ Xk` arredondado; senão valor cheio) aplicado aos 5 KPIs, donut (centro+legenda), Top produtos, Top
  clientes, fluxo do mês, saldos bancários, total em contas e aviso de a-receber-vencido. **Validação:**
  **type-check web verde** + conferência da abreviação (1842→`R$ 2k`, 1.25M→`R$ 1,25M`, <1000 cheio).
  **Pendente:** Gui git push + Ctrl+Shift+R.
- **2026-06-12** — **Paridade §6: Relatório de pedidos (lista plana com filtros).** Novo relatório
  **Relatórios › Pedidos** — lista **todos** os pedidos (inclui orçamento/cancelado, diferente do "Vendas")
  com filtro de **data** (criação) e **status** + export CSV/Excel. Colunas: nº, data, cliente, vendedor,
  forma de entrega, **forma de envio**, status, **entregue em**, total. **Backend:** `RelatorioRepository.pedidos`
  + `SqlRelatorioRepository.pedidos` (LEFT JOIN cliente/vendedor; filtros `de/ate/status` via params; sem o
  filtro ATIVO — mostra tudo); `RelatoriosService.pedidos` (lim ISO + status opcional). Rota
  `GET /relatorios/pedidos?de=&ate=&status=` (cap `relatorios.ver`). **Frontend:** `RelPedidos.tsx` (filtros +
  2 KPIs qtd/total + tabela + export), menu Relatórios, i18n pt/en/es. **Validação:** **type-check api+web
  verde** + **e2e Postgres real (pglite, 5 PASS):** lista os 4 (inclui orçamento/cancelado), traz forma de
  envio/entregue, filtra por status, filtra por data (exclui antigo), status inexistente→vazio. **Sem
  migration.** **Pendente:** Gui git push.
- **2026-06-12** — **Paridade §2: workflow de expedição (forma de envio ao expedir + data de entrega ao
  entregar).** Migration tenant **030** (`pedido.forma_envio`, `forma_envio_detalhe`, `entregue_em`).
  **Backend:** `Pedido` += os 3 campos; `PedidoRepository.definirExpedicao`/`definirEntrega`;
  `SqlPedidoRepository` mapeia/grava; **`PedidosService.mudarStatus`** ganhou `dados?` opcional e passou a
  **exigir** `formaEnvio` ao ir p/ **expedido** (→400 `pedido.forma_envio_obrigatoria`) e `entregueEm` (ISO)
  ao ir p/ **entregue** (→400 `pedido.data_entrega_obrigatoria`); grava os campos após a transição. Rota
  `PATCH /pedidos/:id/status` repassa `formaEnvio/formaEnvioDetalhe/entregueEm`. **Frontend:** componente
  compartilhado `ExpedicaoModais` (`ModalFormaEnvio` com datalist das formas ativas + detalhe opcional;
  `ModalDataEntrega`); **Kanban Expedição** abre o modal ao soltar em Expedido/Entregue; **Detalhe do pedido**
  idem ao clicar nos botões de status; ambos carregam as formas de entrega ativas; o detalhe exibe forma de
  envio + entregue em. i18n pt/en/es. **Importante:** como o backend passou a exigir esses dados, os dois
  caminhos (Kanban e detalhe) foram ajustados juntos — senão o botão de status quebraria. **Validação:**
  **type-check api+web verde** + **e2e Postgres real (pglite, 5 PASS):** expedir sem forma→400, expedir grava
  forma/detalhe, entregar sem data→400, entregar grava data, transição inválida segue 400. **Pendente:** Gui
  `git commit`+push (Windows) → boot do Render aplica a migration 030; relogar.
- **2026-06-12** — **Paridade §3: Regra geral de comissão (cadastro de regras).** Antes a apuração usava só o
  **% individual** do vendedor; agora há um **cadastro de regras** (Financeiro › Controle de comissões, seção
  "Regras de comissão"): nome, **taxa % por pedido**, **vendedor** (ou em branco = geral), **vigência** por
  período ou **indeterminada**, ativo. Migration tenant **029** (`comissao_regra`). **Resolução por pedido**
  (`SqlComissaoRepository.apurar` reescrito): para cada pedido a taxa é **1) regra do vendedor vigente na data
  → 2) regra geral vigente → 3) `comissao_percentual` do vendedor** (fallback/compat); a comissão soma
  `pedido.total × taxa/100` e o `%` exibido vira a taxa **efetiva**. **Backend:** domínio `ComissaoRegra`/
  `NovaComissaoRegra` + métodos no repo; `ComissoesService` (CRUD com validação: taxa 0–100, período não
  invertido, nome ≥2); rotas `/financeiro/comissoes/regras` (GET/POST/PUT/PATCH ativo, caps
  `financeiro.comissao.ver/gerenciar`). **Frontend:** seção "Regras de comissão" na tela Comissões (lista +
  modal: taxa, vendedor select [em branco=geral], check de vigência indeterminada, de/ate, ativar/inativar);
  i18n pt/en/es. **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite, 14 PASS):** sem
  regra usa % individual; geral indeterminada aplica a todos; específica do vendedor vence a geral; **regra por
  período resolve pedido a pedido** (pedido fora da vigência cai no fallback); CRUD valida taxa>100/período
  invertido/nome curto→400 e inexistente→404. **Pendente:** Gui `git commit`+push (Windows) → boot do Render
  aplica a migration 029 + caps; relogar. **Nota:** o `segue_regra_geral` do vendedor virou informativo — a
  resolução já prioriza as regras automaticamente.
- **2026-06-12** — **Paridade §3: Tipos de documento (cadastro + uso no título).** Novo cadastro **Cadastros ›
  Financeiro › Tipos de documento** (só nome + ativo; ex.: NF-e, Boleto, Fatura, Recibo). Migration tenant
  **028** (`tipo_documento` + `titulo.tipo_documento text`). Caps `cadastros.tipodoc.listar/gerenciar`
  (auto-sync no boot). **Backend (hexagonal):** domínio `TipoDocumento` + repo; `SqlTipoDocumentoRepository`;
  `TiposDocumentoService` (valida nome ≥2); rota `/tipos-documento`. **Uso no título:** `Titulo.tipoDocumento`/
  `NovoTitulo.tipoDocumento` (snapshot **texto**, não FK — não quebra ao renomear/excluir o cadastro);
  `SqlTituloRepository` grava/lê; `FinanceiroService.criar` repassa e o `parcelar` preserva. **Frontend:** tela
  de cadastro (padrão simples); **Novo título** (Contas) ganhou o select **Tipo de documento** (opcional, só
  ativos); aparece no detalhe (duplo-clique); menu Cadastros › Financeiro; i18n pt/en/es. **Validação:**
  **type-check api+web verde** + **e2e Postgres real (pglite, 6 PASS):** cadastro cria/lista/edita/inativa,
  nome curto→400, **título salva o tipoDocumento** e sem ele fica null. **Pendente:** Gui `git commit`+push
  (Windows) → boot do Render aplica a migration 028 + caps; relogar.
- **2026-06-12** — **Paridade §3/§10: redimensionar colunas por arraste (Contas).** Frontend puro. Cada
  cabeçalho redimensionável (descrição, pessoa, categoria, vencimento, valor, situação) ganhou uma **alça**
  (`.col-resize` na borda direita, cursor `col-resize`); arrastar ajusta a largura da coluna (mín. 60px) via
  `iniciarResize` (listeners de `mousemove`/`mouseup` no document). As larguras são **persistidas por tipo**
  em `localStorage` (`contas-larg-{receber|pagar}`), no mesmo padrão do esconder/mostrar colunas. Helper
  `thR(col, conteudo)` aplica a largura salva e a alça. **Validação:** **type-check web verde** (é
  comportamento de UI, sem e2e). **Pendente:** Gui git push. Com isso fecha o último ❌ de UI da paridade;
  restam só itens fora de escopo (CRM por decisão; tipos de documento; regra geral de comissão) e uns ⚠️ que
  pedem só conferência no ar.
- **2026-06-12** — **Paridade §5: UF + municípios IBGE no endereço.** Nos endereços (Clientes multi-endereço
  e Fornecedores), o campo **UF** virou **select** (27 siglas, `UFS` em `lib/br.ts`) e a **cidade** ganhou um
  **datalist** com os municípios da UF buscados na **API do IBGE** (`buscarMunicipios`, cache por UF). É
  `<input list>` (não select estrito) — preserva o auto-preenchimento por **CEP/ViaCEP** e aceita digitação
  livre, só sugerindo os municípios oficiais. Sem backend/migration (frontend puro + API pública do IBGE).
  **Validação:** **type-check web verde** (o fetch ao IBGE é runtime, sem e2e). **Pendente:** Gui git push.
- **2026-06-12** — **Paridade §5: Formas de entrega como CRUD.** Novo cadastro **Cadastros › Estoque ›
  Formas de entrega** (espelha o `modalFormaEntrega` do mockup): nome, **tipo** (motoboy/correios/retirada/
  transportadora/própria), prazo estimado, observação, ativo. Migration tenant **027** (`forma_entrega`).
  Caps `cadastros.forma_entrega.listar/gerenciar` (auto-sync no boot via `CAPABILITY_IDS`). **Backend
  (hexagonal):** domínio `FormaEntrega`/`TIPOS_FORMA_ENTREGA` + repo; `SqlFormaEntregaRepository`;
  `FormasEntregaService` (valida nome ≥2 e tipo na whitelist → 400 `forma_entrega.tipo_invalido`); rota
  `/formas-entrega` (GET/POST/PUT/PATCH ativo). **Importante:** é só o **catálogo** — NÃO mexe na lógica de
  frete do pedido (retirada/motoboy/correios continua igual), exatamente como no mockup (o cadastro alimenta
  a expedição). **Frontend:** tela clonada do padrão Marcas (busca + chips + modal com select de tipo),
  menu + rota; i18n pt/en/es (tipos via `forma_entrega.tipo_*`). **Validação:** **type-check api+web verde**
  + **e2e Postgres real (pglite, 7 PASS):** cria/lista, tipo inválido→400, nome curto→400, opcionais→null,
  editar reflete, inativar, editar inexistente→404. **Pendente:** Gui `git commit`+push (Windows) → boot do
  Render aplica a migration 027 + sincroniza as caps; relogar.
- **2026-06-12** — **Paridade §3: Previsto/Efetivo nos títulos (decisão do Gui).** Cada título de Contas a
  receber/pagar tem um **check "Previsto"** (provisão). Migration tenant **026** (`titulo.previsto bool default
  false`). **Regra:** título **previsto não pode ser baixado** (`FinanceiroService.baixar` → 400
  `financeiro.previsto_nao_baixa`) e fica **mais claro** na lista (CSS `.linha-previsto` = texto muted+itálico);
  para baixar, desmarca (vira efetivo). **Backend:** `Titulo.previsto`/`NovoTitulo.previsto` no domínio;
  `SqlTituloRepository` (map + insert + `definirPrevisto`); `FinanceiroService.criar` aceita previsto,
  `definirPrevisto` (só em aberto → senão 400 `previsto_so_aberto`); rota `PATCH /financeiro/:tipo/:id/previsto`.
  **Frontend (Contas):** coluna **Previsto** com checkbox por título (em aberto, toggle via PATCH); linha previsto
  some o botão **Baixar** e sai da **baixa em massa**; checkbox **Previsto** no Novo título; linha no detalhe
  (duplo-clique). i18n pt/en/es. **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite,
  7 PASS):** cria previsto, baixar previsto→400, marca efetivo→baixa ok, pago→previsto 400, criar normal=false,
  listar reflete flags. **Pendente:** Gui `git commit`+push (Windows) → boot do Render aplica a migration 026.
- **2026-06-11** — **Paridade §8: foto/avatar de usuário.** Migration tenant **025** (`usuario.foto text`).
  **Backend:** `Usuario.foto`/`UsuarioResumo.foto` no domínio; `SqlUsuarioRepository` (select/insert/update +
  mapeador) grava/lê a foto; `UsuariosService` aceita `foto` no criar/editar com `normalizarFoto` (vazio→null,
  limite ~2,8MB→400 `usuario.foto_grande`); rotas `/usuarios` POST/PUT repassam `foto`; **`/me` agora retorna
  `foto`** (busca o usuário do tenant; super-admin→null). **Frontend:** componente **`Avatar`** (foto data URI
  ou **iniciais** como fallback) na **topbar** e na **lista de Usuários**; upload de foto no modal de Usuário
  (FileReader→data URI, cap 2MB no front); `AuthContext` carrega `foto` do `/me` (login, troca de empresa e
  revalidação no reload). i18n pt/en/es (`usuarios.foto*`, `usuario.foto_grande`); CSS `.avatar/.avatar-ph`.
  **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite, 7 PASS):** cria com foto (salva +
  aparece no listar), cria sem foto→null, editar troca/limpa a foto, foto gigante→400, editar inexistente→404.
  **Pendente:** Gui `git commit` (no Windows!) + push → o boot do Render aplica a migration 025 sozinho; relogar.
- **2026-06-11** — **Paridade §3: detalhe do título por duplo-clique (Contas).** Modal **read-only**
  (`ModalVerTitulo`) que abre ao dar **duplo-clique** numa linha de *Contas a receber/pagar*: mostra
  descrição, pessoa, categoria, valor, vencimento, situação (pill), forma de pagamento (se pago) e origem.
  Frontend puro (dados já carregados); i18n pt/en/es (`fin.detalhe`, `fin.ver_detalhe`, `fin.origem`);
  CSS `.det-linha/.det-rot/.det-val`. **type-check web verde.** **Pendente:** Gui `git push`.
  **Falta do §11.4:** coluna **Previsto/Efetivo** (regime competência×caixa) — é decisão de modelo, deixei
  pro Gui.
- **2026-06-11** — **UX pedido do Gui: Lembrar-me, sistema clean (sem idioma/fuso) e CRUD de empresas.**
  Lote noturno (Gui autorizou avançar sozinho). **(1) Lembrar-me corrigido:** a revalidação `/me` no
  reload só **desloga em 401** agora (antes qualquer erro de rede/5xx — ex.: API hibernando no Render —
  apagava a sessão persistida). `api/client.ts` passa o **status HTTP** no erro (`ErroApi.status`; rede=0);
  `AuthContext` mantém a sessão em cache em erro transitório. **(2) Menu recolhido:** já estava no código
  (grupos iniciam fechados); o print do Gui era do **deploy antigo** (Cloudflare estava travado) — some
  após o rebuild. **(3) Sistema mais clean:** removido o **seletor de idioma** (topbar + login) e os campos
  **idioma/fuso horário** de *Dados da empresa* (i18n continua pt-BR; o backend mantém os campos, a tela só
  reenvia os valores salvos). **(4) Criar empresa:** "Provisionar"→**"Criar empresa"** (i18n pt/en/es) e o
  **código sumiu da UI** — agora é **gerado automaticamente** (slug do nome, único, `^[a-z][a-z0-9]{1,30}$`)
  no `ProvisionarEmpresa` (campo `codigo` virou opcional, compat mantida). **(5) Editar/excluir empresa:**
  `EmpresaRepository.editarCadastro`/`excluir` + `Migrador.removerTenant` (DROP SCHEMA CASCADE);
  `EmpresaService.editar` (nome/fantasia/ativo) e `excluir` (apaga registro + **dropa o schema do tenant**);
  rotas `PUT/DELETE /empresas/:codigo` (super-admin); tela Empresas com coluna **Ações** (Editar=modal,
  Excluir=confirm). **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite, 12 PASS):**
  cria sem código (slug `dermacenterestetica`, schema criado), 2ª igual→sufixo `...2`, nome curto→400,
  nome só símbolos→slug válido (`e123`), editar reflete, fantasia curta→400, editar/excluir inexistente→404,
  excluir remove registro **e** dropa o schema. **Sem migration** (colunas já existiam). **Pendente:** Gui
  `git push` + Ctrl+Shift+R. **Nota:** mesmo workaround de ambiente (mount trunca arquivos do file-tool;
  tsc/e2e na cópia `/tmp` com esbuild linux). **Próximo na paridade (§11):** Previsto/Efetivo + detalhe do
  título (duplo-clique); foto/avatar de usuário; formas de entrega como CRUD.
- **2026-06-11** — **Paridade §7: KPIs do Dashboard clicáveis (drill por período).** Os 5 cards
  de KPI (Vendas dia/semana/mês/ano + Clientes ativos) viraram **clicáveis** (`.card.clicavel` com
  hover + acessível por teclado) → navegam para **`/dashboard/serie/:tipo`**. Nova tela
  **`DashboardSerie`**: 3 KPIs (Total do período, Média, Pico) + **gráfico SVG** (barras; **linha** no
  "mês"), sem dependência (Chart.js do mockup virou SVG inline, padrão do projeto). **Dia** tem filtro
  de intervalo (de/ate, default últimos 30 dias) + botão "Últimos 30 dias". **Backend (hexagonal):**
  `SerieDashboard`/`TipoSerie` no domínio; `DashboardRepository.serie` + `SqlDashboardRepository.serie`
  (vendas = pedidos não orçamento/cancelado): **dia** série diária no intervalo (CTE `faixa`, default
  -29d, params $1/$2), **semana** 12 semanas, **mês** 12 meses, **ano** 5 anos (todos via
  `generate_series` + `date_trunc` + LEFT JOIN), **clientes** = contagem atual de ativos
  (formato quantidade); `DashboardService.serie` valida tipo (whitelist → 400) e só aplica de/ate ao
  "dia" (mesmo `lim` ISO do RelatoriosService). Rota `GET /dashboard/serie?tipo=&de=&ate=` (cap
  `dashboard.ver`). i18n pt/en/es (`dash.serie_*`, `dash.kpi_drill`). CSS `.dash-row.c3` + `.card.clicavel`.
  **Validação:** **type-check api+web verde** + **e2e Postgres real (pglite, 15 PASS)** no
  `SqlDashboardRepository.serie` (janelas 30/12/12/5/1, somas com cancelado/orçamento fora, 40d fora da
  janela diária, clientes ativos=2) + **serviço (4 PASS)** (tipo inválido→400, datas ISO/inválidas,
  janela fixa ignora intervalo). **Pendente:** Gui `git push` + Ctrl+Shift+R. **Nota de ambiente:** o
  mount do sandbox de novo serviu versão truncada dos arquivos editados pelo file-tool (Windows OK);
  rodei tsc/e2e numa cópia em `/tmp` com os arquivos alterados reconstruídos e symlinks de
  `@triade/shared` refeitos p/ a sessão atual; tsx precisou do esbuild **linux** 0.28.0 via
  `ESBUILD_BINARY_PATH` (node_modules veio do Windows). **Próximo na paridade (§11):** Previsto/Efetivo
  + detalhe do título (duplo-clique).
- **2026-06-11** — **Ajuste toast Pix-only + Curva ABC de clientes.** (1) O toast de *pendência de baixa* passou a
  disparar **só para Pix** (Boleto/Cartão/Dinheiro usam o toast normal de status); o gate de separação segue como no
  mockup. (2) **Curva ABC de clientes**: `RelatorioRepository.curvaAbcClientes` (Σ total e nº de pedidos por cliente,
  pedidos não orçamento/cancelado) + `curvaAbc(...,por)` no serviço/rota; tela `RelAbc` ganhou seletor **Produtos/
  Clientes** (chips) com título/colunas dinâmicos. i18n pt/en/es. **Validação:** type-check api+web verde + **e2e
  Postgres real (pglite, 5 PASS)**: total 1000 (orçamento fora), Belle 800=A, Harmonize 2 pedidos=C. **Pendente:**
  Gui `git push`. **Próximo na paridade (§11):** KPIs clicáveis no dashboard (drill por período).
- **2026-06-11** — **Paridade mockup→sistema (doc) + §1 fluxo Pix/Boleto.** Criado `Info/PARIDADE-MOCKUP.md`:
  inventário de tudo que o mockup faz (68 telas, 40 modais, ~60 blocos de JS) com status ✅/⚠️/❌ por módulo —
  fonte de verdade/checklist p/ deixar o sistema idêntico. **Implementado o §1** (o exemplo do Gui): **gate por
  forma de pagamento** — Cartão/Dinheiro liberam o pedido direto (`aguardando_pagamento`→`aprovado`); **Pix/Boleto**
  ficam aguardando e **não** vão p/ separação até a **baixa do título** no Financeiro, que **avança o pedido** no
  Kanban (`FinanceiroService.baixar` recebe `PedidoRepository`; se origem='pedido', libera). **Sino** ganhou o grupo
  *Pendências de baixa (Pix/Boleto)* (recebíveis em aberto origem=pedido, gated por `financeiro.receber.listar`) e
  **toast** ao confirmar pedido Pix/Boleto. i18n pt/en/es. **Validação:** type-check api+web verde + **e2e Postgres
  real (pglite, 5 PASS)**: Pix espera→bloqueia separação→baixa libera (aprovado); Cartão libera direto. **Refino
  futuro:** toast fixo no canto com botão Abrir (hoje é toast simples + sino). **Pendente:** Gui `git push` + relogar.
- **2026-06-11** — **Dashboard reescrito fiel ao mockup + scroll-to-top + menu recolhido por padrão.** **(1)**
  `ScrollToTop` (useLocation) rola a página ao topo a cada troca de rota — montado no `BrowserRouter`. **(2)** Menu
  lateral passa a iniciar com **todos os grupos recolhidos** (só os nomes; clicar expande/recolhe). **(3) Dashboard**
  na ordem/colunas do mockup: **linha c5** (Vendas do dia/semana/mês/ano + Clientes ativos, cada um com variação %
  vs período anterior), **d2** (Faturamento, Vendas por categoria em donut, Top 5 produtos com valor+qtd), **c2**
  (Top 5 clientes por valor e por pedidos), **d3** (Avisos+Ações), **d3** (Pedidos recentes + Fluxo de caixa do mês),
  **d3** (Saldos bancários + Total em contas) e **rodapé** TRÍADE. Backend `SqlDashboardRepository.resumo` ampliado
  (vendas dia/semana/mês/ano + deltas; clientesAtivos+delta; topProdutos com valor; topClientesValor/Qtd;
  pedidosRecentes; fluxo do mês entradas/saídas/saldo). CSS do mockup portado (`.dash-row.c5/.c2/.d2/.d3`, `.kpi/.delta`,
  `.lst/.it`, `.alerts`, `.quick`, `.fstat`, `.dash-footer`). i18n pt/en/es. **Validação:** type-check api+web verde +
  **e2e Postgres real (pglite, 11 PASS)** das agregações + sem NULs + CSS balanceado (385/385) + lock íntegro.
  **Pendente:** Gui `git push` + Ctrl+Shift+R. **Nota:** sem migration (tudo agregação no SELECT).
- **2026-06-11** — **Colunas agregadas do mockup (Clientes/Vendedores) + Configurações.** **(1)** `SqlClienteRepository.listar`
  passou a trazer **`emAberto`** por cliente (subquery: Σ `titulo.valor` de `tipo='receber' AND status='aberto'`
  via `pedido.cliente_id`) → nova coluna **Em aberto** na lista de Clientes. **(2)** `SqlVendedorRepository.listar`
  traz **`vendasMes`** (Σ `pedido.total` do mês corrente, `status NOT IN (orcamento,cancelado)`) → coluna **Vendas (mês)**
  nos Vendedores. Domínios `Cliente`/`Vendedor` += campo; mapeadores com `?? 0` (buscarPorId segue ok). **(3) Perfis**
  ganhou a coluna **Módulos liberados** (derivada das capabilities × `moduloChave`; "Todos" quando cobre todos os
  módulos) e **Usuários** mostra o perfil como **pill**. i18n pt/en/es (`clientes.em_aberto`, `vendedores.vendas_mes`,
  `perfis.modulos`). **Validação:** type-check api+web verde + **e2e Postgres real (pglite, 3 PASS)**: Belle em aberto=700
  (pago e a pagar fora), cliente sem títulos=0, Carla vendas mês=1000 (orçamento e mês anterior fora). Sem NULs, lock
  íntegro. **Pendente:** Gui `git push` + relogar/conferir. **Nota:** colunas são read-only (agregação no SELECT, sem migration).
- **2026-06-11** — **Cadastros: Produtos no padrão do mockup + grupo conferido.** **Produtos** ganhou
  **toolbar** (busca por nome + **chips** de categoria, incl. "Todas categorias", filtro client-side) e a
  coluna **Categoria** virou **pill colorido** (tint ciclando por categoria). Demais telas do grupo já
  estavam alinhadas (crumb + toolbar/chips + colunas certas): Clientes (Cidade), Vendedores (Região/Meta/
  Comissão), Fornecedores, Favorecidos, Motoboys, Categorias, Marcas, Condições, Cat. financeiras, Contas
  correntes. **Lacunas restantes = backend** (agregação): coluna **Em aberto** (Clientes, Σ recebíveis em
  aberto) e **Vendas (mês)** (Vendedores) — ficam como evolução. **Validação:** type-check web verde, sem
  NULs, lock íntegro. **Pendente:** Gui `git push` + conferir.
- **2026-06-11** — **Relatórios: KPIs com ícone colorido (padrão do mockup).** Os 7 relatórios com KPIs de
  card único por linha (Categorias, DRE, Estoque parado, Inventários, Perdas, Validade, Vendas) passaram a
  combinar `kpi-card kpi-mock` com um **tile de ícone** colorido (tint-gr/or/pp/bl/rd conforme a semântica:
  💰 valor, 🧾 despesa, ✅ resultado, 📦/🔢 itens, ⚠️/⏰/💸 alertas, 🎯 acuracidade), mantendo rótulos/valores/
  cores. RelAbc (pills de classe A/B/C) e RelProdutos (ranking com barras) ficaram como estão. Também
  corrigido bug: a Posição de estoque usava `kpi-mock` sem `card` (sem chrome) → agora `card kpi-mock`.
  **Validação:** type-check web verde, sem NULs, lock íntegro. **Pendente:** Gui `git push` + conferir.
- **2026-06-11** — **Estoque/Expedição: fidelidade ao mockup (Posição + Expedição).** **Posição de estoque**
  (`PosicaoEstoque.tsx`) reescrita no padrão do mockup: 4 **KPIs** (SKUs ativos, Estoque baixo, Validade < 90
  dias, Valor em estoque), botão **Entrada** no cabeçalho, **toolbar** com busca por produto + **chips** de
  situação (Todos/Em dia/Estoque baixo/Validade próxima, filtro client-side) e nova coluna **Valor** (Σ
  saldo×custo por produto); badge de situação por linha (verde/laranja/vermelho) e nota "clique para ver os
  lotes". **Expedição (Kanban)** ganhou cabeçalho no padrão (crumb + subtítulo). i18n pt/en/es das novas
  chaves (`estoque.kpi_*`, `estoque.buscar`, `estoque.valor`, `estoque.f_validade`, `estoque.btn_entrada`).
  **Validação:** type-check web verde. **Pendente:** Gui `git push` + conferir no navegador. **Nota:** as demais
  telas do grupo (Entrada, Recebimento multi-lote, Baixa/perda, Inventário) já estavam com crumb/KPIs alinhados.
- **2026-06-11** — **Excel .xlsx formatado como relatório (igual ao mockup).** `apps/web/src/lib/excel.ts`
  reescrito: `gerarXlsx(cabecalho, linhas, titulo?)` agora gera um **.xlsx real** com a mesma "cara de
  relatório" do mockup — **título** (linha 1, mesclada, na cor da empresa via `--accent`), **subtítulo**
  (linha 2, mesclada: "{empresa} · Gerado em {data}", empresa lida de `triade_sessao`), **cabeçalho** com
  fundo na cor da empresa + texto branco/negrito, **linhas zebradas**, **colunas de valor** detectadas pelo
  título (valor/total/saldo/preço/comissão/receber/pagar) com formato **`"R$" #,##0.00`** alinhado à direita,
  e **linha de Total** somando as colunas de valor. `styles.xml` completo (numFmt 164, 5 fontes, fills da
  paleta, borders, `cellStyles` Normal). `baixarExcel(nome, cab, linhas)` segue **mesma assinatura** — as
  11+ telas (relatórios + Contas) não mudam; o `nome` vira o título humanizado. **Validação:** type-check
  web verde + arquivo gerado aberto com **openpyxl** (A1=título, A2=empresa·data, A1:C1/A2:C2 mescladas,
  header fill = cor da empresa + negrito, célula de valor `"R$"\ #,##0.00`, linha de Total = soma correta,
  abre sem warning). **Pendente:** Gui `git push` + conferir no navegador (exportar um relatório/Contas).
- **2026-06-11** — **Excel real (.xlsx) + frete por Google Maps.** **(1) .xlsx:** `apps/web/src/lib/excel.ts`
  reescrito — `gerarXlsx` monta um **OOXML/ZIP real** (método store, CRC32 próprio, partes mínimas +
  styles com cabeçalho em negrito) **sem dependência**; `baixarExcel` baixa `.xlsx` de verdade. As 11
  telas de relatório seguem iguais (mesma assinatura). Validado abrindo com **openpyxl** (3 linhas, A1
  negrito, zip íntegro). **(2) Frete Google Maps:** migration tenant **024** (`frete_config.cep_origem`).
  `FreteService.calcular` (motoboy) chama o **Distance Matrix** quando há `GOOGLE_MAPS_API_KEY` no
  servidor + CEP de origem salvo; em qualquer falta/erro cai no fallback determinístico (estimativa por
  CEP). Campo **CEP de origem** + dica adicionados na config de frete (tela Motoboys). **Validação:**
  type-check api+web verde + e2e Postgres real (5 PASS: salva CEP origem, motoboy c/ mínimo, fallback
  "estimado", retirada 0, correios manual). **Pendente:** Gui `git push` (Render migra) + **setar
  `GOOGLE_MAPS_API_KEY` no Render** + preencher o CEP de origem na config de frete. **Nota:** a chamada
  real ao Google não dá p/ testar aqui (sem chave/rede) — fica coberta pelo fallback.
- **2026-06-11** — **Fidelidade visual tela a tela (padrão do mockup).** Aplicado o padrão do
  `erp-mockup.html` em ~30 telas: **breadcrumb** (`.crumb` "Módulo / Tela"), **título + subtítulo**
  (`.page-sub`) e, nas listas, **toolbar** com busca (`.busca-box-tb`) + **chips** Todos/Ativos/Inativos
  (`.chip-f`, filtro client-side por status/texto). Telas com toolbar completa: Clientes, Fornecedores,
  Vendedores, Marcas, Categorias, Favorecidos, Motoboys. Dashboard refeito (KPIs com ícone colorido +
  Avisos e pendências + Ações rápidas). Pedidos (Kanban) ganhou crumb + filtro de data. Demais telas
  (Usuários, Perfis, Condições, Cat. financeiras, Produtos, Contas correntes, Estoque/Expedição,
  Financeiro, Logística, Relatórios, Empresas, Dados da empresa, Conciliação) receberam crumb +
  subtítulo. CSS novo (`.crumb/.toolbar/.busca-box-tb/.chip-f/.kpi-mock/.tint-*/.dash-*`); i18n pt/en/es
  de crumbs/subs. **type-check web verde** em todos os lotes; lock íntegro. **Pendente:** Gui revisar no
  ar e ajustar textos de subtítulo/ordem fina onde quiser. **Nota:** gráficos do dashboard (Chart.js) e
  busca/chips nas telas que ficaram só com crumb são evolução (não consigo renderizar p/ conferir aqui).
- **2026-06-11** — **Modo escuro + Administrador do sistema (global) + troca de empresas.** **(1) Modo
  escuro:** `ThemeProvider` (classe `theme-dark` no body, persistido em localStorage), tokens dark no CSS
  e botão 🌙/☀️ na **topbar** e no **login**. **(2) Admin do sistema:** nova tabela `public.super_admin`
  (migration public **003**) + `garantirSuperAdmin` (idempotente, roda no boot via `prepararBanco` e no
  `db-setup` via seed) cria **admin@triadeerp.com.br** (senha default `admin123`, sobrescrevível por
  `SUPER_ADMIN_*`). Login só por e-mail: `AutenticarUsuario` checa primeiro o `super_admin`; se for ele,
  emite token com **`superAdmin: true`** + a 1ª empresa ativa como contexto. Token (`TokenPayload`) e
  middleware de autorização passam a **liberar tudo** quando `superAdmin` (god-mode). **(3) Super-admin
  restrito:** menu/rota/busca de Empresas agora gateados pela **flag `superAdmin`** (não mais pela
  capability) — `ProtectedRoute soSuperAdmin`, item de menu `soSuperAdmin`; rotas `/empresas` exigem
  `exigirSuperAdmin`. Removida a cap `superadmin.empresa.provisionar` (inerte). **(4) Trocar empresa:**
  `POST /auth/trocar-empresa` (só super-admin) emite novo token p/ o schema escolhido; `AuthContext.trocarEmpresa`
  troca o token e recarrega; componente **`EmpresaSwitcher`** (pill 🏢 + dropdown das empresas ativas) na
  topbar, só p/ o admin do sistema. i18n pt/en/es. **Validação:** **type-check api+web verde** + **testes
  (7 PASS super-admin/troca; 6 PASS boot cria super_admin; 5 PASS login por e-mail)** via tsx/pglite.
  **Pendente:** Gui `git push` (Render cria o super-admin no boot) + Ctrl+Shift+R. **Login do sistema:**
  **admin@triadeerp.com.br** / `admin123` (trocar a senha). **Nota:** belle/admin@belle continua como
  admin **da empresa** (sem super-admin).
- **2026-06-11** — **Tela de login refeita no padrão do mockup.** **Backend:** login passa a aceitar
  **só e-mail + senha** — `AutenticarUsuario` com `codigoEmpresa` opcional: sem ele, descobre a empresa
  procurando o usuário em cada tenant ativo (`empresas.listarTodas` × `usuarios.buscarPorEmail`);
  rota `/auth/login` exige só email+senha; mantém compat com `codigoEmpresa`. **Frontend:** `AuthContext.login(email, senha, lembrar)`
  — **Lembrar-me** persiste em `localStorage`, senão `sessionStorage` (cai ao fechar). **Login.tsx** reescrito:
  layout 2 colunas — **hero vermelho** (marca TRÍADE, headline, subtítulo, 6 features) + **card branco**
  (logo TRÍADE com Í vermelho, "Entrar"/"Acesse sua conta", e-mail, senha com **olho** mostrar/ocultar,
  **Lembrar-me** + **Esqueci minha senha**, botão vermelho, rodapé "Desenvolvido por Guilherme Dias");
  modal **Recuperar senha** (stub com mensagem de confirmação, igual ao mockup — sem envio real de e-mail).
  Login usa identidade TRÍADE em **vermelho** (independente do branding white-label da empresa). CSS de
  login substituído (`.login-hero/.login-pane/.login-card/...`, responsivo ≤920px esconde o hero); i18n
  pt/en/es (hero, features, recuperar). **Validação:** **type-check api+web verde** + **teste do caso de
  uso (5 PASS)**: e-mail resolve a empresa, e-mail maiúsculo, inexistente→401, senha errada→401, compat
  com codigoEmpresa. **Pendente:** Gui `git push` + Ctrl+Shift+R. **Nota:** "Esqueci a senha" é visual
  (sem reset real — exige infra de e-mail; fica p/ depois).
- **2026-06-11** — **Polimento funcional — filtros avançados, colunas e form em página inteira.** Três
  entregas de UI (sem backend): (1) **Filtros avançados nas Contas** — barra com busca (descrição/pessoa),
  situação, categoria, faixa de vencimento e faixa de valor; KPIs e seleção refletem o filtro (frontend
  puro sobre a lista carregada). (2) **Esconder/mostrar colunas** na lista de Contas (cliente/categoria/
  vencimento/valor/situação), persistido em `localStorage` por tipo; th/td condicionais + colSpan dinâmico.
  Redimensionar por arraste **deferido** (alto esforço/baixo valor, difícil de testar no ambiente). (3)
  **Cadastro de Produto** convertido de modal para **formulário de página inteira** com botão Voltar
  (padrão do mockup; demais cadastros podem migrar aos poucos). i18n pt/en/es; CSS (`.filtros-grid`,
  `.cols-chooser`, `.form-pagina`, `.form-acoes`). **Validação:** **type-check web verde** nos três;
  lock íntegro. **Pendente:** Gui `git push` + Ctrl+Shift+R.
- **2026-06-11** — **Polimento visual — passada de fidelidade nos tokens (casar com o mockup).** Só
  `apps/web/src/styles.css` (sem lógica). Alinhei os design tokens ao `Info/mockups/erp-mockup.html`:
  `--bg #f4f5fa`, `--ink #1f2430`, `--muted #8a90a2`, `--borda #ececf2`, **`--radius 14px`**, **`--shadow`**
  suave, `--accent` default `#7b61ff` (white-label ainda sobrepõe por empresa) + `--accent-soft`; fonte
  "Segoe UI"/Inter; **sidebar 260px**; `.card`/`.kpi-card` com raio+sombra do mockup; cores de status
  (verde #16a34a/laranja #ea9213/ciano #3b82f6/vermelho #e1483b com fundos suaves). Chaves CSS
  balanceadas (227/227), type-check web verde, lock íntegro. **Nota:** accent no ar reflete a paleta da
  empresa (iSKINS), não o roxo do mockup. **Pendente:** Gui `git push` + Ctrl+Shift+R. Restam itens
  funcionais de polimento (filtros avançados nas Contas, esconder/redimensionar colunas, forms em
  página inteira).
- **2026-06-11** — **Refinamento — Exportar Excel formatado (.xls) nos relatórios.** **Sem dependência
  nova** (evita mexer no `package-lock`): novo `apps/web/src/lib/excel.ts` (`baixarExcel`, mesma
  assinatura do `baixarCsv`) gera **SpreadsheetML 2003** — cabeçalho em negrito (fundo índigo),
  células numéricas com `NumberFormat`, abre direto no Excel. Botão **Exportar Excel** adicionado ao
  lado do **Exportar CSV** em **11 telas** (Aging, Conciliação, DRE, Curva ABC, Vendas, Vendas por
  categoria, Produtos, Validade, Estoque parado, Perdas, Inventários); CSV virou `rel.exportar_csv`,
  Excel `rel.exportar_xlsx` (i18n pt/en/es). DRE/Vendas usavam função `exportar()` → parametrizada
  `exportar(fmt)`. **Validação:** **type-check api+web verde** + **teste do gerador (6 PASS)** via tsx
  (stubs de Blob/document): cabeçalho do Excel, número como `Number`, escape de `<&>`, fecha Workbook.
  `package-lock.json` validado íntegro (JSON.parse OK). **Pendente:** Gui `git push` + Ctrl+Shift+R.
- **2026-06-11** — **Refinamento — Conciliação bancária etapa 2 (importar extrato OFX/CSV).** **Sem
  backend/migration novos** — leitura e match no **navegador**, reusa `PATCH /financeiro/conciliacao/:id`.
  Novo `apps/web/src/lib/extrato.ts` (`lerExtrato`): parser de **OFX** (blocos `STMTTRN` → DTPOSTED/
  TRNAMT/MEMO + `LEDGERBAL`) e **CSV** (delimitador `;`/`,`, datas DD/MM/AAAA ou ISO, valores BR
  1.234,56; sinal crédito+/débito−). Na tela de Conciliação: botão **Importar extrato (OFX/CSV)** →
  lê o arquivo, preenche o saldo do extrato (se houver `LEDGERBAL`) e abre **modal de correspondências**
  que casa cada lançamento do extrato a um título **ainda não conciliado** pelo **valor com sinal**
  (entrada=receber, saída=pagar; cada título usado 1×); botão **Conciliar N correspondências** marca
  todos via PATCH. i18n pt/en/es. **Validação:** **type-check api+web verde** + **teste do parser
  (7 PASS)** via tsx: OFX 2 lançamentos (+1000/−300, saldo 700) e CSV BR (cabeçalho ignorado, 1.234,56→
  número). **Pendente:** Gui `git push` + relogar/Ctrl+Shift+R. **Conciliação concluída (etapas 1 e 2).**
- **2026-06-11** — **Refinamento — Parcelar / multiplicar títulos.** **Sem migration**; reusa a cap
  `financeiro.{receber,pagar}.gerenciar`. **Backend:** `FinanceiroService.parcelar(schema, id, {modo,
  parcelas, intervaloDias})` — só título **em aberto** (senão 400); `modo=dividir` reparte o valor em N
  (última ajusta a sobra), `modo=replicar` cria N cópias com o valor cheio (recorrente); vencimentos a
  partir do venc original espaçados por `intervaloDias`; preserva tipo/pessoa/categoria/favorecido/
  origem; descrição `(i/N)`; **substitui o original** (cria N + exclui). Rota `POST /financeiro/:tipo/
  :id/parcelar`. **Frontend:** no Contas (receber/pagar), botão **Parcelar** nos títulos em aberto →
  modal (modo dividir/replicar, nº de parcelas, intervalo, prévia N× valor); toast; i18n pt/en/es.
  **Validação:** **type-check api+web verde** + **e2e Postgres real (10 PASS)** via pglite: dividir 900→
  3×300 (soma 900, vencimentos 30/60, desc i/3), replicar 100→4×100, parcelas<2→400, título pago→400.
  **Pendente:** Gui `git push` + relogar. **Próximo (opcional):** conciliação etapa 2 (importar extrato
  OFX/CSV) ou exportar Excel formatado.
- **2026-06-11** — **Refinamento — Conciliação bancária (etapa 1: manual por conta).** Migration
  tenant **023** (`titulo.conciliado` bool + `titulo.conciliado_em`). Caps `financeiro.conciliacao.ver/
  gerenciar`. **Backend:** `TituloRepository.conciliacao` (títulos **pagos** numa conta corrente no
  período, pela data de pagamento) + `definirConciliado`; `FinanceiroService.conciliacao` soma
  entradas (receber) / saídas (pagar) / saldo de movimentos e conta conciliados×pendentes;
  `marcarConciliado` (só título pago → senão 400). Rotas `GET /financeiro/conciliacao?contaId&de&ate`
  e `PATCH /financeiro/conciliacao/:id`. **Frontend:** tela **Financeiro › Conciliação bancária**
  (seletor de conta + período; KPIs entradas/saídas/saldo/conciliados/pendentes; checkbox conciliado
  por lançamento; campo de **saldo do extrato** comparado ao **saldo do sistema** com diferença e selo
  "bate"; export CSV); menu + rota + i18n pt/en/es. **Validação:** **type-check api+web verde** +
  **e2e Postgres real (10 PASS)** via pglite: lista só pagos da conta, totais 1000/300, saldo 700,
  marcar/desmarcar conciliado, sem conta→400, título não pago→400. **Etapa 2 (futuro):** importar
  extrato OFX/CSV com matching automático. **Pendente:** Gui `git push` (Render migra sozinho no boot)
  + relogar.
- **2026-06-11** — **Fix de deploy + lição: `package-lock.json` corrompido travava o Cloudflare.**
  Um comando de shell deixou uma linha de espaços no fim do `package-lock.json` (JSON inválido). O
  Cloudflare Pages roda `npm ci` (clean-install) e passou a **falhar silenciosamente em todo build**
  do front desde o commit `0aa3745` — o site ficou numa versão antiga (sem Perdas/Inventários/
  Favorecidos) mesmo com a API e as permissões já atualizadas. **Diagnóstico:** Cloudflare → Pages →
  Deployments mostrava os commits novos como "No deployment available" (⚠️); o log do deploy acusava
  `npm ci ... can only install with an existing package-lock.json`. **Correção:** restaurar o lock
  válido (`git checkout 0aa3745 -- package-lock.json`; nenhum `package.json` mudou desde então, então
  compatível) + commit + push → Pages rebuildou verde. **Regra nova:** nunca editar/anexar em
  `package-lock.json` via shell; depois de mexer no projeto, validar com `node -e JSON.parse` antes de
  commitar. **Pipeline confirmado:** API (Render) e site (Cloudflare Pages) têm deploys SEPARARADOS —
  um push pode subir um e o outro falhar; conferir os dois. Após deploy do front, **Ctrl+Shift+R** +
  relogar (menu lê capabilities no login).
- **2026-06-11** — **Auto-migração no boot da API (deploy sem passo manual).** Nova rotina
  `infra/db/prepararBanco.ts`: no start a API roda `migrarTudo` (public + todos os tenants ativos) e
  **sincroniza as `CAPABILITY_IDS` no perfil Administrador de cada tenant** (idempotente,
  `ON CONFLICT DO NOTHING`). `main.ts` chama no boot, gated por `env.autoMigrate` (`AUTO_MIGRATE`,
  default `true`; `false` desliga p/ migrar só via CLI). Assim, todo deploy no Render passa a aplicar
  migrations e permissões novas automaticamente no Neon — não precisa mais rodar `db-setup` à mão p/
  produção (o `scripts/db-setup-prod.bat` fica como alternativa manual). **Importante:** o usuário
  precisa **relogar** após o deploy p/ o front recarregar as capabilities (o menu lê no login).
  **Validação:** **type-check api verde** + **e2e Postgres real (5 PASS)** via pglite: boot migra o
  tenant (tabela `favorecido` + coluna `titulo.favorecido_id`), sincroniza as caps de favorecido no
  Administrador, sincroniza todas (49) e é idempotente. **Pendente:** Gui `git push` (Render redeploia
  e migra sozinho) + relogar no site.
- **2026-06-11** — **Refinamento — Vínculo do favorecido no título a pagar.** Migration tenant **022**
  (`titulo.favorecido_id` → `favorecido`). **Backend:** `NovoTitulo.favorecidoId?` (opcional — não
  quebra os geradores automáticos pedido/compra/comissão/frete); `Titulo` += `favorecidoId/Nome`;
  `SqlTituloRepository.criar` grava a coluna e `listar` faz **LEFT JOIN** em `favorecido` p/ o nome;
  `FinanceiroService.criar` repassa o favorecido (títulos manuais a pagar). **Frontend:** no **Novo
  título** das Contas a pagar, select de **Favorecido** (ativos) que ao escolher preenche o nome da
  pessoa se vazio; i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres
  real (6 PASS)** via pglite: título a pagar grava favorecido_id, `listar` traz o nome (JOIN), favorecido
  **opcional** (null), receber segue sem favorecido. **Pendente:** Gui rodar `db-setup.bat` (migration
  022) + `git push` + testar. **Próximo (opcional):** conciliação bancária, Excel formatado, ou CRM.
- **2026-06-11** — **Refinamento — Cadastro de Favorecidos (reembolso).** Migration tenant **021**
  (`favorecido`: nome, tipo_pessoa PF/PJ, documento, chave_pix, banco, agencia, conta, observacao,
  ativo). Caps `cadastros.favorecido.listar/gerenciar`. **Backend (hexagonal):** domínio
  `Favorecido`/`FavorecidoRepository` (`TIPOS_FAVORECIDO`), `SqlFavorecidoRepository`,
  `FavorecidosService` (CRUD + ativo; valida nome ≥2 e tipo PF/PJ; campos vazios → null); rota
  `/favorecidos` (GET/POST/PUT/PATCH ativo) registrada no server + composition. **Frontend:** cadastro
  **Cadastros › Pessoas › Favorecidos** (lista + modal com tipo PF/PJ, CPF/CNPJ, chave PIX, banco/
  agência/conta, observação; ativar/inativar); CSS `.form-linha`; menu + rota + i18n pt/en/es (+ labels
  das caps). **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (10 PASS)** via
  pglite: cria PF e PJ, ordena por nome, PF com pix/documento, PJ com dados bancários, campos vazios →
  null, nome curto→400, edita tipo/pix→null, inativar, editar inexistente→404. **Pendente:** Gui rodar
  `db-setup.bat` (migration 021) + `git push` + testar. **Vínculo do favorecido no título a pagar (pessoa)
  fica como evolução.** **Próximo (opcional):** conciliação bancária, Excel formatado, ou CRM (em revisão).
- **2026-06-11** — **Refinamento — Histórico de inventários (Relatórios).** **Sem migration nem
  backend novo**; reusa `estoque.inventario.ver` e os endpoints `GET /inventario` + `GET
  /inventario/:id/faltantes` (já testados no e2e de Inventário). **Frontend:** tela **Relatórios ›
  Inventários** (`RelInventarios.tsx`) — filtro de período (filtra o histórico por `criadoEm`), KPIs
  (nº de inventários, **acuracidade média** = encontradas/esperadas, itens faltantes, baixados como
  perda), tabela com pill de acuracidade colorida (verde ≥95%, amarelo ≥80%, vermelho abaixo) e
  **drill** por inventário (expande e busca os faltantes do `/:id/faltantes`), export CSV; menu +
  rota + i18n pt/en/es. **Validação:** **type-check web verde (exit 0)**; sem e2e (reusa endpoints
  já cobertos). **Pendente:** Gui `git push` + testar. **Próximo (opcional):** cadastros de
  credores/favorecidos p/ reembolso, conciliação bancária, ou CRM (em revisão pelo Gui).
- **2026-06-11** — **Sistema PUBLICADO na nuvem (Cloudflare Pages + Render + Neon).** Site real no ar
  em `https://triade-erp.pages.dev` (Cloudflare Pages, deploy via Git), API no Render
  (`https://triade-api.onrender.com`, `/health` ok), banco na branch **production** do Neon
  (migrations + seed aplicados: empresa `belle`/`admin@belle.com.br`). Login ponta a ponta funcionando.
  Ajuste de produção: `apps/web/src/api/client.ts` usa **`VITE_API_URL`** (build) p/ chamar a API direto
  (CORS na API) — committado `apps/web/.env.production` (URL pública) com exceção no `.gitignore`.
  Domínio `triadeerp.com.br`: nameservers do Cloudflare setados no Registro.br (em propagação); falta
  só adicionar o Custom Domain no Pages quando ficar "Active". **Pendente (Gui):** trocar senha do admin,
  provisionar empresa real, apertar `CORS_ORIGIN` p/ a URL do site, finalizar o domínio.
- **2026-06-11** — **Refinamento — Relatório de Perdas de estoque.** **Sem migration**; reusa
  `relatorios.ver`. **Backend:** `RelatorioRepository.perdasEstoque` (movimentos `tipo='perda'` no
  período — baixa/perda + ajuste de inventário; JOIN produto, LEFT JOIN lote p/ custo; `valor = qtd ×
  custo`; ordena por data desc); rota `GET /relatorios/perdas-estoque`. **Frontend:** tela
  **Relatórios › Perdas de estoque** (filtro de período + motivo, KPIs valor/itens/lançamentos, tabela
  data/produto/lote/motivo/qtd/valor com pill de motivo, export CSV); menu + rota + i18n pt/en/es.
  **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (5 PASS)** via pglite:
  só perdas no período (saída/entrada/fora ignorados), valor = qtd×custo (30 e 20), total 50.
  **Pendente:** Gui `git push` + testar. **Próximo (opcional):** histórico de inventários, cadastros
  de credores/favorecidos/tipos de documento, CRM (em revisão pelo Gui), ou conciliação bancária.
- **2026-06-11** — **Deploy na nuvem (preparação) — Netlify + Render + Neon.** Ajustes p/ produção:
  **API** (`env.ts`) passa a usar `process.env.PORT` (Render injeta) com fallback `API_PORT`/3333;
  novo `corsOrigin` (`CORS_ORIGIN`, padrão `*`). **`server.ts`** ganhou middleware **CORS** (headers +
  preflight OPTIONS→204). **`apps/api/package.json`:** `tsx` movido p/ `dependencies` + script
  **`start:prod`** = `tsx src/main.ts` (roda o TS direto, sem precisar buildar; evita o problema do
  `@triade/shared` apontar p/ `src`). **Site:** `apps/web/public/_redirects` (Netlify) encaminha
  `/api/*` → API do Render (com placeholder a trocar) + fallback SPA `/* → index.html`. `.env.example`
  += `CORS_ORIGIN`/`NODE_ENV=production`. **Guia completo em `Info/DEPLOY-NUVEM.md`** (Neon → Render →
  preparar banco com `db-setup.bat` apontando p/ prod → Netlify → provisionar empresa real via
  super-admin). **Build verificado:** `tsc -b` do web exit 0; type-check api+web verde. **Decisões:**
  API roda via **tsx em produção** (Render: build `npm install`, start `npm run start:prod -w @triade/api`,
  health `/health`); web no Netlify (build `npm install && npm run build -w @triade/web`, publish
  `apps/web/dist`); proxy do Netlify evita CORS (mesma origem) mas o CORS na API fica como rede de
  segurança. **Pendente (Gui):** seguir o guia — criar serviços, setar envs (DB_URL/JWT_SECRET/etc.),
  editar o `_redirects` com a URL real da API, `git push`. **Fora do MVP:** fiscal/NF-e (Fase 7).
- **2026-06-11** — **Refinamento — Curva ABC de produtos.** **Sem migration**; reusa `relatorios.ver`.
  **Backend:** `RelatorioRepository.curvaAbcProdutos` (pedido_item × pedido não orçamento/cancelado no
  período, soma receita por produto, `ORDER BY total DESC`); `RelatoriosService.curvaAbc` calcula
  `pct`, `acumuladoPct` e a **classe** (A ≤80% acumulado, B ≤95%, C resto) + `resumo` por classe
  (itens/total). Tipos `LinhaAbc/RelatorioAbc/ClasseAbc`. Rota `GET /relatorios/curva-abc`.
  **Frontend:** tela **Relatórios › Curva ABC** — 3 KPIs por classe (A verde, B amarelo, C vermelho)
  com total e nº de itens; tabela produto/qtd/receita/% /% acumulado/classe (pill colorida); export
  CSV; menu + rota + i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0)** + **e2e
  Postgres real (8 PASS)** via pglite: total 1000, Top 800→A (80% acum.), Médio 150→B (95%), Cauda
  50→C (100%), ordenação e resumo por classe. **Pendente:** Gui `git push` + testar. **Curva ABC por
  cliente** fica como evolução. **Próximo (opcional):** credores/tipos de documento, conciliação
  bancária, ou esconder/redimensionar colunas — o MVP + refinamentos está bem completo.
- **2026-06-11** — **Refinamento — DRE por categoria financeira.** **Sem migration**; reusa
  `financeiro.fluxo.ver` + a categoria nos títulos (migration 020). **Backend:**
  `TituloRepository.pagosPorCategoria` (LEFT JOIN `categoria_financeira`, soma por tipo+categoria,
  sem categoria cai em `'—'`); `PagoOrigem`→**`PagoAgrupado`** (`{tipo, chave, total}`) reusado por
  origem e categoria; `FinanceiroService.dre(schema, de, ate, por)` escolhe o agrupamento
  (`origem|categoria`) e devolve `RelatorioDre` += `por`. Rota `GET /financeiro/dre?por=categoria`.
  **Frontend:** na tela **DRE** um seletor **Agrupar por: Origem | Categoria financeira**; quando por
  categoria, mostra o nome da categoria (sem traduzir); export CSV usa o rótulo certo; i18n pt/en/es.
  **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (7 PASS)** via pglite:
  receita "Vendas" 1500, despesas Aluguel 800/Salários 300, sem categoria→"—" (50), resultado 350,
  e o agrupamento por origem segue funcionando. **Pendente:** Gui `git push` + testar. **Próximo:**
  Curva ABC (clientes/produtos), cadastros de credores/tipos de documento, ou conciliação bancária.
- **2026-06-11** — **Refinamento — Categorias financeiras (cadastro) + vínculo no título.**
  Migration tenant **020** (`categoria_financeira` nome/tipo `receita|despesa`/ativo +
  `titulo.categoria_financeira_id`). Caps `cadastros.catfin.listar/gerenciar`. **Backend:** domínio
  `CategoriaFinanceira` (`TIPOS_CATFIN`) + repo + `SqlCategoriaFinanceiraRepository`;
  `CategoriasFinanceirasService` (CRUD + ativo, valida nome e tipo); rota `/categorias-financeiras`.
  **Título:** `NovoTitulo.categoriaFinanceiraId?` (opcional — não quebra os geradores automáticos
  pedido/compra/comissão/frete); `Titulo` += `categoriaFinanceiraId/Nome`; `SqlTituloRepository.criar`
  grava a coluna e `listar` faz **LEFT JOIN** p/ trazer o nome; `FinanceiroService.criar` repassa a
  categoria (títulos manuais). **Frontend:** cadastro **Cadastros › Financeiro › Categorias
  financeiras** (nome + tipo receita/despesa + ativo); no **Novo título** das Contas, select de
  categoria filtrado pelo tipo (receita p/ receber, despesa p/ pagar); coluna **Categoria** na lista;
  i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (8 PASS)**
  via pglite: CRUD/validação (nome curto→400, tipo inválido→400), inativar, título grava a categoria,
  `listar` traz o nome (JOIN), categoria **opcional** no título. **Pendente:** Gui rodar `db-setup.bat`
  (migration 020) + `git push` + testar. **Próximo:** **DRE por categoria** (já temos a categoria nos
  títulos — falta agrupar a DRE por `categoria_financeira` além de por origem), ou Curva ABC.
- **2026-06-11** — **Polimento UX — Ações em massa (Contas a receber/pagar).** **Frontend puro** (sem
  backend/migration). Na tela **Contas** (`Contas.tsx`): coluna de checkbox por linha + "selecionar
  todos" no cabeçalho (só quando o usuário tem a cap `gerenciar`); ao marcar ≥1, aparece a **barra de
  ações em massa** (roxa) com a contagem e os botões **Baixar** (só os títulos em aberto selecionados)
  e **Excluir** (com `confirm`), além de "Limpar seleção". O `ModalBaixa` foi generalizado para
  receber **N títulos** e aplicar a mesma forma/conta a todos num loop (retorna quantos baixou).
  Toasts ao concluir (`bulk.baixados/excluidos`). CSS `.bulk-bar`/`.linha-sel` no `styles.css`; i18n
  pt/en/es (`bulk.*`). **Validação:** **type-check api+web verde (exit 0)**; sem e2e (UI; baixa/baixa
  já cobertas pelos testes do financeiro). **Pendente:** Gui `git push` + testar (marcar 2 títulos →
  Baixar). **Polimento UX concluído** (Ctrl+K, toasts, sino, ações em massa). **Próximo:** cadastros
  financeiros (categorias) p/ DRE por categoria, ou Curva ABC, conforme o Gui priorizar.
- **2026-06-11** — **Polimento UX — Sino de notificações.** **Frontend puro** (sem backend/migration).
  Componente **`Sino.tsx`** (na topbar, ao lado da busca): ao logar, agrega pendências reaproveitando
  endpoints existentes, **só os que o usuário pode ver** — títulos a receber **vencidos**
  (`/financeiro/aging-receber`, `diasAtraso>0`), **lotes vencendo em 30 d** (`/relatorios/validade-lotes`)
  e **produtos com estoque baixo** (`/estoque`, `abaixoMinimo`). Badge vermelho com a soma; clicar abre
  painel com cada grupo (ícone, rótulo, contagem) que **navega para a tela** correspondente; overlay p/
  fechar ao clicar fora. CSS `.sino-*` no `styles.css`; i18n pt/en/es (`sino.*`). **Validação:**
  **type-check api+web verde (exit 0)**; sem e2e (UI, dados já cobertos pelos relatórios). **Pendente:**
  Gui `git push` + testar (criar um título vencido / lote vencendo → badge no sino). **Próximo
  (polimento):** ações em massa nas listas; ou cadastros financeiros (categorias) p/ DRE por categoria.
- **2026-06-11** — **Polimento UX — Toasts de confirmação.** **Frontend puro** (sem backend/migration).
  **`Toast.tsx`** (`ToastProvider` + `useToast` + container fixo embaixo à direita, auto-some em 3,5s,
  tipos `ok`/`erro`; também ouve `window 'toast'` p/ disparo sem hook). Montado no `App` (envolve o
  `BrowserRouter`). Ligado em **Contas a receber/pagar** (criar/baixar/cancelar baixa) e no **detalhe
  do pedido** (mudança de status e separação por bipagem). CSS `.toast-*` (slide-in) no `styles.css`;
  i18n pt/en/es (`fin.toast_*`, `pedido.toast_status`, `sep.toast_ok`). **Validação:** **type-check
  api+web verde (exit 0)**; sem e2e (UI). **Pendente:** Gui `git push` + testar (lançar/baixar um
  título → toast). **Próximo (polimento):** sino de notificações na topbar (títulos vencidos, lotes
  vencendo, estoque baixo), ou ações em massa nas listas; ou cadastros financeiros (categorias).
- **2026-06-11** — **Polimento UX — Busca global (Ctrl+K).** **Frontend puro** (sem backend/migration).
  Componente **`BuscaGlobal.tsx`** (montado no `Layout`): paleta de navegação que abre com **Ctrl/⌘+K**
  ou pelo botão **🔎 Buscar** na topbar (via evento `window 'abrir-busca'`); lista todas as telas
  (espelha o menu) **filtradas por capability**, com busca acento-insensível (`normalize NFD`),
  navegação por **↑/↓**, **Enter** abre, **Esc** fecha; overlay `.busca-*` no `styles.css`; i18n
  pt/en/es (`busca.*`). Também decidido com o Gui: **Transferência entre locais = fora de escopo**
  (não faz sentido p/ esta operação) — marcado no `REFINAMENTOS.md`. **Validação:** **type-check
  api+web verde (exit 0)**; sem e2e (navegação pura de UI). **Pendente:** Gui `git push` + testar
  (apertar Ctrl+K em qualquer tela). **Próximo (polimento):** sino de notificações + toasts de
  confirmação, ações em massa nas listas; ou cadastros financeiros (categorias) p/ DRE por categoria.
- **2026-06-11** — **Refinamento — DRE simplificada (resultado do período).** **Sem migration**; reusa
  `financeiro.fluxo.ver`. **Backend:** `TituloRepository.pagosPorOrigem` (SELECT soma dos títulos
  pagos por `tipo`+`origem`, filtro `pago_em::date` no período — sem tocar criar/listar) +
  `SqlTituloRepository`; `FinanceiroService.dre` monta **receitas** (receber) e **despesas** (pagar)
  por origem + `totalReceitas/totalDespesas/resultado`. Tipos `DreLinha/RelatorioDre`. Rota
  `GET /financeiro/dre`. **Frontend:** tela **Financeiro › DRE (resultado)** — filtro de período,
  3 KPIs (receitas verde, despesas vermelho, resultado verde/vermelho), duas tabelas (receitas e
  despesas por origem) e export CSV; rótulos de origem (pedido/compra/comissão/frete/manual) i18n
  pt/en/es; menu + rota. **DRE de caixa** (regime de caixa, pelos pagamentos) — DRE por categoria
  financeira fica para quando criarmos o cadastro de categorias. **Validação:** **type-check api+web
  verde (exit 0)** + **e2e Postgres real (6 PASS)** via pglite: receita de pedidos 1500 (em aberto e
  fora do período ignorados), total receitas 1700, despesas 460, resultado 1240, ordenação por valor.
  **Pendente:** Gui `git push` + testar. **Próximo (REFINAMENTOS):** cadastros financeiros (categorias
  + credores) p/ DRE por categoria, ou Transferência entre locais, ou polimento visual (Ctrl+K, sino).
- **2026-06-11** — **Refinamento — Aging de recebíveis.** **Sem migration**; reusa
  `financeiro.receber.listar`. **Backend:** `FinanceiroService.aging(schema, tipo)` (sem mudar repo)
  filtra títulos em aberto, calcula `diasAtraso = hoje − vencimento` e classifica em faixas
  (**a_vencer** ≤0, **d1_30**, **d31_60**, **d61_90**, **d90_mais**); soma por faixa + total em aberto;
  ordena do mais atrasado primeiro. Tipos `AgingFaixa/AgingLinha/RelatorioAging`. Rota
  `GET /financeiro/aging-receber`. **Frontend:** tela **Financeiro › Aging de recebíveis** (5 KPIs por
  faixa + total em aberto; tabela com dias de atraso e pill colorida por faixa; export CSV); menu +
  rota + i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real
  (8 PASS)** via pglite: 5 títulos em aberto (pago e a-pagar fora), totais por faixa (100/200/300/
  400/500), total 1500, ordena por mais atrasado. **Pendente:** Gui `git push` + testar. **Próximo
  (REFINAMENTOS):** extras de Financeiro (conciliação, categorias financeiras, credores) ou DRE/Curva
  ABC; ou Transferência entre locais (decisão de modelo pendente).
- **2026-06-11** — **Refinamento — Relatório de Vendas por categoria.** **Sem migration**; reusa
  `relatorios.ver`. **Backend:** `RelatorioRepository.vendasPorCategoria` + `SqlRelatorioRepository`
  (`pedido_item` → `produto` → `categoria`, pedidos não orçamento/cancelado, filtro `criado_em::date`
  no período; soma qtd/total por categoria, item sem produto/categoria cai em `'—'`); rota
  `GET /relatorios/vendas-categoria`. **Frontend:** tela **Relatórios › Vendas por categoria** (filtro
  de período, KPI total, barras por categoria, export CSV); menu + rota + i18n pt/en/es. **Validação:**
  **type-check api+web verde (exit 0)** + **e2e Postgres real (4 PASS)** via pglite: 3 grupos (2
  categorias + "—"), Injetáveis 1500 (ordena por total, orçamento ignorado), Skincare 300/qtd 3,
  produto sem categoria em "—". **Pendente:** Gui `git push` + testar. **Próximo (REFINAMENTOS):**
  Transferência entre locais/depósitos (entrega maior — cadastro de locais + `estoque_lote.local_id`
  com migration). **Nota:** trio de saúde de estoque (Validade, Estoque parado) + ranking de produtos/
  categorias cobre os relatórios essenciais; faltam DRE/Curva ABC/Aging como extras.
- **2026-06-11** — **Refinamento — Relatório de Estoque parado.** **Sem migration**; reusa
  `relatorios.ver`. **Backend:** `RelatorioRepository.estoqueParado` + `SqlRelatorioRepository`
  (produtos ativos com `SUM(saldo) > 0`; subquery `MAX(criado_em)` dos movimentos `tipo='saida'` =
  última saída; `valor = Σ saldo×custo`; `ORDER BY ultima_saida ASC NULLS FIRST, nome` — nunca
  vendidos e mais antigos primeiro); rota `GET /relatorios/estoque-parado`. **Frontend:** tela
  **Relatórios › Estoque parado** — seletor "sem vender há" (todos/30/60/90 d), calcula **dias
  parado** no front (nunca vendido = selo vermelho), KPIs (produtos parados, valor parado), export
  CSV. Menu + rota + i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0)** + **e2e
  Postgres real (7 PASS)** via pglite: exclui saldo 0, nunca vendido em 1º (NULLS FIRST), soma
  saldo/valor de múltiplos lotes (15/60), ordena por última saída (antigo→recente). **Pendente:**
  Gui `git push` + testar. **Próximo (REFINAMENTOS):** Transferência entre locais/depósitos (precisa
  de decisão de produto — modelar local/depósito no estoque), ou vendas por categoria.
- **2026-06-11** — **Refinamento — Relatório de Validade de lotes.** **Sem migration**; reusa a cap
  `relatorios.ver`. **Backend:** `RelatorioRepository.validadeLotes` + `SqlRelatorioRepository`
  (lotes com `quantidade > 0`, JOIN produto, `ORDER BY validade NULLS LAST, nome`; devolve produto,
  lote, validade ISO, saldo, custo e **valor = saldo×custo**); `RelatoriosService.validadeLotes`;
  rota `GET /relatorios/validade-lotes`. **Frontend:** tela **Relatórios › Validade de lotes** —
  calcula dias p/ vencer e a situação no front (**vencido** <0, **crítico** ≤30, **atenção** ≤90,
  **OK** >90, **sem validade**), pills coloridas, KPIs (lotes vencidos + valor, vencem em 30 dias),
  filtro "só vencidos/a vencer (90 d)" e **export CSV** (`lib/csv`); menu + rota + i18n pt/en/es;
  classe `.kpi-sub` no CSS. **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres
  real (6 PASS)** via pglite: exclui lote saldo 0, ordena por validade (sem validade ao fim), valor =
  saldo×custo, nome do produto. **Pendente:** Gui `git push` + testar. **Próximo (REFINAMENTOS):**
  Transferência entre locais/depósitos (exige modelar local/depósito no estoque), ou mais relatórios
  (estoque parado, vendas por categoria) / extras de Financeiro.
- **2026-06-11** — **Refinamento — Romaneio imprimível.** **Frontend puro** (sem backend/migration).
  Página **`Romaneio.tsx`** (rota `/comercial/pedidos/:id/romaneio`, **fora do Layout** — folha limpa):
  cabeçalho com **logo/fantasia da empresa** (à esquerda) + título "Romaneio" + marca **TRIADE** (à
  direita); dados do pedido (nº, data, cliente, vendedor, forma de entrega/motoboy/distância, forma
  de pagamento, endereço); tabela de itens (produto/qtd/preço/subtotal); totais (subtotal, frete,
  total) e linha de assinatura "Recebido por". Botões **Imprimir** (`window.print()`) e **Voltar**
  na barra `.no-print`. Botão **🖨️ Romaneio** adicionado no detalhe do pedido. CSS `@media print`
  (esconde `.no-print`, fundo branco, full width) + classes `.romaneio-*`/`.rom-*` no `styles.css`;
  i18n pt/en/es (`romaneio.*`). **Lotes por item** ficam de fora por ora (as etiquetas consumidas na
  separação não estão ligadas diretamente ao item do pedido — evolução futura). **Validação:**
  **type-check api+web verde (exit 0)**; sem e2e (view de impressão, dados já cobertos). **Pendente:**
  Gui `git push` + testar (abrir um pedido → Romaneio → Imprimir). **Próximo (REFINAMENTOS):**
  Transferência entre locais/depósitos, ou itens de Financeiro/Relatórios extras.
- **2026-06-11** — **Refinamento — Gestão de fretes (Logística) + títulos por motoboy.**
  **Sem migration** (usa `pedido.frete/motoboy_id/forma_entrega` da 019). Novo módulo **Logística**;
  caps `logistica.frete.ver/gerenciar`. **Backend:** domínio `GestaoFrete`/`GestaoFreteRepository`;
  `SqlGestaoFreteRepository.apurar` (JOIN motoboy×pedido, `forma_entrega='motoboy'`, status não
  orçamento/cancelado, filtro `criado_em::date` no período; por motoboy: nº de pedidos + Σ frete);
  `GestaoFretesService.fechar` gera **um título a pagar por motoboy** (origem 'frete', descricao
  "Fretes {de a ate} - {motoboy}", pessoa = motoboy) — espelha o "fechar competência" das comissões.
  Rotas `GET /logistica/fretes` e `POST /logistica/fretes/fechar`. **Frontend:** grupo de menu
  **Logística › Gestão de fretes** (filtro de período → tabela motoboy/pedidos/frete + KPIs total e
  pedidos; bloco Fechar competência c/ vencimento → gera os títulos); i18n pt/en/es; rota.
  **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (9 PASS)** via pglite
  (repos/serviços reais): apura 2 motoboys (Ana 2 pedidos/frete 40 com orçamento e retirada
  ignorados, Bruno 1/20), fechar gera 2 títulos a pagar (40 e 20, origem=frete, total 60),
  vencimento obrigatório→400, período sem frete→400. **Pendente:** Gui testar no navegador + commit
  (sem migration nova). **Próximo (REFINAMENTOS):** Romaneio imprimível ou Transferência entre locais.
- **2026-06-11** — **Refinamento — Motoboys + Formas de entrega + frete no pedido.**
  Migration tenant **019** (`motoboy` nome/telefone/ativo; `frete_config` linha única
  `km_rate`/`min_motoboy` defaults 2/20; `pedido` += `forma_entrega` default 'retirada',
  `motoboy_id`, `distancia_km`). Caps `cadastros.motoboy.listar/gerenciar`. **Backend:**
  domínio `Motoboy`/repo + `SqlMotoboyRepository` + `MotoboysService` (CRUD+ativo); rota `/motoboys`.
  `FreteConfig` (domínio + `FORMAS_ENTREGA` = retirada/motoboy/correios/transportadora) +
  `SqlFreteConfigRepository`; **`FreteService`** com `simularKm(cep)` (placeholder determinístico:
  3 + soma_dígitos%18 km, até integrar mapa real) e `calcular()` — retirada→0; motoboy→`km×km_rate`
  com mínimo + memo; correios/transportadora→valor manual (≥0); `obterConfig/salvarConfig`
  (valida ≥0). Rotas `/frete/config` (GET/PUT, cap motoboy) e `/frete/calcular` (POST, cap
  `comercial.pedido.criar`). **Pedido:** `Pedido`/`NovoPedido` += `formaEntrega/motoboyId/distanciaKm`
  (+`motoboyNome` no detalhe via LEFT JOIN); `SqlPedidoRepository` grava/lê os campos; `PedidosService`
  recebe `MotoboyRepository`, valida forma de entrega, exige motoboy quando forma=motoboy (existe),
  **retirada zera o frete**, e o total soma o frete. O **cálculo** do frete é feito no front (via
  `/frete/calcular`); o backend valida/normaliza e armazena. **Frontend:** cadastro **Cadastros ›
  Pessoas › Motoboys** (CRUD + card **Configuração de frete** km/mín, editável com a cap gerenciar);
  **Novo pedido** ganhou seletor de **forma de entrega** + **motoboy** (quando motoboy), frete
  **automático** para retirada/motoboy (chama `/frete/calcular` com o CEP do endereço do cliente) com
  memória de cálculo, e frete **manual** para correios/transportadora; total recalcula; o **detalhe do
  pedido** exibe a forma de entrega/motoboy/distância; i18n pt/en/es; menu + rota.
  **Validação:** **type-check api+web verde (exit 0)** + **e2e Postgres real (20 PASS)**
  via **pglite** (repos/serviços reais): motoboy CRUD/validação, config default 2/20, retirada→0,
  motoboy cep 01001000 → 5 km / frete 20 (mínimo) com memo, correios manual 33,5, forma inválida→400,
  manual negativo→400, nova config 5×5=25, km_rate negativo→400, pedido motoboy grava frete 20/total
  220/distância 5/nome do motoboy, retirada zera frete (total 100), motoboy sem seleção→400, motoboy
  inexistente→400, forma inválida no pedido→400. **Pendente:** Gui rodar `db-setup.bat` (migration 019)
  + testar no navegador + commit. **Obs.:** a distância por CEP é **simulada** (determinística) —
  trocar por um serviço de mapas real é evolução futura. **Nota de ambiente:** mesmo problema das
  sessões recentes — o mount serve versão truncada de arquivo editado pelo file-tool; workaround:
  deletar via shell (exclusão habilitada) e recriar pelo file-tool, ou anexar ao prefixo íntegro via
  shell. e2e com pglite (embedded-postgres em cache sem libs ICU 60). O symlink
  `node_modules/@triade/shared` precisa ser absoluto p/ o tsc no sandbox; no Windows `npm install`
  recria os links do workspace (node_modules é gitignored). **Próximo (REFINAMENTOS):** Gestão de
  fretes (Logística) + títulos por motoboy, ou Romaneio imprimível.
- **2026-06-11** — **Refinamento — Marcas de produtos + Recebimento multi-lote com bipagem.**
  Migration tenant **018** (`marca` nome/fabricante/ativo + `estoque_lote.marca_id`). Caps
  `cadastros.marca.listar/gerenciar`. **Backend:** domínio `Marca`/`MarcaRepository`;
  `SqlMarcaRepository`; `MarcasService` (CRUD + ativar/inativar, valida nome); rota `/marcas`
  (GET/POST/PUT/PATCH ativo). `EntradaEstoque` ganhou `marcaId?` e `LotePosicao` ganhou `marca`
  (nome); `SqlEstoqueRepository.registrarEntrada` grava `marca_id` e a **mescla de lote** agora
  considera produto+lote+validade+**marca**; `posicao` faz LEFT JOIN em `marca`. **Recebimento
  reescrito (`ComprasService.receber`):** recebe `lotes[]`, cada bloco com `{lote, validade,
  marcaId(obrigatório), codigos[]}`; valida marca de cada lote (existe), **soma das etiquetas
  bipadas = quantidade da nota**, recusa código repetido entre lotes (400) e código já no estoque
  (409); registra N lotes (entrada + etiquetas) e marca a pendência como recebida. `ComprasService`
  passou a receber `MarcaRepository` + `EtiquetaRepository`. **Frontend:** cadastro **Cadastros ›
  Estoque › Marcas** (lista + modal nome/fabricante + ativar/inativar); **Recebimento** virou
  multi-lote — modal com N blocos (marca select + lote/validade + caixa de bipagem própria c/ chips
  e contador), botão "Adicionar lote", contador global bipados/qtd, confirma só quando soma = qtd e
  todo bloco tem marca; **Entrada de estoque** ganhou seletor de marca opcional; **Posição de
  estoque** mostra a marca no lote; i18n pt/en/es. **Validação:** **type-check api+web verde (exit 0
  nos dois)** + **e2e Postgres real (20 PASS)** rodado via **pglite** (Postgres em WASM) injetando
  um shim `ds.query` nos repositórios SQL reais — exercita as migrations + repos + serviços de
  verdade: marca CRUD/validação, nota gera título a pagar (30, origem=compra) + pendência, receber
  2 lotes soma=3 (saldo 3, 2 lotes, marca nos lotes, 3 etiquetas, pendência fechada), soma
  divergente→400, marca obrigatória→400, marca inexistente→400, código repetido→400, lista vazia→400,
  código já no estoque→409, falhas não tocam saldo/pendência, 2ª nota mescla no mesmo lote (saldo 6).
  **Pendente:** Gui rodar `db-setup.bat` (migration 018) + testar no navegador + commit.
  **Nota de ambiente:** o mount do sandbox voltou a servir versão truncada de **todo** arquivo
  editado pelo file-tool (o `stat` reporta o tamanho cortado); arquivos novos sincronizam normais.
  Workaround usado: deletar via shell (após habilitar exclusão) e recriar pelo file-tool, ou
  reconstruir o prefixo íntegro via shell — assim o `tsc`/e2e enxergam o código real. O
  `embedded-postgres` em cache está incompleto (faltam libs ICU 60) e não roda; por isso o e2e foi
  feito com **pglite** (npm acessível nesta sessão). **Próximo (REFINAMENTOS):** Formas de entrega +
  frete (motoboy CEP×km) / Romaneio imprimível, ou Transferência entre locais.
- **2026-06-11** — **Refinamento — Inventário por leitor (contagem + baixa de faltantes).**
  Migration tenant 017 (`inventario` + `inventario_faltante`). Caps `estoque.inventario.ver/gerenciar`.
  **Backend:** domínio `Inventario`/`InventarioRepository`; `SqlInventarioRepository` (criar c/ faltantes,
  listar histórico, faltantesDe); `EtiquetaRepository.listarEmEstoque` (esperadas = etiquetas status
  'estoque'); `EstoqueRepository.baixarUnidadeLotePerda` (−1 no lote + movimento 'perda'). `InventarioService.finalizar`
  recebe `{responsavel, codigos[], baixarPerda}`: compara lidos × esperadas → encontradas/faltantes/desconhecidas;
  se `baixarPerda`, zera cada faltante (status perda + baixa do lote, motivo "Ajuste de inventário"); grava o
  inventário + faltantes. Rotas `POST /inventario`, `GET /inventario`, `GET /inventario/:id/faltantes`.
  **Frontend:** tela **Estoque/Expedição › Inventário** (responsável + caixa de bipagem c/ chips/contador;
  botões "Finalizar contagem" e "Finalizar e baixar faltantes"; painel de resultado c/ KPIs esperadas/
  encontradas/faltantes/desconhecidas + lista de faltantes; histórico); menu + rota + i18n pt/en/es.
  **Validação:** type-check api+web verde (3 pacotes). **e2e NÃO rodou nesta sessão:** o sandbox reiniciou no
  meio e o `embedded-postgres` (binário ~59MB) não reinstalou — download trava nesta rede. O harness de e2e
  já está escrito (`/tmp/pgtool/e2einv.mjs`, mas /tmp é volátil) cobrindo: 3 esperadas/2 encontradas/1 faltante,
  desconhecida ignorada, baixar faltante vira perda (saldo cai, etiqueta 'perda'), histórico, guard 403 —
  **recomendado rodar ao aplicar a migration 017.** **Pendente:** Gui rodar `db-setup.bat` (migration 017) +
  testar + commit. **Próximo (REFINAMENTOS):** Marcas de produtos / Recebimento multi-lote com bipagem.
- **2026-06-10** — **Refinamento — Código de barras na SEPARAÇÃO (bipagem p/ baixa).**
  Fecha o item "código de barras" do `REFINAMENTOS.md`. **Backend:** `PedidosService.separarBipando`
  (recebe `codigos[]`, casa cada etiqueta com um item do pedido pelo produto, exige TODOS os itens
  bipados na quantidade exata, dá baixa **do lote específico da etiqueta** — não FIFO genérico — e
  marca a etiqueta como `saida`); novo `EstoqueRepository.baixarUnidadeLote` (−1 no lote + movimento
  'saida' com ref do pedido); só permite quando o pedido está em status que transita p/ `separacao`
  (aprovado→separacao). Rota `POST /pedidos/:id/separar` (cap `comercial.pedido.gerenciar`). O caminho
  antigo (PATCH status → FIFO automático) segue existindo como fallback. **Frontend:** no **detalhe do
  pedido**, pedidos aprovados ganham o botão **"Separar por leitura"** → modal lista os itens/qtd +
  caixa de bipagem (chips, contador bipados/total) → confirma chamando `/separar`; i18n pt/en/es.
  **Validação:** type-check api+web + **e2e Postgres real (12 PASS)**: incompleto→400, produto fora do
  pedido→400, código inexistente→404, sem baixa parcial nas falhas, separação OK baixa saldo p/ 0 +
  etiqueta vira `saida`, pedido vai p/ separacao, separar de novo→400 (transição), etiqueta já
  consumida→409, guard 403. **Pendente:** Gui rodar/testar + commit (sem migration nova). **Nota de
  ambiente:** o mount do sandbox corrompeu o `node_modules` no meio da sessão; rodei type-check e e2e
  numa cópia limpa do projeto em disco local (`/tmp`), com Postgres real — o código-fonte no Desktop é
  o de verdade. **Próximo (REFINAMENTOS, ordem):** Inventário (contagem + ajuste por leitor).
- **2026-06-10** — **Refinamento — Código de barras na ENTRADA (bipagem das etiquetas).**
  Correção de premissa: o sistema **não gera** etiquetas — elas já vêm afixadas nos produtos; o
  sistema apenas **bipa** os códigos (modelo do mockup, `triade_etiquetas_<emp>`). Migration tenant
  016 `etiqueta` (codigo único, produto_id, lote_id, status estoque/saida/perda). **Backend:** domínio
  `Etiqueta`/`EtiquetaRepository` (`listarPorLote`, `buscarPorCodigo`, `jaExistem`, `consumir`);
  `SqlEtiquetaRepository`. `EstoqueService.entrada` virou **bipagem**: recebe `codigos[]` (os lidos),
  **quantidade = nº de códigos**, recusa código repetido na leitura (400) e código já existente no
  estoque (409); `registrarEntrada` insere as etiquetas lidas vinculadas ao lote (não gera nada).
  Nova rota `GET /estoque/etiquetas/:codigo` (a bipagem **traz produto/lote/validade**, normaliza
  maiúsculo) e `GET /estoque/lotes/:loteId/etiquetas` (rastreabilidade). **Frontend:** **Entrada de
  estoque** trocou o campo Quantidade por uma **caixa de bipagem** (lê/digita + Enter → chips de
  códigos; quantidade derivada); **Posição de estoque** mostra as etiquetas bipadas de cada lote
  (código + situação, somente leitura); i18n pt/en/es. **Validação:** type-check 3 pacotes + **e2e
  Postgres real (15 PASS)**: entrada com 2 códigos → saldo 2 + 2 etiquetas estoque; consulta traz
  produto/lote/validade (e normaliza minúsculo); código inexistente→404; reusar código no estoque→409;
  repetido na leitura→400; sem códigos→400; merge no mesmo lote (+1) → saldo 3 e 3 etiquetas; guard 403.
  **Pendente:** Gui rodar `db-setup.bat` (migration 016) + testar + commit; **remover do working tree**
  os arquivos órfãos `e2ebar.mjs` (vazio) e `apps/web/src/lib/barcode.ts` (não consegui apagar no
  ambiente — `git rm`/clean). **Build Vite** não rodou no ambiente (node_modules veio do Windows, sem
  binários nativos Linux do rollup/esbuild) — só afeta o build local, não o código (tsc verde). **Próximo:
  Código de barras na SEPARAÇÃO** (bipar p/ baixa, casando com o pedido). **Nota técnica do ambiente:**
  o mount do sandbox truncou várias escritas do file-tool; o caminho confiável foi escrever via shell.
- **2026-06-10** — **Refinamento — Contas correntes (bancos) + saldo + vínculo na baixa.**
  Migration tenant 015 `conta_corrente` (nome, banco, saldo_inicial, ativo) + `titulo.conta_corrente_id`.
  Caps `cadastros.conta.listar/gerenciar`. **Backend:** domínio `ContaCorrente`/repo + `ContasService`
  (CRUD); `saldos` = saldo_inicial + Σ recebíveis pagos na conta − Σ pagáveis pagos na conta.
  `TituloRepository.baixar` agora grava `conta_corrente_id` (e `cancelarBaixa` limpa). `FinanceiroService.baixar`
  recebe contaCorrenteId; rota de baixa repassa. Rotas `/contas-correntes` (CRUD) + `/contas-correntes/saldos`.
  **Frontend:** **Cadastros › Financeiro › Contas correntes** (cards com saldo + saldo inicial + editar) e
  **seletor de conta no modal de baixa** do Contas a receber/pagar; i18n pt/en/es. **Validação:** type-check
  3 pacotes + build Vite + **e2e Postgres real (6 PASS)**: saldo inicial 1000, baixa receber+pagar na conta
  → 1300, cancelar baixa do receber → 800, nome curto→400, guard 403. **Pendente:** Gui rodar `db-setup.bat`
  (migration 015) + testar + commit. Próximo: conciliação bancária ou código de barras (ver `Info/REFINAMENTOS.md`).
- **2026-06-10** — **Refinamento — Comissões de vendedores (apuração + fechar competência).**
  Caps `financeiro.comissao.ver/gerenciar`. **Backend:** domínio `Comissao`/`ComissaoRepository`;
  `SqlComissaoRepository.apurar` (JOIN pedido×vendedor, pedidos não orçamento/cancelado no período,
  por vendedor: vendido + comissão = vendido×%/100). `ComissoesService.fechar` soma e cria **título a
  pagar** "Comissões {de a ate}" (origem 'comissao', pessoa "Comissões (vendedores)"). Rotas
  `GET /financeiro/comissoes` e `POST /financeiro/comissoes/fechar`. **Frontend:** **Financeiro ›
  Controle de comissões** (filtro período → tabela vendedor/vendido/%/comissão + KPI total; bloco
  Fechar competência c/ vencimento → gera o título); i18n pt/en/es. **Nota:** regra geral de comissão
  (`segue_regra_geral` do vendedor) fica como evolução futura — hoje usa o % individual. **Validação:**
  type-check 3 pacotes + build Vite + **e2e Postgres real (5 PASS)**: apura vendido 5000 (orçamento
  ignorado), comissão 250 (5%), fechar gera título a pagar de 250 origem=comissao, guard 403.
  **Pendente:** Gui rodar `db-setup.bat` + testar + commit. Próximo: contas correntes/bancos ou
  código de barras (ver `Info/REFINAMENTOS.md`).
- **2026-06-10** — **Refinamento — Condições de pagamento + parcelamento do pedido.**
  Migration tenant 014 `condicao_pagamento` (nome, parcelas, intervalo_dias, ativo) +
  `pedido.condicao_parcelas`/`condicao_intervalo` (snapshot, defaults 1/30). Caps
  `cadastros.condicao.listar/gerenciar`. **Backend:** domínio `Condicao` + repo + `CondicoesService`
  (CRUD, valida parcelas 1–99 e intervalo≥0); `PedidosService` recebe `CondicaoRepository`, no
  **criar** resolve a condição e grava o snapshot no pedido; `TituloRepository.criarReceberDePedido`
  virou **`criarParcelasDePedido`** (gera N parcelas: valor total/N c/ ajuste na última, descricao
  "PE-xxxxxx (i/N)", vencimento `CURRENT_DATE + i*intervalo`); confirmar o pedido usa o snapshot.
  Rotas `/condicoes` (GET/POST/PUT/PATCH ativo). **Frontend:** cadastro **Cadastros › Comercial ›
  Condições de pagamento** (lista + modal parcelas/intervalo) e **seletor de condição no Novo pedido**
  (em branco = à vista/título único); i18n pt/en/es. **Bug corrigido no caminho:** o INSERT do pedido
  não casou na 1ª substituição (faltou `numero` no alvo) → snapshot não gravava; ajustado. **Validação:**
  type-check 3 pacotes + build Vite + **e2e Postgres real (7 PASS)**: condição 3x gera 3 parcelas
  (soma=total, vencimentos 30/60/90, descrição i/3), parcelas 0→400, pedido sem condição = 1 título.
  **Pendente:** Gui rodar `db-setup.bat` (migration 014) + testar + commit. Próximo: comissões de vendedores.
- **2026-06-10** — **Refinamento — Campanhas de preço (preço por período sobre o base).**
  Checklist mestre dos refinamentos do mockup criado em `Info/REFINAMENTOS.md`. Migration tenant 013
  `preco_campanha` (produto_id, preco, motivo, de/ate date). **Backend:** `PrecoBaseRepository.precoDe`
  agora resolve **campanha vigente hoje** (`CURRENT_DATE BETWEEN de AND ate`, mais recente) → senão
  preço fixo do `preco_base`; +`listarCampanhas`/`criarCampanha`/`removerCampanha`. `PrecosService`
  valida preço≥0, datas ISO, ate≥de. Rotas `GET/POST /precos/campanhas/:produtoId`, `DELETE
  /precos/campanhas/item/:id`. **Frontend:** Tabela de preço (modo base) ganhou coluna **Campanhas** →
  modal com histórico (preço, motivo, período, selo vigente/encerrada) + form nova campanha + remover;
  `api.del` adicionado ao client; i18n pt/en/es. **Validação:** type-check 3 pacotes + build Vite +
  **e2e Postgres real (8 PASS)**: campanha vigente sobrepõe fixo no pedido (700→1400), só 1 vigente,
  remover volta ao fixo (1000), período invertido→400. **Cadeia de preço efetivo no pedido:** preço do
  cliente → campanha vigente → preço fixo. **Pendente:** Gui rodar `db-setup.bat` (migration 013) +
  testar + commit. Próximo refinamento: condições de pagamento + parcelamento do título no pedido.
- **2026-06-10** — **Refinamento — Preço por cliente (Tabela de preço) + uso no pedido.**
  Migration tenant 012 `preco_cliente` (cliente_id+produto_id PK, preco). **Backend:** domínio
  `PrecoClienteRepository`; `SqlPrecoClienteRepository` (listarPorCliente c/ base de referência via
  LEFT JOIN preco_base, `definir` upsert — preço 0 **remove** o registro, `precoDe`). `PrecosService`
  ganhou `listarCliente`/`definirCliente`. **`PedidosService` agora resolve o preço do item como
  preço do cliente (se houver) → senão preço base.** Rotas `GET /precos/cliente/:clienteId` e
  `PUT /precos/cliente/:clienteId/:produtoId`. **Frontend:** Tabela de preço com seletor de **modo
  Base × Por cliente**; no modo cliente, escolhe o cliente e edita o preço por produto (mostra o base
  como referência; em branco = usa base); i18n pt/en/es. **Validação:** type-check 3 pacotes + build
  Vite + **e2e Postgres real (6 PASS)**: lista base sem preço de cliente, define 800, pedido do VIP usa
  800 (total 1600) e do comum usa base 1000 (2000), preço 0 remove. **Pendente:** Gui rodar
  `db-setup.bat` (migration 012) + testar + commit. Próximos refinamentos do mockup: campanhas de
  preço (período), comissões, condições de pagamento/parcelas, código de barras, CRM.
- **2026-06-10** — **Fase 6 — Entrega 6B (Relatórios: vendas + produtos mais vendidos). Fase 6 concluída.**
  Cap `relatorios.ver` (módulo Relatórios). **Backend:** domínio `Relatorio`/`RelatorioRepository`;
  `SqlRelatorioRepository.vendas` (pedidos não orçamento/cancelado no período, filtro `criado_em::date`
  entre de/ate; total + **total por vendedor**) e `produtosVendidos` (Σ pedido_item por produto no
  período, ranking por qtd). `RelatoriosService` (valida datas ISO). Rotas `GET /relatorios/vendas` e
  `GET /relatorios/produtos-vendidos` (cap relatorios.ver). **Frontend:** grupo de menu **Relatórios**
  com **Vendas** (filtro de período, KPI total, tabela de pedidos + painel total por vendedor) e
  **Produtos mais vendidos** (ranking c/ barras); ambos com **Exportar CSV** (`lib/csv.ts`, BOM + `;`);
  i18n pt/en/es. **Validação:** type-check 3 pacotes + build Vite + **e2e Postgres real (6 PASS)**:
  total de vendas no período (5000, orçamento ignorado), total por vendedor, ranking de produtos,
  total por produto, período vazio→0, guard 403. **MVP (Fases 0–6) completo.** Refinamentos restantes
  (campanhas/preço por cliente, comissões, inventário cód. barras, CRM) ficam como melhorias opcionais.
- **2026-06-10** — **Fase 6 — Entrega 6A (Dashboard com indicadores reais).** Backend: domínio
  `Dashboard`/`DashboardRepository`; `SqlDashboardRepository.resumo` agrega (1 chamada): vendas do
  mês (pedidos não orçamento/cancelado no mês), pedidos por status, a receber/pagar aberto+vencido
  (FILTER WHERE), produtos com estoque baixo (saldo<estoque_minimo), saldo de caixa (Σ títulos pagos,
  receber+/pagar−), top 5 produtos vendidos (Σ pedido_item). `DashboardService` + rota `GET /dashboard`
  (cap `dashboard.ver`). **Frontend:** Dashboard real substitui o placeholder — 5 cards (vendas mês,
  saldo caixa, a receber, a pagar c/ selo vencido, estoque baixo) + painel **Pedidos por status** +
  **Top produtos** (barras), i18n pt/en/es. **Validação:** type-check 3 pacotes + build Vite + **e2e
  Postgres real (8 PASS)**: dashboard zerado, vendas do mês após confirmar pedido (2000), a receber,
  estoque baixo=1, top produto, pedidos por status, saldo de caixa após baixa (2000). **Pendente:**
  Gui testar (sem migration nova) + commit. **Próximo:** relatórios (vendas por período, produtos
  mais vendidos) e refinamentos (campanhas/preço por cliente, comissões, inventário cód. barras, CRM).
- **2026-06-10** — **Fase 5 — Entrega 5B (Fluxo de caixa + Nota de entrada/compra + Recebimento). MVP essencial completo.**
  **5B-i Fluxo de caixa:** cap `financeiro.fluxo.ver`; `TituloRepository.listarPagos` + `FinanceiroService.fluxo`;
  rota `GET /financeiro/fluxo`; tela **Financeiro › Fluxo de caixa** (KPIs entradas/saídas/saldo + lista de
  movimentos pela data da baixa). **5B-ii Compra (2 etapas):** migration tenant 011 `recebimento`
  (fornecedor, produto, qtd, custo, total, nf, titulo_id, status pendente/recebido); cap
  `financeiro.compra.criar`. `ComprasService.lancarNota` cria **título a pagar** (origem 'compra',
  venc +30) **+ pendência de recebimento**; `listarPendentes`; `receber` dá **entrada no estoque**
  (lote/validade via `EstoqueRepository.registrarEntrada`) e marca recebido. Rotas `POST /financeiro/nota`,
  `GET /estoque/recebimentos`, `POST /estoque/recebimentos/:id/receber`. **Frontend:** **Financeiro › Nota
  de entrada** (fornecedor datalist, produto, qtd, custo, NF, total auto) e **Estoque/Expedição ›
  Recebimento** (lista pendências → modal lote/validade → entrada). i18n pt/en/es. **Validação:**
  type-check 3 pacotes + build Vite + **e2e Postgres real (8 PASS)**: nota gera título a pagar (800,
  origem=compra) + pendência; estoque só entra após receber (saldo 0→10 no lote informado); pendência
  some; baixa do título a pagar vira **saída no fluxo de caixa**. **Pendente:** Gui rodar `db-setup.bat`
  (migration 011) + testar + commit. **MVP (Fases 0–5) essencialmente completo.** Próximo: Fase 6
  (Relatórios & Dashboard) — consolidação/indicadores; campanhas de preço, comissões e inventário por
  código de barras ficam como refinamentos.
- **2026-06-10** — **Fase 5 — Entrega 5A (Financeiro: Contas a receber/pagar + título auto do pedido).**
  **Banco (migration tenant 010):** tabela `titulo` (tipo receber/pagar, descricao, pessoa_nome,
  valor, vencimento date, status aberto/pago, forma_pagamento, pago_em, origem manual/pedido,
  pedido_id). **Caps:** `financeiro.receber/pagar` listar/gerenciar (módulo Financeiro). **Backend
  (hexagonal):** domínio `Titulo`/`TituloRepository`; `SqlTituloRepository` (listar por tipo, criar,
  baixar→status pago+forma+pago_em, cancelarBaixa, excluir, `criarReceberDePedido` com vencimento
  CURRENT_DATE+30); `FinanceiroService` valida descricao/valor>0/vencimento. **Integração:**
  `PedidosService` recebe `TituloRepository` e, ao **confirmar** o pedido (→aguardando_pagamento),
  gera **título a receber** (descricao=Pedido PE-xxxxxx, valor=total, origem='pedido'). Rotas
  genéricas `/financeiro/receber` e `/financeiro/pagar` (GET/POST/PATCH baixar/PATCH cancelar/DELETE),
  guard por capability do tipo. **Frontend:** telas **Contas a receber** e **Contas a pagar**
  (componente único `Contas` por tipo): KPIs (em aberto, vencidos), lista com situação
  aberto/vencido/pago, novo título, baixar (forma de pgto), cancelar baixa; selo "do pedido" nos
  títulos de origem pedido; menu grupo **Financeiro**; i18n pt/en/es. **Validação:** type-check 3
  pacotes + build Vite + **e2e Postgres real (10 PASS)**: cria/lista/baixa título a pagar, valor
  inválido→400, **confirma pedido gera título a receber (total c/ frete, origem=pedido)**, guard 403.
  **Pendente:** Gui rodar `db-setup.bat` (migration 010) + testar + commit. **Próximo (5B):** Fluxo
  de caixa + nota de entrada (compra) → título a pagar + pendência de recebimento no estoque.
- **2026-06-10** — **Fase 4 — Entrega 4C (Baixa / perda de estoque).** Cap `estoque.baixa.criar`.
  **Backend:** `EstoqueRepository` ganhou `saldoLote` e `baixarLote` (decrementa o lote + movimento
  'perda' com o motivo). `EstoqueService.baixaPerda` valida qtd>0, motivo, lote existe e qtd≤saldo
  (insuficiente→409). Rota `POST /estoque/baixa`. **Frontend:** menu **Estoque/Expedição › Baixa /
  perda** — seleciona produto → lote (mostra validade + saldo) → quantidade (máx = saldo) → motivo
  (Vencimento/Avaria/Furto/Ajuste/Devolução/Outro); i18n pt/en/es. **Validação:** type-check + build +
  **e2e Postgres real (7 PASS)**: baixa por vencimento (10→7), baixa>saldo→409, motivo vazio→400,
  lote inexistente→404, guard 403. **Fase 4 essencial concluída** (inventário simples por ajuste fica
  opcional; recebimento por nota+código de barras casa com o Financeiro). **Próximo: Fase 5 (Financeiro).**
- **2026-06-10** — **Fase 4 — Entrega 4B (Baixa de estoque na separação + Kanban de Expedição).**
  **Backend:** `EstoqueRepository` ganhou `disponivel` (soma saldo do produto) e `baixarFifo`
  (consome lotes por validade NULLS LAST/criado_em, movimento 'saida' com ref `Pedido PE-xxxxxx`).
  `PedidosService` recebe `EstoqueRepository` e, ao mover o pedido para **`separacao`**, **checa
  disponibilidade** de todos os itens (insuficiente → 409 `estoque.insuficiente`) e depois **baixa**
  FIFO. Cancelar só antes da separação (sem devolução de estoque). **Frontend:** **Estoque/Expedição ›
  Pedidos (Kanban)** com **drag-and-drop**; soltar card numa coluna chama `PATCH status` (respeita
  transições; arrastar p/ "Em separação" dispara a baixa); card abre detalhe. Cap do menu:
  `comercial.pedido.gerenciar`. i18n pt/en/es. **Validação:** type-check 3 pacotes + build Vite +
  **e2e Postgres real (5 PASS)**: separação baixa estoque (13→8), **FIFO** (lote val. mais cedo zera
  primeiro), insuficiente bloqueia (409) e mantém saldo. **Próximo na Fase 4:** inventário e
  baixa/perda; depois Fase 5 (Financeiro) habilita recebimento por nota + código de barras.
- **2026-06-10** — **Fase 4 — Entrega 4A (Estoque: Posição + Entrada).**
  **Banco (migration tenant 009):** `estoque_lote` (produto_id, lote, validade date, quantidade,
  custo_unitario) + `estoque_movimento` (produto_id, lote_id, tipo, quantidade, observacao).
  **Caps:** `estoque.saldo.ver`, `estoque.entrada.criar`. **Backend (hexagonal):** domínio `Estoque`;
  `SqlEstoqueRepository` — `posicao` agrega saldo por produto + lotes (validade ISO), marca
  `abaixoMinimo` vs estoque_minimo; `registrarEntrada` **mescla** lote de mesmo produto+lote+validade
  (senão cria) + movimento 'entrada'; `EstoqueService` valida produto/qtd>0/custo≥0. Rotas
  `GET /estoque`, `POST /estoque/entrada`. **Frontend:** menu **Estoque/Expedição** com **Posição de
  estoque** (saldo + situação; expandir vê lotes/validade) e **Entrada de estoque**; i18n pt/en/es.
  **Validação:** type-check + build + **e2e Postgres real (9 PASS)**: posição abaixo do mínimo,
  entrada + **merge** (10+15=25), 2 lotes, validade, acima do mínimo, qtd 0→400, guard 403.
  **Nota:** ambiente temporário do Claude foi reiniciado nesta sessão e reconstruído da pasta do projeto.
- **2026-06-10** — **Fase 3 — Entrega 3B (Pedidos: novo, lista, detalhe, workflow, limite de crédito).**
  **Banco (migration tenant 008):** sequência `pedido_numero_seq`; tabela `pedido` (numero,
  cliente_id, vendedor_id, status, forma_pagamento, observacao, endereco_entrega, subtotal,
  frete, total) e `pedido_item` (produto_id, **snapshot** produto_nome/preco_unitario, qtd,
  subtotal). **Caps:** `comercial.pedido.listar/criar/gerenciar`. **Backend (hexagonal):**
  domínio `Pedido`/`PedidoItem`/`StatusPedido`; `SqlPedidoRepository` (proximoNumero via
  nextval, criar+itens, listar, buscarPorId, mudarStatus, somaEmAberto p/ crédito);
  `PedidosService` — preço **puxado da tabela de preço** (`precoDe`), snapshot de nome/preço,
  subtotal/total c/ frete, endereço default do **favorito do cliente**; `mudarStatus` valida
  transições (orçamento→aguard.pagto→aprovado→separação→expedido→entregue; +cancelado) e na
  confirmação (→aguard.pagto) checa **limite de crédito** (soma dos pedidos em aberto do
  cliente + total ≤ limite, se limite>0). Rotas `/pedidos` GET/POST, `/pedidos/:id` GET,
  `PATCH /pedidos/:id/status`. **Frontend:** **Comercial › Pedidos** (lista c/ nº PE-000000,
  status colorido), **Novo pedido** (cliente/vendedor/forma pgto, endereço do favorito,
  itens c/ preço auto da tabela, subtotal/frete/total), **Detalhe** c/ itens e botões de
  ação por status; i18n pt/en/es. **Reserva de estoque:** gancho — integra na Fase 4.
  **Validação:** type-check 3 pacotes + build Vite + **e2e Postgres real (13 PASS)**: preço
  da tabela, total c/ frete, snapshot de item, endereço do favorito, limite estourado→409,
  confirma dentro do limite, transição inválida→400, fluxo completo de status, sem itens→400.
  **Pendente:** Gui rodar `db-setup.bat` (migration 008) + testar + commit.
  **Addendum:** tela **Pedidos** convertida de lista para **Kanban** (colunas por status,
  cards clicáveis → detalhe), fiel ao mockup (Kanban Comercial é leitura; movimentação fina
  vai no Kanban de Expedição da Fase 4). type-check + build OK. Decisão de fidelidade
  reforçada: replicar componentes-assinatura do mockup (Kanban etc.); polimento puro
  (Ctrl+K, sino) fica p/ passada futura.
- **2026-06-10** — **Passada de fidelidade nos cadastros antigos (Produto/Fornecedor/Vendedor).**
  Migration tenant 006: **produto** perde `preco` (preço vai p/ Comercial › Tabela de preço, conforme
  mockup) e ganha `localizacao` + `registro_anvisa`; **fornecedor** ganha `cep`/`cidade`/`uf`;
  **vendedor** ganha `regiao`, `meta_mensal` (numeric) e `segue_regra_geral` (bool). Backend
  (domínio/repos/serviços) e telas atualizados: Produto sem preço, unidade como select (UN/CX/ML/G/KG/FR/AMP),
  nota de que preço/lote/validade vêm depois; Fornecedor com **máscara + buscar CNPJ** (BrasilAPI) e
  endereço (CEP via ViaCEP, cidade/UF); Vendedor com região, meta mensal e checkbox "seguir regra geral
  de comissão" (desabilita o % individual). Util `apps/web/src/lib/br.ts` (máscaras CNPJ/CPF/CEP +
  buscarCnpj/buscarCep). e2e Postgres real (7 PASS) + type-check + build. **Pendente:** Gui rodar
  `db-setup.bat` (migration 006) + testar + commit. **Obs.:** layout em modal mantido (mockup usa
  página inteira em alguns forms — polimento de layout adiável).
- **2026-06-10** — **Decisão: fidelidade ao mockup + passada de fidelidade no Clientes.**
  Gui pediu para o sistema seguir fielmente o mockup (campos/fluxo/telas). **Regra nova:**
  cada módulo replica os campos/comportamentos do `Info/mockups/erp-mockup.html`; o que for só
  polimento de UI (busca global Ctrl+K, sino de notificações, ações em massa) pode ficar p/ depois,
  mas campos de negócio devem bater. **Clientes enriquecido:** migration tenant 005 `cliente_endereco`
  (cep, logradouro, numero, complemento, bairro, cidade, uf, favorito; FK→cliente ON DELETE CASCADE);
  domínio `Cliente.enderecos: EnderecoCliente[]`; `SqlClienteRepository` grava/lê/substitui endereços;
  `ClientesService` normaliza favorito (≤1; se houver endereço e nenhum favorito, marca o 1º). **Front:**
  modal de Clientes com **máscara CPF/CNPJ**, **buscar CNPJ** (BrasilAPI preenche razão/fantasia),
  seção de **endereços** (principal+adicionais, rádio favorito, add/remover) com **busca de CEP** (ViaCEP
  preenche logradouro/bairro/cidade/uf). e2e Postgres real (7 PASS): cria com 2 endereços, normaliza
  favorito, edita substituindo, PF sem endereço. type-check + build OK. **Pendente:** Gui rodar
  `db-setup.bat` (migration 005) + testar + commit. Fornecedor/Vendedor/Produto: alinhar detalhes ao
  mockup conforme formos tocando (ex.: máscara doc no fornecedor).
- **2026-06-10** — **Fase 2 — Entrega 2B (Cadastros › Pessoas) + alinhamento de menu. Fase 2 concluída.**
  **Banco (migration tenant 004):** `cliente` (tipo_pessoa PJ/PF, nome, fantasia, documento,
  email, telefone, limite_credito numeric, ativo), `fornecedor` (nome, fantasia, documento,
  email, telefone, ativo), `vendedor` (nome, email, telefone, comissao_percentual numeric, ativo).
  **Caps:** `cadastros.cliente/fornecedor/vendedor` listar/gerenciar. **Backend (hexagonal):**
  domínio + repos SQL (`SqlCliente/Fornecedor/VendedorRepository`) + `PessoasServices.ts`
  (ClientesService valida PF/PJ, documento, limite ≥ 0; FornecedoresService; VendedoresService
  valida comissão 0–100); rota única `pessoas.ts` com helper CRUD genérico (GET/POST/PUT/PATCH
  ativo) registrando `/clientes`, `/fornecedores`, `/vendedores`, guard por capability.
  **Frontend:** telas Clientes (toggle PF/PJ muda labels/campos; limite de crédito; CPF/CNPJ),
  Fornecedores e Vendedores (lista + modal + ativar/inativar), sob **Cadastros › Pessoas**,
  i18n pt/en/es. **Menu alinhado ao mockup:** grupo único **Configurações** (Usuários, Perfis,
  Dados da empresa) no lugar do antigo "Acesso"+"Configurações"; **Cadastros** com sub-rótulos
  (`nav-sublabel`) Pessoas e Estoque/Expedição; Super-admin mantido à parte (adição do multi-tenant,
  fora do mockup). **Validação:** type-check 3 pacotes + build Vite + **e2e Postgres real (13 PASS)**:
  cria cliente PF e PJ (com limite), valida nome curto/documento vazio (400), CRUD de fornecedor e
  vendedor, comissão > 100 → 400, edita/inativa, guard 403 sem cap. **Pendente:** Gui rodar
  `db-setup.bat` (migration 004) + testar + commit.
- **2026-06-10** — **Fase 2 — Entrega 2A (Cadastros: Categorias e Produtos).**
  **Banco (migration tenant 003):** tabelas `categoria` (id, nome) e `produto` (id, nome,
  categoria_id→categoria, unidade, preco numeric(14,2), estoque_minimo, ativo). **Caps novas:**
  `cadastros.categoria.listar/gerenciar`, `cadastros.produto.listar/gerenciar` (módulo Cadastros).
  Seed agora **sincroniza** todas as caps no perfil Administrador a cada execução (corrige o
  caso de caps novas não chegarem a perfis já existentes). **Backend (hexagonal):** domínio
  `Categoria`/`Produto` + repos como interface; `SqlCategoriaRepository`, `SqlProdutoRepository`;
  `CategoriasService`, `ProdutosService` (validações: nome, preço ≥ 0, mínimo inteiro ≥ 0,
  categoria existente — via `ErroAplicacao` i18n); rotas `/categorias` (GET/POST/PUT) e
  `/produtos` (GET/POST/PUT + PATCH ativo), guard por capability. **Frontend:** telas
  **Cadastros › Categorias** e **Produtos** (lista + modal; produto com categoria, unidade,
  preço, estoque mínimo, ativar/inativar), menu Cadastros por permissão, i18n pt/en/es.
  **Validação:** type-check 3 pacotes + build Vite + **e2e Postgres real (11 PASS)**: cria/lista
  categoria e produto (com nome da categoria e preço), valida nome curto/preço negativo/categoria
  inexistente (400), edita e inativa, guard 403 p/ usuário sem a cap. **Pendente:** Gui rodar
  `db-setup.bat` (aplica migration 003) + testar telas + commit. Falta 2B: Clientes, Fornecedores, Vendedores.
- **2026-06-10** — **Fase 1 — Entrega B2 (Provisionar empresas / super-admin). Fase 1 concluída.**
  Nova capability `superadmin.empresa.provisionar` (módulo Super-admin) no registry.
  **Backend:** `EmpresaRepository` ganhou `listarTodas`/`existeCodigo`/`criar`; porta
  `Migrador` + `TypeOrmMigrador` (aplica migrations de tenant no schema novo); use case
  `ProvisionarEmpresa` (valida código slug `^[a-z][a-z0-9]{1,30}$`, único; cria
  `public.empresa` + schema `t_<codigo>` + migra tenant + perfil Administrador com todas
  as caps + 1º usuário admin hasheado); rotas `GET /empresas` (lista) e `POST /empresas`
  (provisiona), ambas guard `superadmin.empresa.provisionar`. **Frontend:** tela
  **Super-admin › Empresas** (lista + form provisionar), `BrandingContext` aplica o
  **idioma padrão da empresa no login** quando o usuário não escolheu idioma; i18n pt/en/es.
  **Validação:** type-check 3 pacotes + build Vite + **e2e Postgres real (10 PASS)**:
  provisiona empresa nova, admin dela loga com todas as caps no próprio tenant,
  **isolamento** (cada tenant só vê seus usuários), código duplicado→409, código
  inválido→400, guard 403 p/ usuário sem a cap. **Pendente:** Gui rodar `db-setup.bat`
  + testar (provisionar uma empresa e logar nela) + commit. Falta opcional da Fase 1:
  idioma/timezone por usuário (override) — adiável p/ Fase 2.
- **2026-06-10** — **Fase 1 — Entrega B1 (Dados da empresa / branding white-label).**
  **Banco (migration public 002):** colunas em `public.empresa` — `logo` (data URI/URL),
  `cor_primaria`, `cor_menu_fundo`, `cor_menu_fonte` (hex, com defaults), `idioma_padrao`,
  `timezone_padrao`. **Backend:** `Empresa` ganhou `BrandingEmpresa`; `SqlEmpresaRepository`
  lê os campos novos + `atualizar(codigo, dados)`; `EmpresaService` (valida hex, idioma em
  IDIOMAS, fantasia/timezone); rotas `GET /empresa` (qualquer logado, p/ aplicar tema) e
  `PUT /empresa` (cap `acesso.empresa.editar`); `express.json` subiu p/ 3mb (logo). **Frontend:**
  `branding/tema.ts` (`aplicarTema` seta `--accent`/`--accent-fg` por luminância/`--side-bg`/
  `--side-fg`; lista de TIMEZONES), `BrandingContext` (busca `/empresa` ao logar e aplica;
  reseta no logout), tela **Dados da empresa** (fantasia, upload de logo→data URI c/ preview,
  3 color pickers, idioma/timezone), `Layout` mostra logo no sidebar + fantasia do branding,
  menu **Configurações › Dados da empresa** (cap), i18n pt/en/es. **Validação:** type-check
  3 pacotes + build Vite + **e2e Postgres real** (6 PASS): GET defaults, PUT atualiza e
  reflete, cor inválida→400, guard 403 p/ quem não tem a cap, leitura liberada a logado.
  **Pendente:** Gui rodar `db-setup.bat` (aplica public 002) + testar tela + commit.
- **2026-06-10** — **Fase 1 — Entrega A (Acesso: Perfis, Permissões, Usuários).**
  **Permissões auto-descobertas:** `CAPABILITIES` em `packages/shared/src/capabilities.ts`
  (id + chave i18n de módulo/label) — fonte única; backend valida contra ela, frontend
  monta os checkboxes. Caps da Fase 1: `dashboard.ver`, `acesso.usuario.listar/gerenciar`,
  `acesso.perfil.listar/gerenciar`, `acesso.empresa.editar`. **Banco (migration tenant
  002):** tabelas `perfil`, `perfil_capability`, coluna `usuario.perfil_id`. Seed cria
  perfil **Administrador** (todas as caps) e vincula ao admin demo (idempotente; também
  conserta admin antigo sem perfil). **Backend (hexagonal):** domínio `Perfil` +
  `PerfilRepository`, `Usuario` ganhou `perfilId` + `UsuarioResumo`, `UsuarioRepository`
  expandido (listar/criar/editar/ativo/senha/`capabilities`); `application/` `PerfisService`
  e `UsuariosService` (validações via `ErroAplicacao` com chave i18n); `infra/` `SqlPerfilRepository`,
  `SqlUsuarioRepository` reescrito; `interface/` guard `criarAutorizar(cap)` (busca caps do
  perfil do usuário no banco), rotas `/perfis` (GET/POST/PUT), `/usuarios` (GET/POST/PUT +
  PATCH ativo/senha), `/capabilities` (GET), `/me` agora retorna `capabilities`. Helper
  `tratarErro`. **Frontend:** `api` client (get/post/put/patch), `AuthContext` guarda
  `capabilities` + `temCapability()` (busca `/me` no login e revalida no reload → logout se
  401), `ProtectedRoute` aceita `capability`, `Layout` com menu agrupado que só mostra item
  se o usuário tem a cap, telas **Usuários** (lista + modal criar/editar + ativar/inativar +
  redefinir senha) e **Perfis** (lista + modal com checkboxes de permissões por módulo),
  i18n completo pt-BR/en-US/es das novas telas. **Validação:** type-check verde nos 3
  pacotes + build Vite + **e2e contra Postgres real** (embedded-postgres): admin loga e tem
  todas as caps, cria perfil Vendedor (só dashboard) e usuário, e-mail duplicado→409,
  vendedor loga e só tem dashboard.ver, guard bloqueia vendedor (403) em listar usuários e
  criar perfil, editar perfil reflete na hora — **12/12 PASS**. **Pendente:** Gui rodar
  `db-setup.bat` (aplica migration 002 + cria perfil admin) e testar telas no navegador + commit.
- **2026-06-10** — **Fase 0 implementada — primei