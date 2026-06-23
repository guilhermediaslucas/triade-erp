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

## 0. PRINCÍPIO PRIMORDIAL — fidelidade ao mockup

> **A fidelidade VISUAL e FUNCIONAL da aplicação com o mockup
> (`Info/mockups/erp-mockup.html`) é PRIMORDIAL e tem prioridade.** Toda tela do
> sistema deve espelhar o mockup em estrutura, campos, fontes, ícones, espaçamento,
> cores e comportamento. Ao tocar/criar qualquer tela, comparar com o mockup e
> igualar (campos de negócio e fluxo, não só aparência). O que for só polimento de
> UI (ex.: atalhos) pode ficar para depois, mas campos/fluxos do mockup devem bater.
> O checklist de paridade vive em `Info/PARIDADE-MOCKUP.md`. Regra do Gui (2026-06-12).

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
- **Datetime em UTC** no banco/backend; datas exibidas em pt-BR (`toLocaleString('pt-BR')`).
  **SEM suporte a fuso horário/timezone** (removido em 2026-06-22 a pedido do Gui).
- **Idioma: SÓ pt-BR.** O sistema **não é multilíngue** (decisão do Gui, 2026-06-22).
  Existe a função `t('chave')` em todas as telas, mas resolve sempre no único dicionário
  português (`dicionario` em `dicionarios.ts`). **NUNCA** adicionar/manter en-US ou es;
  ao criar texto novo, só pt-BR. (Os objetos `en`/`es` no `dicionarios.ts` são código morto.)
- **White-label por empresa:** cada empresa define logo, nome fantasia e
  paleta de cores aplicada ao layout (tela "Dados da empresa").
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

- **2026-06-23 (BUG do carregador do Google Maps — `loading=async` + onload resolvia cedo demais)** — Verificado ao vivo
  (Claude no Chrome, link público `/rastreio/teste...`): a chave **entra no build** (request `maps/api/js?key=AIza...` → 200,
  main/common/util.js 200) mas a tela ficava no **fallback**. Causa: `MapaEntrega.carregarMaps` montava o script com
  `&loading=async` e resolvia a promise no `s.onload` — mas com `loading=async` o `onload` é só do **bootstrap** e o
  `window.google.maps` **ainda não existe** nesse instante → caía no `.catch` → `falhou=true` → fallback. Bug **pré-existente**
  (estava assim desde a 1ª versão do componente; nunca renderizou o mapa embutido). **Fix:** usar o **callback oficial** do Google
  (`&callback=__triadeMapsReady`) que dispara quando `google.maps` está pronto, e resolver a promise nele (removido o resolve no
  onload; mantido `onerror`→reject). Sem isso, nem com chave+referrer corretos o mapa aparece. Precisa **rebuild+deploy** (var de
  build). **Pendente Gui:** `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` → commit+push.

- **2026-06-23 (Google Maps: chave de navegador corrigida — RAIZ do "mapa não aparece")** — Config no Google Cloud (projeto
  `triade-erp`), feito via Claude no Chrome. **Causa:** a chave de navegador `Maps Embed (web)` (= `VITE_GOOGLE_MAPS_KEY` do
  Cloudflare, valor `AIzaSyBpHIY...VVD4Iogs`) estava **restrita por referenciador só a `triadeerp.com.br`**; como o site roda
  em `triade-erp.pages.dev`, o Google bloqueava o Maps JS → caía no fallback de link. As 3 APIs (Maps JavaScript, Directions,
  Geocoding) **já estavam ativas** e a restrição de API da chave já tinha as 3; billing OK (trial, ~R$1.727/80d). **Fix:**
  adicionados aos referenciadores HTTP da chave: `https://triade-erp.pages.dev/*`, `https://*.triade-erp.pages.dev/*` (preview)
  e `https://localhost/*` (WebView do APK — Capacitor bundled, androidScheme https → origem `https://localhost`). Propagação até
  ~5 min. **Para valer no site:** refazer o deploy (a `VITE_GOOGLE_MAPS_KEY` é var de build). A `Maps Platform API Key` (2 APIs)
  é a de **servidor** no Render (`GOOGLE_MAPS_API_KEY`, Distance Matrix/Directions) — não mexer.

- **2026-06-23 (Preview do destino também nas telas públicas)** — Só frontend. `RastreioPublico` (link do cliente),
  `EntregaMotoboyPublico` (link avulso por pedido) e `RotaPublica` (link de rota) agora mostram o **mapa do destino** mesmo
  **antes** do motoboy iniciar (status aguardando): reusa o `MapaEntrega` em modo destino-only (geocode). `RastreioPublico`:
  mapa some só no 'entregue'; em aguardando mostra destino + nota "aguardando". `RotaPublica`: novo `foco` = parada em rota OU
  1ª pendente. Sem migration, sem cap. Depende da `VITE_GOOGLE_MAPS_KEY` (com Geocoding API). **Pendente Gui:**
  `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` → commit+push.

- **2026-06-23 (Mapa de entregas maior + preview do destino antes da corrida)** — Só frontend. **`MapaEntrega.tsx` reescrito:**
  além do modo "posição do motoboy + rota" (a_caminho/chegou), agora tem **preview do DESTINO sem GPS** — quando há só o endereço
  de entrega, **geocodifica** (`maps.Geocoder`) e centraliza o mapa no destino (mostra antes de "A caminho"). Rota agora enquadra
  os dois pontos (`preserveViewport:false` + marker do destino via `end_location`). **Fallback (sem chave)** ficou maior e com
  link **"rota até o destino"** (`/maps/dir/?api=1&destination=`) em vez de só lat/lng, + nota `rastreio.mapa_sem_chave`.
  **`PainelEntregas`:** mapa 420→**560**, card do mapa **sticky**, grid `300px minmax(0,1fr)` + media query ≤860px empilha
  (`.painel-entregas-grid`). **`MinhasEntregas`:** o mapa agora aparece p/ **toda** entrega com endereço (não só a_caminho/chegou)
  e subiu p/ **300px**. **Causa raiz das queixas ("não dá pra ver o mapa"):** a `VITE_GOOGLE_MAPS_KEY` **não está no Cloudflare**
  → cai no fallback de link; com a chave, o mapa renderiza embutido. **Setup da chave (3 APIs):** Maps JavaScript API + Directions
  API + **Geocoding API** (esta nova, p/ o preview do destino) na chave de navegador, var `VITE_GOOGLE_MAPS_KEY` no Cloudflare Pages.
  **Menu Logística no motoboy:** o perfil do motoboy do Gui está com **`logistica.entrega.ver`** marcado (print) — é isso que mostra
  o grupo Logística; desmarcar "Ver entregas / painel de rastreio" no perfil Motoboy (deixar só "App do motoboy"). Sem migration,
  sem cap. **Pendente Gui:** `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` → commit+push →
  `scripts\app-apk.bat` + setar `VITE_GOOGLE_MAPS_KEY` no Cloudflare (com Geocoding API ativada).

- **2026-06-23 (Motoboy: 1ª tela ao logar + remover link do cliente no Minhas entregas)** — Só frontend. **(1) "Nenhuma tela
  liberada" no motoboy (BUG):** o `lib/primeiraRota.ts` (usado pelo `PainelInicial` p/ quem não tem `dashboard.ver`) **não listava**
  a tela do motoboy → motoboy (perfil só com `logistica.entrega.atualizar`) caía em "sem telas". Fix: adicionada
  `{ cap: 'logistica.entrega.atualizar', to: '/entregas/minhas' }` como 2ª rota (logo após o dashboard) → agora o motoboy é levado
  direto a **Minhas entregas**. **(2) Menu Logística no motoboy:** o menu **já** esconde grupo vazio (`totalVisiveis === 0 → null`)
  e o perfil padrão **Motoboy** tem só `logistica.entrega.atualizar` (sem `.ver`) → não vê o grupo Logística. Se algum motoboy
  estiver vendo Logística, é porque o usuário dele está num **perfil com `logistica.entrega.ver`** (ex.: Estoque) — basta pôr o
  usuário no perfil **Motoboy**. **(3) Remover link do cliente:** tirado o botão "Copiar link do cliente" (e a função `copiarLink`)
  do `MinhasEntregas.tsx` (chaves i18n `rastreio.copiar_link`/`link_cliente` ficam inertes). **Mapa:** o `MapaEntrega` mostra o mapa
  + rota **dentro do app** (Google Maps JS SDK) **quando há `VITE_GOOGLE_MAPS_KEY`** (chave de navegador com Maps JavaScript API +
  Directions API) no Cloudflare Pages **e** o motoboy já está "A caminho"/"Cheguei" com GPS capturado; sem a chave (ou sem posição),
  cai no **fallback de link** "Ver no mapa". Sem migration, sem cap. **Pendente Gui:** `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE`
  → `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`. P/ mapa no app: setar `VITE_GOOGLE_MAPS_KEY` no Cloudflare.

- **2026-06-23 (Perfil multi-empresa: "marcar todas as empresas")** — Só frontend (`Perfis.tsx` `ModalPerfilMulti`). Acima
  da lista de empresas entrou um contador `sel.size/empresas.length selecionadas` + botão **"Marcar todas as empresas"** /
  **"Desmarcar todas"** (`todasMarcadas` = todas no `sel`; `toggleTodas` seta tudo ou limpa). Permite o super-admin **replicar
  o mesmo perfil (nome + permissões) em TODAS as empresas de uma vez** (o backend `PerfilMultiEmpresa.sincronizar` já aplica em
  cada empresa marcada — cria onde não existe pelo nome, atualiza as permissões onde existe; desmarcadas não são tocadas). i18n
  `perfis.multi_todas`/`_desmarcar_todas`/`_selecionadas` (pt). Sem backend novo, sem migration, sem cap. **Pendente Gui:**
  `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`.

- **2026-06-23 (Lote 2: Acesso multi-empresa padronizado + olho na troca de senha + importação Produtos/Fornecedores)** —
  Três frentes (sem migration; sem cap nova). **(1) Acesso multi-empresa (Usuários):** o `AcessoMultiEmpresa.situacao` virou
  `situacao(termo)` — aceita **e-mail OU nome** (resolve o login pelo nome via `usuarios.listar` quando não tem `@`) e retorna
  `SituacaoAcesso {email, nome, perfilNome, empresas[]}` (antes só o array de empresas). Rota `GET /superadmin/usuarios/acessos`
  passou a ler `?termo=` (com `?email=` por retrocompat). **Front `ModalAcessoEmpresas`:** campo de busca "E-mail ou nome" (busca
  on-blur), **pré-preenche Nome + Perfil** do cadastro existente (decisão do Gui: padrão = igual ao registrado), checklist com
  **selo "novo"** quando marcada e inexistente (espelha o Perfil multi-empresa), `modal-lg`. `email` resolvido guardado à parte p/
  o salvar (`emailFinal`). i18n `usuarios.acesso_busca`/`_busca_ph`/`_novo`. **(2) Olho na troca de senha:** `TrocarSenha.tsx`
  (provisória **e** normal) ganhou botão de olho (`login-senha`/`login-eye`/`i-eye`, reuso do Login) nos 3 campos, um `ver` único.
  **(3) Importação em lote em Produtos e Fornecedores** (Clientes já tinha): backend `ProdutosService.importar` (dedup por **nome**)
  e `FornecedoresService.importar` (dedup por **documento**→nome), rotas `POST /produtos/importar` e `POST /fornecedores/importar`
  (caps `cadastros.produto/fornecedor.gerenciar`, sem cap nova). Front: botão **Importar** + `ImportadorPlanilha` + `CAMPOS_*` em
  `Produtos.tsx`/`Fornecedores.tsx` (mesmo componente CSV/XLSX do Clientes). i18n `produtos.importar`/`fornecedores.importar`.
  **Validação:** hand-review (tsc do sandbox segue inútil — mount trunca). **Sem migration, sem cap → não precisa relogar.**
  **OBS comando:** o build anterior falhou porque foi rodado em `Desktop\FIN_PESSOAS` (outro repo) — rodar SEMPRE em
  `Desktop\ERP_TRIADE`. **Pendente Gui:** `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` →
  commit+push → `scripts\app-apk.bat`. **PWA/instalável: FEITO em 2026-06-23** (ver entrada própria abaixo).

- **2026-06-23 (PWA — TRIADE web instalável pelo navegador, igual ao FinPessoais)** — **Sem dependência nova (PWA manual).**
  Adicionados em `apps/web/public`: `manifest.webmanifest` (name "Tríade ERP", display standalone, theme_color #dc2626,
  ícones 192/512/maskable), `sw.js` (service worker mínimo — **sem cache de app-shell**: só intercepta navegação e vai à rede,
  pra nunca prender o app numa versão antiga após deploy; `skipWaiting`+`clients.claim`), e os PNGs `icon-192/512/maskable-512`
  (T branco em quadrado vermelho, gerados com Pillow). `index.html` += `<link rel=manifest>` + `theme-color` + `apple-touch-icon`
  + metas apple. `main.tsx` registra o `/sw.js` **só fora do app nativo** (`!Capacitor.isNativePlatform()`) — não roda no APK.
  Resultado: Chrome/Edge passam a oferecer **"Instalar app"** (PC e celular) na URL do Cloudflare Pages (já é HTTPS). Distribuição:
  **APK** (Android) + **PWA** (cada um instala pela URL). `.exe` desktop real só com Electron/Tauri (não feito; proposto se quiser).
  **Pendente Gui:** `cd /d C:\Users\guilherme.dias\Desktop\ERP_TRIADE` → `npm run build -w @triade/web` → commit+push.

- **2026-06-23 (Lote: fix rota.motoboy_invalido + confirmação por telefone + etiqueta duplicada + Volume de entregas)** —
  Quatro frentes (sem migration nova; sem cap nova). **(1) BUG rota.motoboy_invalido (RAIZ ENCONTRADA):** o TypeORM 0.3.30
  retorna `UPDATE…RETURNING` como **tupla `[linhas, contagem]`** (`PostgresQueryRunner`: `case 'UPDATE'/'DELETE' → result.raw =
  [raw.rows, raw.rowCount]`); SELECT/INSERT retornam só as linhas. O código lia `(await ds.query(UPDATE…RETURNING))[0]`
  esperando a 1ª LINHA, mas pegava o **array de linhas** → `.rota_token` = undefined → null → `rota.motoboy_invalido`. O MESMO
  bug quebrava o link avulso por pedido. **Fix:** `SqlRotaRepository.garantirRotaToken` e `SqlRastreioRepository.garantirMotoboyToken`
  passam a ler `const r = Array.isArray(res?.[0]) ? res[0][0] : res?.[0]` (robusto às duas formas). + adicionada a tradução
  pt `rota.motoboy_invalido`/`rota.nao_encontrada` (faltava → aparecia a chave crua). **(2) Etiqueta duplicada informa QUAL:**
  `ErroAplicacao` ganhou 3º param `detalhe?` (texto livre, não-i18n); `tratarErro` inclui `{erro, detalhe}`; `api/client.ts`
  `ErroApi.detalhe`. `EstoqueService`/`ComprasService` passam `jaExistem.join(', ')` no `etiqueta.duplicada` (409). Front
  (`EntradaEstoque`/`Recebimento`) mostram `t(erro) + ': ' + detErro`. pt `etiqueta.duplicada` reescrita p/ casar com a lista.
  **(3) Confirmação de entrega por TELEFONE (4 dígitos):** ao marcar **Entregue** nos 3 fluxos do motoboy (app logado
  `mudarStatus`, link avulso por pedido `freelancerStatus`, link de rota `rotaStatus`), o motoboy digita os 4 últimos dígitos
  do telefone do cliente — validado server-side (`RastreioService.exigirCodigoTelefone` → `RastreioRepository.telefoneClienteDoPedido`
  = `cliente.telefone` do pedido). **Decisão do Gui: cliente PRECISA ter telefone** — sem telefone bloqueia
  (`entrega.cliente_sem_telefone`, 400); código errado → `entrega.codigo_invalido` (400). Rotas passam `b.codigoConfirmacao`.
  Front: 2º `window.prompt` (após "quem recebeu") em `MinhasEntregas`/`EntregaMotoboyPublico`/`RotaPublica`; os 2 públicos
  agora mostram a chave de erro real (antes caíam num genérico). i18n `rastreio.codigo_telefone`/`entrega.codigo_invalido`/
  `entrega.cliente_sem_telefone`. **OBS p/ o Gui:** clientes existentes SEM celular cadastrado terão a entrega bloqueada até
  cadastrar o telefone. A expedição/Comercial (ModalDataEntrega) **não** mudou — a confirmação é só do motoboy. **(4) Relatório
  Volume de entregas (Logística):** `RelatorioRepository.volumeEntregas` (pedidos com `entregue_em` no período, por data de
  entrega; `LinhaEntregaVol {data, formaEntrega, total}`); rota `GET /relatorios/volume-entregas` (cap `logistica.entrega.ver`,
  sem cap nova). Tela `VolumeEntregas.tsx` (menu **Logística › Volume de entregas**, rota `/logistica/volume-entregas`): filtro
  de período + **toggle dia/semana/mês** (agrupado no front), KPIs **Entregas / Valor total / Ticket médio**, tabela por período
  e **tabela separada por forma de entrega** (motoboy/correios/etc.), export CSV/Excel. i18n `volent.*`/`menu.volume_entregas`.
  **Validação:** hand-review (o tsc do sandbox segue inútil — o mount **trunca** os arquivos editados, ex.: `ErroAplicacao.ts`
  lido com 5 linhas cortado no meio → TS1005/TS1160 falsos; **build local = fonte de verdade**). **Sem migration, sem cap nova
  → não precisa relogar.** **Pendente Gui:** `npm run build -w @triade/web` (validar!) → commit+push (Render pega o backend via
  tsx) → `scripts\app-apk.bat` (telas mudaram).

- **2026-06-22 (Sistema só pt-BR — removida multilíngua + timezone)** — **Decisão do Gui: o sistema não será
  usado em outros idiomas nem fusos.** Escolha dele: **manter só pt-BR** (não arrancar o `t()` de todas as telas).
  **Frontend:** `I18nContext` simplificado p/ só `{ t }` (sem `idioma`/`idiomas`/`setIdioma`, sem `localStorage
  triade_idioma`); `t()` resolve sempre no dicionário **pt** (`export const dicionario = pt`). Os objetos `en`/`es`
  do `dicionarios.ts` viraram **código morto** (não referenciados; `void en; void es;` — saem numa limpeza dedicada
  depois). `BrandingContext` não aplica mais o idioma da empresa no login. `SeletorIdioma.tsx` virou **no-op**
  (return null, não é importado em lugar nenhum). `DadosEmpresa` parou de enviar `idiomaPadrao`/`timezonePadrao`.
  `tema.ts`: removidos `TIMEZONES` e os campos `idiomaPadrao`/`timezonePadrao` da interface `Branding`. **Backend:**
  deixado **inerte** (colunas `empresa.idioma_padrao`/`timezone_padrao` + validação ficam, sem uso — igual marca/
  categoria; sem migration destrutiva). **REGRA p/ próximas sessões:** ao escrever texto de UI, **só pt-BR** — nunca
  mais `Object.assign(en/es, …)` nem "i18n pt/en/es" nas notas. **Validação:** hand-review (grep confirmou zero
  referências remanescentes a idiomaPadrao/timezonePadrao/setIdioma/idiomas/IDIOMAS no `apps/web`). **Pendente Gui:**
  `npm run build -w @triade/web` (validar!) → commit+push → `scripts\app-apk.bat`.

- **2026-06-23 (Fase 8 — link público de ROTA do freelancer)** — **Migration tenant 073. Sem cap nova.** O freelancer
  (motoboy avulso, sem login) ganha **um link só com TODAS as paradas dele em ordem** (antes só tinha link por pedido).
  Agrupado pelo **cadastro de motoboy**: migration **073** `motoboy.rota_token text` (único parcial). Hexagonal:
  `RotaRepository` += `garantirRotaToken`/`motoboyPorRotaToken`/`paradasPublicas` (paradas expedidas do motoboy, ordem_rota,
  com status + última posição via LATERAL); tipos `ParadaPublica`/`RotaPublica` em `domain/logistica/Rota.ts`.
  **`RastreioService` ganhou o `rotaRepo` no construtor** (3º param; composition compartilha 1 `rotaRepo` entre Rastreio e
  Rota) + métodos `gerarLinkRota`/`rotaPublica`/`rotaStatus`/`rotaPosicao` (reusam ETA-cache, `repo.dono` p/ checar que o
  pedido é do motoboy do token, e a mesma lógica de status/entrega do freelancer por-pedido). Token = `<codigo>.<aleatório>`
  (tenant sai do prefixo). Rotas: `POST /logistica/rota/:motoboyId/link` (cap `logistica.entrega.ver`) + **públicas**
  `GET /rota-publica/:token`, `PATCH /rota-publica/:token/:pedidoId/status`, `POST /rota-publica/:token/:pedidoId/posicao`.
  **Front:** `MontarRota` ganhou botão **"Link do motoboy (avulso)"** (copia `/rota/<token>`); página pública
  `RotaPublica.tsx` (rota `/rota/:token`, fora do Layout) — lista as paradas numeradas com status + botão A caminho/Cheguei/
  Entregue por parada, **GPS** (`navigator.geolocation.watchPosition`) enviado p/ a parada ativa, mapa+ETA da ativa. i18n
  `rota.link_*`/`rota.publica_titulo`/`rota.pendentes`/`rota.tudo_entregue` (só pt). **Validação:** hand-review. **Pendente
  Gui:** `npm run build -w @triade/web` → commit+push (Render aplica 073) → `scripts\app-apk.bat`.

- **2026-06-22 (Fase 8 — parte 3: Montar rota + mapa suave JS SDK)** — **Migration tenant 072. Sem cap nova.**
  **Item 5 (mapa suave):** `MapaEntrega.tsx` reescrito do iframe Embed p/ o **Google Maps JS SDK** — o pin do motoboy desliza
  (`marker.setPosition` + `map.panTo`, sem reload/flicker) e a rota é desenhada **uma vez** por destino (`DirectionsService`/
  `DirectionsRenderer`, `preserveViewport`). Loader singleton (`carregarMaps`); fallback p/ link se sem `VITE_GOOGLE_MAPS_KEY` ou
  falha. **Setup Google (chave de NAVEGADOR):** ativar **"Maps JavaScript API"** e **"Directions API"** no projeto da chave
  `VITE_GOOGLE_MAPS_KEY` (a de referrer). Sem isso → fallback de link. **Item 4 (montar rota):** migration **072**
  `pedido.ordem_rota int`. Hexagonal: `domain/logistica/Rota.ts` (`ParadaRota`/`RotaRepository`), `SqlRotaRepository`
  (`entregasDoMotoboy` = pedidos expedidos/forma motoboy/não entregues do motoboy, ORDER BY ordem_rota NULLS LAST; `definirOrdem`),
  `application/logistica/RotaService` (`listar`/`salvar`/**`otimizar`**). **Otimização = Directions waypoint optimization**
  (`optimize:true`, origin=destination=endereço da empresa via `empresasRepo.buscarPorCodigo`; **usa a chave de SERVIDOR
  `GOOGLE_MAPS_API_KEY`** → precisa **Directions API ativada nessa chave também**; degrada p/ ordem manual em qualquer falha —
  1 chamada por montagem de rota, barato). Rotas (em `entregas.ts`): `GET /logistica/rota/:motoboyId`, `POST /logistica/rota`
  {motoboyId, ordem[]}, `POST /logistica/rota/otimizar` (cap `logistica.entrega.ver`). `SqlRastreioRepository.minhasEntregas`
  agora ordena por `ordem_rota NULLS LAST` (o app do motoboy segue a rota). **Front:** `MontarRota.tsx` (menu **Logística › Montar
  rota**, cap `logistica.entrega.ver`) — seletor de motoboy, lista de paradas **arrastável** (HTML5 drag, círculo nº 1/2/3),
  **Otimizar rota** + **Salvar rota**; i18n `rota.*`/`menu.montar_rota` pt/en/es. **Cap p/ não-admin:** o perfil que monta rota
  precisa **`logistica.entrega.ver`** + **`cadastros.motoboy.listar`** (o dropdown lê `/motoboys`). **Validação:** hand-review
  (sandbox tsc não-confiável; build local = fonte de verdade). **Pendente Gui:** `npm install` → `npm run build -w @triade/web`
  (validar!) → commit+push (Render aplica 072) → relogar → `scripts\app-apk.bat`. **Setup Google:** ativar **Maps JavaScript API**
  + **Directions API** na chave de navegador (mapa suave) e **Directions API** na chave de servidor (otimizar rota).

- **2026-06-22 (Fase 8 — ajustes pós-teste, parte 1)** — **4 itens (sem migration nova; caps mexidas → relogar).**
  (4) **Voltar p/ orçamento** agora só de **aguardando_pagamento/aprovado** (TRANSICOES back+`lib/pedido`); de separacao/expedido/entregue não é mais permitido (bloqueia se houve movimentação de estoque) — removido o auto-`devolverPorRef`/`reverterPorPedido` do ramo `orcamento` (só remove títulos, bloqueia se pago). Botão no detalhe gateado por `proximos.includes('orcamento')` + `!modoExpedicao` (só Comercial). i18n nova `pedidos.acao.orcamento` (corrige o "botão estranho" cru no Kanban) + confirma atualizado. (6) **Desconto no card do Kanban:** `PedidoResumo` += `desconto` (SqlPedidoRepository.listar + domínio); `Pedidos.tsx` mostra linha verde "Desconto: R$ X" no card. (2) **Menu do motoboy:** `CAPS_PAINEL_TV` += `logistica.entrega.atualizar` (não vai p/ perfis "vê tudo"); perfil **Motoboy** ficou só com `logistica.entrega.atualizar` (sem `.ver` → não vê Logística/painel); `GET /entregas/minhas` regateado p/ `atualizar`. (8) **Notificações "Limpar todas":** `Notificacoes.tsx` botão que conclui todos os grupos (localStorage `triade_notif_concluidas`) + i18n `notif.limpar_todas`. **Pendente Gui:** `npm install` → `npm run build -w @triade/web` → commit+push → relogar. **FEITO (parte 2a):** **mapa+rota+ETA** — `MapaEntrega` ganhou modo Embed **directions** (rota motoboy→cliente) c/ destino; ETA (distância+tempo) calculado no `RastreioService` via **Distance Matrix** (reusa `GOOGLE_MAPS_API_KEY` do servidor) com **cache de 2min** por entrega; `EntregaMotoboy/Ativa/RastreioPublico` += `posicao`/`eta`; mostrado em Minhas entregas (mapa por entrega), Painel e link público. i18n `rastreio.faltam`. Sem setup novo no Google (reusa as 2 chaves). **FEITO (parte 2b-i):** **link do motoboy avulso (freelancer, sem login)** — migration **071** `pedido.motoboy_token` (único); `RastreioRepository` += `garantirMotoboyToken`/`buscarPorMotoboyToken` (+ `EntregaFreelancer`); `RastreioService` += `gerarLinkMotoboy`/`freelancerEntrega`/`freelancerStatus`/`freelancerPosicao` (token autoriza atualizar; reusa cache de ETA). Rotas: `POST /pedidos/:id/motoboy-link` (cap `comercial.pedido.expedir`) + **públicas** `GET/PATCH/POST /entrega-motoboy/:token[...]` (schema sai do prefixo do token). Front: página pública `EntregaMotoboyPublico.tsx` (rota `/entrega/:token`, botões A caminho/Cheguei/Entregue + GPS via navigator.geolocation, mapa+ETA) + botão **"Link do motoboy (avulso)"** no detalhe do pedido (expedição, copia o link). i18n `rastreio.link_motoboy*`/`entrega.*`. Sem cap nova. **FEITO (parte 2b-ii):** (frete extra) migration não precisou — `PedidoRepository.reabrirEntrega` (troca endereço + entrega_status='aguardando' + zera motoboy_token) + `PedidosService.refazerEntrega` (gera título a pagar do motoboy SEMPRE + título a receber "Frete adicional" se quemPaga='cliente'; rota `POST /pedidos/:id/refazer-entrega` cap `comercial.pedido.expedir`; modal `ModalRefazerEntrega` no detalhe, botão só em expedido/motoboy). (cliente) **mini-cadastro inline** (`SeletorPessoa.ModalNovaPessoa`) ganhou os campos de **endereço completo** (logradouro/número/complemento/bairro) no ramo cliente — espelha o de fornecedor; salva no endereço favorito. (relatório) **`lib/excel.ts`**: título limpa as datas ISO do nome (período fica no subtítulo) → corrige o "Contas pagar 2026 06 01..." cru; **total virou fórmula `SUM(...)`** no Excel — vale p/ TODOS os relatórios. **Extrato bancário:** já existe na Conciliação (OFX/CSV). **Pendente Gui:** `npm install` → `npm run build -w @triade/web` → commit+push (Render aplica 070+071) → relogar (caps da parte 1) → `scripts\app-apk.bat`.

- **2026-06-22 (Fase 8 — Rastreio do motoboy)** — **Módulo de entrega/rastreio dentro do TRIADE. Migration tenant 070. Caps novas (relogar).**
  Decisões do Gui: **login do motoboy no app** (vínculo usuario↔motoboy) + **tudo de uma vez**. **Migration 070:** `pedido` +=
  `entrega_status` (aguardando|a_caminho|chegou|entregue, default aguardando) + `rastreio_token` (link público, único); `usuario` +=
  `motoboy_id` (FK→motoboy); tabela `entrega_posicao` (pedido_id, lat, lng, criado_em — trajeto, última linha = posição atual).
  **Caps novas** (módulo Logística): `logistica.entrega.ver` (painel) e `logistica.entrega.atualizar` (app do motoboy). **Perfil padrão
  novo "Motoboy"** (só as 2 caps; `garantirPerfisPadrao` cria no boot). `logistica.entrega.ver` add ao perfil **Estoque**. **Backend
  (hexagonal):** `domain/logistica/Entrega.ts` (StatusEntrega + RastreioRepository), `SqlRastreioRepository`, `application/logistica/
  RastreioService` (recebe `pedidoRepo` p/ fechar o pedido no 'entregue' — exige quem recebeu, reusa `definirEntrega`+`mudarStatus`).
  **Token público = `<codigo>.<aleatório>`** (codigo = schema sem `t_`) → o link `/rastreio/:token` já carrega o tenant. Rotas
  (`entregas.ts`): `GET /entregas/minhas` (motoboy, resolve motoboy pelo `usuario.motoboy_id`), `PATCH /entregas/:id/status`,
  `POST /entregas/:id/posicao`, `GET /entregas/ativas` (painel), e **`GET /rastreio/:token` PÚBLICO** (sem auth; resolve schema via
  `empresasRepo.buscarPorCodigo`). Vínculo: `PATCH /usuarios/:id/motoboy` (cap `acesso.usuario.gerenciar`) + `usuario.motoboy_id` no
  listar; tela Usuários ganhou select **"Motoboy vinculado"**. **Frontend:** `MinhasEntregas.tsx` (motoboy: lista + botões A caminho/
  Cheguei/Entregue + **GPS via `navigator.geolocation.watchPosition`** enviando posição p/ as entregas em rota + copiar link do cliente),
  `PainelEntregas.tsx` (empresa: entregas ativas + **mapa**, polling 10s), `RastreioPublico.tsx` (página pública fora do Layout, rota
  `/rastreio/:token`, timeline de status + mapa, polling 10s), `components/MapaEntrega.tsx` (**Google Maps Embed** mode place; precisa
  `VITE_GOOGLE_MAPS_KEY` de navegador; sem chave → fallback com link). Menu: **"Minhas entregas"** (cap `entrega.atualizar`, item topo)
  + **"Entregas (mapa)"** na Logística (cap `entrega.ver`). i18n pt/en/es (`rastreio.*`). **Sem dep npm nova** (GPS via browser API).
  **Validação:** hand-review (sandbox tsc não-confiável; build local = fonte de verdade). **Pendente Gui:** `npm install` (relink shared
  p/ caps novas) → `npm run build -w @triade/web` (validar!) → commit+push (Render aplica 070 + cria perfil Motoboy + sincroniza caps no
  Administrador) → **relogar** → `scripts\app-apk.bat`. **Setup p/ funcionar:** (1) **`VITE_GOOGLE_MAPS_KEY`** no Cloudflare Pages (chave
  de navegador do Google Maps, restrita por referrer) — sem ela o mapa cai no fallback de link. (2) Criar **usuário p/ cada motoboy**,
  perfil **Motoboy**, e **vincular ao cadastro de motoboy** (select em Usuários). (3) **GPS no APK:** o `navigator.geolocation` funciona
  no **navegador do celular** (o motoboy pode logar pelo site no celular); no **APK** exige permissão de localização no AndroidManifest
  (ACCESS_FINE_LOCATION) + geolocation habilitado no WebView — se não pegar, usar o site no navegador ou adicionar `@capacitor/geolocation`
  depois. **Fluxo:** pedido vira **expedido** com motoboy escolhido → aparece em "Minhas entregas" do motoboy → ele dá "A caminho"
  (gera token + começa a enviar GPS) → cliente acompanha por `/rastreio/<token>` → "Cheguei" → "Entregue" (pede quem recebeu, fecha o
  pedido). **Doc do projeto:** `Info/RASTREIO-MOTOBOY.md` (atualizar status p/ "implementado").

- **2026-06-22 (follow-up)** — **4 ajustes do Gui (sem migration nova; 1 cap nova → relogar).**
  (1) **Desconto por total no Novo pedido:** endpoint `GET /comercial/descontos/resolver?clienteId=&subtotal=`
  (`DescontosPedidoService.resolver`) + efeito no `NovoPedido` (keyed em clienteId/subtotal) → mostra a linha de desconto e
  abate no total **já na digitação** (backend reaplica autoritativo ao salvar). Linha de desconto também no detalhe do pedido.
  (2) **Voltar pedido para orçamento como o cancelar:** `TRANSICOES` (back `PedidosService` + front `lib/pedido.PROXIMOS`)
  passou a permitir `orcamento` a partir de aprovado/separacao/expedido/entregue; o ramo `novo==='orcamento'` agora **devolve
  estoque + etiquetas** (`devolverPorRef`/`reverterPorPedido`) além de remover títulos (bloqueia se algum pago), igual ao
  cancelar. Botão "Voltar para orçamento" no detalhe agora aparece como o cancelar (`podeCancelar && !modoExpedicao && status
  ∉ {orcamento,cancelado}`); rota gateia `orcamento` com a mesma cap do cancelar (`comercial.pedido.cancelar`|gerenciar). i18n
  do confirma atualizado (avisa que estoque/etiquetas voltam). (3) **CRM excluir leads:** `CrmRepository.removerOportunidades(ids)`
  (interações em cascata) + `removerLeads()` (todos estágio 'lead', retorna qtd); `CrmService.excluirOportunidades/excluirLeads`;
  rotas `POST /crm/oportunidades/excluir {ids}` e `DELETE /crm/leads` (cap `comercial.crm.gerenciar`). Front `Crm.tsx`: **lixeira
  por card** (exclui a oportunidade) + botão **"Excluir todos os leads (N)"** no topo do funil → é o jeito de limpar os leads da
  empresa **Teste** pelo próprio app (dispensa o `scripts/limpar-leads-teste.sql`). (4) **Disponibilidade flagável no Comercial:**
  cap nova **`comercial.disponibilidade.ver`** (módulo Comercial) — menu/rota da Disponibilidade gateados por ela; `GET /estoque`
  aceita **any-of** [`estoque.saldo.ver`,`comercial.disponibilidade.ver`]; adicionada aos perfis padrão **Comercial** e **Estoque**.
  Agora aparece p/ marcar no editor do perfil Comercial. **Sem migration nova.** **Pendente Gui:** `npm install` (relink shared p/
  a cap nova) → `npm run build -w @triade/web` (validar antes do commit!) → commit+push → **relogar** (carrega `comercial.disponibilidade.ver`)
  → `scripts\app-apk.bat`. Existing perfis Comercial/Estoque: marcar "Disponibilidade de produtos" no perfil (o `garantirPerfisPadrao`
  não injeta cap nova em perfil já existente; só o Administrador sincroniza no boot).

- **2026-06-22** — **Lote grande (14 demandas do Gui). Migrations tenant 065–069. Caps novas (relogar).**
  Entregue num lote só (decisão do Gui). **Frontend (sem migration):** (1) Kanban "Em separação" → **"Pedido Pronto"**
  (i18n `status.separacao`, 3 idiomas). (2) **Disponibilidade** movida p/ grupo **Comercial**; **Marca** removida da
  Consulta de etiqueta. (3) **Lançamentos (Contas):** clicar no cabeçalho **ordena** (asc/desc, ↑/↓ via `sortCol/sortDir`
  + `ordenados`); **duplo-clique** abre `ModalVerTitulo` agora com **ações** (Editar/Baixar/Parcelar/Multiplicar/Reembolso/
  Excluir/Cancelar baixa) — `excluirUm` novo. (4) **Abrir título do pedido na baixa:** `PedidoTituloResumo` += `id`/`tipo`;
  botão "Abrir título" no detalhe → `/financeiro/{tipo}?titulo=<id>&baixar=1`; Contas lê os params (useSearchParams) e abre o
  ModalBaixa. (11) **Análise de vendas:** seletor **Barras/Pizza/Linha** por usuário (SVG `GraficoAnalise`, salvo em
  `/preferencias/analise-grafico`). (13) **Notificações:** modo lista + **marcar como concluído** (localStorage
  `triade_notif_concluidas` + "Mostrar concluídas"). **Permissões (#2):** caps `comercial.pedido.separar/expedir` movidas do
  módulo Comercial p/ **Estoque** (só `moduloChave`); **9 widgets do painel** viraram caps (`dashboard.kpis/faturamento/
  por_produto/top_produtos/clientes/avisos/pedidos/fluxo/saldos`) — Dashboard gateia cada bloco com fallback
  `temAlgumWidget` (perfil sem nenhum widget vê tudo = não quebra). **#10:** "quem recebeu" **obrigatório** ao entregar
  (back `pedido.recebido_obrigatorio` + front ModalDataEntrega). **#5 (migration 065 `forma_pagamento_taxa`):** cadastro
  **Taxas de cartão** (% por forma/bandeira, Cadastros › Financeiro, cap nova `cadastros.taxa_cartao.*`); na baixa do título
  a taxa **auto-preenche** pela forma. **#7 (migration 066 `frete_campanha.absorve` + `pedido.frete_motoboy`):** campanha de
  frete ganhou **"Motoboy recebe"** (cheio=custo real [padrão] | cobrado); `resolverFrete` resolve cobrado+motoboy na venda;
  **corrige** a Gestão de fretes que pagava o motoboy pelo `frete` cobrado (zerava em frete grátis) → agora soma
  `COALESCE(frete_motoboy, frete_custo, frete)`. **#6:** **editar** campanha de frete (PUT + modal); **histórico** de campanhas
  via Auditoria (POST já auditava; add PUT/DELETE); **desconto por total do pedido ≥ X** (migration 069 `desconto_pedido` +
  `pedido.desconto`; tela Comercial › "Descontos por total"; aplicado no `PedidosService.montar` → total = subtotal − desconto +
  frete; **PedidosService ganhou param `descontoPedidoRepo` no construtor**). **#8 (migration 067 `pedido.frete_gerado`/
  `frete_titulo_id`):** Gestão de fretes reformulada — seleção por pedido (checkbox), filtro **Não gerados/Gerados/Todos**
  (padrão não gerados), **emissão**+vencimento, **confirmação**, **bloqueio de regeração** (frete já gerado destacado), Excel
  com coluna Gerado + totalizador; rota `/logistica/fretes/gerar` (era /fechar). **#9 (migration 068 `forma_entrega_historico`):**
  expedição **troca a forma de entrega** com **justificativa** obrigatória + **histórico** (quem/quando/de→para) no detalhe do
  pedido (cap `comercial.pedido.expedir`). **#12:** CRM — lógica de **clientes inativos verificada (OK)** (filtra
  `diasSemComprar > 90` sobre histórico de compras); leads de teste → **script** `scripts/limpar-leads-teste.sql` (rodar no
  Neon; sem acesso ao banco daqui). **#14 (rastreio do motoboy):** entregue como **PROJETO** em `Info/RASTREIO-MOTOBOY.md`
  (arquitetura + dados + endpoints + Capacitor geolocation + mapa + link público + estados + decisões) — não construído (precisa
  sprint dedicada com teste ao vivo de GPS). **Validação:** hand-review (sandbox tsc não confiável neste projeto; **build local/
  Cloudflare é a fonte de verdade**). **Pendente Gui:** `npm install` (relink @triade/shared p/ caps novas) → `npm run build -w
  @triade/web` → commit+push (Render aplica 065–069 no boot via AUTO_MIGRATE + sincroniza caps no Administrador) → **relogar**
  (carrega widgets do painel + `cadastros.taxa_cartao.*`) → `scripts\app-apk.bat` (muitas telas mudaram) → rodar
  `scripts/limpar-leads-teste.sql` no Neon quando quiser. **Para perfis não-admin:** marcar os widgets do painel desejados e
  `cadastros.taxa_cartao.*` nos perfis em Configurações › Perfis (senão o painel respeita a seleção a partir do 1º widget marcado).

- **2026-06-21** — **Campanha de frete GERAL (sem cliente) + tipo "grátis acima de X" + fix do campo de busca no tema escuro.**
  Decisões do Gui: (a) permitir campanha de frete **geral** (sem escolher cliente); (b) novo tipo **"grátis acima de X"** = se o
  **valor do pedido (subtotal dos produtos, sem o frete) ≥ X → frete grátis**, senão cobra o custo; (c) precedência **campanha do
  próprio cliente vence a geral** (igual comissões). **Migration tenant 064** `frete_campanha`: `cliente_id` passa a aceitar **NULL**
  (NULL = geral); o tipo `gratis_acima` reusa `valor` como limiar (text livre, sem coluna nova). **Backend:** `FreteCampanha` domínio
  += tipo `gratis_acima`, `clienteId: string|null`, e `freteCobrado(schema, clienteId, custo, **subtotal**)`. `SqlFreteCampanhaRepository.freteCobrado`
  reescrito: `WHERE (cliente_id = $1 OR cliente_id IS NULL) AND CURRENT_DATE BETWEEN de AND ate ORDER BY (cliente_id IS NOT NULL) DESC, de DESC LIMIT 1`
  (específica antes da geral); aplica gratis→0 · fixo→valor · percentual→custo×(1-%) · **gratis_acima→ subtotal≥valor ? 0 : custo**.
  `FreteCampanhasService.criar` torna o cliente **opcional** (vazio→null), valida `gratis_acima` (valor>0); `cobrado(...)` ganha `subtotal`.
  `PedidosService` passa o `subtotal` ao resolver. Rota **`GET /frete/cobrado`** lê `&subtotal=`; auditoria do POST trata cliente null
  ("para todos os clientes") e o texto de gratis_acima. **Frontend (`CampanhasFrete.tsx`):** seletor de cliente com opção **"Todos os
  clientes (campanha geral)"**; tipo ganha **"Grátis acima de (R$)"** (campo vira "Frete grátis a partir de (R$)"); Salvar deixa de
  exigir cliente; lista mostra **"Todos (geral)"** quando sem cliente; `rotuloTipo` mostra "Grátis ≥ R$X". `NovoPedido` passa `&subtotal`
  ao `/frete/cobrado` (recalcula o total ao mudar os itens). i18n `fretecamp.tipo_gratis_acima`/`valor_limiar`/`geral`/`todos` + sub
  atualizado pt/en/es. **Sem capability nova** (reusa `logistica.frete.*`) → não precisa relogar. **Fix tema escuro:** `.busca-num`
  (busca de Pedidos) tinha `background:#fff` fixo e a regra global `body.theme-dark input{background:#1b1f27}` pintava o input interno
  de escuro → pílula branca com input escuro. Corrigido: `.busca-num` usa `var(--card)` + input transparente; regra
  `body.theme-dark .busca-num input, body.theme-dark .busca-box-tb input { background: transparent; border: 0; }`. **Validação:**
  hand-review (file-tool lê o arquivo real íntegro); o tsc do sandbox acusa só os falsos TS1005/TS1002 da **truncagem do mount** nos
  arquivos recém-editados + a cascata do `@triade/shared` sem symlink — tsc local é a fonte de verdade. **Pendente Gui:** `npm install`
  → `npm run build -w @triade/web` → commit+push (Render aplica a **064** no boot via AUTO_MIGRATE; backend roda via tsx) →
  `scripts\app-apk.bat` (telas Campanhas de frete e Pedidos mudaram).
- **2026-06-21** — **Reordenar colunas por arraste no Contas (a receber/pagar), salvo NA CONTA do usuário (backend) + fix de alinhamento na Gestão de fretes.**
  Decisões do Gui: (a) reordenar só no **Contas** (onde já havia esconder/mostrar + redimensionar); (b) mover **tudo** (ordem +
  ocultas + larguras) do localStorage para a **conta do usuário** (backend, segue em qualquer dispositivo). **Camada nova de
  preferências (genérica, reusável):** migration tenant **063** `usuario_preferencia` (`usuario_id text`, `chave text`, `valor jsonb`,
  `atualizado_em`, PK `(usuario_id, chave)`; **sem FK em usuario** — o super-admin opera dentro de um tenant mas seu `token.sub` não é
  linha de `usuario` daquele schema). Domínio `domain/preferencia/PreferenciaUsuario.ts` (porta `obter`/`salvar`), infra
  `SqlPreferenciaUsuarioRepository` (upsert `ON CONFLICT (usuario_id, chave)`, `$3::jsonb`), aplicação `PreferenciasService`
  (valida chave `^[a-zA-Z0-9_.-]+$` ≤64; erro `preferencia.chave_invalida`/`valor_invalido`). Rotas **`GET/PUT /preferencias/:chave`**
  (só autenticação, **sem capability** — cada usuário só acessa as próprias, chaveado por `req.usuario.sub`). Wire composition + server.
  Auditoria **ignora** `/preferencias` (não polui o log a cada arraste). **Frontend (`Contas.tsx`):** as colunas, antes hardcoded no
  JSX, viraram **dirigidas por uma lista de descritores** (`ColDef` {chave,label,hideable,soReceber?,cell,exp}); estado `ordem[]`
  carregado de `/preferencias/contas-<tipo>` no mount (fallback p/ ordem padrão; `normalizarOrdem` adiciona colunas novas ao fim e
  descarta obsoletas). **Drag-and-drop nos cabeçalhos** (`draggable` + dragstart/over/leave/drop) reordena e dá **PUT** ao soltar;
  realce visual (`.th-mov.arrastando`/`.alvo` no styles.css). Âncoras fixas: checkbox no início, **Previsto** e **Ações** no fim. As
  colunas reordenáveis são numero/descricao/cat/pessoa/forma/frete/doc/emissao/venc/baixa/valor/vendedor/sit (forma/frete só em
  receber). **Ocultas e larguras** migradas p/ o mesmo backend (mesma chave, objeto `{ordem,ocultas,larguras}`); resize agora guarda
  por `redimRef` síncrono p/ não disparar o drag do `<th>`. **Export CSV/Excel respeita a ordem visível.** i18n `fin.col_arraste` +
  `preferencia.*` pt/en/es. **Fix Gestão de fretes:** `GestaoFretes.tsx` toolbar passou de `alignItems:'center'` p/ **`flex-end`** (e o
  `<span>` dos botões idem) — Filtros, campo "1º vencimento", Exportar Excel e Gerar títulos agora alinham na mesma base (o label do
  campo deixava a coluna mais alta e centralizava os botões fora de linha). **Sem capability nova** (não precisa relogar). **Validação:**
  tsc do sandbox confirma **0 erros nos arquivos novos/editados** (Contas/GestaoFretes/preferências/composition); os demais erros são a
  cascata conhecida do `@triade/shared` sem symlink no sandbox + o aviso pré-existente do MetasService — tsc local é a fonte de verdade.
  **Pendente Gui:** `npm install` (relink `@triade/shared`) → `npm run build -w @triade/web` → commit+push (Render aplica a **063** no
  boot via AUTO_MIGRATE) → `scripts\app-apk.bat` (a tela Contas mudou). **Migração transparente:** quem tinha colunas escondidas/larguras
  no localStorage começa do padrão (não migra o localStorage antigo) — basta reconfigurar uma vez e fica salvo na conta.
- **2026-06-19** — **Backfill: classifica todos os títulos sem categoria financeira (roda no boot, idempotente).**
  Decisão do Gui: corrigir os lançamentos existentes sem categoria. `categoriasPadraoSeed.ts`: nova
  `classificarTitulosSemCategoria(ds, schema)` — UPDATE só onde `categoria_financeira_id IS NULL`: **automáticos pela origem**
  (pedido→"Receita com vendas", compra→"Compra de mercadorias para revenda", comissao→"Comissões de vendedores",
  frete→"Frete de entrega") e **resto por tipo** (receber→"Outras receitas", pagar→"Outras despesas"). Adicionada
  **"Outras despesas"** ao `CATEGORIAS_PADRAO`. Chamada no `prepararBanco` após `garantirCategoriasPadrao` (por tenant, best-effort).
  Como não há acesso direto ao banco daqui, roda no deploy (Render via tsx). **Idempotente** (só mexe em null). **Sem migration,
  sem web build, sem APK** (só backend). **Nota:** novos títulos automáticos (pedido/comissão/frete) nascem sem categoria e só são
  classificados no próximo boot/deploy — se incomodar, dá p/ setar a categoria na criação depois. **Pendente Gui:** commit+push
  (Render redeploia e roda o backfill no boot).
  **Addendum (mesma rotina):** regra fixa por fornecedor — **Cemig → "Energia elétrica"** (`pessoa_nome ILIKE '%cemig%'`, tipo pagar),
  passo 3 do `classificarTitulosSemCategoria`. Sobrescreve mesmo já classificados/pagos (`IS DISTINCT FROM`), re-aplica a cada boot
  (Cemig sempre = energia, decisão do Gui). Só backend, sem migration/web/APK. **Pendente Gui:** commit+push.
- **2026-06-19** — **Lançamento manual: campos obrigatórios + botão de editar (Contas a receber/pagar).**
  Decisão do Gui: ao salvar um lançamento **manual** exigir TODOS os campos; e poder **editar** lançamentos manuais em aberto.
  **Backend:** `TituloRepository.atualizar` + `SqlTituloRepository.atualizar` (UPDATE descricao/pessoa/valor/vencimento/categoria/
  previsto/tipo_doc/num_doc/emissao — não toca origem/baixa/favorecido). `FinanceiroService`: novo `validarManual(tipo,e)` (exige
  descrição, **tipo de documento, nº do documento, categoria financeira, fornecedor/cliente, emissão e vencimento** + valor>0) reusado
  por `criar` e pelo novo `atualizar(schema,tipo,id,e)` (404 se não existe; **`financeiro.nao_editavel`** [400] se origem≠manual ou
  status≠aberto). Rota **`PUT /financeiro/:tipo/:id`** (cap `financeiro.{tipo}.gerenciar`, auditada). **Escopo (decisão do Gui): só
  lançamentos manuais** — os automáticos (pedido/compra/comissão/frete) são criados direto pelo repo e seguem como hoje (senão
  quebraria confirmação de pedido/nota). **Frontend (`Contas.tsx`):** `Titulo` += `categoriaFinanceiraId` (já vinha do domínio/SQL,
  faltava no front). `ModalNovo` aceita `editar?: Titulo` (pré-preenche; título "Editar lançamento"; POST cria / **PUT edita**),
  `faltando()` valida os obrigatórios antes de enviar (mensagem específica por campo), labels marcados com `*` (`.obrig` no CSS).
  **Botão lápis** (`i-edit`) nas ações da linha **só p/ origem manual + em aberto** → abre o ModalNovo em edição. Seção de reembolso
  escondida no modo edição (tem ação própria). i18n `financeiro.{tipodoc,numdoc,categoria,pessoa,emissao,vencimento}_obrigatori*` +
  `financeiro.nao_editavel` + `fin.editar_lancamento` + `fin.toast_editado` pt/en/es. **Sem migration, sem cap nova** (reusa
  `financeiro.*.gerenciar` → não precisa relogar). **Pré-requisito p/ o usuário:** ter **categorias financeiras** e **tipos de
  documento** cadastrados (senão não finaliza o lançamento — é o bloqueio pedido). **Pendente Gui:** `npm run build -w @triade/web` →
  commit+push (Render pega o backend via tsx) → `scripts\app-apk.bat`.
- **2026-06-19** — **Excel da DRE virou demonstração em cascata (cara de DRE), agrupada por grupo › conta › lançamento.**
  Novo gerador dedicado em `lib/excel.ts`: `baixarExcelDRE(nome, titulo, linhas: LinhaDRE[], opcoes)` + `gerarXlsxDRE` +
  `stylesDRE` + `planilhaXmlDRE`. Layout 2 colunas (Descrição · Valor) com estilos hierárquicos
  (`EstiloDRE` = grupo | grupo_neg | conta | lancamento | subtotal | resultado | nota): grupos em destaque (fill roxo claro,
  deduções em vermelho), contas indentadas (indent 1), lançamentos indentados cinza (indent 2), subtotais (= Lucro bruto) com
  fill cinza + borda fina, **= Resultado do período** com fill verde + borda média (vermelho se negativo), e linha "Margem" (nota).
  numFmt 164 (R$) nos valores; reusa logos/`montarImagens`/zip/drawing do gerador genérico. **`RelDRECompetencia.tsx`:** `exportar('xlsx')`
  agora chama `exportarExcelDre()` (monta a cascata Receita → Custo merc. = Lucro bruto → Custos op. → Despesas = Resultado;
  inclui lançamentos sob cada conta **quando "Detalhar lançamentos" marcado**, via `carregarTitulos(grupo,categoria)`). **CSV mantido
  plano** (resumo, ou detalhado por lançamento quando marcado) p/ importação. Título do Excel: nova i18n `dre.excel_titulo`
  ("Demonstração do resultado (competência)") pt/en/es. Import `baixarExcel` removido do arquivo (não usado lá). Só frontend,
  **sem backend/migration/cap**. **Pendente Gui:** `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`.
- **2026-06-18** — **Excel da DRE: logo TRÍADE à direita, colunas mais largas (global) + opção "Detalhar lançamentos".**
  **(1+2) `lib/excel.ts` (afeta o Excel de TODOS os relatórios):** logo TRÍADE movida da penúltima p/ a **última coluna**
  (`montarImagens`: `col: ncols-1`, cx 1200000/cy 304000) — some a sobreposição com o título centralizado. `colsXml`: largura passou
  de `min(60, max(10, len+2))` p/ `min(80, max(16, len+6))` (colunas mais largas). **(3) `RelDRECompetencia.tsx`:** checkbox
  **"Detalhar lançamentos"** ao lado de CSV/Excel; quando marcado, `exportar()` chama `exportarDetalhado()` que varre cada
  grupo×categoria (reusa cache `titulos`, senão busca `/financeiro/dre-competencia/titulos`) e gera uma planilha **uma linha por
  lançamento** — cab `Grupo · Conta · Data · Documento · Descrição · Valor` (i18n `dre.conta/dre.data/dre.documento/fin.descricao`),
  nome `dre-competencia-detalhada`. i18n novas `dre.detalhar`/`dre.detalhar_hint` pt/en/es. Só frontend, **sem backend/migration/cap**.
  **Pendente Gui:** `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`.
- **2026-06-18** — **Botão "Exportar Excel" na DRE por competência.** `RelDRECompetencia.tsx`: `exportar()` virou
  `exportar(fmt: 'csv'|'xlsx')` (mesma montagem de linhas grupo/categoria/conta/valor); no cabeçalho, ao lado do CSV, entrou o
  `BotaoExcel` (verde, padrão das outras telas) chamando `baixarExcel('dre-competencia', cab, linhas, { periodo: rotuloPeriodo(de, ate) })`.
  Só frontend, **sem backend/migration/cap**. **Pendente Gui:** `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`.
- **2026-06-18** — **Remoção completa da "Categoria de produto" do sistema (igual fizemos com "Marcas").**
  Decisão do Gui: remover por completo (menu + rota + tela + backend + relatórios por categoria + coluna na tabela de preço).
  **NÃO confundir com `categoria_financeira`/`catfin` (Financeiro) — essa fica intacta.** **Capabilities (`packages/shared`):**
  removidas `cadastros.categoria.listar/gerenciar` e `relatorios.categorias.ver` (+ tirada de `REL_COMERCIAL`). **Frontend:**
  `Layout` (item Cadastros › Estoque › Categorias), `App.tsx` (rotas `/cadastros/categorias` e `/relatorios/vendas-categoria` +
  imports), `BuscaGlobal` (2 destinos), `Relatorios` (hub), `primeiraRota`. `Produtos.tsx` reescrita sem o seletor/filtro/coluna
  de categoria. `TabelaPreco.tsx` perdeu a coluna Categoria (base e por cliente; colSpan 5→4). `AnaliseVendas.tsx` perdeu o chip
  "Categorias" + o donut (era a única dimensão em pizza). **Backend:** `server.ts`/`composition.ts` desregistram rotas+wiring de
  categoria; `ProdutosService` não recebe mais `CategoriaRepository` e `validar` não checa categoria; `SqlProdutoRepository` parou de
  ler/gravar `categoria_id` (sem JOIN); domínio `Produto`/`ProdutoResumo`/`NovoProduto` sem `categoriaId/categoriaNome`. Relatórios:
  removidos `vendasPorCategoria` (domínio/repo/serviço/rota `/relatorios/vendas-categoria`) e a dimensão `categorias` da `/comercial/analise`.
  Preço: `PrecoProduto`/`PrecoClienteLinha` sem `categoriaNome`; `SqlPrecoBaseRepository`/`SqlPrecoClienteRepository` sem JOIN `categoria`.
  **Banco:** a tabela `categoria` e a coluna `produto.categoria_id` ficam **inertes** (sem migration destrutiva). **Sem cap nova, sem
  migration.** **Arquivos órfãos p/ o Gui `git rm`** (sandbox não apaga): `apps/web/src/pages/Categorias.tsx`,
  `apps/web/src/pages/RelCategorias.tsx`, `apps/api/src/domain/cadastro/Categoria.ts`,
  `apps/api/src/infra/repositories/SqlCategoriaRepository.ts`, `apps/api/src/application/cadastro/CategoriasService.ts`. O
  `rotas/categorias.ts` virou stub (`export {}`). Chaves i18n de categoria deixadas no dicionário (inertes, não quebram). **Pendente Gui:**
  `npm install` (relink @triade/shared) → `git rm` dos órfãos → `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`
  (telas mudaram) → relogar (recarrega caps).
- **2026-06-18** — **Fix: divergência entre os cards "Vendas por produto" e "Produtos mais vendidos" do Dashboard.**
  Causa: no `SqlDashboardRepository.resumo` as duas queries tinham bases diferentes. O `top` (Produtos mais vendidos)
  **não filtrava status nem período** — somava `pedido_item` de TODOS os pedidos (incluindo orçamento/cancelado) e de
  todo o histórico; já o `vendasProd` (Vendas por produto) filtrava `p.${NAO}` + janela de 6 meses. Por isso Dysport 300
  aparecia R$ 23k num e R$ 19k no outro (os ~R$ 4k extras vinham de orçamentos/cancelados). **Correção:** alinhei as duas
  à **mesma base** — `JOIN pedido p ... AND status NOT IN (orcamento,cancelado)` + `WHERE p.criado_em >= now() - interval '30 days'`
  (decisão do Gui: janela de **30 dias** nos dois). Só backend, **sem migration, sem cap nova, sem mudança de tela**
  (roda via tsx no Render). **Pendente Gui:** commit+push (Render redeploia) — não precisa rebuild web nem APK.
- **2026-06-18** — **DRE gerencial por competência: grupos (Receita / Custo de mercadoria / Custos operacionais / Despesas) + drill por lançamento + categorias base.**
  Decisão do Gui: NÃO seguir com contabilidade formal (escrituração/SPED) — só a parte **gerencial**. **Migration tenant 062**
  `categoria_financeira += grupo` (receita | custo_mercadoria | custo_operacional | despesa; default 'despesa', backfill receita p/ tipo=receita).
  **Domínio:** `CategoriaFinanceira` += `grupo` (`GrupoCatFin`/`GRUPOS_CATFIN`/`tipoDoGrupo` — o `tipo` receber/pagar é **derivado** do grupo)
  + const `CATEGORIA_COMPRA_MERCADORIA`; repo += `buscarPorNome`; `criar/atualizar` passam a receber **grupo** (derivam tipo). `SqlCategoriaFinanceiraRepository`
  grava/lê grupo + `buscarPorNome`. `CategoriasFinanceirasService` valida grupo (`catfin.grupo_invalido`; aceita tipo legado por compat).
  **Seed base p/ todas as empresas:** `infra/db/categoriasPadraoSeed.ts` (`CATEGORIAS_PADRAO` 22 categorias + `garantirCategoriasPadrao`,
  idempotente por nome) chamado no `prepararBanco` (boot, junto dos perfis padrão). **Nota de entrada:** `ComprasService` recebe o
  `CategoriaFinanceiraRepository` e grava a categoria **"Compra de mercadorias para revenda"** no título a pagar de compra (best-effort — sem a
  categoria, segue sem). **DRE por competência (reescrita):** `SqlTituloRepository.dreCompetencia` agrupa por **grupo** (`COALESCE(cf.grupo, tipo→receita/despesa)`)
  + categoria + conta contábil; novo `dreCompetenciaTitulos(grupo, categoria)` = **drill** (títulos por emissão que compõem a linha).
  `FinanceiroService.dreCompetencia` monta os 4 grupos na ordem da DRE com **cascata** (Receita − Custo de mercadoria = Lucro bruto; − Custos
  operacionais − Despesas = Resultado) + buckets mapeados (juros/multa/desconto recebidos→receita; taxa de cartão→custo operacional; juros/multa
  pagos + desconto concedido→despesa). Rota `GET /financeiro/dre-competencia/titulos?de=&ate=&grupo=&categoria=` (cap `financeiro.fluxo.ver`).
  **Frontend:** `RelDRECompetencia.tsx` reescrita — demonstração em cascata, grupos expansíveis, **clique na conta abre os lançamentos** (drill);
  KPIs Receita/Lucro bruto/Resultado/Margem; CSV. `CategoriasFinanceiras.tsx` troca o select de tipo por **Grupo (DRE)** (4 opções). CSS
  `.dre-demonstrativo/.dre-grupo/.dre-conta/.dre-drill/.dre-subtotal` (theme-safe). i18n `dre.g_*`/`dre.lucro_bruto`/`dre.lancamentos`/`catfin.grupo`
  pt/en/es. **Sem cap nova** (reusa `financeiro.fluxo.ver` + `cadastros.catfin.*`) → **não precisa relogar**. **Sem dep nova.** Backend roda via tsx
  no Render (boot aplica a **062** + semeia as categorias base). **Pendente Gui:** `npm run build -w @triade/web` → commit+push (Render aplica 062 +
  seed no boot) → `scripts\app-apk.bat` (telas DRE + Categorias mudaram). Validação por hand-review (tsc local = fonte de verdade, como sempre).
- **2026-06-16** — **Painel de referência da tabela de ICMS em Dados da empresa › Fiscal (só frontend).** `lib/icms.ts` (espelha o
  `domain/fiscal/icms.ts`) + botão **"Ver tabela de ICMS interestadual"** no `ConfigFiscalCard` (recebe `ufEmpresa` de DadosEmpresa):
  a partir da UF da empresa, mostra um chip por UF de destino com a alíquota (roxo=interna, verde=12%, laranja=7%), usando os pills
  theme-safe `st-roxo/st-verde/st-laranja` e a alíquota interna configurada. i18n `fiscal.tabela_*` pt/en/es. **Sem backend/migration/cap.**
  **Pendente Gui:** `npm run build -w @triade/web` → commit+push → APK.
- **2026-06-16** — **Fiscal/contábil — Entrega 4/4: DRE por competência (emissão) por categoria financeira + conta contábil + buckets. Conjunto fiscal/contábil concluído.**
  `TituloRepository.dreCompetencia(schema, de, ate)` (SQL): competência = `COALESCE(emissao, criado_em::date)`, só `previsto=false`;
  agrega `valor` por **tipo × categoria financeira × conta contábil** (JOIN categoria_financeira → conta_contabil) e soma os **buckets**
  (juros/multa/desconto por tipo + taxa_cartao). `FinanceiroService.dreCompetencia` monta receitas/despesas: categorias de receber→receita,
  pagar→despesa; buckets fixos (Juros recebidos/Multa recebida/Desconto obtido = receita; Taxa de cartão/Desconto concedido/Juros pagos/
  Multa paga = despesa); totais + resultado. Rota `GET /financeiro/dre-competencia?de=&ate=` (cap `financeiro.fluxo.ver`). **Frontend:**
  `pages/RelDRECompetencia.tsx` — período, KPIs (receitas/despesas/resultado/margem), 2 tabelas (categoria + **conta contábil** + valor)
  com totais, export CSV. Menu **Financeiro › DRE** + rota `/financeiro/dre` + i18n `dre.*`/`menu.dre` pt/en/es. (A DRE de caixa antiga
  [`/financeiro/dre` API por origem/categoria] continua existindo inerte; a nova usa `/financeiro/dre-competencia`.) **Sem cap nova, sem
  migration nova** (usa as 060/061), **não precisa relogar**. Parse limpo (só o falso fim por truncagem nos editados). **Pendente Gui:**
  `npm run build -w @triade/web` → commit+push → APK. **As 4 entregas (ICMS interestadual, plano de contas, taxa de cartão, DRE) podem
  subir juntas.** Buckets em pt-BR (data, não i18n). DIFAL/4% importado seguem fora de escopo.
- **2026-06-16** — **Fiscal/contábil — Entrega 3/4: taxa de cartão como campo no recebimento (juros/multa/desconto já eram campos).** Migration
  tenant **061** `titulo += taxa_cartao numeric(14,2) NOT NULL DEFAULT 0`. `Titulo`/`AjustesBaixa` += `taxaCartao`;
  `SqlTituloRepository.baixar` grava `taxa_cartao=$8` e o map lê. `FinanceiroService.baixar` valida taxa ≥0 e repassa (não reduz o
  valor de baixa — é despesa da operadora). Rota `/financeiro/:tipo/:id/baixar` passa `taxaCartao: b.taxaCartao`. **Frontend (`Contas`
  `ModalBaixa`):** quando forma = **Cartão**, aparece o campo **Taxa do cartão** + **Líquido recebido** (= total a baixar − taxa); só
  na baixa individual; o detalhe do título mostra a taxa quando paga. i18n `fin.taxa_cartao`/`fin.liquido_cartao` pt/en/es. Desconto/
  multa/juros já existiam como composição da baixa (decisão do Gui: tudo **campo** na baixa, sem lançamento separado; o DRE [Entrega 4]
  agrega em categorias fixas). **Sem cap nova, sem dep, não precisa relogar.** Parse limpo (só o falso fim por truncagem do mount nos
  editados; íntegros). **Pendente Gui:** `npm run build -w @triade/web` → commit+push (Render aplica a **061**) → APK. **Falta a
  Entrega 4: DRE por competência** agregando categoria financeira + buckets fixos (juros/multa/taxa/desconto) com a conta contábil.
- **2026-06-16** — **Fiscal/contábil — Entrega 2/4: Plano de contas (cadastro) + vínculo na categoria financeira.** Migration tenant
  **060** `conta_contabil` (codigo, descricao, tipo [receita/despesa/ativo/passivo], pai_id self-FK opcional, ativo) +
  `categoria_financeira += conta_contabil_id` (FK). **Backend:** domínio `financeiro/ContaContabil` + repo,
  `SqlContaContabilRepository`, `ContasContabeisService` (CRUD; valida codigo/descricao/tipo; não deixa ser pai de si mesma);
  rotas `/contas-contabeis` (GET/POST/PUT/PATCH ativo, **reusa cap `cadastros.catfin.*`** → sem cap nova). `CategoriaFinanceira`
  domínio/repo/serviço += `contaContabilId` (criar/atualizar passam a FK). Wire composition + server. **Frontend:** tela
  `pages/PlanoContas.tsx` (Cadastros › Financeiro › Plano de contas — código/descrição/tipo/conta-pai/ativo) + select **Conta
  contábil** no modal de Categorias financeiras. Menu + rota `/cadastros/plano-contas` + i18n `plano.*`/`catfin.conta_contabil`
  pt/en/es. **Sem relogar** (cap reusada). Parse de sintaxe limpo em todos os arquivos. **Pendente Gui:** `npm install`? não
  (sem dep) → `npm run build -w @triade/web` → commit+push (Render aplica a **060** no boot) → APK. **Próximas:** 3) taxa de
  cartão + campos na baixa; 4) DRE por competência agregando categoria financeira + conta contábil.
- **2026-06-16** — **Fiscal/contábil — Entrega 1/4: alíquota de ICMS interestadual automática na NF-e (origem×destino).** Novo
  `domain/fiscal/icms.ts` `aliquotaIcms(ufOrigem, ufDestino, aliquotaInterna)`: mesma UF → **interna** (configurada, ex. MG 18%);
  origem no **Sul/Sudeste exc. ES** (PR/RS/SC/SP/RJ/MG) → **12%** p/ S/SE-exc-ES e **7%** p/ N/NE/CO+ES; origem N/NE/CO/ES → **12%**.
  `NotasFiscaisService` usa isso no item (Regime Normal/CST tributado): `icmsAliquota = simples ? 0 : aliquotaIcms(empresa.uf, dest.uf, cfg.aliquotaIcms)`
  → a alíquota correta entra na NF (icms_aliquota/base/valor). `cfg.aliquotaIcms` passou a ser a **alíquota interna** (label/hint
  atualizados em Dados da empresa › Fiscal; a interestadual é automática). Validado: MG→MG 18, MG→SP/RJ/PR/RS/SC 12, MG→ES/BA/AM/DF/GO/PE/RO 7
  (bate com a matriz do tax group). Só vale no **Regime Normal** (no Simples o item usa CSOSN, sem alíquota). **Sem migration/cap/dep.**
  **Pendente Gui:** `npm run build -w @triade/web` → commit+push → APK. **Próximas entregas (decididas com o Gui):** 2) **plano de
  contas completo** (cadastro) + FK na categoria financeira; 3) **taxa de cartão** como campo no recebimento (+ juros/multa/desconto
  como campos, sem lançamento); 4) **DRE por competência** (emissão) agregando por categoria financeira + buckets fixos
  (juros/multa/taxa/desconto), mostrando a conta contábil.
- **2026-06-16** — **Perfil multi-empresa (super-admin): replica um perfil em várias empresas de uma vez (espelha o multi-empresa de usuários).**
  **Backend (sem migration, sem cap nova):** use case `application/perfil/PerfilMultiEmpresa` — `situacao(nome)` (por empresa ativa:
  existe?/ativo?/qtdCaps + `modelo` = 1º perfil achado p/ pré-preencher permissões/descrição) e `sincronizar({nome, descricao,
  capabilities, empresas[]})` que, **só nas empresas marcadas**, cria (se não existe pelo nome) ou atualiza as permissões; **empresas
  desmarcadas NÃO são tocadas** (decisão do Gui — um perfil pode ter usuários vinculados, inativá-lo tiraria o acesso deles). Rotas
  super-admin `GET/PUT /superadmin/perfis/empresas` (gate `exigirSuperAdmin`, PUT auditado). Wire composition (`perfilMultiEmpresa`).
  **Frontend (`Perfis.tsx`):** botão **Perfil multi-empresa** (só super-admin) abre `ModalPerfilMulti` — nome (com busca da situação),
  descrição, o **mesmo editor de permissões por módulo** do perfil normal, e o **checklist de empresas** (badge "já existe · N caps" /
  "novo"; pré-seleciona onde já existe e pré-preenche as permissões pelo modelo). i18n `perfis.multi*` pt/en/es. **Sem relogar.**
  **Pendente Gui:** `npm run build -w @triade/web` → commit+push (Render pega o backend via tsx) → `scripts\app-apk.bat`. Parse limpo
  (só o falso "}" do fim por truncagem do mount em perfis.ts/composition.ts; íntegros pelo file-tool).
- **2026-06-16** — **Tela central de Notas fiscais (Comercial › Notas fiscais) + baixar XMLs do período em zip (p/ a contabilidade).**
  **Backend (sem migration, sem cap nova):** `NotaFiscal` domínio += `NotaFiscalResumo`/`FiltroNotas`; `SqlNotaFiscalRepository.listar`
  (JOIN `nota_fiscal`×`pedido`×`cliente`; filtros status/de/ate por `criado_em`; traz nº/série/chave/status/cliente/valor[=pedido.total]/
  data). `NotasFiscaisService.listar`. Rota `GET /fiscal/notas?status=&de=&ate=` (cap **`fiscal.nota.ver`** reusada). **Frontend:** página
  `pages/NotasFiscais.tsx` — KPIs (autorizadas/valor/canceladas/erro), chips de status + período + busca (nº/chave/cliente), tabela com
  **DANFE/XML por linha** (reusa `/pedidos/:id/nota/danfe|xml`) e clique abre o pedido; **Exportar CSV** do índice; **Baixar XMLs (zip)**
  = baixa todos os XMLs autorizados do filtro num zip só (novo `lib/zip.ts` — método store + CRC32, **sem dependência**, reaproveita a
  lógica do `lib/excel.ts`). Menu **Financeiro › Notas fiscais** + rota `/financeiro/notas-fiscais` (cap `fiscal.nota.ver`) + i18n
  (movido do Comercial p/ o Financeiro — comercial/expedição só usa a nota dentro do pedido; o controle central é do financeiro/contabilidade)
  `menu.notas_fiscais`/`nf.tela_*`/`nf.kpi_*`/`nf.baixar_xmls`/`nf.valor`/`nf.pedido`/`nf.emitida_em`/`nf.f_todas` pt/en/es.
  **Contabilidade:** um perfil só com **`fiscal.nota.ver`** (sem `emitir`) dá acesso de leitura+download (ver/baixar DANFE/XML/zip) sem
  poder emitir/cancelar — é o perfil ideal p/ o contador. O card dentro do pedido continua igual. **Sem relogar** (cap já existe).
  **Pendente Gui:** `npm run build -w @triade/web` → commit+push (Render pega o backend via tsx) → `scripts\app-apk.bat`. Parse limpo
  (só o falso "}" do fim por truncagem do mount nos arquivos editados; íntegros pelo file-tool).
- **2026-06-16** — **Fase 7 — Entrega 7C: CANCELAMENTO de NF-e. Fase 7 (Fiscal/NF-e via Focus NFe) concluída (emitir + consultar + DANFE/XML + cancelar).**
  Porta `EmissorFiscal` += `cancelar(ambiente, token, ref, justificativa)`; adapter `FocusNFeEmissor.cancelar`
  (**DELETE `/v2/nfe/:ref`** com body `{justificativa}`, normaliza resposta). `NotasFiscaisService.cancelar(schema,
  empresaCodigo, pedidoId, justificativa)`: valida **justificativa 15–255**, exige nota **autorizada**, chama o adapter e
  **só vira 'cancelado' no sucesso** — se a SEFAZ/Focus recusar (fora do prazo, já cancelada…), **preserva a nota** e
  devolve o erro (mensagem do provedor). Rota **`POST /pedidos/:id/nota/cancelar`** (reusa a cap **`fiscal.nota.emitir`**,
  auditada). **Frontend (`NotaFiscalCard`):** no estado **autorizado**, botão **Cancelar NF-e** revela um textarea de
  justificativa (contador x/255, confirma só com ≥15) → `POST .../cancelar` → status vira **Cancelada**. i18n `nf.cancelar*`/
  `nf.justificativa*`/`fiscal.nota.justificativa_invalida`/`nao_cancelavel`/`cancelamento_falhou` pt/en/es. **Sem capability
  nova** (reusa `fiscal.nota.emitir`) → **não precisa relogar**. **Sem migration, sem dep nova.** Backend roda via tsx no
  Render (redeploy pega). **Validação:** parse limpo (só o falso "}" do fim por truncagem do mount; arquivos íntegros);
  hand-review das assinaturas. **Pendente Gui:** `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`.
  **Obs.:** cancelamento tem prazo legal (geralmente 24h após autorização, varia por UF) — se a SEFAZ recusar, a mensagem
  dela aparece e a nota continua autorizada. **Fora do escopo (futuro, se precisar):** carta de correção (CC-e),
  inutilização de numeração.
- **2026-06-16** — **Fase 7B — ajustes pós-teste de emissão: card prefixa a resposta da Focus + adapter corrige grupo de ICMS (modBC/vBC).**
  **(1) Card:** mensagem de erro da nota agora vem prefixada por **"A Focus NFe respondeu:"** (`nf.resposta_provedor`
  pt/en/es) p/ deixar claro que o texto é do provedor/SEFAZ, não do suporte do TRIADE. **(2) Erro de schema
  `vBC não esperado, esperado modBC`:** no `FocusNFeEmissor`, o grupo de base de cálculo do ICMS só era enviado quando
  `aliquota > 0`. Para **CST de ICMS tributado (Regime Normal: 00/10/20/70/90)** com alíquota 0, o XML saía com `vBC`
  (Focus assume 0) sem `modBC` → SEFAZ rejeita. **Correção:** o adapter passou a distinguir **CSOSN (3 dígitos, Simples)**
  de **CST (2 dígitos, Normal)** e, para CST tributado, **sempre** envia `icms_modalidade_base_calculo` + `icms_base_calculo`
  + `icms_aliquota` + `icms_valor` (mesmo com alíquota 0). **Diagnóstico p/ o Gui:** o erro indica que a **iSKINS está
  configurada como Regime Normal / CST 00**. Se a iSKINS for **Simples Nacional** (provável p/ distribuidora estética), o
  certo é trocar o **regime para Simples** em Dados da empresa › Fiscal — aí usa **CSOSN 102** e o erro some sem depender do
  fix. Se for Normal mesmo, definir a **alíquota de ICMS** (CST 00 = tributada integralmente exige alíquota > 0; o fix evita
  o XML inválido, mas a SEFAZ ainda espera alíquota real). **Sem migration/cap/dep.** Backend roda via tsx no Render
  (redeploy pega). **Pendente Gui:** `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`. Parse limpo (só
  o falso "}"/JSX do fim por truncagem do mount; arquivos íntegros).
- **2026-06-16** — **Fix: frete do motoboy não recalculava ao EDITAR orçamento (mantendo o endereço atual).** No `NovoPedido.tsx`
  o efeito de recálculo tinha `if (usandoAtual) return` **antes** do ramo do motoboy → ao editar um orçamento com "Manter
  endereço atual", trocar/escolher Motoboy não recalculava e o frete ficava no valor salvo (0,00). Além disso o CEP não era
  definido nesse modo. **Correção (só frontend):** (1) o ramo **motoboy recalcula sempre** (frete automático), inclusive na
  edição; o guard `usandoAtual` passou a valer só p/ **correios/transportadora** (frete manual, que não deve ser sobrescrito);
  (2) quando `usandoAtual`, o **CEP é extraído do texto do endereço salvo** (`/\d{5}-?\d{3}/`) p/ o cálculo ter origem.
  **Validação prévia (a pedido do Gui):** o Google Maps **está correto e é global** — `GOOGLE_MAPS_API_KEY` é env do servidor
  (Render), igual p/ todas as empresas; a origem vem do endereço de **Dados da empresa** de cada empresa (fallback: CEP de
  origem da Config de frete); a linha de memória do frete mostra `(Google Maps)` vs `(estimado)`. Se a iSKINS cair em
  `(estimado)`, o endereço dela em Dados da empresa está vazio (preencher). **Sem migration/cap/dep.** **Pendente Gui:**
  `npm run build -w @triade/web` → commit+push → `scripts\app-apk.bat`. Parse de sintaxe limpo (só o falso L466 da truncagem
  do mount; arquivo íntegro).
- **2026-06-16** — **Anexos de documentos no cadastro de Cliente (espelha o Contas a pagar; mesmo R2).** O Gui escolheu **nos dois
  lugares** (lista + formulário), confirmado por mockup antes de aplicar. **Migration tenant 059** `cliente_anexo` (cliente_id FK
  CASCADE + nome_arquivo/tipo/tamanho/chave/usuario_nome/criado_em — igual `titulo_anexo`). **Backend:** domínio
  `domain/pessoa/ClienteAnexo.ts` + repo, `SqlClienteAnexoRepository`, `application/pessoa/ClienteAnexosService` (cópia do
  `AnexosService`: valida PDF/JPG/PNG/WEBP + 10 MB, chave `schema/clientes/<id>/<uuid>-nome`, upload/baixar/remover). Rotas
  **no mesmo `anexos.ts`**: `GET/POST /clientes/:id/anexos`, `GET /clientes/anexos/:id/conteudo` (stream), `DELETE /clientes/anexos/:id`
  — gate `cadastros.cliente.listar` (ver) / `cadastros.cliente.gerenciar` (anexar/remover), auditadas. **Sem capability nova**
  → **não precisa relogar**. Wiring: `r2Storage` extraído no composition.ts p/ reuso entre `anexosService` e o novo
  `clienteAnexosService`. **Frontend:** `AnexosTitulo` foi **generalizado** em `components/AnexosDocumentos.tsx` (recebe as URLs;
  modo **modal** e modo **inline**) — `AnexosTitulo` virou wrapper fino (Contas/relatórios inalterados). Na **lista de Clientes**:
  botão 📎 (`i-clip`) na coluna de ações abre o modal de documentos. No **formulário** (`ModalCli`): seção "Documentos do cliente"
  **inline** ao editar (novo cliente mostra "salve primeiro"). i18n `anexo.cliente`/`anexo.salve_primeiro`/`anexo.cliente_invalido`
  pt/en/es (demais `anexo.*` reusadas). CSS `.anexo-inline`. **Sem dep npm nova, sem env nova** (reusa o R2 do Contas — as 4 vars
  já no Render). **Validação:** parse de sintaxe limpo nos arquivos novos/editados (só o `composition.ts` acusa o falso "}"/")" da
  truncagem do mount — confirmado íntegro). **Pendente Gui:** `npm run build -w @triade/web` → commit+push (Render aplica a **059**
  no boot via AUTO_MIGRATE) → `scripts\app-apk.bat` p/ APK novo (telas mudaram). **Pré-requisito:** R2 já configurado (mesmo do
  Contas; se o anexo de título funciona, esse funciona). **e2e sugerido:** anexar PDF a um cliente pela lista e pelo formulário;
  ver/baixar; remover; tipo inválido/>10 MB barra.
- **2026-06-16** — **Fase 7 — Entrega 7B: EMISSÃO de NF-e (Focus NFe), consulta de status e DANFE/XML no detalhe do pedido.**
  **Decisões do Gui:** destinatário **sempre não contribuinte** (indicador IE 9, sem IE — não mexe no cadastro de cliente);
  botão **Emitir NF-e só com pedido Expedido/Entregue**; escopo emitir (cancelar = 7C). **Migrations:** tenant **058**
  `nota_fiscal` (pedido_id FK CASCADE, ref UNIQUE [idempotência Focus], status [processando|autorizado|erro|cancelado],
  status_focus/status_sefaz/mensagem_sefaz, chave/numero/serie, caminho_danfe/caminho_xml, timestamps). public **008**
  `empresa_fiscal += numero_emitente, complemento_emitente` (o resto do endereço do emitente vem de Dados da empresa;
  número faltava e a NF-e exige). **Backend (porta+adapter):** domínio `domain/fiscal/EmissorFiscal.ts` (porta +
  DTOs neutros DadosEmissaoNF/EmitenteNF/DestinatarioNF/ItemNF/RespostaFiscal/ArquivoFiscal) e `NotaFiscal.ts`
  (NotaFiscal/StatusNota/AtualizacaoNota + repo). Adapter `infra/fiscal/FocusNFeEmissor.ts` (fetch nativo, Basic Auth
  `base64(token+':')`, base homologação/produção; `POST /v2/nfe?ref=`, `GET /v2/nfe/:ref`, baixa DANFE/XML; **monta o
  JSON da Focy**: ramifica **CSOSN [Simples] / CST [Normal] no mesmo campo `icms_situacao_tributaria`**, base/alíquota/valor
  só quando alíquota>0, destinatário com `indicador_inscricao_estadual_destinatario:9`, CPF/CNPJ conforme PF/PJ; normaliza
  resposta e erros `codigo`/`erros[]`). `SqlNotaFiscalRepository` (tenant). `application/fiscal/NotasFiscaisService`:
  `emitir(schema, empresaCodigo, pedidoId)` (valida status Expedido/Entregue, nota não duplicada, emitente completo
  [CNPJ/IE/endereço+numero_emitente], token do ambiente presente, destinatário [cliente + endereço favorito + documento],
  **todo item com NCM 8 díg.**; CFOP por UF emitente×destinatário [override do produto > perfil]; CST/CSOSN/origem do produto
  ou do perfil; ref `<empresa>-<numero>-<ts36>`; persiste 'processando' → chama o adapter → atualiza), `statusAtual`
  (reconsulta a Focus se 'processando'), `baixar` (DANFE/XML stream). **Rotas** (em `fiscal.ts`): `POST /pedidos/:id/nota`
  (cap `fiscal.nota.emitir`, auditada), `GET /pedidos/:id/nota` (status, cap `fiscal.nota.ver`), `GET /pedidos/:id/nota/danfe|xml`
  (stream autenticado). Wiring composition.ts (configFiscalRepo extraído p/ reuso) + server.ts (rotasFiscal já registrado na 7A).
  **Caps novas** `fiscal.nota.ver`/`fiscal.nota.emitir` (módulo `cap.modulo.fiscal`) — no Administrador (sync no boot) e no
  perfil padrão **Estoque** (quem expede). **Frontend:** componente `components/NotaFiscalCard.tsx` no **detalhe do pedido**
  (Emitir quando expedido/entregue; **polling** a cada 4s enquanto 'processando'; Baixar **DANFE/XML** via `api.blob`+`lib/download`;
  mensagem da SEFAZ no erro + reemitir) — só aparece com `fiscal.nota.ver` e status ≠ orçamento. `ConfigFiscalCard` += número/
  complemento do emitente. i18n pt/en/es (`nf.*`, `fiscal.nota.*` [erros], `fiscal.numero_emitente`, labels das caps).
  **Sem dep npm nova** (fetch/Buffer nativos). **Validação:** parse de sintaxe limpo nos arquivos escritos de uma vez;
  os editados acusam o falso "} expected" da truncagem do mount (confirmado íntegros pelo file-tool); hand-review das
  assinaturas/wiring/ordem de params. **Pendente Gui:** `npm install` (relink @triade/shared p/ as caps novas) →
  `npm run build -w @triade/web` (tsc local = fonte de verdade) → commit+push (Render aplica **public 008** + **tenant 058**
  no boot via AUTO_MIGRATE + sincroniza as caps no Administrador) → **relogar** (carrega `fiscal.nota.*`) → `scripts\app-apk.bat`
  p/ APK novo (telas mudaram). **Pra não-admin emitir:** marcar as caps `fiscal.nota.*` no perfil dele em Configurações › Perfis.
  **Setup Focus (pré-requisito p/ autorizar):** certificado **A1 (.pfx)** no painel Focus, emitente credenciado na SEFAZ
  (homologação primeiro), **token** colado em Dados da empresa › Fiscal, e **número do endereço do emitente** preenchido lá.
  **Sugiro e2e (homologação) ao aplicar:** produto com NCM + cliente com endereço favorito → expedir pedido → Emitir NF-e →
  status vira 'autorizado' → baixar DANFE e XML; pedido sem NCM/sem token/sem número do emitente → erro claro; pedido em
  orçamento não mostra o card. **Próximo: 7C** — cancelamento (`DELETE /v2/nfe/:ref` + justificativa ≥15, cap reusa `fiscal.nota.emitir`).
- **2026-06-16** — **Fase 7 (Fiscal/NF-e via Focus NFe) — Entrega 7A: configuração fiscal por empresa + perfil padrão + NCM no produto (NADA emite ainda).**
  Base para a emissão (7B) e cancelamento (7C). **Decisões do Gui:** regime tributário **por empresa** (multi-tenant);
  **perfil de operação padrão + NCM por produto** (overrides opcionais p/ exceções); escopo **emitir + cancelar** (7B/7C).
  **API Focus NFe confirmada na doc:** Basic Auth (token no usuário, senha vazia); homologação `https://homologacao.focusnfe.com.br`,
  produção `https://api.focusnfe.com.br`; `POST /v2/nfe?ref=` (assíncrono) → `GET /v2/nfe/:ref` (status `autorizado` traz
  `chave_nfe`/`numero`/`serie`/`caminho_xml_nota_fiscal`/`caminho_danfe`) → `DELETE /v2/nfe/:ref` (cancelar). **Migration public 007**
  `empresa_fiscal` (1:1 com empresa via `empresa_codigo` FK ON DELETE CASCADE): `regime_tributario` (1 Simples · 2 Simples sublimite ·
  3 Normal), `ambiente` (homologacao|producao), `token_homologacao`/`token_producao` (**só no servidor**), e o **perfil padrão**
  (natureza_operacao, cfop_dentro_uf 5102, cfop_fora_uf 6102, icms_origem, csosn_padrao, cst_icms_padrao, aliquota_icms,
  pis_cst_padrao, cofins_cst_padrao). **Migration tenant 057** `produto += ncm, cfop, cst_fiscal, origem_fiscal` (NCM obrigatório só
  na emissão; overrides opcionais herdam o perfil). **Backend (hexagonal, prep p/ porta+adapter da 7B):** domínio
  `domain/fiscal/ConfigFiscal.ts` (RegimeTributario/AmbienteFiscal/PerfilFiscal + `configFiscalPadrao` + `ConfigFiscalRepository`);
  `SqlConfigFiscalRepository` (upsert ON CONFLICT em public.empresa_fiscal); `ConfigFiscalService` (valida regime∈{1,2,3},
  ambiente, CFOP 4 díg., origem 0–8, alíquota 0–100, natureza; **token em branco PRESERVA o atual** — merge). Rotas `fiscal.ts`:
  `GET /fiscal/config` (devolve config **sem os tokens**, só flags `tokenHomologacaoConfigurado`/`tokenProducaoConfigurado`) e
  `PUT /fiscal/config` — ambas gate `acesso.empresa.editar`, PUT auditado. Wiring em composition.ts + server.ts. Produto:
  `Produto`/`NovoProduto` += ncm/cfop/cstFiscal/origemFiscal; `SqlProdutoRepository` map/insert/update; `ProdutosService.validar`
  normaliza (NCM 8 díg. opcional, CFOP 4 díg., origem 0–8). **Frontend:** componente `components/ConfigFiscalCard.tsx` (carrega/salva
  `/fiscal/config`; regime, ambiente, tokens [placeholder "deixe em branco p/ manter" + selo configurado], perfil padrão; mostra
  CSOSN no Simples e CST+alíquota no Normal) embutido em **Dados da empresa**; seção **Dados fiscais** no FormProduto (NCM + overrides).
  i18n pt/en/es (`fiscal.*`, `produtos.fiscal*`/`ncm`/overrides, erros). **Sem capability nova** (reusa `acesso.empresa.editar` e
  `cadastros.produto.gerenciar`) → **não precisa relogar**. **Validação:** parse de sintaxe (TS API) limpo em todos os arquivos novos;
  hand-review da consistência (paths, wiring, ordem dos params do upsert, NovoProduto só é montado no ProdutosService). tsc do sandbox
  inútil (esbuild é binário Windows; node/bash truncam arquivos grandes do mount → falso "} expected" no tenantMigrations:801 — o
  arquivo real está íntegro, 810 linhas). **Pendente Gui:** `npm run build -w @triade/web` (tsc local = fonte de verdade) → commit+push
  (Render aplica as migrations **public 007** + **tenant 057** no boot via AUTO_MIGRATE) → `scripts\app-apk.bat` p/ APK novo (telas
  mudaram). **Setup do Gui (fora do código, p/ a 7B funcionar):** conta Focus NFe + plano NF-e, certificado **A1 (.pfx)** subido no
  painel, emitente habilitado/credenciado na SEFAZ (homologação primeiro), e colar os **tokens** em Dados da empresa › Fiscal.
  **Próximo: 7B** — porta `EmissorFiscal` + adapter `FocusNFeEmissor` (ramifica Simples→CSOSN / Normal→CST; CFOP intra/inter por UF) +
  `nota_fiscal` (tenant) + emitir/consultar/DANFE/XML no detalhe do pedido + caps `fiscal.nota.*`. **7C:** cancelamento.
- **2026-06-16** — **Fix tema escuro: linha selecionada invisível na Fluxo de caixa (e em qualquer lista que use `.linha-sel`).**
  `styles.css` `.linha-sel { background: var(--accent-soft) }` — o `--accent-soft` (#efeaff, claro) **não era
  redefinido no escuro**, então linha selecionada ficava fundo claro + texto `--ink` claro = invisível. Adicionado
  `body.theme-dark .linha-sel { background: #2b2550; }` (índigo escuro, contrasta com o texto claro, distinto do hover
  #1e2330). Só CSS, só afeta o tema escuro. **Download de Excel/comprovantes pelo app:** o **código já está correto**
  (`csv.ts`/`excel.ts`/`AnexosTitulo` → `lib/download.ts`; deps `@capacitor/filesystem`+`/share` no package.json; o
  `android/app/src/main/assets/capacitor.plugins.json` já lista os 2 plugins → `cap sync` já rodou). **A causa é o APK
  instalado ter sido gerado ANTES do sync** (o `build/intermediates/.../mergeDebugAssets/capacitor.plugins.json` só
  tinha barcode-scanning) → sem os plugins nativos o `Filesystem.writeFile`/`Share` falham e cai no fallback web que
  não baixa no WebView. **Sem mudança de código no download — só regerar o APK.** **Pendente Gui:**
  `npm run build -w @triade/web` → `scripts\app-android.bat` (APK novo resolve o tema escuro + o download).
- **2026-06-16** — **Implementado o `Info/CRM-IMPORT-PLANO.md` (tudo de uma vez): importar clientes (CSV/XLSX), leads no CRM + conversão, orçamento ligado ao pedido e alertas adaptativos.** **Migration tenant 056** (`oportunidade` += `contato`/`email`/`telefone`/`origem`; `interacao.cliente_id` vira **nullable** + `oportunidade_id` FK→oportunidade ON DELETE CASCADE). **Frente 1 — Importar clientes (sem migration):** `ClientesService.importar(schema, linhas[])` (carrega `repo.listar` 1×, dedup por **documento** [dígitos] e, na falta, por **nome**; valida via `montar`; erro por linha não aborta o lote) → `{criados, ignorados, erros[]}`; rota `POST /clientes/importar` (cap `cadastros.cliente.gerenciar`, auditada). Front: **dep nova `xlsx`** (SheetJS) no `apps/web`; componente **genérico** `components/ImportadorPlanilha.tsx` (lê CSV/XLSX no navegador, **auto-mapeia** colunas pelo cabeçalho [acento-insensível] com override manual, **prévia** + contagem de válidas, **baixar modelo** CSV, relatório de resultado); botão **Importar clientes** na `Clientes.tsx` (transforma PF/PJ, parse de moeda BR, monta endereço de cidade/UF). **Frente 2 — Leads + conversão:** domínio `Crm.ts` (Oportunidade/NovaOportunidade += contato/email/telefone/origem; Interacao/NovaInteracao com `clienteId` nullable + `oportunidadeId`; tipos novos `ResultadoImportacao`, `AlertaCliente`, `RelatorioAlertas`, `RitmoCliente`); repo += `vincularCliente`, `listarInteracoesOportunidade`, `migrarInteracoesParaCliente` (criar/interação atualizados p/ as colunas novas). `CrmService` (injeta `ClienteRepository`): `importarLeads` (dedup nome+telefone, cria oportunidades estágio `lead`), `criarInteracao` aceita `oportunidadeId` **ou** `clienteId`, `converterEmCliente(oppId)` (cria cliente PJ, `vincularCliente`, migra interações). Rotas `POST /crm/leads/importar`, `PATCH /crm/oportunidades/:id/converter`, `GET /crm/oportunidades/:id/interacoes`, `GET /crm/alertas`. Front `Crm.tsx`: campos de contato/origem no modal de oportunidade; **Importar leads**; **Converter em cliente** + **Registrar interação** nos cards de lead; tag "Lead". **Frente 3 — Orçamento pelo CRM (já estava quase pronto):** `gerarOrcamento` agora **converte o lead** antes de navegar; `NovoPedido` já lia `?cliente=`/`?oport=` e vinculava via `PATCH /crm/oportunidades/:id/orcamento`. **Frente 4 — Alertas adaptativos (sem migration):** `CrmService.alertas(schema,{k,limite,inativoDias})` usa `vendasPorCliente()` (data+total): por cliente calcula ciclo/ritmo (semanal ≤10d / quinzenal ≤20d / mensal ≤45d / esporádico) e **janela = clamp(K×ciclo, 14, 180)** (K=4 default); compara **valor/frequência** em [hoje−janela] vs [hoje−2janela]; retorna 3 seções **Em queda** (queda de valor/freq ≤ −limite, default 30%), **Recompra atrasada**, **Inativos** (>inativoDias, default 90). Painel "Alertas do comercial" no topo do CRM com ações **Registrar contato** / **Gerar orçamento** por cliente. **Sem caps novas** (reusa `comercial.crm.*` e `cadastros.cliente.*`). i18n pt/en/es (`import.*`, `clientes.importar`, `crm.contato/origem/lead_tag/converter/importar_leads/alertas*/al_*/ritmo.*`). **Validação:** hand-review pelo file-tool (sandbox tsc inútil de novo — truncagem do mount gera "unterminated string/template" falsos; ex.: tenantMigrations:686, CrmService:130). **Pendente Gui:** `npm install` (raiz — relink `@triade/shared` + baixa `xlsx`) → `npm run build -w @triade/web` (tsc local é a fonte de verdade) → commit+push (Render aplica a **056** no boot via AUTO_MIGRATE) → relogar **não** é obrigatório → `scripts\app-android.bat` p/ APK novo (telas mudaram). **Sugiro e2e ao aplicar:** importar CSV e XLSX de clientes (dedup por documento; erros por linha); importar leads → coluna Lead; registrar interação num lead; Converter em cliente preserva interações; Gerar orçamento de um lead converte e abre o pedido vinculado; cliente semanal que parou aparece em queda/atrasado e um mensal não dispara por 1 semana.

- **2026-06-16** — **Lote: senha provisória (1º login) + acesso multi-empresa pelo super-admin + sem-dashboard vai à 1ª tela + grupo Relatórios contábeis + dashboard de Disponibilidade + fix Excel/comprovantes no app (Capacitor).** Seis frentes. **(1) Senha provisória:** **migration tenant 055** (`usuario.trocar_senha` bool default false); domínio/repo/`UsuariosService.criar` (+`NovoUsuario.trocarSenha` + `definirTrocarSenha`), login (`AutenticarSaida.trocarSenha`) e `/me` devolvem o flag; ao trocar a senha (`/auth/senha` e reset por e-mail) o flag é **zerado**. Front: checkbox **pré-marcado** "Exigir troca de senha no próximo acesso" no cadastro; `AuthContext` guarda `trocarSenha` + `limparTrocarSenha`; `Layout` mostra `TrocarSenha obrigatorio` (sem cancelar) bloqueando o sistema até a troca. **(2) Acesso multi-empresa (super-admin):** novo use case `AcessoMultiEmpresa` (`situacao(email)`/`sincronizar`): percorre os tenants ativos, **cria/reativa** o mesmo e-mail nas empresas marcadas e **inativa** nas desmarcadas, **mesma senha** entre empresas (reusa o login multi-empresa existente) e **perfil resolvido pelo nome** em cada empresa. Rotas super-admin `GET/PUT /superadmin/usuarios/acessos`. Front: na tela Usuários, botão **Acesso multi-empresa** + ícone por linha → modal (e-mail, nome, perfil por nome, senha provisória opcional, exigir troca, checklist de empresas). **(3) Sem dashboard → 1ª tela:** `lib/primeiraRota.ts` (`primeiraRotaAcessivel`) + `PainelInicial` redireciona quem não tem `dashboard.ver` para a 1ª tela acessível (ou "sem telas"). **(4+5) Relatórios contábeis:** caps novas `relatorios.contabil.{pagar,receber,vendas}.ver` (módulo `cap.modulo.relatorios_contabil`), novo grupo **Contábil** no hub com os 3 (Contas a pagar/receber + Vendas contábil), gate das rotas trocado, e os endpoints de dados (`/financeiro/pagar`, `/financeiro/receber`, `/relatorios/vendas-contabil`) passaram a **aceitar any-of** [cap financeira OR cap contábil] p/ não 403. Adicionadas ao perfil **Financeiro** padrão (o `garantirPerfisPadrao` injeta no boot via ON CONFLICT) + Administrador (sync). **(6) Dashboard de disponibilidade:** nova página `/estoque/disponibilidade` (menu Estoque/Expedição, cap `estoque.saldo.ver` — sem cap nova) reusando `GET /estoque` (saldo·reservado·disponível·mínimo), KPIs + tabela + CSV/Excel. **Fix Excel/comprovantes no app (Capacitor):** o download via `<a download>`/`window.open(blobUrl)` **não funciona no WebView Android** — criado `lib/download.ts` (`baixarArquivo`/`abrirArquivo`): no app nativo grava no **Filesystem** e abre via **Share**; na web segue âncora/nova aba. `excel.ts`/`csv.ts`/`AnexosTitulo` passam por ele. **Dep nova:** `@capacitor/filesystem@^8.1.2` + `@capacitor/share@^8.0.1` → exige `npm install` + `cap sync`. i18n pt/en/es de tudo. **Validação:** hand-review pelo file-tool (sandbox trunca arquivos grandes — tsc local é a fonte de verdade). **Pendente Gui:** `npm install` (raiz, relink shared + plugins) → `npm run build -w @triade/web` → commit+push (Render aplica a 055 + caps no boot) → **relogar** → `scripts\app-android.bat` p/ APK novo (testar Excel + abrir comprovante no app). **Sugiro e2e ao aplicar:** criar usuário com troca obrigatória → 1º login força troca; super-admin vincula 1 e-mail a 2 empresas e alterna; usuário só-relatório-contábil abre as telas sem 403; usuário sem dashboard cai na 1ª tela.

- **2026-06-16** — **Relatório Contas a receber (contábil) + multi-empresa por login.** Duas frentes, **sem migration,
  sem dep nova.** **(1) Relatório a receber (contábil):** espelha o de a pagar — nova página
  `RelContasReceberContabil.tsx` (endpoint `GET /financeiro/receber`; **filtra/exibe por emissão** [competência;
  `emissao ?? criadoEm`], colunas nº/descrição/categoria/**Cliente**/Emissão/Vencimento/valor/situação/**Anexos**; KPIs
  Total a receber [abertos] + Recebido [pagos] + nº de títulos; botão 📎 abre o `AnexosTitulo` [gate
  `financeiro.receber.gerenciar`]; CSV/Excel). Rota `/relatorios/contas-receber` (cap `financeiro.receber.listar`) +
  entrada no hub de Relatórios (grupo Financeiro). i18n `relcr.*` + `menu.rel_contas_receber` pt/en/es (reusa
  `relcp.anexos/anexar/emissao_de/categoria/titulos`). **(2) Multi-empresa por login (lógica do super-admin p/ usuário
  comum):** um login (mesmo e-mail) presente em vários tenants passa a **ver e trocar entre as empresas dele** (só as
  dele), igual o super-admin troca entre todas. **Backend:** `AutenticarUsuario.executar` — quando o login é sem
  `codigoEmpresa`, percorre os tenants ativos e entra no 1º onde o e-mail é **usuário ativo E a senha confere** (funciona
  com a mesma senha entre empresas); `AutenticarSaida` += `empresas[]`; novos `empresasDoUsuario(email)` (lista os tenants
  ativos onde o e-mail é ativo) e `trocarEmpresaUsuario(email, codigo)` (valida pertencimento → emite novo token, não
  super-admin). Rota `POST /auth/trocar-empresa` agora **sem** `exigirSuperAdmin`: super-admin → `trocarEmpresa`; comum →
  `trocarEmpresaUsuario(u.email, codigo)`. `/me` devolve `empresas` (vazio p/ super-admin). **Frontend:** `AuthContext`
  guarda/propaga `empresas` (login, troca, revalidação no reload; `trocarEmpresa` agora usa o `superAdmin` real do `/me`);
  `EmpresaSwitcher` aparece p/ super-admin **OU** login com **2+ empresas** (`empresas` do contexto). **Validação:** tsc
  do sandbox inútil de novo (truncagem → TS1005/TS1160 falsos em dezenas de arquivos não tocados); hand-review pelo
  file-tool (AutenticarUsuario íntegro). **Pendente:** Gui build web + commit+push (Render aplica o backend) + APK.
  **Sem caps novas, sem relogar obrigatório** (mas relogar recarrega `empresas` no `/me`). **Nota:** para o usuário ver
  2 empresas, o **mesmo e-mail** precisa existir como usuário ativo (com a mesma senha) em cada tenant.
- **2026-06-16** — **Anexos: contador no Contas + ver documentos pelos relatórios contábeis + relatório a pagar por emissão.**
  **(1)** `Titulo` += `anexosCount` (subquery no `SqlTituloRepository.listar`); no Contas a receber/pagar o botão 📎
  mostra a contagem e destaca quem tem documento. **(2)** **RelContasPagarContabil** passou a **filtrar/exibir por
  emissão** (competência; `emissao ?? criadoEm`) em vez de vencimento — col. Emissão + Vencimento; ganhou coluna
  **Anexos** com botão que abre o modal `AnexosTitulo` (ver/baixar/anexar) ali mesmo; CSV inclui emissão + nº de anexos.
  **(3)** **RelVendasContabil**: `vendasContabil` agora traz `tituloId` (título a receber do pedido, 1º por vencimento)
  + `anexosCount`; coluna Anexos com o mesmo modal (gate `financeiro.receber.gerenciar`). i18n `relcp.anexos/anexar/
  sub_emissao/emissao_de` pt/en/es. **Sem migration, sem dep nova.** **Validação:** tsc da API limpo. **Pendente:**
  Gui build + commit+push + APK. **Nota:** pedido parcelado → o 📎 do relatório de vendas abre o 1º título a receber.
- **2026-06-16** — **Fix upload de anexo (checksum R2) + endereço completo do fornecedor.** **(1)** O upload de anexo
  dava erro genérico: o `@aws-sdk/client-s3` recente manda checksum CRC32 que o R2 recusa → adicionado
  `requestChecksumCalculation:'WHEN_REQUIRED'` + `responseChecksumValidation:'WHEN_REQUIRED'` no `R2Storage`. **(1b)**
  Causa REAL do erro no Gui: `R2_ACCOUNT_ID` no Render estava com a URL completa → endpoint virava `https://https://…` →
  `getaddrinfo ENOTFOUND triade-anexos.https`. `R2Storage` agora **normaliza** o accountId (tira `https://` e
  `.r2.cloudflarestorage.com`). Fix imediato p/ o Gui: pôr só o ID na var (sem deploy). **(2)**
  Endereço completo do **fornecedor** (antes só CEP/cidade/UF): **migration tenant 054** (`fornecedor` += logradouro,
  numero, complemento, bairro); domínio/repo/`FornecedoresService` repassam; preenchimento por **CEP (ViaCEP)** já fixa
  logradouro/bairro. Campos adicionados na **tela de Fornecedores** e no **mini-modal de cadastro rápido** (`SeletorPessoa`).
  Cliente já tinha endereço completo (multi-endereço) — inalterado. i18n `clientes.complemento` pt/en/es (logradouro/numero/
  bairro já existiam). **Validação:** tsc da API limpo. **Pendente:** Gui build + commit+push (Render aplica 054) + APK.
- **2026-06-16** — **Anexos de documentos nos títulos (Cloudflare R2).** Permite anexar NF/conta de energia/etc. a um
  título (a receber/pagar) — para o fechamento contábil. **Dependência nova:** `@aws-sdk/client-s3` (R2 é S3-compatível)
  → exige `npm install`. **Migration tenant 053:** `titulo_anexo` (titulo_id FK CASCADE, nome_arquivo, tipo, tamanho,
  chave R2, usuario_nome, criado_em). **Backend:** porta `ArquivoStorage` + adapter `R2Storage` (`infra/storage`, monta
  o endpoint a partir do `R2_ACCOUNT_ID`; **sem as 4 vars → `configurado()=false`, recurso desligado**, não quebra nada);
  domínio `TituloAnexo`/repo; `AnexosService` (valida tipo PDF/JPG/PNG/WEBP + limite 10 MB; gera chave
  `schema/titulos/<id>/<uuid>-nome`; upload/baixar/remover). Rotas (gate any-of `financeiro.{receber,pagar}.{listar|gerenciar}`):
  `GET /anexos/habilitado`, `GET/POST /financeiro/titulos/:id/anexos`, `GET /financeiro/anexos/:id/conteudo` (stream),
  `DELETE /financeiro/anexos/:id`. **Upload passa pela API** (base64 → R2; `express.json` subiu p/ **15mb**) e **download
  por fetch autenticado → blob** (sem CORS no bucket, sem presign). Auditoria registra anexar/remover. **Frontend:**
  `components/AnexosTitulo.tsx` (modal: lista, enviar via FileReader→base64, ver/baixar via `api.blob`, remover) + botão
  📎 (`i-clip`) na coluna de ações do Contas a receber/pagar. `api.blob` novo no client. i18n `anexo.*` + `common.excluir`
  pt/en/es. CSS `.anexo-*`/`.btn-mini`. **Setup do Gui (R2):** bucket `triade-anexos` + API token (Object R/W) + as 4 vars
  no Render (`R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET`). **CORS no bucket dispensado** (upload
  via API). **Validação:** tsc da API limpo (só `@aws-sdk` não-instalado no sandbox + `@triade/shared` + Metas). **Pendente:**
  Gui `npm install` + build + commit+push (Render aplica 053) + setar as 4 vars no Render + APK. **Decidido:** sem coluna
  de contagem "(N)" por enquanto (fica fácil de adicionar depois via subquery no `titulo.listar`).
- **2026-06-16** — **Auditoria: menos ruído + descrições mais ricas.** Middleware passou a **ignorar** endpoints que não
  alteram dados (`/frete/calcular`, `/frete/cobrado`, `/auth/trocar-empresa`) — some o "Criou frete/calcular". **Nota de
  entrada** agora descreve fornecedor + NF + valor; **recebimento** descreve produto + qtd + fornecedor (`recebimentoRepo`
  exposto nas deps). Só backend, sem migration. **Pendente:** Gui commit+push. (Decisão R2: uploads vão **passar pela API**
  → **dispensa CORS no bucket**; só precisam das 4 vars no Render: Account ID, Access Key, Secret, bucket.)
- **2026-06-16** — **Fix: entrada manual de estoque grava fornecedor/NF/emissão na etiqueta + responsável do inventário = usuário logado.**
  **(1)** A consulta de etiqueta mostrava Fornecedor/NF/Emissão "—" para etiquetas que entraram pela **Entrada de estoque
  manual** (bipagem): o `EstoqueService.entrada` chamava `registrarEntrada` **sem** repassar esses campos (o fluxo de
  Nota de entrada já repassava). Corrigido: `entrada` agora passa `fornecedor`/`nf`/`emissao` (normalizados); a tela
  `EntradaEstoque` ganhou 3 campos **opcionais** (Fornecedor, Nº NF, Emissão). Vale para entradas novas (as antigas
  seguem "—"). **(2)** No Inventário, o **responsável** agora é **sempre o usuário logado**: a rota `POST /inventario`
  força `responsavel: req.usuario.nome` (ignora o corpo); a tela mostra o campo **desabilitado** com o nome do usuário.
  i18n `entrada.fornecedor/nf/emissao*`/`inv.responsavel_auto` pt/en/es. **Sem migration.** **Validação:** tsc da API
  limpo. **Pendente:** Gui build + commit+push + APK.
- **2026-06-15** — **Auditoria rica (descrições humanas + antes→depois).** O log de auditoria deixou de mostrar
  `método + caminho` cru. **Migration tenant 052:** `log_acao` += `descricao`/`entidade`/`referencia`. **Infra:**
  helper `auditar(req, {descricao, modulo, entidade, referencia})` (`interface/http/audit.ts`, anexa `req.audit`);
  o **middleware** `criarAuditoria` grava a descrição rica quando a rota a anexa, senão um **fallback genérico
  legível** (verbo + caminho sem UUID via regex). `interface/http/fmt.ts` (`brl`/`dataBR`). Repos expostos nas deps
  (`tituloRepo`/`clientesRepo`/`produtosRepo`/`precoBaseRepo`/`pedidoRepo`) p/ as rotas resolverem nomes/valores.
  **Rotas instrumentadas com texto rico** (com **antes→depois** onde cabe): **Preços** (base de→para, por cliente,
  campanha de preço), **Frete** (campanha), **Financeiro** (criar/baixar/cancelar baixa/excluir título, com nº REC/PAG
  + valor + pessoa), **Comercial** (criar pedido PE-xxxx + cliente + total; mudar status de→para), **Cadastros**
  (cliente/fornecedor/vendedor criar/editar/inativar; **limite de crédito de→para** no cliente), **Segurança**
  (usuário criar/editar/inativar/senha). **Ampliado depois:** Financeiro (previsto/reembolso/parcelar/multiplicar/
  conferência/nota), Estoque (inventário/recebimento), Empresa (branding). O **fallback genérico ficou inteligente**
  (mapa de rótulo por recurso + `body.nome` → ex.: "Criou banco: Itaú", "Inativou condição de pagamento"), cobrindo os
  cadastros menores sem instrumentar um a um. Tudo o que sobra ainda cai no verbo+caminho legível. **Tela Auditoria:**
  mostra `descricao` (fallback verbo+caminho) e o **CSV exporta a descrição**. `SqlLogAcaoRepository.listar` += `descricao`.
  **Validação:** tsc da API limpo (0 erros de tipo reais). **Pendente:** Gui build + commit+push → Render aplica a 052
  + APK. **Sem permissão nova.** **Nota:** as descrições são geradas em pt-BR no servidor (dado operacional, não i18n).
- **2026-06-15** — **Frete (cobrado×custo) + campanhas de frete + vendas sem frete + relatórios contábeis + histórico de preço por cliente + auditoria.** Lote grande (tudo numa entrega). **Migration tenant 051:** `pedido.frete_custo`
  (backfill = frete), tabelas `frete_campanha` (cliente, tipo gratis|fixo|percentual, valor, motivo, de, ate),
  `preco_cliente_historico` (preço/tipo/vigência + usuario_id/nome + criado_em), `log_acao` (auditoria). **(1) Bug nome
  produto:** dashboard "Produtos mais vendidos" (`SqlDashboardRepository.top`) passou a usar o **nome atual** do produto
  (JOIN `produto`, snapshot só reserva). **(2) Indicadores sem frete:** todas as somas de venda do dashboard/série/drill
  trocaram `SUM(total)`→`SUM(subtotal)` (financeiro de títulos inalterado). **(3) Frete cobrado×custo:** `pedido.frete` =
  COBRADO do cliente (entra no total); `frete_custo` = custo real; `PedidosService.montar` trata o frete informado como
  custo e resolve o **cobrado** pela campanha vigente do cliente (`FreteCampanhaRepository.freteCobrado`); absorvido =
  custo−cobrado. Domínio `FreteCampanha`/repo/`FreteCampanhasService`, rotas `/frete/campanhas` (GET/POST/DELETE, cap
  `logistica.frete.*`), tela `CampanhasFrete` (Logística). **(4) Frete no Contas a receber:** `SqlTituloRepository.listar`
  estendeu o JOIN do pedido → `Titulo.pedidoFrete`/`pedidoFreteTipo`; coluna **Frete** na tela (receber). **(5) Relatórios
  contábeis:** `RelVendasContabil` (venda/frete cobrado/custo/absorvido/tipo/total, backend `vendasContabil`) e
  `RelContasPagarContabil` (reusa `/financeiro/pagar`); ambos no hub de Relatórios, CSV/Excel. **(6) Histórico preço
  cliente:** `preco_cliente_historico` gravado no `definirCliente` com usuário/hora; `GET /precos/cliente/:id/historico`;
  botão **Histórico** + modal no modo "Por cliente" da Tabela de preço. **(7) Auditoria geral:** **middleware único**
  (`criarAuditoria`) registra toda alteração (POST/PUT/PATCH/DELETE 2xx) em `log_acao` (usuário/método/caminho/módulo);
  `SqlLogAcaoRepository` + rota `/auditoria` (cap `acesso.usuario.listar`) + tela **Auditoria** (Configurações, filtros
  usuário/módulo/período + CSV). i18n pt/en/es (`relvc.*`/`relcp.*`/`fretecamp.*`/`precohist.*`/`audit.*`/`frete.entrega_*`).
  **Sem capability nova** (reusa logistica.frete/relatorios/financeiro/acesso) → **não precisa relogar**. **Validação:**
  **tsc da API limpo** (0 erros de tipo reais; só `@triade/shared` não-resolvido no sandbox + aviso pré-existente do
  MetasService); web por hand-review (sandbox trunca). **Pendente:** Gui `npm install` + build + commit+push → Render
  aplica a **051** + **APK novo**. **Polimento FEITO:** no NovoPedido, endpoint `GET /frete/cobrado` (cap
  `comercial.pedido.criar`) resolve o frete cobrado da campanha vigente; a tela mostra **custo × cliente paga ×
  absorvido** e o **total usa o cobrado** (corrige o total exibido quando há campanha; o backend já reaplicava).
  **Sugiro e2e ao aplicar:** campanha grátis zera o frete
  cobrado mantendo o custo; relatório contábil bate venda/frete; histórico registra usuário/hora; auditoria registra um POST.
- **2026-06-15** — **Segurança: corrigida a vulnerabilidade do esbuild (npm audit "2 high") subindo a Vite 5→8.** As 2
  "high" eram do **esbuild** (transitivo da Vite, ferramenta de build): falhas do **dev server** (SSRF + leitura de
  arquivo no Windows) + uma específica de Deno — **zero impacto em produção** (Cloudflare serve estático; API não usa
  esbuild em runtime). Só a **Vite 8** zera o audit (6/7 ainda trazem esbuild ≤0.28; forçar esbuild 0.28.1 via
  `overrides` na Vite 5 **quebra o build** — testado). `apps/web/package.json`: `vite ^5.4.10→^8.0.0`,
  `@vitejs/plugin-react ^4.3.3→^5.2.0` (react 18/tsc inalterados). **Vite 8 exige Node ≥20.19/≥22.12** → criado
  **`.nvmrc` = 22** na raiz (o Cloudflare Pages lê o `.nvmrc` no build; o Gui precisa de Node compatível local também).
  Config da Vite é trivial (plugin-react + proxy /api) → migra limpo. **Validação:** projeto isolado em /tmp com a mesma
  config (vite ^8 + plugin-react ^5.2.0 + react 18) → `npm install` limpo, **`npm audit` = 0 vulnerabilities**, `vite
  build` OK. Build do app real não roda no sandbox (node_modules Windows) → validar no build local/Cloudflare.
  **Pendente:** Gui `npm install` (regenera o package-lock) + `npm run build -w @triade/web` (validar) + commit+push.
  **Reverter se quebrar:** `git checkout -- apps/web/package.json package-lock.json` e voltar vite 5.
- **2026-06-15** — **Vendedor só inclui pedido para si (vínculo login↔vendedor + permissão).** Migration tenant **050**
  `usuario.vendedor_id` (FK→vendedor, ON DELETE SET NULL). Permissão nova **`comercial.pedido.vendedor_qualquer`**
  ("Escolher qualquer vendedor no pedido", módulo Comercial) — vai pro Administrador no boot e pros perfis padrão
  Diretor (TODAS) e **Comercial**; quem não tem fica restrito. **Backend:** `Usuario`/`UsuarioResumo` += `vendedorId`
  (+ `vendedorNome` no resumo via JOIN); `SqlUsuarioRepository` grava/lê; `UsuariosService.criar/editar` e rotas
  `/usuarios` aceitam `vendedorId`; `/me` devolve `vendedorId`+`vendedorNome` (via `vendedoresRepo`, exposto nas deps).
  **Regra (`PedidosService`):** injeção de `usuariosRepo`; `criar/editar` recebem `AtorPedido {usuarioId, superAdmin}`
  (passado pela rota a partir do token); `resolverVendedor`: super-admin OU quem tem a cap → vendedor livre (do corpo);
  **sem a cap e vinculado a um Vendedor → FORÇA o próprio** (ignora o corpo, vale via API); sem a cap e sem vínculo →
  livre (não quebra quem já usa). **Frontend:** `Usuários` ganhou select **"Vendedor vinculado"**; `AuthContext`/`/me`
  guardam `vendedorId`/`vendedorNome`; `NovoPedido` — quando `!temCapability('comercial.pedido.vendedor_qualquer') &&
  usuario.vendedorId`, o campo Vendedor vira **travado** (input desabilitado com o nome do próprio + hint) e força o id;
  senão, dropdown normal. i18n `usuarios.vendedor*`/`pedidos.vendedor_travado|_voce`/`cap.comercial.pedido.vendedor_qualquer`
  pt/en/es. **Validação:** tsc da API sem erros de tipo reais (só truncagem do mount nos arquivos grandes + `@triade/shared`
  não-resolvido + aviso pré-existente do MetasService); hand-review. **Pendente:** Gui `npm install` (relink shared) +
  build + commit+push → Render aplica a 050 + sincroniza a cap no Administrador + **relogar** (carrega a cap + `/me` com
  vendedor) + **APK novo**. **Setup pelo Gui:** em Usuários, **vincular cada login de vendedor ao seu cadastro de Vendedor**
  (é o que ativa a trava); dar a cap "qualquer vendedor" só a quem pode lançar por outros (Admin/Comercial já têm).
  **Sugiro e2e ao aplicar:** vendedor vinculado sem a cap → pedido sai com ele mesmo (mesmo mandando outro id no corpo);
  com a cap → escolhe qualquer; sem vínculo → livre.
- **2026-06-15** — **Esqueci a senha (real) + notificação ao autor do chamado (e-mail + sino).** Três frentes.
  **(A) E-mail ao autor na mudança de status:** `SuporteService.mudarStatus` agora carrega o chamado e, ao virar
  **em_andamento** ou **resolvido**, envia e-mail ao `usuarioEmail` (`notificarUsuario`, best-effort). Sem migration.
  **(B) Esqueci a senha:** migration public **006** `reset_senha` (token_hash, email, schema_name [null=super-admin],
  usuario_id, expira_em, usado_em). Domínio `ResetSenha`/`ResetSenhaRepository` (`domain/auth`), `SqlResetSenhaRepository`
  (public). Use case `RecuperarSenha` (`application/auth`): `solicitar(email)` acha super-admin OU usuário ativo de
  algum tenant (reusa a descoberta do login), gera token aleatório (`randomBytes(32)`), guarda só o **sha256** com
  validade **1h**, e envia e-mail com link `${APP_URL}/redefinir-senha?token=...` — **sempre responde neutro** (não
  revela se o e-mail existe). `redefinir(token,novaSenha)` valida (hash, não expirado, não usado), troca a senha
  (super-admin→`atualizarSenha`; tenant→`definirSenha`) e marca **usado** (uso único). `env.appUrl` (`APP_URL`).
  Rotas públicas `POST /auth/esqueci-senha` (reusa rate-limit do login) e `POST /auth/redefinir-senha`. Frontend:
  `ModalRecuperar` (Login) chama a rota de verdade; página pública `pages/RedefinirSenha.tsx` (rota `/redefinir-senha`,
  lê `?token=`, nova senha + confirmar). **(C) Sino + Meus chamados:** `ChamadoRepository.listarPorUsuario` +
  `GET /suporte/meus` (qualquer logado, filtra por email+empresa do token); página `pages/MeusChamados.tsx` (rota
  `/meus-chamados`); **Sino** ganhou grupo "Seus chamados atualizados" (conta os em_andamento/resolvido que mudaram
  vs. snapshot `localStorage triade_chamados_vistos`; zera ao abrir Meus chamados); link "Ver meus chamados" no modal
  de Suporte. CSS `.reset-page/.reset-card`; i18n `reset.*`/`meuschamados.*`/`sino.chamados_atualizados`/`suporte.ver_meus`/
  `auth.reset_invalido` pt/en/es. `emailSender` hoisted no `composition.ts` (reusado por Suporte + RecuperarSenha).
  `.env.example` += `APP_URL`. **Validação:** tsc do sandbox inútil de novo (truncagem → "} expected" no fim dos
  arquivos grandes; os arquivos novos do reset compilaram limpos) + hand-review pelo file-tool. **Pendente:** Gui
  commit+push (Render aplica a migration 006 no boot) + **setar `APP_URL` no Render** (= URL do site) + APK novo
  (telas mudaram). Sem caps novas (não precisa relogar). **Sugiro e2e ao aplicar:** esqueci-senha gera token e e-mail;
  redefinir troca a senha e invalida o token (2º uso → 400); token expirado → 400; mudança de status dispara e-mail
  ao autor; `GET /suporte/meus` só traz os do próprio usuário.
- **2026-06-15** — **Suporte: print anexado no e-mail de notificação.** O `notificar()` agora **anexa a imagem** do
  print ao e-mail (Resend `attachments`): `EmailSender.MensagemEmail` += `anexos[]` (`AnexoEmail{nomeArquivo,
  conteudoBase64}`), `ResendEmailSender` mapeia p/ `attachments`, e `printComoAnexo()` no `SuporteService` converte o
  data URI (`data:image/...;base64,...`) em anexo (nome `print-chamado.<ext>`, jpeg→jpg). Antes só avisava que havia
  print. Só backend. **Pendente:** Gui commit+push (Render redeploia).
- **2026-06-15** — **Suporte: colar/arrastar print no modal de chamado.** O campo de print do `Suporte.tsx` virou uma
  **zona única**: colar (Ctrl+V, `onPaste` no modal — só intercepta se há imagem, texto colado na descrição segue
  normal), **arrastar** (`onDrop`/`onDragOver`, com realce `.arrastando`) ou **Anexar imagem** (input file). Helper
  `carregarImagem(File)` valida `image/*` + ~2,8MB e converte em data URI; miniatura + remover. CSS `.suporte-drop*`/
  `.suporte-print-row`; i18n `suporte.print_zona` pt/en/es. Só frontend. **Pendente:** Gui build + commit+push + APK.
- **2026-06-15** — **Suporte etapa 2: infra de e-mail (Resend) + notificação de chamado por e-mail.** Liga o gancho
  `notificar()` do `SuporteService`: ao abrir um chamado, dispara e-mail ao admin do sistema. **Porta** `EmailSender`
  (`domain/ports/EmailSender.ts`: `enviar({para,assunto,html,texto})`) — domínio agnóstico ao provedor. **Adapter**
  `ResendEmailSender` (`infra/email/`) via **fetch nativo** (sem dependência nova — `fetch` já tipado por
  `types:["node"]` e usado no `FreteService`); **sem `RESEND_API_KEY` vira no-op** (loga e segue → dev/local não
  quebra) e nunca lança (best-effort). **`env.ts`** += `resendApiKey`/`emailFrom` (default
  `TRIADE ERP <notificacoes@triadeerp.com.br>`)/`suporteEmailDestino` (default `admin@triadeerp.com.br`). `SuporteService`
  recebe `EmailSender?`+`destino?` e o `notificar()` monta HTML+texto (tipo, assunto, descrição, empresa, usuário,
  tela/versão; avisa se há print) e envia. Wiring no `composition.ts`. `.env.example` documentado. **Sem migration,
  sem mudança de frontend.** **Setup externo feito pelo Gui (fora do código):** (1) **Cloudflare Email Routing** —
  `admin@triadeerp.com.br` encaminha p/ o Gmail pessoal (recebimento); (2) **Resend** — domínio verificado + API key;
  (3) **Render** — vars `RESEND_API_KEY`, `EMAIL_FROM`, `SUPORTE_EMAIL_DESTINO`. **Validação:** tsc do sandbox inútil
  (truncagem do mount → "} expected" no fim dos arquivos); confirmado `fetch` ok (FreteService já usa) + hand-review.
  **Pendente:** Gui commit+push → Render redeploia (lê as vars novas). **Próximo (sugestão):** "Esqueci a senha" real
  reusa essa infra (token de reset + página de nova senha).
- **2026-06-15** — **Suporte: abertura de chamados (in-app) + tela do super-admin.** Qualquer usuário logado abre um
  chamado pelo **"Suporte"** do rodapé do menu (que virou clicável); o **administrador do sistema (super-admin)** vê
  todos numa tela só. **Banco — migration public 005** (`public.chamado_suporte`: tipo erro/sugestao/duvida, assunto,
  descricao, **print** text [data URI], tela, versao, empresa_codigo, usuario_nome/email, status aberto/em_andamento/
  resolvido, criado_em, resolvido_em + índice por status). Tabela no **public** (não no tenant) p/ o super-admin ver
  todas as empresas; fantasia vem via LEFT JOIN `public.empresa`. **Backend (hexagonal):** domínio `Chamado`/
  `ChamadoRepository` + `TIPOS_CHAMADO`/`STATUS_CHAMADO` (`domain/superadmin/Chamado.ts`); `SqlChamadoRepository`
  (public); `SuporteService` (`abrir` valida tipo/assunto≥3/descrição≥3 + normaliza print ~2,8MB como a foto de
  usuário; `listar`; `contarAbertos`; `mudarStatus`; **gancho `notificar()` vazio** p/ a etapa 2 de e-mail). Rotas:
  `POST /suporte` (qualquer logado — empresa/usuário vêm do **token**, não do corpo), `GET /suporte` +
  `GET /suporte/abertos` + `PATCH /suporte/:id/status` (`exigirSuperAdmin`). Wiring em `composition.ts` + `server.ts`.
  **Frontend:** `components/Suporte.tsx` (modal: tipo Erro/Sugestão/Dúvida, assunto, descrição, **anexo de print** via
  FileReader→data URI com miniatura/remover; envia `tela`=pathname + `versao`); rodapé do `Layout` clicável
  (`sidebar-foot-btn`) abre o modal; página `pages/ChamadosSuporte.tsx` (super-admin: KPIs aberto/andamento/resolvido,
  chips de filtro, tabela, modal de detalhe com contexto + print + mudar status); rota `/superadmin/chamados`
  (`soSuper`) + item no menu **Super-admin** + destino na **BuscaGlobal**; **Sino** ganhou grupo "Chamados de suporte
  abertos" (só super-admin, via `/suporte/abertos`). CSS `suporte-*`/`sup-*`/`pill-erro|aviso|info|neutro` (+ dark) no
  `styles.css`. i18n `suporte.*`/`chamados.*`/`menu.chamados`/`sino.chamados_suporte` pt/en/es. **Sem capability nova**
  (gate pela flag `superAdmin` → **não precisa relogar**). **E-mail ao admin: fica p/ etapa 2** (exige infra de e-mail
  — provedor + var no Render; o mesmo destrava o "Esqueci a senha"); o gancho `notificar()` já está no lugar.
  **Validação:** type-check do sandbox inútil de novo (mount trunca → "unterminated string"/"JSX sem fechamento" nos
  arquivos grandes; o tsc da API confirmou **0 erros nos arquivos novos** — só o `@triade/shared` não-resolvido
  [I/O error no symlink] e o aviso pré-existente do `MetasService`); hand-review pelo file-tool. **Pendente:** Gui
  `npm install` (relink shared) + build + commit+push → Render aplica a migration 005 no boot (`AUTO_MIGRATE`) +
  **APK novo** (telas mudaram). **Sugiro e2e ao aplicar:** abrir chamado como usuário comum; super-admin lista/conta/
  muda status; não-super-admin recebe 403 em `GET /suporte`.
- **2026-06-14** — **Reembolso a terceiro (favorecido) no Contas a pagar.** Um título a pagar pode ser marcado como
  **reembolso a terceiro** (pago por um favorecido no cartão dele; a empresa reembolsa). Modelo de **um título só**:
  o título representa o que a empresa deve ao favorecido — **em aberto = a reembolsar**, **baixa = reembolso**
  (entra no fluxo de caixa). Migration tenant **049** (`titulo.favorecido_forma`, `titulo.favorecido_pago_em`;
  `favorecido_id` já existia). **Backend:** `Titulo`/`NovoTitulo` += `favorecidoForma`/`favorecidoPagoEm`;
  `SqlTituloRepository` map/criar + `definirReembolso` (set/clear favorecido + forma + data pagamento + vencimento);
  `FinanceiroService.criar` aceita os campos; `definirReembolso` (só tipo pagar); rota `PATCH /financeiro/pagar/:id/
  reembolso`. **Frontend:** ModalNovo (a pagar) ganhou **checkbox "Reembolso a terceiro"** que revela favorecido +
  forma do favorecido + data do pagamento pelo favorecido + data de reembolso (= vencimento, rótulo muda); ação na
  linha do Contas a pagar (`ModalReembolso`) p/ **alternar em título existente a qualquer momento**; a tela
  **Reembolsos a favorecidos** (`RelFavorecidos`) virou **controle por favorecido** (KPIs a reembolsar/reembolsado/
  nº terceiros, agrupado por terceiro, com saldo) e botão **Reembolsar** (`ModalReembolsar`: banco + data + forma →
  baixa o mesmo título via `/financeiro/pagar/:id/baixar`, reflete no Contas a pagar e no fluxo de caixa). i18n
  `fin.reembolso*`/`relfav.*` pt/en/es. Conceito confirmado pelo Gui: todo título entra no fluxo (aberto pelo
  vencimento = data de reembolso; baixado pela baixa). **Pendente:** Gui build + commit+push → Render aplica 049 +
  APK novo. Sem caps novas (não precisa relogar).
- **2026-06-14** — **Toast "pedido liberado para separação" + grupo no Sino.** Quando um pedido vira **aprovado**
  (baixa do Financeiro p/ Pix/Boleto/Link, ou confirmação Cartão/Dinheiro que libera direto), dispara um toast
  "liberado para separação" com link p/ a Expedição, para quem fez a ação. **Backend:** `FinanceiroService.baixar`
  agora retorna `{ pedidoLiberado: number | null }` (nº do pedido quando avança aguardando→aprovado); rota
  `/financeiro/:tipo/:id/baixar` devolve isso. **Frontend:** novo `lib/notificarSeparacao.ts`; `Contas` (ModalBaixa)
  dispara o toast pros títulos que liberaram; `NovoPedido` e `PedidoDetalhe` disparam ao confirmar Cartão/Dinheiro
  (`lib/pagamento.liberaDireto`); **Sino** += grupo "Pedidos aguardando separação" (conta status=aprovado, cap
  `comercial.pedido.gerenciar`). i18n `toastsep.*`/`sino.aguard_separacao` pt/en/es. Sem migration. **Pendente:**
  Gui build + commit+push + APK.
- **2026-06-14** — **Lote grande do Gui: remoção de marca/DRE, conferência cartão/dinheiro, análise de vendas, nota multi-produto, bloqueio de separação, Link, e ajustes.**
  **(1) Marca removida** de todo o sistema: caps `cadastros.marca.*` e item nos PERFIS_PADRAO (Estoque/Comercial) tirados; menu/rota/busca/página `Marcas.tsx` removidos do uso (arquivo órfão — Gui pode `git rm`); seletor de marca tirado de `EntradaEstoque`, `Recebimento` (multi-lote agora só lote/validade/bipagem) e coluna na `PosicaoEstoque`; **`ComprasService` não recebe mais `MarcaRepository`** e `receber` não exige marca; rota `/marcas` desregistrada no `server.ts`. Coluna `estoque_lote.marca_id` e tabela `marca` ficam **inertes no banco** (sem migration destrutiva). **(2) DRE removida** (menu+rota+import; `RelDRE.tsx` órfão; backend `dre`/`dreDetalhe` inertes). **(3) Badge "DO PEDIDO"** removido do Contas. **(4) Dashboard:** donut de categoria → **vendas por produto (valor)** (`vendasProduto` no `ResumoDashboard`/SqlDashboardRepository); **top 10 clientes** (LIMIT 5→10) valor e nº de pedidos. **(5) Contas a receber:** coluna **Forma** (forma do pedido — `pd.forma_pagamento` no `SqlTituloRepository.listar` + `Titulo.pedidoFormaPagamento`); **1 linha por lançamento** (`.tabela-1linha` nowrap + scroll horizontal); **alça de coluna visível** (`.col-resize` com grip). **(6) Pagamentos:** lista única `lib/pagamento.ts` (`FORMAS_PAGAMENTO`/`FORMAS_BAIXA`) usada no NovoPedido e na baixa; **Link** = igual Pix (não está em `liberaDireto` → espera baixa; `ehAVista` trava à vista p/ pix+link; toast pix||link no NovoPedido e PedidoDetalhe; pill link). **Dinheiro** já existia (igual cartão). **(7) Conferência de cartão e dinheiro:** migration tenant **048** (`titulo.conferido`/`conferido_em`); `FinanceiroService.conferenciaCartao(dia)` (recebíveis origem=pedido forma cartão/dinheiro pela data do título) + `marcarConferido`; `Titulo.definirConferido`; rotas `GET/PATCH /financeiro/conferencia-cartao`; tela `ConferenciaCartao.tsx` (navegação por dia ‹›, filtro Todos/Pendentes/Conferidos, KPIs cartão/dinheiro/conferido, confirmar selecionados + desfazer) — **opção A** (cartão/dinheiro liberam direto; conferência é controle, NÃO dá baixa). Menu Financeiro + rota (cap `financeiro.receber.listar`). **(8) Bloquear separação:** removida a transição manual `aguardando_pagamento→aprovado` em `TRANSICOES` (PedidosService) e `PROXIMOS` (lib/pedido) — aprovação só pela **baixa do Financeiro** ou `liberaDireto` (cartão/dinheiro), ambos via repo direto; Estoque não aprova mais. **(9) Nota de entrada multi-produto:** `lancarNota` aceita `itens[]` → **1 título a pagar (total) + N recebimentos** (RecebimentoRepository += `listarPorTitulo`; editar/excluir recalculam o total do título); `NotaEntrada.tsx` reescrita com cabeçalho + grid de produtos. **Toast ao lançar** (`lib/notificarRecebimento.ts`) + grupo **Sino** "recebimentos pendentes" (cap `estoque.entrada.criar`). **(10) Análise de vendas (Comercial):** cap nova `comercial.analise.ver`; rota `GET /comercial/analise?dim=produtos|categorias|clientes` (reusa RelatoriosService); tela `AnaliseVendas.tsx` (chips dimensão, período, pizza p/ categorias / ranking p/ produtos·clientes, export CSV/Excel). i18n pt/en/es de tudo. **Validação:** type-check do sandbox inútil (mount trunca/NUL-pad — confirmado); hand-review pelo file-tool. **Pendente:** Gui `npm install` (relink shared) + build + commit+push → Render aplica 048 + **relogar** (caps novas) **e APK novo** (muitas telas). **Limpeza:** composition já está sem marca; a rota `rotas/marcas.ts` virou stub (`export {}`). Faltam só os
**arquivos órfãos** (o sandbox não apaga — fazer no Windows): `del .git\index.lock` e depois
`git rm apps/web/src/pages/Marcas.tsx apps/web/src/pages/RelDRE.tsx apps/api/src/application/cadastro/MarcasService.ts apps/api/src/infra/repositories/SqlMarcaRepository.ts apps/api/src/interface/http/rotas/marcas.ts apps/api/src/domain/cadastro/Marca.ts`.
- **2026-06-14** — **Fluxo de caixa (agrupar por mês + inline + período + badges), logo do Excel e DRE redesenhada.**
  **Fluxo (`FinanceiroService.fluxoCompleto`):** `RelatorioFluxo` += `granularidade`; agora agrupa as barras por
  **semana** (período ≤ ~12 semanas) ou **mês** (> 84 dias) automaticamente (helpers `primeiroDoMes/ultimoDoMes/
  addMes/diasEntre`, `MESES_ABREV`). **`FluxoCaixa.tsx`:** filtro **inline** (Data início/fim + Filtrar + Limpar,
  como o mockup; saiu o `FiltrosModal`), **período exibido** no topo (`rotuloPeriodo` + badge agrupado por mês/
  semana), texto do gráfico adapta (semana/mês). Mantidos: resumo, saldo inicial por banco, seleção, export.
  **Previsto/Efetivo = badges do mockup:** CSS `.pe-ef` (verde) / `.pe-pv` (neutro c/ borda); no fluxo (read-only)
  e em **Contas** o checkbox virou **badge clicável** (`.pe-badge`, alterna previsto, mantém a cap). **Excel
  (`lib/excel.ts`):** a logo da empresa era inserida com cx/cy fixos (3,9:1) → achatava. Novos `dimsImagem`
  (lê PNG/JPEG/GIF dos bytes) + `caixaLogo` calculam cx/cy mantendo a proporção dentro da caixa máx
  (1400000×360000 EMU). Logo TRIADE (texto) intacta. **DRE redesenhada (`RelDRE.tsx` reescrita + backend):**
  `dre` += `anterior` (mesmo período imediatamente anterior, p/ comparação) e novo `dreDetalhe` (títulos pagos
  que compõem uma linha) + rota `GET /financeiro/dre/detalhe`. Tela: **competência (mês)** + período personalizado,
  agrupar por categoria/origem, KPIs (Receitas/Despesas/Resultado/**Margem**), demonstrativo com **% e barra** por
  linha, totais, **Resultado do período** + margem + delta vs anterior, e **drill** (clica na linha → modal com os
  títulos). CSS `.dre-linha/.dre-bar/.dre-pct/.dre-val/.dre-total/.dre-resultado`. i18n `fluxo.*`/`dre.*` pt/en/es.
  **Validação:** type-check do sandbox inútil (mount trunca/NUL-pad); hand-review pelo file-tool; sem órfãos.
  **Pendente:** Gui build + commit+push (Render/Cloudflare) **e APK novo** (telas mudaram). Sem migration; relogar
  não é necessário.
- **2026-06-14** — **Metas do calendário refletindo nos dashboards + drill de faturamento (meta × realizado).**
  **Bug:** a tabela `meta_dia` (calendário) era salva mas **nunca lida** — TV derivava a meta do dia de
  `metaDiaUtil/metaSabado` (modelo dia da semana) e o drill não mostrava meta. **Fix (sem migration):** novo
  `MetaRepository.metaDiasMes(schema, ano, mes)` → `{porDia[], total}` com **fallback** (usa `meta_dia` se houver
  calendário, feriado=0; senão deriva de dia útil/sábado, domingo=0) em `SqlMetaRepository`. `MetasService.atual`
  reescrito: calcula **metaHoje/metaSemana/metaMes** a partir do calendário (semana = seg→dom dos dias no mês) e
  devolve `diasMeta[]`; novo `metasDoMes(YYYY-MM)`. **TV (`DashboardTV.tsx`):** usa metaHoje/semana/mes do backend
  e mapeia cada barra pela `diasMeta` (mês corrente; fallback dia da semana p/ dias de outro mês). **Drill de
  faturamento (`Dashboard.tsx` `DrillModal`):** domínio `DrillFaturamento` += `metaMes` + `dias[]{dia,faturamento,
  meta}`; `SqlDashboardRepository.drillFaturamento` agrega faturamento por dia; `DashboardService` recebe
  `MetaRepository` (composition) e preenche a meta diária. Modal ganhou **seletor de mês** (`<input type=month>`),
  KPIs **Meta do mês** + **Atingido %** (mantidos Faturado/Pedidos/Ticket), **gráfico diário** barras (realizado)
  × linha vermelha (meta) com toggle **acumulado** (componente `DrillChart`). i18n `dash.drill_meta/atingido/mes/
  acumulado` pt/en/es. **Validação:** type-check do sandbox inútil (mount trunca/NUL-pad — confirmado); hand-review
  pelo file-tool. **Pendente:** Gui build + commit+push (Render/Cloudflare) **e APK novo** (telas mudaram); relogar
  não é necessário (sem caps novas). Sem migration.
- **2026-06-14** — **Lote do Gui (6 demandas, mostradas em mockup e aprovadas antes de aplicar).**
  **(1) Confirmar cancelamento de baixa:** `Contas.tsx` ganhou modal de confirmação (estado `cancelarT` +
  `.btn-danger`) antes de `cancelar(tt)`; i18n `fin.cancelar_baixa_titulo/aviso`. **(2) Voltar para orçamento:**
  `PedidosService` TRANSICOES += `aguardando_pagamento → orcamento`; ao voltar, **remove os títulos do pedido se
  em aberto** e **bloqueia se algum pago** (`pedido.voltar_baixa_antes`, 409). Botão "Voltar para orçamento" no
  detalhe (só em aguardando_pagamento). **(3) Máscara de moeda (varredura completa):** novo componente
  `components/MoedaInput.tsx` (`fmtMoedaBR`/`parseMoedaBR`, exibe `350.000,00`, devolve número) aplicado em
  Vendedores (meta), TabelaPreco (base/cliente/campanha), Clientes (limite), ContasCorrentes (saldo), Contas
  (valor/desconto/multa/juros/filtros), Crm, EntradaEstoque, NotaEntrada, NovoPedido (frete), GestaoFretes,
  Conciliacao. (Deixado de fora: campo "variação" do parcelar, que alterna R$/%.) **(3b) Metas por dia
  (calendário):** migration tenant **046** `meta_dia` (ano,mes,dia,valor,feriado); `MetaRepository` +=
  `listarDiasAno`/`salvarDiasAno`; `MetasService.obterDias` + `salvar` aceita `dias[]`; rota `GET /metas/dias`.
  `Metas.tsx` reescrita: cada mês expande um calendário (Preencher a partir de dia útil/sábado; clicar no dia
  edita valor / marca feriado / zera; total do mês = soma dos dias; CSS `.cal-wd/.cal-grid/.cal-cel/.cal-editor`).
  **(4) Cancelar pedido como permissão + nível B:** `packages/shared/capabilities.ts` += `comercial.pedido.separar/
  expedir/cancelar` (e nos perfis padrão Comercial/Estoque). `criarAutorizar` aceita `string|string[]` (any-of,
  retrocompat com `gerenciar`); novo `criarTemCaps` p/ autorização que depende do corpo. Rota `PATCH /pedidos/:id/
  status` gateia por destino (cancelado→cancelar|gerenciar; expedido/entregue→expedir|gerenciar); `/separar`→
  separar|gerenciar. **Perfis.tsx:** módulos viram **expansíveis (＋/−)** (estado `abertos`, contador marcadas/total;
  CSS `.perm-mod-tg/.perm-mod-nome/.perm-mod-ct`). **(5) Consulta por número:** `PedidoRepository.buscarPorNumero`
  + `PedidosService.obterPorNumero` (aceita "142"/"PE-000142"); rota `GET /pedidos/numero/:numero`; `obter` anexa
  `titulos` (resumo em aberto/baixado, via `listarPorPedido`). `Pedidos.tsx` ganhou busca por nº (`.busca-num`);
  `PedidoDetalhe.tsx` ganhou bloco **Financeiro** (`.fin-linha-det`) + "Recebido por". **(recebido por)** migration
  tenant **047** `pedido.recebido_por`; `definirEntrega(...,recebidoPor)`; `ModalDataEntrega` ganhou campo opcional
  "Recebido por" (em branco se entregue de outra forma); `mudarStatus` repassa `recebidoPor`. **(6) Comissão por
  competência:** `Comissoes.tsx` troca de/até por seletor **`<input type=month>`** (competência → 1º a último dia),
  com link "usar período personalizado". i18n pt/en/es de tudo (bloco no fim de `dicionarios.ts`). **Validação:**
  **type-check NÃO rodou no sandbox** (mount trunca arquivos grandes → erros falsos "unterminated string"/"invalid
  character"; confirmado byte-a-byte) — hand-review pelo file-tool (lê o Windows íntegro); confiar no build do
  Cloudflare/Render. **Pendente:** Gui `npm install` (relink `@triade/shared`) + `npm run build -w @triade/web` +
  commit+push → Render aplica migrations 046/047 no boot + **relogar** (carrega caps novas).
- **2026-06-12** — **Paridade: telas de cadastro de Pessoas igualadas ao mockup (lote completo).**
  "Tudo de uma vez" (escolha do Gui). **Comum:** sprite += `i-trash`/`i-eye`; CSS `.acao-ic`/`.acoes-ic`; todas as
  listas trocaram botões de texto (Editar/Inativar) por **ícones** (lápis/lixeira); busca usa `<Ic i-search>`.
  **Por tela:** **Clientes** → "Clientes comerciais", colunas Cliente/CPF-CNPJ/Cidade/Em aberto/Status (tirou Tipo/
  Limite da lista). **Fornecedores** → crumb "Cadastros / Pessoas / Fornecedores", colunas Fantasia/Razão social/
  CNPJ/Cidade-UF/Telefone. **Vendedores** → += E-mail/Telefone, headers curtos. **Favorecidos** → Nome-Fantasia/Tipo/
  CPF-CNPJ/Chave Pix (tirou Banco/Situação). **Motoboys** → **removido o card de Configuração de frete** (foi p/ a
  Gestão de fretes), colunas += **CPF**/**Chave Pix**. **Backend (Motoboy):** migration tenant **036** (`motoboy` +=
  `cpf`, `chave_pix`); `Motoboy`/`NovoMotoboy` += cpf/chavePix; `SqlMotoboyRepository`+`MotoboysService` repassam;
  modal ganhou CPF + Chave Pix. i18n pt/en/es. **Decisão:** mantive chips Todos/Ativos/Inativos e **não** pus o ícone
  "olho/ver". **Validação:** **type-check NÃO rodou** (sandbox) — hand-review; lote grande. **Pendente:** Gui
  `npm install` + build + commit+push → Render aplica a migration 036.
- **2026-06-12** — **Fluxo de caixa reescrito (rico, igual ao mockup) + Aging e Fluxo projetado removidos.** O Gui
  pediu pra concentrar tudo na Fluxo de caixa. **Mudança de regra:** antes só mostrava **baixados** (pela data da
  baixa); agora considera **todos os títulos** com **data de caixa = baixa (se pago) ou vencimento (se em aberto)**.
  **Backend (sem migration):** `Titulo` += `contaCorrenteNome` (LEFT JOIN `conta_corrente` no `listar`);
  `FinanceiroService.fluxoCompleto(de,ate)` junta receber(entrada)+pagar(saída), filtra por período, calcula totais e
  monta **semanas** (segunda–domingo, p/ o gráfico); rota `GET /financeiro/fluxo?de=&ate=` passou a devolver o objeto
  rico `{lancamentos, entradas, saidas, semanas}` (o `fluxo()` antigo/`listarPagos` ficou inerte). **Frontend
  (`FluxoCaixa.tsx` reescrito):** filtro de período (Filtrar/Limpar), **gráfico SVG de barras semanais** (entradas
  verde/saídas vermelha) **clicável** (clicar na semana filtra a lista), painel **Resumo** (Saldo inicial = soma dos
  bancos marcados via `/contas-correntes/saldos`, Entradas, Saídas, Saldo do período) com **checkbox por banco**, e a
  tabela **"Lançamentos que compõem o fluxo"** (Tipo, Título, Descrição, Cliente/Fornecedor, Conta, Data de caixa,
  Previsto/Efetivo, Situação, Valor) + Exportar Excel. CSS `.fluxo-lin/.fluxo-banco`. i18n `fluxo.*` pt/en/es.
  **Remoções:** tirei **Aging de recebíveis** e **Fluxo projetado** do **menu** (Layout) e das **rotas** (App.tsx);
  os métodos/rotas de backend (`aging`, `fluxoProjetado`) ficaram **inertes**. **Os arquivos `AgingReceber.tsx` e
  `RelFluxoProj.tsx` NÃO consegui apagar** (mount nega exclusão) — **o Gui precisa `git rm apps/web/src/pages/
  AgingReceber.tsx apps/web/src/pages/RelFluxoProj.tsx`** (eles ainda compilam, só estão inacessíveis). **Coluna
  chooser ("Colunas") do mockup ficou de fora** (2ª passada). **Validação:** **type-check/e2e NÃO rodaram** (sandbox);
  hand-review. **Pendente:** Gui `npm install` + build + `git rm` dos 2 arquivos + commit+push.
- **2026-06-12** — **Paridade: Nota de entrada (compra) igualada ao mockup.** A tela estava minimal (forn, produto,
  qtd, custo, NF, total); o mockup é rica. Reescrita (`NotaEntrada.tsx`): grid 2 colunas (**Fornecedor | Produto**
  ambos datalist; **Quantidade | Custo unitário**; **Nº da nota | Série**; **Emissão | 1º vencimento**), **3 KPIs**
  (Quantidade, Custo unitário, Valor total), nota explicativa completa, botões **Cancelar** + **Lançar nota**.
  Produto virou datalist (resolve o id pelo nome). **Backend (sem migration):** `ComprasService.lancarNota` passou a
  aceitar `serie`, `emissao`, `vencimento` — o título a pagar agora usa o **vencimento informado** (antes era fixo
  +30d), grava **emissão** e **numeroDocumento** (`NF / Série`) reusando os campos da migration 035. i18n
  `nota.serie/serie_ph/nf_ph/produto_ph/venc1/valor_total/gera_full` pt/en/es. **Validação:** hand-review; sem
  migration. **Pendente:** Gui build + commit+push. **Tela de fidelidade visual continua iterativa** (conforme o Gui
  aponta cada tela).
- **2026-06-12** — **Fix: tabelas largas rolam horizontalmente (não cortam).** `.card.pad0` tinha `overflow:hidden`
  + herdava `max-width:640px` → tabela do Contas (11 colunas) era clipada. Trocado p/ `overflow-x:auto;
  overflow-y:hidden; max-width:none` — fix **global** (todas as listas) espelhando a rolagem do mockup; telas com
  `maxWidth` inline (ex.: detalhe do pedido 820) mantêm o limite. Pendente: Gui build+push.
- **2026-06-12** — **Cadastro inline de Fornecedor igualado ao mockup ("Cadastrar fornecedor").** O mini-modal
  inline do lançamento estava mínimo (nome/doc/telefone); agora o **fornecedor** (pagar) espelha a tela do mockup:
  **Razão social, Nome fantasia** (placeholder "usa 1º nome da razão social"), **CNPJ + Buscar** (BrasilAPI →
  preenche razão/fantasia/cep/cidade/uf), **Celular**, **E-mail**, **UF** (select), **Cidade**, **CEP** (ViaCEP no
  blur); botão "Salvar fornecedor"; usa `modal-lg`. Reusa máscaras/lookups de `lib/br`. O **cliente** (receber) ganhou
  e-mail + máscara de CNPJ. POST manda os campos extras (FornecedoresService já aceita fantasia/email/cep/cidade/uf).
  i18n `fin.cadastrar_fornecedor/fantasia_ph/celular/uf/salvar_fornecedor` pt/en/es. **Validação:** hand-review;
  sem backend/migration novos. **Pendente:** Gui build + commit+push.
- **2026-06-12** — **Auto-serviço "Trocar senha" (super-admin + usuário de tenant).** O Gui perguntou como trocar a
  senha do admin do sistema — não havia jeito pela UI (o `garantirSuperAdmin` só cria se não existe; mudar a env
  `SUPER_ADMIN_SENHA` não atualiza quem já existe). Implementado o jeito definitivo: **PUT `/auth/senha`** (autenticado)
  que troca a própria senha. **Backend:** `SuperAdminRepository` += `atualizarSenha(email, hash)` (UPDATE em
  `public.super_admin`); `AutenticarUsuario.trocarSenha(ctx{superAdmin,email,schema,sub}, atual, nova)` — valida
  nova≥6, confere a atual (`hash.comparar`), e grava (super-admin → `superAdmins.atualizarSenha`; tenant →
  `usuarios.definirSenha` após `buscarPorId`); erro `auth.senha_atual_invalida`. **Frontend:** componente
  `TrocarSenha.tsx` (modal: senha atual, nova, confirmar) aberto **clicando no nome/avatar na topbar**; valida
  confirmação no front (`senha.divergem`) e ≥6; toast de sucesso. i18n `senha.trocar/atual/nova/confirmar/ok/
  divergem` + `auth.senha_atual_invalida` pt/en/es. **Validação:** hand-review (sandbox não roda tsc/e2e); sem
  migration. **Pendente:** Gui `npm run build -w @triade/web` + commit+push. **Uso (após deploy):** topbar → clicar
  no nome → Trocar senha. (Alternativa imediata sem deploy: trocar o `senha_hash` direto no Neon, ou apagar a linha
  `public.super_admin` + setar `SUPER_ADMIN_SENHA` no Render + restart.)
- **2026-06-12** — **Lançamento usa Fornecedor (não Favorecido) + cadastro inline; KPIs do Contas clicáveis; base visual 14px.**
  Pedido do Gui (3 frentes). **(A) Fornecedor no lançamento:** o modal a pagar passou a puxar do cadastro de
  **Fornecedores** (`/fornecedores`); a receber, de **Clientes** (`/clientes`) — **não mais Favorecidos** (decisão do
  Gui; o relatório de Reembolsos continua existindo, só não é mais alimentado por esses lançamentos). Campo vira
  `input list` (datalist dos nomes ativos). O **"+ cadastrar novo"** abre um **mini-modal inline** (`ModalNovaPessoa`)
  sobre o lançamento — fornecedor exige nome+documento; cliente exige tipo PF/PJ+nome+documento — salva via POST e
  já seleciona, **sem sair da tela**. `favorecidoId` agora vai `null` no POST. Coluna/cabeçalho **"Favorecido/Cliente"
  → "Fornecedor"** (pagar); filtro **"Todos favorecidos" → "Todos fornecedores"**. **(B) Paridade Contas:** os 4
  **KPIs viraram clicáveis** (`fKpi`/`toggleKpi`; novo memo `kpiBase` calcula os KPIs sem se autocolapsar; `filtrados`
  = `kpiBase` + filtro do KPI) — clicar filtra a lista (A pagar→abertos, Vence 7d, Vencidos, Boletos) e clicar de novo
  limpa; KPIs com valor **abreviado** (`abrevMoeda`, R$ 4k); rótulos **"Novo lançamento"**, **"Baixar selecionados"**,
  **"Excluir selecionados"**, **"Status"**. CSS `.kpi-mock.kpi-ativo`. **(C) Visual global:** o mockup define
  `body{font-size:14px}` e o sistema **não definia** (herdava 16px) — adicionado **`font-size:14px` no body** +
  `-webkit-font-smoothing`, que reduz a escala de **todas as telas** de uma vez (os demais tokens — cores, raio 14px,
  fonte, tabela 14px/th 12px — já batiam). i18n `fin.novo_lanc_btn/baixar_sel/excluir_sel/status/todos_fornecedores/
  nome/novo_fornecedor/novo_cliente/doc_ph` pt/en/es. **Validação:** **type-check/e2e NÃO rodaram** (sandbox);
  hand-review; mudanças aditivas. **Pendente:** Gui `npm run build -w @triade/web` + commit+push. **ABERTO — varredura
  visual tela-a-tela:** o Gui pediu fidelidade pixel a pixel em TODAS as telas; apliquei a **base (14px)** mas a
  passada detalhada por tela precisa ser **iterativa com feedback visual** (não dá p/ renderizar as 40 telas no
  sandbox) — fazer conforme o Gui apontar cada tela.
- **2026-06-12** — **Paridade: modal "Novo lançamento financeiro" (Contas a receber/pagar) igual ao mockup.**
  O Gui apontou que a tela de lançamento estava mínima — na verdade os selects (Tipo doc/Categoria/Favorecido)
  só apareciam quando havia cadastro (empresa ISKINS vazia). O Gui escolheu o escopo **completo (com migration)**.
  Migration tenant **035** (`titulo` += `numero_documento` text, `emissao` date). **Backend:** `Titulo`/`NovoTitulo`
  += `numeroDocumento`/`emissao`; `SqlTituloRepository.map` lê os campos e `criar` insere (emissao **default
  CURRENT_DATE** via COALESCE); `FinanceiroService.criar` valida emissão ISO (opcional) e repassa. **Frontend
  (`Contas.tsx` `ModalNovo`):** título "Novo lançamento financeiro" + botão "Salvar lançamento"; grid 2 colunas do
  mockup (**Tipo de documento | Nº do documento**, **Categoria | Valor**, **Emissão | Vencimento**); selects
  **sempre visíveis** (Categoria e Tipo doc seguem **cadastro-based**, não lista fixa — categoria é FK usada na DRE,
  trocar quebraria); campo **Fornecedor / Favorecido** com **datalist** de favorecidos (digita ou escolhe → vincula
  a FK por nome) + link **"+ cadastrar novo"**; **nota** sobre a conta bancária ser definida na baixa; checkbox
  Previsto mantido. Coluna **Emissão** da lista passou a usar `emissao ?? criadoEm`; detalhe (duplo-clique) mostra
  Nº documento + Emissão. i18n `fin.novo_lancamento/salvar_lancamento/num_documento/fornecedor_favorecido/
  cadastrar_novo/nota_conta` pt/en/es. **Decisão:** Tipo doc e Categoria **continuam do cadastro** (não lista fixa
  como o mockup) p/ não quebrar DRE/relatórios — combinado com o Gui. **Validação:** **type-check/e2e NÃO rodaram**
  (sandbox) — hand-review; mudança aditiva (colunas nullable, emissao default hoje). **Pendente:** Gui rodar
  `npm install` (link do shared) + `npm run build -w @triade/web` + commit+push → Render aplica a migration 035 no
  boot + relogar.
- **2026-06-12** — **INCIDENTE/LIÇÃO: build local quebrou com `Cannot find module '@triade/shared'` (5×) +
  cascatas (implicit any no Perfis, "possibly undefined" no I18nContext).** Causa: o `node_modules` (gitignored)
  ficou **sem o link do workspace** `@triade/shared` → o módulo não resolve → seus exports viram `any`, disparando
  TS7006/TS2532 em vários arquivos. **Não era erro de código.** **Correção:** `npm install` na raiz recria o link;
  todos os 7 erros somem juntos. **Regra:** depois de clonar/limpar node_modules, sempre `npm install` na raiz
  antes de `npm run build -w @triade/web`. O **Cloudflare faz install limpo**, então buildou normal mesmo quando o
  local falhou. O tsc do sandbox é inútil aqui (mount trunca arquivos → erros falsos de "unterminated string").
- **2026-06-12** — **Paridade: Tabela de preço — modo "Por cliente" com Categoria + Vigência (Fixo/Período).**
  O Gui apontou divergência; mostrei o comparativo e ele escolheu o escopo **completo (com período)**. O modo
  **base** já estava fiel; faltava o **modo Por cliente** que no mockup tem colunas **Categoria** e **Vigência**
  (o preço negociado pode ser **Fixo** ou **Período** com datas de/até). Migration tenant **034** (`preco_cliente`
  += `tipo` default `fixo`, `de` date, `ate` date). **Backend:** `PrecoClienteLinha` += categoria/tipo/de/ate +
  `PrecoClienteEntrada`; `SqlPrecoClienteRepository.listarPorCliente` (JOIN categoria + tipo/de/ate),
  `definir({preco,tipo,de,ate})` (upsert; preço≤0 remove), **`precoDe` resolve o período** (tipo `periodo` só
  vale se `CURRENT_DATE BETWEEN de AND ate`; senão null → cai no base/campanha). `PrecosService.definirCliente`
  valida tipo + datas ISO + ate≥de. Rota PUT `/precos/cliente/:c/:p` passa o corpo inteiro. **Cadeia de preço no
  pedido agora:** preço do cliente (fixo OU período vigente) → campanha vigente → preço fixo base. **Badge de
  campanha vigente (modo base):** agora mostra **motivo + valor** (ex.: "Black Friday · R$ 500,00") — `PrecoProduto`
  += `precoVigenteMotivo`; `SqlPrecoBaseRepository.listar` traz o motivo da campanha vigente. **Frontend
  (`TabelaPreco.tsx`):** modo cliente ganhou colunas Categoria + Vigência (select Fixo/Período + 2 date inputs,
  datas habilitadas só no Período), estado `cliMeta` por produto, salvar envia `{preco,tipo,de,ate}` só do que
  mudou. i18n `precos.vigencia/tipo_fixo/tipo_periodo` pt/en/es. **Validação:** **type-check/e2e NÃO rodaram**
  (sandbox trunca leituras grandes + embedded-postgres incompleto) — hand-review feito; mudança é aditiva
  (coluna com default, `precoDe` degrada p/ base). **Pendente:** Gui commit+push → Render aplica a migration 034
  no boot (AUTO_MIGRATE) + relogar. **Sugiro e2e ao aplicar:** preço cliente período vigente sobrepõe base;
  fora do período cai no base; fixo sempre vale; preço 0 remove.
- **2026-06-12** — **Paridade: tela Novo pedido alinhada ao mockup.** Só frontend (`NovoPedido.tsx` +
  i18n + CSS), sem backend/migration. **(1) Endereço de entrega** virou o padrão do mockup: **select dos
  endereços salvos do cliente** (favorito no topo, rotulado) + opção **"➕ Informar um novo endereço"** que
  revela o form (logradouro, número, complemento, bairro, **CEP com busca ViaCEP**, cidade, **UF select**) +
  checkbox **"Salvar este endereço no cadastro do cliente"** (best-effort: faz PUT `/clientes/:id` anexando o
  endereço; favorito se for o 1º). O texto consolidado vai em `enderecoEntrega`; o CEP efetivo alimenta o
  cálculo de frete. **(2) Itens** ganharam **checkbox por linha + selecionar todos**, botão **"Excluir
  selecionados"** e a **sumbar** (contagem + total selecionado), espelhando o mockup. **(3) Pix trava condição
  à vista** (seletor desabilitado + reset). **(4) Label "Cliente comercial"** + link **"+ cadastrar novo"**
  (→ `/cadastros/clientes`). **(5) Dois botões:** **"Criar pedido"** cria e **confirma** (PATCH status
  →`aguardando_pagamento`, que aplica o gate de forma de pagamento + limite de crédito) e vai ao **detalhe**;
  **"Salvar como orçamento"** só cria (fica em orçamento) e vai ao detalhe. **Importante:** a rota de status
  exige cap `comercial.pedido.gerenciar` (a tela é liberada por `comercial.pedido.criar`) — por isso o confirm
  é **best-effort silencioso**: sem a permissão (ou estourando o limite), o pedido fica como orçamento e a
  confirmação acontece na tela de detalhe com o feedback certo. i18n pt/en/es (`pedidos.cliente_comercial`,
  `pedidos.end_*`, `pedidos.excluir_sel`, `pedidos.salvar_orcamento`, etc.); CSS `.sumbar`. **Validação:**
  **type-check NÃO rodou** (mount do sandbox trunca leituras de arquivos grandes) — hand-review feito; confiar
  no build Cloudflare/Render (tsc). **Pendente:** Gui commit+push.
  **Addendum (mesma sessão) — Detalhe do pedido: colunas Lote/Validade (rastreabilidade).** Conferido: o
  detalhe já estava fiel ao mockup (workflow visual, grid de dados, separação por bipagem, modais de
  expedição) e o Kanban Comercial já tinha filtro de data — a única diferença era **Lote/Validade por item**.
  Implementado **sem migration** (query read-only sobre tabelas existentes): `SqlPedidoRepository.buscarPorId`
  agora busca os **lotes consumidos na separação** (`estoque_movimento` tipo `saida` cuja `observacao` = ref do
  pedido `Pedido PE-000000`, JOIN `estoque_lote`), agrupa lote+validade por `produto_id` e anexa em
  `PedidoItem.lotes` (novo campo opcional no domínio + tipo `ItemLote`). Pega tanto a baixa **FIFO** automática
  quanto a **bipagem** (ambas gravam `observacao=ref`); perdas/inventário não casam (observacao=motivo).
  Frontend (`PedidoDetalhe.tsx`): tabela de itens ganhou colunas **Lote** e **Validade** (lotes/validades
  juntados por vírgula; `—` antes de separar; validade formatada MM/AAAA). i18n `pedido.lote`/`pedido.validade`
  pt/en/es. **Prod roda via tsx (src), dist não usado.** **Validação:** hand-review (sandbox não roda tsc/e2e);
  confiar no build. **Pendente:** Gui commit+push.
- **2026-06-12** — **Paridade: Perfil (cards por módulo) + Contas a receber/pagar (numeração + colunas).**
  **(1) Perfil** — migration tenant **032** (`perfil` += `ativo`, `descricao`). Editor virou o padrão do mockup:
  Nome + **Ativo** + **Descrição** + **"Telas liberadas"** com **cards por módulo** (toggle no título marca/desmarca o
  módulo) e permissões em **2 colunas**. Lista ganhou coluna de situação. Backend: `Perfil`/repo/`PerfisService`/rota
  `/perfis` carregam/gravam ativo+descrição; `ProvisionarEmpresa` cria Administrador com descrição. **(2) Contas** —
  migration tenant **033** (`titulo` += `numero` int + sequência `titulo_numero_seq`, com **backfill** dos títulos
  existentes via row_number + setval). Backend: `Titulo` += `numero` (formatado **REC-/PAG-000000**) e `vendedorNome`
  (LEFT JOIN pedido→vendedor no listar); `criar` e `criarParcelasDePedido` usam `nextval`. Frontend (Contas.tsx,
  cirúrgico): coluna **Título** (sempre), novas colunas ocultáveis **Documento/Emissão/Baixa/Vendedor** (ordem do
  mockup), **4º KPI "Boletos abertos"**, **chips de status** (Todos/A vencer/Vencido/Pago → `fSit`) e **dropdown de
  favorecido/cliente** (`fPessoa`). i18n pt/en/es. **Validação:** **type-check NÃO rodou** (mount trunca leituras no
  sandbox) — confiar no build Cloudflare/Render. **Pendente:** Gui commit+push → Render aplica migrations 032+033 no
  boot + relogar. **Memória nova:** §0 do CLAUDE.md — **fidelidade visual+funcional ao mockup é PRIMORDIAL** (regra do Gui).
- **2026-06-12** — **Paridade de telas com o mockup: Pedidos + Tabela de preço + Dados da empresa.**
  **(1) Pedidos (Comercial)** — só frontend: título "Pedidos - Comercial" + sub "Visão Kanban (somente leitura…)",
  botões Filtrar/Limpar, **kanban com borda colorida no topo + ícone + contador** (cores do mockup, classes `pk-*`),
  cards com **pill da forma de pagamento** (Pix/Boleto/Cartão) + total (usa `--accent2`). "Em separação" exibido como
  **"Aguardando retirada"** (decisão do Gui — só rótulo; mantém 6 status). **(2) Tabela de preço** — card "Tabela"
  com seletor de modo + **Salvar tabela** (lote, só o que mudou); coluna "Preço base"→**"Preço fixo (R$)"**, nova
  coluna **"Campanha vigente"** e botão **"Campanhas (N)"** com a contagem. Backend: `/precos` (SqlPrecoBaseRepository
  + PrecoProduto) passou a devolver `campanhasCount` e `precoVigente` por produto (subqueries em `preco_campanha`).
  **(3) Dados da empresa** — redesenho 2 colunas (Identificação + Logo/Paleta) com **CNPJ Buscar** (BrasilAPI), CEP
  (ViaCEP), UF select, **slider de tamanho da logo** e **4 cores** (incl. Secundária). **Backend: migration public
  004** (`empresa` += cor_secundaria, logo_altura, cnpj, inscricao_estadual, telefone, email, logradouro, bairro,
  cep, uf, cidade) + `BrandingEmpresa`/`AtualizacaoEmpresa` (+ nome) + `SqlEmpresaRepository` (COLS/mapear/atualizar)
  + `EmpresaService.atualizar` reescrito (**merge** sobre os valores atuais → front antigo não quebra; valida cor
  secundária/HEX, logo_altura 24–120) + rota `/empresa` GET/PUT expõem os campos. Frontend: `Branding`/`aplicarTema`
  += `--accent2` (cor secundária) e `--logo-altura` (altura da logo no menu, `.sidebar-logo`). Ícones novos no sprite:
  i-edit, i-clock, i-check, i-upload. i18n pt/en/es. **Validação:** **type-check NÃO rodou** (mount trunca leitura
  de arquivos grandes no sandbox) — confiar no build do Cloudflare/Render (tsc). **Pendente:** Gui commit+push →
  Render aplica migration 004 no boot (AUTO_MIGRATE) + **relogar** uma vez (recarrega branding). **Fila:** próximas
  telas a igualar = **Perfil** e **Contas a pagar/receber** (mostrar prévia antes de aplicar).
- **2026-06-12** — **Paridade do menu/topbar com o mockup + modais não fecham ao clicar fora + login lembra e-mail.**
  Lote do Gui (5 pedidos). **(1) Topbar:** removido o nome da empresa; no lugar entrou a **barra de busca**
  (estilo do mockup: ícone de lupa + placeholder + `Ctrl K`) que abre a paleta global (evento `abrir-busca`).
  **(2) Menu idêntico ao mockup:** novos **ícones SVG line-style** portados do mockup (`components/Icones.tsx`:
  `<SpriteIcones/>` + `<Ic name/>`), rótulo **PRINCIPAL**, grupos com ícone + chevron que gira ao abrir,
  **sub-itens só texto recuado** (sem ícone), mesma fonte/espaçamento/raio do mockup (CSS `.nav-label/.nav-head/
  .lead/.chev/.nav-sub/.nav-subitem`, `.ic`). **(3) Logo TRÍADE** no topo (fallback sem logo da empresa) e no
  rodapé seguem o mockup: **TRÍADE** com **Í vermelho** + **E R P** espaçado abaixo (`.brand-logo/.brand-tag/
  .side-brand-foot`). **(4) Modais fecham só no Cancelar:** removido o `onClick` do `modal-fundo` (backdrop) em
  **todos os 31 modais** (26 arquivos) — clicar fora não fecha mais; só o botão Cancelar/Fechar. **(5) Login
  lembra o último e-mail** usado quando "Lembrar-me" está marcado (`localStorage triade_ultimo_email`, preenche
  ao abrir) — complementa o token de 30d. i18n `menu.principal` + placeholder de busca pt/en/es. **Validação:**
  hand-review do Layout reescrito (240 linhas, fecha ok); **type-check NÃO rodou** (ver incidente abaixo) — Gui
  rodar `npm run build -w @triade/web` local antes/depois do commit (o build do Cloudflare também roda tsc).
  **Pendente:** Gui commit+push.
  ⚠️ **INCIDENTE/LIÇÃO (importante p/ próximas sessões):** usei `sed -i` via **shell (bash)** para remover o
  `onClick` dos 31 modais. O **mount do sandbox TRUNCA leituras** de arquivos grandes (e dos editados pelo
  file-tool) — o `sed -i` leu a versão truncada e **gravou de volta truncada**, corrompendo 8 arquivos grandes
  no Windows (Contas, Comissoes, Empresas, Usuarios, PedidoDetalhe, Clientes, Fornecedores, ContasCorrentes).
  **Recuperação:** `git show HEAD:<path> | sed 's/.../.../' > <path>` — o `git show` lê do object store (íntegro,
  não passa pelo mount truncado) e o redirect grava cheio; restaurei os 8 e reapliquei o fix limpo. Conferido:
  todos batem a contagem de linhas do HEAD (Login +3 = adição legítima). **REGRAS:** (a) **NUNCA** usar bash
  para escrever/editar arquivos do projeto no mount (sed -i, `>`, etc.) — só o **file-tool** (Edit/Write) grava
  no Windows com segurança; (b) `git status`/`git diff` no mount vêm com `improper chunk offset` (corrupção de
  view) e marcam dezenas de arquivos como modificados **falsamente** — não confiar; **`git show`/`git archive`**
  ainda funcionam; (c) o file-tool **lê a verdade do Windows** (App.tsx lê 139 linhas certas onde o mount lê 119).
  **`.git/index.lock`** ficou preso (não consegui remover pelo mount, "Operation not permitted") — se o git no
  Windows reclamar de lock, **apagar `.git\index.lock`** antes de commitar.
- **2026-06-12** — **Ajustes do Gui: editar admin inicial da empresa + Lembrar-me (token 30d) + logout confirma.**
  **(1) Lembrar-me — causa raiz:** o **JWT expirava em 8h** (`JwtGeradorToken`), então a sessão "Lembrar-me"
  caía no dia seguinte (token expirado → `/me` 401 → logout). Subi a expiração para **30 dias**; com o
  localStorage (lembrar) a sessão persiste, e sem lembrar o sessionStorage já derruba ao fechar. (Complementa
  o fix anterior de só deslogar em 401.) **(2) Editar admin inicial pelo super-admin:** ao editar uma empresa,
  o modal agora carrega e permite editar o **administrador inicial** (usuário mais antigo do tenant): nome,
  e-mail e **nova senha** (opcional). Backend: `UsuarioRepository.buscarPrimeiro`/`atualizarNomeEmail`;
  `EmpresaService` ganhou `obterAdmin`/`editarAdmin` (injetados `usuariosRepo`+`hash`; valida nome/e-mail,
  e-mail duplicado→409, senha curta→400); rotas `GET/PUT /empresas/:codigo/admin` (super-admin). Frontend:
  seção "Administrador" no modal de editar empresa (prefill via GET, salva cadastro + admin juntos). i18n
  pt/en/es. **(3) Confirmar logout:** já feito no lote anterior (modal de confirmação) — só não estava no ar
  por causa do Cloudflare; vai aparecer no deploy. **Validação:** **type-check api+web verde** + **e2e Postgres
  real (pglite, 7 PASS):** obterAdmin pega o mais antigo, edita nome/email, troca senha (hash), e-mail
  duplicado→409, e-mail inválido/senha curta→400, empresa inexistente→404. **Sem migration.** **Pendente:**
  Gui git push.
- **2026-06-12** — **Cosméticos do mockup: confirmação de logout + tela de Notificações + cadastro de Bancos.**
  Três itens de polimento. **(1) Confirmar logout:** o botão **Sair** abre um modal de confirmação
  (Layout, `sairOpen`) antes de deslogar. **(2) Tela de Notificações:** nova `/notificacoes`
  (`Notificacoes.tsx`) que reusa a mesma agregação do **Sino** (títulos vencidos, pendência de baixa Pix/
  Boleto, lotes vencendo 30d, estoque baixo) renderizada como cards; o Sino ganhou link **"Ver todas"** →
  `/notificacoes`. **(3) Cadastro de Bancos:** **Cadastros › Financeiro › Bancos** (CRUD simples nome+ativo,
  clone do Tipos de documento). Migration tenant **031** (`banco`); caps `cadastros.banco.listar/gerenciar`
  (auto-sync no boot); backend hexagonal `Banco`/repo/`BancosService`/rota `/bancos`. **Ligação:** o campo
  **Banco** da Conta corrente virou `input list` com **datalist** dos bancos ativos (não muda o modelo — banco
  segue texto na conta). i18n pt/en/es. **Validação:** **type-check api+web verde** + **e2e Postgres real
  (pglite, 5 PASS)** do CRUD de banco (cria/lista, nome curto→400, editar/inativar, inexistente→404).
  **Pendente:** Gui git commit+push (Windows) → boot do Render aplica a migration 031 + caps; relogar.
  **Decisão:** **Hub de Relatórios** e **Relatório dedicado de Contas a receber/pagar** ficam de fora — são
  redundantes (o menu já lista todos os relatórios; a tela de Contas já filtra e exporta).
- **2026-06-12** — **Paridade §6: Reembolsos a favorecidos (relatório).** Novo relatório **Relatórios ›
  Reembolsos** — lista os **títulos a pagar vinculados a um favorecido** (favorecidoId não nulo), com filtro
  de período (vencimento) e situação + export CSV/Excel. **Frontend puro** (`RelFavorecidos.tsx`): reusa o
  endpoint já testado `GET /financeiro/pagar` (que já traz `favorecidoId/favorecidoNome` via JOIN), filtra no
  cliente; 2 KPIs (lançamentos/total) + tabela (favorecido, descrição, valor, vencimento, situação, pago em);
  menu Relatórios (cap `financeiro.pagar.listar`), i18n pt/en/es. Sem backend/migration novos. **Validação:**
  **type-check web verde** (reusa endpoint coberto; sem e2e novo). **Pendente:** Gui git push.
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