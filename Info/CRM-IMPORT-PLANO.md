# Plano fechado — Importação de clientes/leads + CRM (orçamento, conversão, alertas adaptativos)

> Decidido com o Gui em 2026-06-16. Implementar **tudo de uma vez** numa sessão
> nova (esta fechou perto do limite de contexto). Plano nível-arquivo abaixo.

## Decisões travadas
- **Formato de importação:** CSV **e** Excel (.xlsx). → adicionar **SheetJS** (`xlsx`) ao `apps/web` (exige `npm install`). Parsing no navegador; backend recebe as linhas já normalizadas (JSON).
- **Leads:** **estender a oportunidade** (não criar tabela separada). Lead = oportunidade no estágio `lead` com campos de contato.
- **Queda de volume:** **adaptado ao ritmo de cada cliente** (modus operandi). Nada de janela fixa: usar o **ciclo médio** do cliente (já calculado em `CrmService.stats`) para dimensionar a janela de comparação. Há clientes semanais e mensais — a janela acompanha o ciclo.

## Base que já existe (reaproveitar)
- `oportunidade` (migration 040): id, cliente_id (nullable), cliente_nome, titulo, valor, vendedor_id, estagio (`lead|contato|proposta|negociacao|ganho|perdido`), previsao, **pedido_id** (liga ao pedido), perdido, criado_em.
- `interacao` (040): id, **cliente_id NOT NULL**, tipo, data, nota.
- `CrmService`: funil, interações, `recompra()` (prevê próxima compra pelo ciclo), `inativos(dias)` (X dias sem comprar), `timeline()` (pedidos+interações). Repo: `vendasPorCliente()` retorna `{clienteId, cliente, data, total}` por venda (tem o **total**, serve p/ janelas de valor).
- "Orçamento" = pedido com status `orcamento`. `oportunidade.pedido_id` + rota `PATCH /crm/oportunidades/:id/orcamento` (vincularPedido) já existem.
- `ClientesService.criar(schema, obj)` aceita `{tipoPessoa, nome, fantasia, documento, email, telefone, limiteCredito, enderecos[]}`.

## Frente 1 — Importar clientes (sem migration)
- **Front:** dep `xlsx` (SheetJS). Tela/modal "Importar clientes" (botão na `Clientes.tsx`). Ler CSV/XLSX → mapear colunas → **preview** + validação por linha → POST. Botão "baixar modelo".
- **Back:** `ClientesService.importar(schema, linhas[])`: carrega `repo.listar` 1x, monta sets de documento (normalizado) e nome (lower) p/ **dedup**; para cada linha valida via `montar` e cria; retorna `{criados, ignorados, erros:[{linha, motivo}]}`. Rota `POST /clientes/importar` (cap `cadastros.cliente.gerenciar`).

## Frente 2 — Leads no CRM + conversão (migration 056)
- **Migration 056:** `oportunidade` += `contato text`, `email text`, `telefone text`, `origem text`. `interacao`: `ALTER COLUMN cliente_id DROP NOT NULL` + `ADD COLUMN oportunidade_id uuid REFERENCES oportunidade(id) ON DELETE CASCADE`.
- **Domain `Crm.ts`:** `Oportunidade`/`NovaOportunidade` += contato/email/telefone/origem. `Interacao`/`NovaInteracao`: `clienteId` nullable + `oportunidadeId`. Repo: `listarInteracoesOportunidade`, `vincularCliente(id, clienteId)`, e `importarLeads`.
- **Service:** `importarLeads(schema, linhas[])` cria oportunidades estágio `lead` (dedup por nome+telefone). `criarInteracao` aceita `oportunidadeId` (lead) **ou** `clienteId`. `converterEmCliente(schema, oppId)`: cria cliente (PJ, nome=cliente_nome, email/telefone do lead) via `ClienteRepository` (injetar no CrmService), seta `oportunidade.cliente_id` e `UPDATE interacao SET cliente_id=novo WHERE oportunidade_id=opp`. Rotas: `POST /crm/leads/importar`, `PATCH /crm/oportunidades/:id/converter`.
- **Front (`Crm.tsx`):** campos de contato no modal de oportunidade; botão "Importar leads"; botão "Converter em cliente"; interações no lead.

## Frente 3 — Orçamento pelo CRM ligado ao pedido (quase só front)
- **Front:** botão "Gerar orçamento" no card. Se a oportunidade não tem cliente (lead) → `converter` antes. Navega p/ `/comercial/pedidos/novo?cliente=<id>&oportunidade=<id>`. `NovoPedido.tsx` lê esses query params: pré-seleciona o cliente e, ao salvar como orçamento, chama `PATCH /crm/oportunidades/:id/orcamento` com o `pedidoId`. O orçamento depois é confirmado → vira pedido pelo fluxo normal. Conferir como o `NovoPedido` retorna o id do pedido criado.

## Frente 4 — Alertas adaptativos (sem migration)
- **Service:** novo `alertas(schema)` (ou `quedaVolume`) usando `vendasPorCliente()` (tem data+total). Por cliente:
  - `ciclo` médio (já há em `stats`); **ritmo** = semanal (≤10d) / quinzenal (≤20d) / mensal (≤45d) / esporádico (>45d ou <2 compras).
  - `janela = clamp(K * ciclo, MIN, MAX)` (ex.: K=4, MIN=14d, MAX=180d).
  - `valorRecente` = Σ total em `[hoje-janela, hoje]`; `valorAnterior` = Σ em `[hoje-2janela, hoje-janela]`; `quedaValorPct`.
  - `freqRecente`/`freqAnterior` = nº de pedidos nas mesmas janelas; `quedaFreqPct`.
  - Flag **em queda** se `quedaValorPct <= -LIMITE` (default 30%) **ou** queda de frequência relevante.
  - Combinar no painel "Alertas do comercial": **Atrasados** (recompra vencida), **Em queda** (valor/freq), **Inativos** (já existe). Cada item com ações **Registrar contato** e **Gerar orçamento**.
  - Rota `GET /crm/alertas` (ou estender). Limite/threshold ajustável via querystring com defaults.
- **Front (`Crm.tsx`):** painel de alertas com as 3 seções + ritmo do cliente + variação %.

## Entrega / deploy
- `npm install` (raiz: relink shared + **xlsx**) → `npm run build -w @triade/web` → commit+push (Render aplica **migration 056** no boot) → relogar não é obrigatório (sem caps novas) → APK novo (telas mudaram) via `scripts\app-android.bat`.
- **Sem caps novas** (reusa `comercial.crm.*` e `cadastros.cliente.*`).

## e2e sugerido ao aplicar
- Importar CSV e XLSX de clientes (dedup por documento; relatório de erros).
- Importar leads → aparecem na coluna Lead; registrar interação num lead; "Converter em cliente" cria cadastro e preserva interações.
- "Gerar orçamento" de uma oportunidade → cria pedido `orcamento` vinculado; confirmar vira pedido.
- Alertas: cliente semanal que parou 3 ciclos aparece em "Em queda/atrasados"; cliente mensal não dispara por 1 semana de atraso.
