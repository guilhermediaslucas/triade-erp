# PARIDADE-MOCKUP.md — Mockup → Sistema (fonte de verdade)

> Objetivo: capturar **tudo o que o `Info/mockups/erp-mockup.html` faz** e usar como
> checklist para deixar o sistema idêntico. Cada item tem status:
> ✅ feito · ⚠️ parcial · ❌ faltando · ➖ não se aplica (mecanismo só-mockup).
>
> Como manter: ao implementar um item, marque ✅ e cite o commit. Quando um
> comportamento do mockup mudar, atualize aqui **antes** de codar no sistema.

---

## 0. Método (a forma prática que você pediu)

O mockup é um arquivo único com toda a lógica em JS. Em vez de "olhar e refazer
de memória", o fluxo prático é:

1. **Extrair**: os blocos `/* ===== … ===== */` do mockup já nomeiam cada
   funcionalidade; os `id="modal…"` listam todas as janelas; os `id="s-…"` as
   telas. Isso virou a tabela das seções 2–9 abaixo.
2. **Diferença (gap analysis)**: marcar o que já existe no sistema e o que falta.
3. **Especificar o que falta**: para cada ❌/⚠️, escrever a regra de negócio
   (entradas, saídas, transições de status, quem vê) — seções 1 e detalhes.
4. **Implementar por prioridade** + validar (type-check + e2e Postgres real) +
   commit, um item por vez.
5. **Marcar ✅** aqui e seguir.

> Dica: o mockup guarda estado em `localStorage` por empresa (snapshots HTML).
> No sistema isso vira **tabela no Postgres + endpoint** — por isso alguns
> mecanismos do mockup são ➖ (não se replicam literalmente, só o efeito).

---

## 1. GAP PRIORITÁRIO — Fluxo Pix/Boleto → Financeiro → liberação no Kanban

**(o exemplo que você citou — ✅ IMPLEMENTADO no commit do fluxo Pix/Boleto; e2e 5 PASS)**

No mockup (`/* Item 2: notificações de pendência de baixa (Pix/Boleto) + toast */`):

- Ao **confirmar um pedido** cuja **forma de pagamento é Pix ou Boleto**, o sistema:
  1. gera o **título a receber** (já fazemos) **e** registra uma **pendência de
     baixa** (notificação);
  2. mostra um **toast fixo no canto inferior** ("O pedido PE-xxxx (Cliente)
     gerou um título de R$ X que precisa ser baixado no financeiro") com botões
     **Fechar** e **Abrir** — o toast **só some ao clicar**;
  3. a pendência também entra na **contagem do sino** e numa lista de
     **Notificações**, visível **só para quem tem acesso ao Financeiro**.
- Clicar em **Abrir** leva ao **Contas a receber** e **destaca** o título do pedido.
- Ao **dar baixa** (confirmar o recebimento) desse título, o **pedido avança de
  status no Kanban** e fica **disponível para Separação**.
- **Regra de liberação (Kanban Expedição):** pedido **Cartão/Dinheiro** pula
  "Aguardando pagamento" e já fica liberado; **Pix/Boleto** **só** avança para
  separação **depois** da confirmação financeira (baixa do título).

**Estado no sistema:** ✅ (implementado — toast persistente de ação fica como refino)
- ✅ Confirmar pedido gera título a receber.
- ✅ Workflow de status no Kanban (drag) com transições.
- ✅ Gate por **forma de pagamento** (Cartão/Dinheiro liberam direto → `aprovado`; Pix/Boleto
  exigem baixa antes de `separacao`).
- ✅ **Pendência de baixa** no **sino** + **toast** ao confirmar, restritos a quem vê Financeiro
  (toast fixo no canto com botão Abrir = refino futuro).
- ✅ Ao baixar o título de origem `pedido`, o pedido **avança** (aguardando_pagamento → aprovado).

**Especificação para implementar (proposta):**
- Backend: ao `baixar` um título com `origem='pedido'`, mover o pedido de
  `aguardando_pagamento → aprovado` (libera separação). Endpoint do dashboard/sino
  já lista pendências; adicionar "pendências de baixa de pedido" (títulos a
  receber em aberto de origem pedido) à agregação do `Sino`, gated por
  `financeiro.receber.listar`.
- Frontend: na confirmação do pedido, se forma = pix/boleto, disparar um **toast
  persistente** (o `ToastProvider` já existe; criar variante "ação" que não some
  sozinha) com botão "Abrir" → navega para `/financeiro/receber` e destaca o
  título. Transição de status do Kanban respeita o gate por forma de pagamento.
- e2e: pedido Pix confirmado fica bloqueado p/ separação até a baixa; após baixa,
  status vira aprovado e separação fica disponível; Cartão libera direto.

---

## 2. Comercial

| Funcionalidade do mockup | Status | Nota |
|---|---|---|
| Novo pedido (cliente/vendedor/itens/forma pgto/entrega) | ✅ | |
| Preço puxado da Tabela de preço + snapshot do item | ✅ | |
| Limite de crédito do cliente | ✅ | |
| Condições de pagamento (parcelas) | ✅ | |
| Forma de entrega (retirada/motoboy/correios/transportadora) + frete | ✅ | motoboy via Google Maps c/ fallback |
| Kanban Comercial (leitura) + filtro de data | ⚠️ | Kanban existe; filtro por data de criação a confirmar |
| Kanban Expedição (drag) + sincronização | ✅ | |
| **Gate Pix/Boleto antes de separar** | ✅ | ver §1 (e2e 5 PASS) |
| Visualização do pedido (duplo-clique, leitura, entrega editável) | ⚠️ | há página de detalhe; "forma de entrega editável no view" a confirmar |
| Romaneio imprimível | ✅ | |
| Campanhas de preço (período) | ✅ | |
| Preço por cliente | ✅ | |

## 3. Financeiro

| Funcionalidade | Status | Nota |
|---|---|---|
| Contas a receber / a pagar (CRUD, baixar, cancelar baixa) | ✅ | |
| Título automático do pedido | ✅ | |
| **Notificação de pendência de baixa (Pix/Boleto) + toast** | ✅ | sino + toast; toast fixo c/ Abrir = refino |
| **Baixa do título do pedido → avança status do pedido** | ✅ | ver §1 |
| Filtros avançados (multi-status + favorecido + faixas) | ⚠️ | barra de filtros existe; multi-status/favorecido a confirmar |
| Esconder/mostrar colunas (modalColunas) | ⚠️ | feito nas Contas; revisar paridade |
| **Redimensionar colunas (arraste)** | ❌ | adiado (alto esforço) |
| **Coluna Previsto/Efetivo + destaque de previsão** | ❌ | conceito de competência vs caixa |
| Janela de detalhe do título (duplo-clique) | ✅ | modal read-only nas Contas (duplo-clique na linha) |
| Parcelar título (N parcelas) | ✅ | |
| Multiplicar título (N cópias) | ✅ | |
| Fluxo de caixa + saldos bancários + drill | ✅ | |
| Conciliação bancária (manual + importar OFX/CSV) | ✅ | |
| Comissões (apuração + fechar competência) | ✅ | |
| **Regra geral de comissão (cadastro de regras)** | ⚠️ | usa % individual; regra geral pendente |
| DRE (origem + categoria) | ✅ | |
| Aging de recebíveis | ✅ | |
| Contas correntes | ✅ | |
| Categorias financeiras | ✅ | |
| Favorecidos / Credores (reembolso) | ✅ | |
| Tipos de documento (cadastro) | ❌ | cadastro simples do mockup |

## 4. Estoque / Expedição

| Funcionalidade | Status | Nota |
|---|---|---|
| Posição de estoque (KPIs, busca, chips, valor, lotes) | ✅ | |
| Seleção + soma + excluir selecionados (em massa) | ⚠️ | seleção/soma do mockup a confirmar na Posição |
| Entrada de estoque (bipagem) | ✅ | |
| Recebimento multi-lote (Nota → Recebimento) | ✅ | |
| Baixa / perda | ✅ | |
| Inventário por leitor (registro/log) | ✅ | |
| Marcas | ✅ | |
| **Transferência entre locais** | ➖/❌ | decidido fora de escopo p/ esta operação |

## 5. Cadastros

| Funcionalidade | Status | Nota |
|---|---|---|
| Clientes (PF/PJ, CNPJ/CEP, endereços, limite, **Em aberto**) | ✅ | |
| Vendedores (região/meta/comissão, **Vendas do mês**) | ✅ | |
| Fornecedores (CNPJ/CEP) | ✅ | |
| Produtos (toolbar busca+chips, categoria pill) | ✅ | |
| Categorias / Marcas | ✅ | |
| Motoboys + config de frete | ✅ | |
| Favorecidos | ✅ | |
| Condições de pagamento | ✅ | |
| Contas correntes / Categorias financeiras | ✅ | |
| UF + municípios (IBGE) no endereço | ⚠️ | CEP via ViaCEP ok; dropdown de município a confirmar |
| Formas de entrega/envio como **CRUD** (modalFormaEntrega) | ⚠️ | hoje lista fixa; mockup permite cadastrar |

## 6. Relatórios

| Funcionalidade | Status | Nota |
|---|---|---|
| Vendas / Produtos mais vendidos | ✅ | |
| Vendas por categoria | ✅ | |
| Curva ABC (produtos) | ✅ | |
| **Curva ABC (clientes)** | ✅ | seletor Produtos/Clientes (e2e 5 PASS) |
| Validade de lotes / Estoque parado / Perdas / Inventários | ✅ | |
| DRE simplificada | ✅ | |
| Aging / projeção | ✅ | |
| Relatório Contas a receber / a pagar (com filtros + Excel) | ⚠️ | há Contas; "relatório dedicado" do mockup a avaliar |
| Exportar Excel formatado (.xlsx com cara de relatório) | ✅ | |

## 7. Dashboard

| Funcionalidade | Status | Nota |
|---|---|---|
| 5 KPIs (dia/semana/mês/ano + clientes) com delta | ✅ | |
| Faturamento + Vendas por categoria (donut) + Top produtos | ✅ | |
| Top 5 clientes (valor e pedidos) | ✅ | |
| Avisos e pendências + Ações rápidas | ✅ | |
| Pedidos recentes + Fluxo do mês | ✅ | |
| Saldos bancários + Total em contas + rodapé | ✅ | |
| KPIs clicáveis (abrem gráfico do período) | ✅ | drill `/dashboard/serie/:tipo`; dia/semana/mês/ano/clientes (e2e 15 PASS) |

## 8. Configurações / Acesso

| Funcionalidade | Status | Nota |
|---|---|---|
| Usuários (CRUD, senha, perfil pill) | ✅ | |
| Perfis (CRUD, permissões por módulo, **Módulos liberados**) | ✅ | |
| **Foto/avatar do usuário + apresentação** | ❌ | mockup tem foto no perfil |
| Dados da empresa (logo, cores, idioma/timezone) | ✅ | idioma/timezone **removidos da UI** por preferência do Gui (sistema clean) |
| Multi-empresa / white-label / admin geral | ✅ | super-admin + switcher; **CRUD completo** (criar sem código/auto-slug, editar, excluir+drop schema) |
| Tema claro/escuro | ✅ | |
| Login (ver senha + recuperar senha) | ✅ | recuperar é stub visual |

## 9. CRM (módulo do mockup ainda não trazido)

| Funcionalidade | Status | Nota |
|---|---|---|
| Oportunidades (funil) — modalOportunidade | ❌ | em revisão pelo Gui |
| Interações/registro — modalCrmInteracao | ❌ | |

## 10. Itens transversais de UI

| Funcionalidade | Status | Nota |
|---|---|---|
| Tema escuro | ✅ | |
| Busca global (Ctrl+K) | ✅ | |
| Toasts de confirmação | ✅ | |
| Sino de notificações | ⚠️ | existe; falta pendência de baixa Pix/Boleto (§1) |
| **Toast de ação persistente (Pix/Boleto)** | ⚠️ | toast simples feito; variante fixa c/ botão Abrir pendente |
| Tooltip global nos botões de ação | ⚠️ | usa title nativo |
| Redimensionar colunas | ❌ | adiado |
| Ações em massa (Contas) | ✅ | |
| Scroll ao topo na troca de tela | ✅ | |
| Menu recolhível (grupos) | ✅ | |

---

## 11. Próximos passos sugeridos (ordem de valor)

1. ✅ **§1 — Fluxo Pix/Boleto → Financeiro → Kanban** (feito; toast fixo c/ botão Abrir = refino).
2. ✅ Curva ABC de clientes (feito).
3. ✅ KPIs clicáveis no Dashboard (drill por período) — feito.
4. Coluna Previsto/Efetivo (✅ detalhe do título por duplo-clique feito; **Previsto/Efetivo** = decisão de competência×caixa, aguarda o Gui).
5. Foto/avatar de usuário.
6. Formas de entrega como CRUD; municípios IBGE.
7. CRM (oportunidades + interações) — quando você decidir o escopo.

> Itens ⚠️ pedem só **confirmação no ar** (podem já estar prontos) — revisar
> tela a tela e fechar.
