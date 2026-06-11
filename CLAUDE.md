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
- **2026-06-10** — **Fase 0 implementada — primeiro código de sistema.** Sai do
  planejamento puro. **Decisões:** MVP = Fases 0–6 (sem fiscal/Fase 7 por ora,
  operação interna); banco de dev/prod = **Postgres na nuvem (Neon**, região
  sa-east-1). Repo git inicializado e no GitHub (`guilhermediaslucas/triade-erp`).
  Demo do mockup planejada via Netlify (`_redirects` + `Info/DEPLOY-MOCKUP.md`).
  Orçamento das fases em `Info/ORCAMENTO-FASES.md` (modelo "Claude + Gui").
  **Monorepo** npm workspaces: `packages/shared` (tipos/i18n), `apps/api`
  (Node+TS, Express, TypeORM/pg), `apps/web` (React+Vite+TS). TS estrito.
  **Backend (hexagonal):** `domain/` puro (entidades Empresa/Usuario, portas
  Clock/HashSenha/GeradorToken, repos como interfaces, `ErroAplicacao` com chave
  i18n); `application/` (`AutenticarUsuario`); `infra/` (`env` centralizado com
  busca do .env subindo à raiz, `AppDataSource` único e DB-agnóstico com SSL
  configurável, `BcryptHashSenha` com **bcryptjs** — puro JS, sem build nativo
  no Windows, `JwtGeradorToken`, repos SQL parametrizados, **runner de migrations
  por tenant** com ledger `migracao` em public e em cada schema, `seedDemo`
  idempotente); `interface/` (composition root com DI manual, middleware de auth
  JWT, rotas `/auth/login` e `/me`, `/health`). **Multi-tenant schema-por-tenant:**
  `public.empresa` (registro) + schema `t_<codigo>` por tenant com `usuario`;
  login resolve empresa por código → schema → usuário. Nome de schema validado
  (anti-injeção). **Frontend:** i18n próprio pt-BR/en-US/es (chaves, sem texto
  fixo), `AuthContext` (token em localStorage), client com proxy `/api`→3333,
  tela de Login (empresa+email+senha), layout sidebar/topbar, rota protegida,
  dashboard placeholder. **Validação:** type-check verde nos 3 pacotes + build
  Vite OK + **teste e2e contra Postgres real** (embedded-postgres): login certo
  gera token, senha/empresa erradas → 401 com chave i18n, `/me` com/sem token,
  seed idempotente — todos PASS. **Scripts Windows:** `db-setup.bat` (migrate+seed),
  `dev.bat` (sobe API+Web). `.env` com `DB_URL`/`DB_SSL`/`JWT_SECRET` (gitignored).
  Demo seed: empresa `belle` / `admin@belle.com.br` / `admin123`. **Pendente:**
  Gui rodar na máquina dele e confirmar login no navegador + commit/push.
- **2026-06-10** — **Remoção da tela "Formas de pagamento"** (mockup). A tela
  `s-formas-pgto` (menu Cadastros › Financeiro) era placeholder estático: tabela
  com 4 linhas hardcoded, chips (`Pix/TED/Boleto/Dinheiro/Cartão/Reembolso`) e
  campos de data **sem nenhum JS** — nenhum event listener, nenhuma leitura de
  dados reais. As chips nem batiam com as formas de baixa que o sistema usa de
  fato (`Conta corrente/Dinheiro/Cartão/Reembolso`, via `bxForma`/`data-bx-forma`).
  O que ela prometia (pagamentos por forma/período) já é coberto pelo **Fluxo de
  caixa** + relatórios financeiros, alimentados pelas baixas do Contas a pagar/
  receber. Removidos: a `<section id="s-formas-pgto">`, o link de menu
  (`<a data-go="formas-pgto">`), o registro de permissão (`{id:'formas-pgto'...}`)
  e a entrada da busca (`{l:'Formas de pagamento'...}`). Sem referência órfã
  (`grep` limpo) e JS validado (`node --check`). **Nota:** a pasta
  `Desktop\ERP_TRIADE` **não é repositório git** — não houve commit/push.
  **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Rodada de correções + recebimento multi-lote + Marcas + motoboy
  na expedição** (mockup). **Correções:** romaneio com logo da empresa **preta de
  verdade** (conversão via canvas `source-in` preto — `window._abrirRomaneioPedido`
  reutilizável); **alinhamento** dos títulos novos no Contas a pagar/receber
  (MutationObserver injeta a coluna `pe-cell` Previsto/Efetivo em qualquer linha
  nova); **Credores/Reembolso** ganhou CRUD (editar/excluir/salvar `modalCredor`,
  com `data-*`); **Recebimento** não abre mais sozinho (form `#entFormWrap`
  escondido até clicar **Receber**); **Lotes do produto** — duplo-clique agora
  abre só a **movimentação** (`_abrirMovLote`), sem editar quantidade.
  **Cadastro Marcas de produtos** (`s-marcas`, `modalMarca`, store
  `triade_marcas_<emp>` {nome,fab,ativo}, `window._marcasAtivas`, menu Cadastros›
  Estoque + perm `marcas`). **Recebimento multi-lote:** form reescrito — marca
  vira **select** (do cadastro Marcas); botão **Adicionar lote**; cada bloco
  (`.receb-lote`) tem lote/validade/qtd + bipagem própria (`.rl-scan`, debounce
  s/ Enter) e contador; confirma só quando soma das qtds dos lotes = qtd da nota
  e cada bloco bipado completo; cria/mescla N lotes com etiquetas+mov. **Motoboy
  na expedição:** modal forma de envio mostra **select `#fenvMotoboy`** (do
  cadastro) quando tipo=Motoboy. **Romaneio automático:** ao confirmar a
  expedição (`fenvConfirmar`), abre `_abrirRomaneioPedido`. **Limpeza v3**
  (flag `triade_clear_v3`): zera movimentação (pedidos/kanban/etiquetas/estoque/
  receber/pagar/perdas/inventários/**recebimentos**/notif), mantém cadastros.
  Validado com `node --check` + testes de lógica (multi-lote, campanhas).
  **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Tabela de preço: histórico de campanhas + romaneio logo preta**
  (mockup). Preço base mudou de **uma** campanha (`camp`) para **lista**
  (`camps:[]`) em `triade_precobase_<emp>` `{produto:{fixo,camps:[{preco,motivo,
  de,ate}]}}` — migra `camp`→`camps[]` automático (`_campsOf`). `_precoBase`
  usa `_campVigente` (campanha que cobre a data; se sobrepõem, a de **início
  mais recente**) → senão fixo. `window._campStatus` = vigente/agendada/
  encerrada. Tela base reformulada: colunas Produto·Categoria·**Preço fixo**·
  **Campanha vigente**·botão **Campanhas (N)** (`.pcb-camp`); modal
  **`modalCampanhas`** (`tblCampanhas`) lista o histórico com status + form
  "Nova campanha" (`campAdd`) + remover (`camp-del`). `_salvar` base agora só
  grava o `fixo` (preserva `camps`). Modo "Por cliente" inalterado. **Romaneio:**
  logo da empresa **sempre preta** (`filter:grayscale(1) brightness(0)` na img;
  texto fallback `color:#000`). Validado com `node --check` + teste de vigência/
  sobreposição/status. **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Rodada grande "compra/frete/logística" — EM ANDAMENTO (blocos).**
  Decisões fechadas com o Gui: (1) entrada de estoque em **2 etapas** —
  Financeiro lança a NOTA (fornecedor, produto, qtd, custo unit., total auto) →
  gera título no Contas a pagar + **pendência de recebimento**; Estoque abre a
  pendência, informa **marca** + bipa etiquetas + distribui por **lote/validade**
  (sem localização, sem estoque mínimo na entrada — mínimo só no cadastro do
  produto). (2) Bipagem **registra ao ler, sem Enter** (debounce ~120ms).
  (3) Romaneio **imprimível** com logo da empresa (esq.) + marca TRIADE (dir.) +
  **vendedor** + itens/lotes/endereço. (4) **Pix = só à vista**. (5) Frete:
  **Motoboy** = distância **simulada por CEP** × R$/km (edit.) com **mínimo**
  (memória de cálculo "12 km × R$2 = R$24, mín R$20"); **Correios/Transportadora**
  = valor **manual**. (6) Novo menu **Logística › Gestão de fretes** (alimentado
  pelos fretes dos pedidos; km/mín editáveis; **gerar títulos por motoboy** no
  Contas a pagar, igual fechar comissão). (7) Novo cadastro **Pessoas › Motoboys**
  (alimenta o seletor de motoboy no pedido). (8) Obrigatório: **endereço de
  entrega** no pedido e **CPF/CNPJ** em cliente e fornecedor. (9) Pedido mostra
  **qtd disponível** + campo **Frete** no total. (10) Arrastar p/ **Em separação**
  abre a janela de separação/bipagem.
  **JÁ APLICADO (blocos 1,2,3,5,6):**
  **B1 Pedido** — `#npFrete` no card de totais + `_npRecalc` somando frete;
  `#npSubItens`; **forma de entrega** `#npFormaEntrega` + `#npMotoboy` +
  auto-cálculo do frete (`_recalcFretePedido`: motoboy = km simulado por CEP via
  `_simKm` empresa→entrega × kmRate, mín; correios/transp = manual; retirada=0;
  memória em `#npFreteMemo`); Pix trava `#npCondPgto` (`_aplicarPixAvista`);
  `#itDisp` disponível no modal de item (`_dispProdutoPedido`, aviso se qtd>disp);
  `_coletaPedido(true)` exige endereço ao Criar e grava `frete/formaEntrega/
  motoboy/distanciaKm`. **B2** — CPF/CNPJ obrigatório (cliente `_salvar`,
  fornecedor `frnSalvar` e cadastro rápido `mfSalvar`); cadastro **Motoboys**
  (`s-motoboys`+`modalMotoboy`, store `triade_motoboys_<emp>`, `window.
  _motoboysAtivos`, permissão `motoboys`, menu Pessoas). **B3** — bipagem sem
  Enter (debounce 120ms em `#entScan`/`#sepScan`/`#invScan`) + arrastar p/
  `aprovado`/`separacao` abre `_abrirSeparacao`. **B5 Logística › Gestão de
  fretes** (`s-gestao-fretes`, menu+perm `logistica`/`gestao-fretes`; store
  `triade_frete_<emp>` {kmRate,minMotoboy} edit.; tabela dos pedidos c/ frete;
  **Gerar títulos por motoboy** → Contas a pagar, soma por motoboy no período).
  **B6 Romaneio** — botão `#pvRomaneio` na visualização do pedido abre página
  imprimível com **logo da empresa** (esq.) + **TRIADE** (dir.) + **vendedor** +
  cliente/endereço/forma de envio + itens/lotes. Tudo validado com `node --check`.
  **B4 Entrada em 2 etapas — APLICADO.** **Nota (Financeiro):** tela
  `s-nota-entrada` (menu Financeiro, perm `nota-entrada`): fornecedor, produto,
  qtd, custo unit., total auto; "Lançar nota" cria título no **Contas a pagar**
  (`data-origem='compra'`) + pendência em **`triade_recebimentos_<emp>`**
  `{id,fornecedor,produto,qtd,custo,total,nf,status:'pendente'}`. **Recebimento
  (Estoque):** `s-entrada` reescrita — tabela `#tblRecebPend` lista pendências;
  "Receber" abre `#entFormWrap` com produto/fornecedor/qtd/custo/NF readonly +
  campos **marca/lote/validade** + bipagem; "Confirmar recebimento"
  (`entConfirmar`) cria o lote com etiquetas/mov e chama
  `window._recebimentoConcluir(id)` (marca recebido). **Sem localização nem
  estoque mínimo** na entrada. Validado com `node --check` + teste de fluxo.
  **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Limpeza v2 + Cliente PF/PJ** (mockup). **Limpeza única v2**
  (flag `triade_clear_v2`, IIFE no boot): zera em TODAS as empresas os pedidos
  (`pedidoData`/`pedidoItens`/`kbCom`/`kbExp`), **etiquetas** (`triade_etiquetas_`
  → `{}`), **entradas/lotes do estoque** (`d.estoque=''` + `#tblEstoque`),
  **Contas a receber/pagar** (+ conciliação derivada) e **notificações**; também
  zera `triade_perdas_`/`triade_inventarios_` (órfãos do estoque). **Mantém**
  cadastros, tabela de preços e CRM. **Cliente PF/PJ:** modal de cliente ganhou
  **Tipo de pessoa** (`#mclTipoPessoa` PJ/PF). PJ = Razão social + Nome fantasia
  + CNPJ (como antes); PF = Nome completo + CPF (esconde fantasia/CNPJ via
  `_aplicarTipoPessoa`, labels dinâmicas `#mclNomeLabel`). Linha guarda
  `data-pessoa`/`data-doc`/`data-cpf`; coluna da lista virou **CPF/CNPJ**
  (mostra `docPessoa`). Editar repopula tipo+doc. Adicionada máscara `.mask-cpf`
  (`###.###.###-##`, delegada) — corrige também o CPF do favorecido. Validado
  com `node --check`. **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Lotes sem exclusão + zerado preservado + movimentação por lote**
  (mockup). **Excluir lote removido de vez:** tirados os botões `.ep-excluir`/
  `.ep-bulk-excluir`, a coluna de seleção do `tblEstoqueProd`, a permissão
  `estoque:excluir-lote`, o CSS `sem-excluir-lote` e a IIFE
  `_applyExcluirLotePerm`. (Exclusão de **produto** inteiro — `estq-excluir` —
  continua.) **Lote nunca some:** ao zerar (saída por leitura, baixa/perda
  manual, inventário) o lote fica com `status:'zerado'` + `zeradoEm`, saldo 0,
  no histórico — `_consumirEtiquetas` e `pdConfirmar` não removem mais o lote
  nem o produto. Cada lote ganhou `status` (`ativo`/`zerado`) e **`mov:[]`**
  (log de movimentação). **Filtro "Incluir zerados (histórico)"**
  (`#epShowZerados`): por padrão `tblEstoqueProd` mostra só ativos; ligado,
  revela zerados (linha esmaecida + selo `Zerado · data`). KPIs/saldo contam só
  ativos. **Log de movimentação por lote:** registrado em cada ponto —
  Entrada (entConfirmar, novo lote e reposição), Saída (`_consumirEtiquetas`,
  ref `Pedido PE-xxxx`, 1 por etiqueta), Perda (`pdConfirmar` + inventário via
  `_baixarEtiquetasComoPerda`, ref = motivo) e marcador `Zerado`. Cada movimento
  guarda `{tipo,qtd,data(hora),resp,ref,etiqueta,obs,saldoApos}`. **Clicar no
  lote** (nome ou ícone relógio `.ep-mov`) abre **`modalLoteMov`**: resumo
  (produto, lote, validade, fornecedor/marca, NF, situação/saldo) + tabela
  `tblLoteMov` com todos os movimentos + **Exportar Excel** (`data-export-table`).
  Helper `_agoraDH()` (data+hora). Validado com `node --check` + teste de ciclo
  (2 saídas → zerado, índice `saida`, log com refs). **Sem código de sistema
  ainda** (mockup).
- **2026-06-09** — **Expedição rastreada + Inventário com registro/log** (mockup).
  **Expedido por:** ao confirmar a forma de envio (Aguardando retirada →
  Expedido, `fenvConfirmar`), grava `data-expedido-por` (usuário logado) +
  `data-expedido-em` (data/hora) no card e no espelho do Comercial — mesma
  lógica do `data-separado-por`. Novo campo **"Expedido por"** (`#pvExpedido`)
  na visualização do pedido. **Inventário reestruturado** (`s-inventario`):
  painel **Iniciar** (data `#invData` + responsável `#invResp` → `#invIniciar`),
  painel **Em andamento** (`#invEmAndamento`: bipagem + KPIs + faltantes +
  `#invCancelar`/`#invFinalizar`/`#invFinalizarBaixar`) e **Histórico**
  (`tblInvHist` + export Excel). Cada inventário finalizado vira um registro em
  **`triade_inventarios_<emp>`** `{data,resp,criadoEm,finalizadoEm,esperados,
  encontrados,faltando,baixouPerda,faltantes:[]}`. "Finalizar e baixar
  faltantes como perda" usa `_baixarEtiquetasComoPerda`. Modal `modalInvDet`
  (`tblInvDet`) lista os faltantes de um inventário. **Relatório de
  inventários:** card no hub Estoque + tela `s-rel-inventarios` (`tblRelInv`,
  `rel:estoque` no REL_SCREENS), alimentada por `_renderRelInventarios`.
  Validado com `node --check` + teste funcional (finalizar com baixa,
  esperadas pós-baixa). **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Código de barras / rastreabilidade por item** (mockup).
  Modelo: cada item físico tem uma **etiqueta** (impressa pelo usuário, lida
  pelo sistema — leitor USB modo teclado). Índice global
  **`triade_etiquetas_<emp>`** = `{ "<code>": {produto,lote,validade,local,
  fornecedor,marca,custo,nf,cadastro,status} }` (status `estoque`→`saida`/
  `perda`); cada lote ganhou `etiquetas:[]`, `fornecedor`, `marca`, `nf`.
  Helpers em `window`: `_etqIndex`/`_saveEtqIndex`, `_consumirEtiquetas(codes,
  status)` (remove do lote, decrementa saldo, marca status), `_baixarEtiquetas
  ComoPerda(codes,motivo)` (registra em `triade_perdas_<emp>` + consome).
  **Entrada (`s-entrada`) reestruturada:** cards Dados do lote (produto,
  fornecedor, **marca**, lote, validade, qtd, custo, local, mínimo) · Nota
  fiscal (número/série/emissão/chave) · **Etiquetas dos itens** — caixa de
  bipagem (`.scan-box` `#entScan`, Enter adiciona; chips `.etq-chip`;
  `#entScanCount`). Recusa etiqueta repetida (na entrada ou já no índice).
  **Confirmar entrada** só habilita quando bipados = quantidade; grava
  `etiquetas` no lote + registra cada code no índice. Guard
  `s-entrada.active` p/ não colidir com o `#entConfirmar` duplicado do modal de
  entrega. **Saída — separação por leitura** (modal `modalSeparacao`): caixa
  `#sepScan` + coluna **Bipados** (`.sep-bip`) + `#sepScanCount`; bipar casa a
  etiqueta com um item do pedido (pelo produto), monta `it.lotes`/`it.etqLidas`,
  auto-marca **Conferido** quando bipados=qtd; recusa etiqueta fora do pedido/
  já bipada/fora do estoque. Ao **Aprovar separação**, `_consumirEtiquetas`
  baixa os itens do estoque (status `saida`). Continua possível usar
  *Selecionar lotes* sem leitor. **Inventário por leitor** (`s-inventario`,
  permissão `inventario`, menu Estoque): caixa `#invScan`, KPIs esperados/
  encontrados/faltando, lista `tblInvFalta` de não localizadas, **Reiniciar
  contagem** e **Baixar não localizados como perda** (Ajuste de inventário →
  `_baixarEtiquetasComoPerda`, alimenta o relatório de perdas). CSS novo:
  `.scan-box`, `.etq-chip`. Validado com `node --check` + teste funcional
  ponta-a-ponta (entrada/duplicidade, separação casa/recusa, inventário
  faltantes→perda). **Sem código de sistema ainda** (mockup).
- **2026-06-09** — **Baixa / perda de estoque** (mockup). Nova capability de
  tela `baixa-perda` ("Baixa / perda de estoque") no catálogo + item no menu
  Estoque (`<a data-go="baixa-perda">`). Nova tela **`s-perda`** (espelha
  Entrada/Transferência): produto (`pdProduto`+`dlPerdaProduto`, populado da
  posição de estoque) → lote (`pdLote`, lotes com saldo>0 do produto) → qtd
  (`pdQtd`, limitada ao saldo) → motivo (`pdMotivo`: Vencimento/Avaria/Furto/
  Ajuste de inventário/Devolução descartada/Outro) → data (`pdData`) →
  responsável (auto, `_userName`) → observação (`pdObs`). Cards calculados:
  custo unit. (do lote), **valor da perda** e saldo após. **Confirmar baixa**
  (`pdConfirmar`): registra no histórico **`triade_perdas_<emp>`**
  (`window._perdasEstoque`), **decrementa o saldo do lote** (se zerar, remove o
  lote; se for o último, remove o produto da posição) e re-renderiza
  (`_renderRow`/`_persist`/`_refreshKpi`). **NÃO** gera lançamento no Financeiro
  (decisão do Gui — a perda já reduz o valor do estoque). Atalho por lote:
  botão `.ep-perda` em *Lotes do produto* (`tblEstoqueProd`) abre a tela
  pré-preenchida (`window._abrirPerda(produto,lote)`). **Relatório de perdas:**
  card no hub Estoque + tela **`s-rel-estoque-perdas`** (`rel:estoque`): KPIs
  (itens, valor, lançamentos), filtro de data + motivo, tabela
  (`tblRelPerdas`) com total e export Excel (`data-export-table`),
  `window._refreshRelPerdas`/`_relPerdas`. Validado com `node --check` +
  teste funcional da baixa (saldo/remoção de lote) e do filtro. **Sem código
  de sistema ainda** (mockup).
- **2026-06-09** — Rodada **preço / lote** no mockup. **Excluir lote virou
  permissão:** novo item de catálogo `estoque:excluir-lote` ("Excluir lote
  (estoque)"); sem ele os botões de excluir lote (`.ep-excluir` /
  `.ep-bulk-excluir` no `tblEstoqueProd`) ficam escondidos via classe
  `body.sem-excluir-lote` (IIFE `window._applyExcluirLotePerm`, reavalia no
  boot e ao navegar p/ estoque). **Preço saiu do cadastro do produto:** campo
  `pfPreco` removido da tela de produto (+ nota apontando p/ Comercial › Tabela
  de preço); `_fillProduto`/`_salvar` não usam mais o campo — o preço exibido
  na lista de produtos vem de `window._precoBase`; removida a permissão
  `produto:preco-venda` e a função `_aplicarPermPreco`. **Tabela de preço
  (`s-precos-cliente`) reestruturada** com seletor `pcModo` (**Preço base
  (geral)** × **Por cliente**) e `thead` dinâmico (`pcThead`/`_setThead`).
  Novo store **`triade_precobase_<emp>`** = `{ "<produto>": { fixo:<n>,
  camp?:{preco,motivo,de,ate} } }` — **preço fixo** + **uma campanha/motivo
  por vigência opcional**. `window._precoBase(produto,dataISO)` resolve:
  campanha vigente na data (se preço>0 e dentro do de/até) → senão preço fixo →
  senão null. `window._refreshProdutoPrecos` propaga o preço base p/
  `tblProdutos[data-preco]`/célula e `dlProdutos`. **Preço efetivo no pedido**
  (`itProd change`): **preço do cliente** (`_precoCliente`, vigente) → **preço
  base** (`_precoBase`, campanha/fixo) → fallback do datalist; hint
  `#itPrecoHint` quando há preço de cliente. Modo cliente continua salvando em
  `triade_precos_<emp>` (Fixo/Período) e mostra o preço base como referência.
  Validado com `node --check` (IIFE de preços + handler do pedido). **Sem
  código de sistema ainda** (mockup).
- **2026-06-08** — Rodada grande de ajustes no mockup (`erp-mockup.html`),
  módulos Comercial / Estoque / Dashboard. **Pedidos/orçamento:** termo
  "Rascunho" → **"Orçamento"** em todo texto visível (chave interna
  `data-col="rascunho"` preservada, sem migração de dados). Sequencial do
  pedido agora **persiste por empresa** (`triade_pedseq_<emp>`, sem reiniciar
  a cada reload; padding corrigido p/ 6 dígitos) e o código é exibido como
  **"DD/MM/AAAA