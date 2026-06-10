# Plano de Desenvolvimento — TRIADE ERP

> Planejamento de produto. Acompanha `CLAUDE.md` (regras) e
> `Info/ARQUITETURA.md` (fundação técnica). O mockup navegável correspondente
> está em `Info/mockups/erp-mockup.html`. Versão do plano: 0.1.0.

---

## 1. Mapa de navegação (sitemap)

```
TRIADE ERP
├── [Login]                          marca do software
│
├── Dashboard                        visão geral da operação
│
├── Comercial
│   ├── Pedidos                      lista + filtros + status
│   ├── Novo pedido                  formulário (cliente, itens, total)
│   ├── Detalhe do pedido            workflow: aprovação → separação → envio → entrega
│   ├── Orçamentos                   (fase 2)
│   └── Comissões                    por vendedor (fase 2)
│
├── Cadastros
│   ├── Produtos                     lista
│   ├── Produto (form)               categoria, preço, unidade, lote/validade/local
│   ├── Clientes comerciais          clínicas/institutos compradores + limite de crédito
│   ├── Vendedores                   equipe comercial
│   ├── Fornecedores                 origem dos produtos
│   └── Categorias                   skincare, injetáveis, cosméticos, equipamentos
│
├── Estoque / Logística
│   ├── Posição de estoque           saldo por produto/lote/validade/local
│   ├── Entrada de estoque           recebimento (com lote e validade)
│   ├── Transferência                entre locais/depósitos
│   ├── Inventário                   contagem e ajuste
│   └── Alertas                      estoque baixo, validade próxima
│
├── Financeiro
│   ├── Contas a receber             títulos, vencimentos, baixa
│   ├── Contas a pagar               títulos a fornecedores
│   ├── Boletos                      registro interno (fase 2: banco real)
│   ├── Fluxo de caixa               entradas × saídas × saldo
│   └── Conciliação                  (fase 2)
│
├── Relatórios
│   ├── Vendas                       por período/vendedor/categoria/cliente
│   ├── Estoque                      giro, ruptura, validade
│   ├── Financeiro                   inadimplência, DRE simplificado
│   └── Exportações                  CSV/PDF
│
└── Configurações / Acesso
    ├── Usuários                     da empresa (tenant)
    ├── Perfis                       papéis + vínculo de FUNCIONALIDADES (auto-descobertas)
    ├── Dados da empresa             razão social, fantasia, CNPJ, logo, idioma, timezone, paleta de cores
    └── Preferências                 notificações, etc.
```

Itens fixos da barra: **busca global (Ctrl+K)**, **seletor de idioma**
(pt-BR/en-US/es), **logo do cliente** (quando logado), **menu do usuário**
(perfil, timezone, sair).

---

## 2. Inventário de telas

Tipo: `L` = listagem, `F` = formulário, `D` = detalhe, `V` = visão/painel.
Capability = chave de funcionalidade auto-descoberta (ver ARQUITETURA §11.1).

| # | Tela | Módulo | Tipo | Capability |
|---|---|---|---|---|
| 1 | Login | — | F | público |
| 2 | Dashboard | Dashboard | V | `dashboard.ver` |
| 3 | Pedidos | Comercial | L | `comercial.pedido.listar` |
| 4 | Novo pedido | Comercial | F | `comercial.pedido.criar` |
| 5 | Detalhe / aprovação | Comercial | D | `comercial.pedido.aprovar` |
| 6 | Produtos | Cadastros | L | `cadastros.produto.listar` |
| 7 | Produto (form) | Cadastros | F | `cadastros.produto.editar` |
| 8 | Clientes comerciais | Cadastros | L | `cadastros.cliente.listar` |
| 9 | Vendedores | Cadastros | L | `cadastros.vendedor.listar` |
| 10 | Posição de estoque | Estoque | L | `estoque.saldo.ver` |
| 11 | Entrada de estoque | Estoque | F | `estoque.entrada.criar` |
| 12 | Transferência | Estoque | F | `estoque.transferencia.criar` |
| 13 | Contas a receber | Financeiro | L | `financeiro.receber.listar` |
| 14 | Contas a pagar | Financeiro | L | `financeiro.pagar.listar` |
| 15 | Fluxo de caixa | Financeiro | V | `financeiro.fluxo.ver` |
| 16 | Relatórios | Relatórios | V | `relatorios.ver` |
| 17 | Usuários | Acesso | L | `acesso.usuario.gerenciar` |
| 18 | Perfis | Acesso | F | `acesso.perfil.gerenciar` |
| 19 | Dados da empresa | Acesso | F | `acesso.empresa.editar` |
| 20 | Provisionar empresas (super-admin) | Acesso | F | `superadmin.empresa.provisionar` |

---

## 3. Roadmap em fases

Ordem pensada pra entregar valor cedo e validar a arquitetura ponta a ponta.

**Fase 0 — Fundação (1 sprint)**
Scaffold do monorepo (`apps/web`, `apps/api`, `packages/shared`), Docker +
Postgres, DataSource centralizado, runner de migrations por tenant, `Clock`
UTC, i18n base, layout do front (sidebar/topbar) e tela de login. Decisões já
fechadas (schema-por-tenant; Empresa/Cliente; branding por empresa).

**Fase 1 — Acesso & Identidade (1–2 sprints)**
Empresa, Usuário, Perfil, `CapabilityRegistry` (funcionalidades
auto-descobertas), guards de autorização, área administrativa, branding
white-label por empresa (logo, nome fantasia, paleta de cores),
idioma/timezone. *Telas 17–20.*

**Fase 2 — Cadastros (1 sprint)**
Produtos (com lote/validade/local), Clientes comerciais (com limite de
crédito), Vendedores, Fornecedores, Categorias. *Telas 6–9.* Módulo de
referência da arquitetura hexagonal.

**Fase 3 — Comercial (2 sprints)**
Pedidos + workflow de status, regra de limite de crédito, reserva de estoque
na aprovação. *Telas 3–5.*

**Fase 4 — Estoque / Logística (1–2 sprints)**
Posição por lote/validade/local, entrada, transferência, inventário,
alertas. *Telas 10–12.*

**Fase 5 — Financeiro (2 sprints)**
Contas a receber/pagar, boleto interno, fluxo de caixa. Porta para
boleto/NF-e (impl. real na fase 2 do produto). *Telas 13–15.*

**Fase 6 — Relatórios & Dashboard (1 sprint)**
Consolidação dos indicadores, relatórios, exportações. *Telas 2, 16.*

**Fase 7+ (pós-MVP):** SSO, NF-e real, boleto bancário real, conciliação,
orçamentos, comissões, BI.

---

## 4. Critérios de pronto por fase

Cada fase só fecha com: type-check verde nos dois apps; domínio sem import de
ORM/infra; migration criada e rodando nos schemas de tenant; testes de use
case com repositório fake; telas correspondentes funcionando no front; versão
sincronizada (cabeçalho ↔ package.json); commit + push.

---

## 5. Decisões fechadas (2026-05-27)

1. **Isolamento de tenant:** schema-por-tenant (isolamento forte).
2. **Nomenclatura:** *Empresa* = tenant · *Cliente* = clínica compradora.
3. **Branding:** white-label por empresa (logo, nome fantasia, paleta de cores).

Nada bloqueia a Fase 0 — próximo passo é o scaffold do monorepo.

---

## 6. Estado do mockup (referência viva)

`Info/mockups/erp-mockup.html` é a fonte de UX dos requisitos. Está sendo
evoluído antes do código pra travar o comportamento esperado.

### 6.1 Branding (Dados da empresa)

Quatro paletas de chips (cada uma com 44 cores cobrindo 13 matizes em 3
tons + 5 neutros, **incluindo branco e preto**): **Primária**, **Secundária**,
**Menu (fundo)** e **Menu (fonte)**. Quando a empresa escolhe um fundo de
menu claro, o tema escuro/claro do sidebar é detectado por luminância e
ajustado automaticamente (classe `.sidebar.is-light` + variáveis CSS
`--side-fg`/`--accent-fg`). A cor da fonte do menu é independente e tem
fallback automático para garantir contraste com o fundo. Texto sobre
primária também adapta (botões nunca ficam branco em fundo branco).

### 6.2 Financeiro (Contas a pagar / Contas a receber)

Ambas as telas têm a mesma estrutura, pareadas em todos os detalhes:

- **4 KPIs no topo** (cards `.kpi-card`): A pagar/receber no mês · Vence em
  7 dias · Vencidos · Boletos abertos. **Clicáveis** — clique filtra a
  tabela mostrando os títulos que compõem o valor. Reset automático ao mexer
  manualmente nos chips de status.
- **Toolbar única** com: campo Buscar (substring em todas as colunas) ·
  chips de status (Todos / A vencer / Vencido / Pago) · select rápido de
  fornecedor/cliente · botão **Filtros** com badge contador · botões à
  direita **Excluir selecionados** / **Baixar selecionados** / **Novo
  título**.
- **Modal de filtros avançados** (centralizado) com 14 campos: Categoria ·
  Conta bancária · Fornecedor/Cliente (input + datalist de sugestões) ·
  Fantasia (input + datalist, busca em `data-fantasia`) · Documento (select:
  NF-e, NFS-e, Boleto, Recibo, Duplicata, Fatura, Cupom Fiscal) · Título ·
  Descrição (linha cheia) · Valor R$ (de/até na mesma linha) · Emissão
  (de/até) · Vencimento (de/até) · Baixa (de/até). Botões "Limpar tudo" e
  "Aplicar filtros".
- **Ações por linha em ícones com tooltip:** Editar (lápis) · Baixar
  (checkmark, só quando aberto) ou Cancelar baixa (X, só quando pago) ·
  Excluir (lixeira) — sempre disponível.
- **Confirmação de exclusão** num modal dedicado (individual e em lote
  reusam o mesmo modal).
- **Baixa em lote** usa o mesmo `modalBaixa` mostrando contagem e valor
  total dos selecionados.

Comportamentos implícitos do mockup que viram requisitos do código:

- Linhas ocultas pelo filtro são desmarcadas automaticamente do checkbox
  (não contam como "selecionadas" para ações em massa).
- Cancelar baixa devolve a linha pro estado "aberto" e re-roda a contagem de
  selecionados.
- Datalist HTML5 deve permitir digitar livre **ou** escolher da lista —
  filtro busca em `data-razao` (razão social longa) e no texto da coluna.

### 6.3 Demais módulos

Já com layout navegável: Dashboard, Pedidos (listagem + form de novo
pedido), Clientes/Fornecedores/Favorecidos/Vendedores, Produtos, Posição de
estoque, Entrada de estoque, Transferência, Fluxo de caixa, Formas de
pagamento, Contas correntes, Conciliação, Acesso (Usuários/Perfis/Dados da
empresa). Esses são a referência visual; as regras de negócio finais ficam
nos casos de uso a serem implementados.

### 6.4 Exportação de relatórios — requisitos da fase de implementação

O mockup gera os "Exportar Excel" como um `.xls` baseado em **HTML** (gridlines
off, cabeçalho com a paleta white-label da empresa, marca TRIADE com o "Í"
vermelho, zebra, números à direita). Essa técnica **não embute imagem**: data
URI de logo no `.xls` HTML faz o Excel mostrar "a imagem vinculada não pode ser
exibida". Por isso, no mockup, a empresa aparece pelo **nome fantasia** em
texto, não pela imagem.

Requisitos para o código real:

- **Gerar `.xlsx` nativo** (ex.: ExcelJS/SheetJS no backend) em vez de `.xls`
  HTML, para suportar imagem embutida de verdade, estilos de célula, formatos
  numéricos (moeda/data) e congelamento de cabeçalho.
- **Logo da empresa embutida** no cabeçalho do relatório (a logo white-label de
  "Dados da empresa"), com fallback para o nome fantasia quando não houver logo.
- **Marca TRIADE** no cabeçalho com o "Í" em vermelho (`#dc2626`), à direita.
- **Esquema de cores derivado da paleta da empresa** (cor primária `--accent`):
  preenchimento do cabeçalho, borda, zebra e título — com contraste automático
  do texto do cabeçalho (claro/escuro por luminância), como já feito no helper
  `_exportarRelatorioXLS` do mockup.
- Centralizar tudo num **único serviço de exportação** (espelha o helper único
  do mockup), consumido por todas as telas que exportam.
- **Comissões (fechamento de competência):** ao gerar o título único de
  comissões, **congelar o valor apurado** no momento do fechamento (snapshot por
  vendedor), para o título não mudar se uma baixa do Contas a receber for
  cancelada depois.
