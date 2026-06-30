# Assistente (IA) — desenho técnico

> Objetivo: um assistente embutido que **responde sobre os dados da empresa** e
> **propõe ações** (criar/editar), sempre **com confirmação** antes de aplicar.
> Modelo por perfil: **Haiku** (base) · **Sonnet** (Diretoria/Supervisão).
> Preview do visual: `Info/mockups/assistente-ia-preview.html`.

## 1. Princípios

- **A IA nunca executa escrita sozinha.** Toda ação vira uma *proposta* que o
  usuário confirma na tela (igual à cultura de preview do Tríade).
- **Herda as permissões do usuário.** A IA só enxerga/age no que o login já pode
  (mesmas capabilities). Conta demo (só-leitura) → a IA só responde.
- **Multi-tenant isolado.** Todas as ferramentas recebem o `schema` do tenant do
  token; nada cruza empresa.
- **Agnóstico ao provedor** (hexagonal): porta + adapter, trocável (Claude/OpenAI/
  self-host) sem tocar no domínio.

## 2. Arquitetura (Ports & Adapters)

```
domain/ia/LlmProvider.ts        (porta)  -> conversar(modelo, mensagens, ferramentas): Resposta
infra/ia/ClaudeProvider.ts      (adapter) -> chama a API (tool-calling); lê ANTHROPIC_API_KEY
application/ia/AssistenteService.ts        -> orquestra: monta ferramentas, resolve o modelo
                                              pelo perfil, executa as leituras, devolve resposta
                                              ou "ação proposta"
application/ia/ferramentas/*               -> cada ferramenta = wrapper de um use case JÁ existente
interface/http/rotas/ia.ts                 -> POST /ia/perguntar (stream) ; POST /ia/aplicar
```

- **Ferramentas = use cases existentes.** Não há SQL livre. Ex.: `dashboard.resumo`,
  `pedidos.listar`, `estoque.saldo`, `financeiro.aReceber`, `clientes.inativos`.
- Cada ferramenta declara: nome, descrição, parâmetros, **capability exigida** e a
  função que chama o repositório/serviço real (escopo = schema do token).

## 3. Modelo por perfil

- Capability nova **`ia.modelo_avancado`** (módulo `cap.modulo.ia`).
- Capability nova **`ia.assistente.usar`** (libera o assistente em si).
- No `AssistenteService`: `modelo = usuario.temCap('ia.modelo_avancado') ? SONNET : HAIKU`.
- Default nos perfis padrão: `ia.assistente.usar` em Diretor/Comercial/Financeiro/
  Estoque; `ia.modelo_avancado` **só** no Diretor (e quem o Gui marcar = Supervisão).
- Tudo configurável no editor de perfis (sem chumbar) + override por empresa no futuro.

## 4. Fluxo de uma pergunta

1. Front (modal) → `POST /ia/perguntar` com o texto + histórico curto.
2. `AssistenteService` resolve o **modelo** (perfil) e monta o **catálogo de ferramentas
   filtrado pelas capabilities** do usuário.
3. Chama `LlmProvider.conversar`. A IA escolhe ferramenta(s) de **leitura** → o serviço
   executa (escopo do tenant) → devolve dados → a IA compõe a resposta.
4. Se a IA propõe **escrita**, retorna uma `AcaoProposta` (estruturada, **não aplicada**).
   O front mostra o card "Confirmar". Ao confirmar → `POST /ia/aplicar` roda o use case
   real (que já cai na **auditoria** e valida a capability de escrita).

## 5. Ferramentas — Fase 1 (somente leitura)

| Ferramenta | Capability | O que devolve |
|---|---|---|
| `dashboard.resumo` | `dashboard.ver` | faturamento, pedidos, ticket, KPIs do mês |
| `pedidos.listar` | `comercial.pedido.listar` | pedidos por status/período/cliente |
| `estoque.saldo` | `estoque.saldo.ver` | saldo por produto, abaixo do mínimo |
| `financeiro.titulos` | `financeiro.receber.listar` / `pagar` | a receber/pagar, vencidos |
| `clientes.inativos` | `comercial.crm.ver` | clientes sem comprar há N dias |
| `relatorio.vendas` | `relatorios.vendas.ver` | vendas por período/vendedor/produto |

## 6. Segurança / LGPD

- **Dados saem para o provedor de IA** (API gerenciada). Exige: cláusula no Termo LGPD,
  DPA com o provedor, e **liga/desliga por empresa**. Enviar só o necessário (resultado
  das ferramentas, não o banco inteiro); mascarar campos sensíveis.
- **Capability gate** em toda ferramenta (leitura e escrita).
- **Auditoria**: ações aplicadas passam pelo middleware existente.
- **Rate-limit + teto de custo** por tenant (env), pra não estourar.
- Alternativa de máxima privacidade: **self-host** (Llama/Mistral) — sem custo por token,
  troca por custo de servidor e qualidade menor.

## 7. Envs novas (API)

```
IA_PROVIDER=claude            # claude | openai | (futuro) selfhost
ANTHROPIC_API_KEY=...         # chave do provedor
IA_MODELO_BASE=haiku          # modelo padrão
IA_MODELO_AVANCADO=sonnet     # modelo do perfil com ia.modelo_avancado
IA_LIMITE_MENSAL_USD=50       # teto de gasto (corta ao atingir)
```

## 8. Fases

- **Fase 1** — assistente **só-leitura** (Q&A sobre KPIs/pedidos/estoque/financeiro).
  Baixo risco, valor alto. (1–2 sprints.)
- **Fase 2** — **ações propostas** com confirmação (criar pedido/cliente/título),
  reusando use cases + auditoria.
- **Fase 3** — **proativo** (alertas agendados via batch) + busca semântica.

## 9. Custo (resumo, jun/2026)

- Haiku 4.5 ~US$ 1/M entrada · US$ 5/M saída → ~**US$ 0,01/pergunta**.
- Sonnet 4.6 ~US$ 3 / US$ 15 → ~**US$ 0,03/pergunta**.
- Por empresa: leve ~US$ 1–3/mês · médio ~US$ 5–15/mês. Prompt caching corta ~90% da
  parte fixa; batch (−50%) nos alertas. Teto mensal por env.
