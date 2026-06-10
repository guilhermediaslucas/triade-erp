# Orçamento de tempo e custo — TRIADE ERP

> **Modelo deste orçamento:** o código é construído **por mim (Claude), nestas
> sessões**, com **você validando e testando** cada fase. Não há salário de
> desenvolvedor. O custo de desenvolvimento é essencialmente a **sua assinatura
> + o seu tempo**. Comparado a contratar (um dev sênior full-stack no Brasil
> custa ~R$12–22 mil/mês; uma software house cobraria, num MVP deste porte,
> algo entre R$120 mil e R$400 mil+), este modelo é uma fração do custo — mas
> tem riscos próprios, listados no fim.
>
> Valores coletados em **junho/2026**. Câmbio aproximado usado: **US$1 ≈ R$5,50**,
> **€1 ≈ R$6,00** (varia — trate como estimativa).

---

## 1. Premissas

- Você (não-técnico) acompanha, testa cada entrega e toma as decisões de produto.
- Eu escrevo o código, migrations, testes e ajudo no deploy.
- O ritmo (tempo de calendário) é limitado **pela sua disponibilidade de testar
  e decidir**, não pela velocidade de escrever código.
- Estimativas de tempo derivam do seu `PLANO-DESENVOLVIMENTO.md` (9–11 sprints
  para o MVP), convertidas em calendário realista para um dono validando em
  paralelo à rotina.

---

## 2. Cenário A — MVP (Fases 0 a 6)

Sistema utilizável internamente: acesso, cadastros, pedidos, estoque,
financeiro e relatórios. **Sem NF-e/boleto bancário real** (registro interno,
como já previsto).

### 2.1 Tempo por fase

| Fase | Escopo | Sprints (plano) | Calendário realista* |
|---|---|---|---|
| 0 | Fundação (monorepo, Docker, Postgres, login) | 1 | 2–4 semanas |
| 1 | Acesso & Identidade (empresa, usuários, perfis, branding) | 1–2 | 3–5 semanas |
| 2 | Cadastros (produtos, clientes, fornecedores) | 1 | 2–4 semanas |
| 3 | Comercial (pedidos + workflow + crédito) | 2 | 4–6 semanas |
| 4 | Estoque / Logística | 1–2 | 3–5 semanas |
| 5 | Financeiro (receber/pagar, fluxo) | 2 | 4–6 semanas |
| 6 | Relatórios & Dashboard | 1 | 2–3 semanas |
| | **Total MVP** | **9–11** | **≈ 4 a 6 meses** (meio período) |

\* Se você puder dedicar tempo concentrado a testar, cai para **~2,5–4 meses**.

### 2.2 Custo de desenvolvimento (a assinatura)

Para um projeto deste tamanho (monorepo TypeScript, arquitetura hexagonal,
multi-tenant), o trabalho é intenso e sustentado. Faixas:

| Assinatura | Preço/mês | Indicação |
|---|---|---|
| Claude Pro | US$20 (~R$110) | Insuficiente sozinho para ritmo de dev pesado |
| Claude Max 5x | US$100 (~R$550) | Mínimo recomendável para tocar as fases |
| Claude Max 20x | US$200 (~R$1.100) | Confortável para ritmo intenso/sessões longas |

**Custo total de dev do MVP (4–6 meses):** entre **~US$400 e ~US$1.200**
(~R$2.200 a R$6.600) em assinatura — dependendo do plano e da duração.

### 2.3 Infraestrutura recorrente (quando entrar no ar)

| Item | Opção econômica | Opção gerenciada |
|---|---|---|
| Frontend (React) | Grátis (Netlify/Cloudflare/Vercel) | idem |
| Backend + PostgreSQL | VPS Hetzner ~€5/mês (~R$30) via Docker | Render/Railway ~US$15–65/mês (~R$80–360) |
| Backups do banco | incluso no VPS (script) | incluso/poucos US$ |
| Domínio (já tem) | ~R$40/ano (Registro.br) | idem |
| HTTPS/SSL | grátis (Let's Encrypt/automático) | grátis |
| E-mail no domínio (opcional) | Zoho grátis | Google Workspace ~US$6/usuário |

**Infra do MVP em produção:** ~**R$30 a R$360/mês**, conforme você escolha
administrar um VPS (mais barato, exige cuidado técnico) ou usar plataforma
gerenciada (mais simples, mais cara).

---

## 3. Cenário B — MVP + Fiscal (Fase 7)

Tudo do Cenário A **+ NF-e real, boleto bancário e conciliação** — o que torna o
sistema fiscalmente operante no Brasil. É um capítulo regulado e complexo.

### 3.1 Tempo adicional

| Bloco | Calendário realista |
|---|---|
| NF-e real (CFOP, NCM, ICMS/ST de produtos estéticos, edge cases) | 6–10 semanas |
| Boleto bancário (integração + conciliação) | 3–5 semanas |
| Conciliação financeira | 2–4 semanas |
| **Adicional sobre o MVP** | **≈ +2 a 4 meses** |

> Esta fase normalmente exige a participação do seu **contador** para definir as
> regras tributárias corretas. Erro fiscal tem consequência legal — não é área
> para "achismo".

### 3.2 Custos recorrentes específicos do fiscal

| Item | Custo | Observação |
|---|---|---|
| API NF-e (Focus NFe, plano Solo) | **R$89,90/mês** | 1 CNPJ, 100 notas; R$0,10/nota extra |
| Certificado digital e-CNPJ A1 | ~R$120–250/ano | obrigatório; renovação anual |
| Integração de município novo (NFSe) | R$199 (uma vez) | só se seu município não estiver integrado |
| Boleto bancário | ~R$1,50–4,00 por boleto | tarifa do banco/gateway, varia |
| Apoio contábil | conforme seu contador | recomendado nesta fase |

---

## 4. Comparativo lado a lado

| | **A — MVP** | **B — MVP + Fiscal** |
|---|---|---|
| Tempo (meio período) | ~4 a 6 meses | ~6 a 10 meses |
| Custo de dev (assinatura) | ~R$2.200 – 6.600 (total) | ~R$3.300 – 11.000 (total) |
| Infra recorrente | R$30 – 360/mês | R$30 – 360/mês |
| Custos fiscais recorrentes | — | + ~R$90/mês (NF-e) + certificado/ano + tarifas de boleto |
| Resultado | Operação interna funcional | Operação fiscalmente completa |

---

## 5. Riscos honestos deste modelo (importante)

Não seria justo te dar só os números bonitos. O modelo "Claude + você" é
barato, mas tem pontos de atenção reais para um sistema que mexe com **dinheiro
e dados de clientes**:

1. **Manutenção e incidentes.** Quando algo quebrar em produção (e vai
   acontecer), quem conserta? Eu ajudo nas sessões, mas um ERP financeiro no ar
   24/7 idealmente tem alguém com acesso técnico para responder a falhas. Vale
   reservar orçamento para **apoio pontual de um dev** (deploy, segurança,
   emergências) — o que aproxima do modelo misto.
2. **Você é o ponto de validação.** Como não-técnico, testar regras de negócio
   complexas (crédito, estoque por lote/validade, baixas financeiras) exige
   tempo e atenção seus. É o verdadeiro "custo" escondido.
3. **Segurança e LGPD.** Dados de clínicas/clientes têm exigências legais.
   Precisa de cuidado com autenticação, backups e tratamento de dados pessoais.
4. **Fiscal não perdoa erro.** A Fase 7 mexe com a Receita. Sem um contador
   validando as regras, o risco é multa, não só bug.
5. **Continuidade.** Se em algum momento você precisar passar o projeto para uma
   equipe, a arquitetura limpa (já planejada) ajuda — mas a documentação precisa
   ser mantida em dia (é o que o `CLAUDE.md` e o `Info/` já fazem).

---

## 6. Recomendação

Comece pelo **Cenário A (MVP)**, e dentro dele pela **Fase 0**. Motivos:

- Valida a arquitetura ponta a ponta com baixo custo e risco.
- Te dá um sistema utilizável internamente em meses, não anos.
- O fiscal (Fase 7) pode esperar: enquanto o MVP usa "registro interno", você
  opera e aprende, e só investe na complexidade fiscal quando o sistema já
  provou valor.
- Reserve, desde já, uma verba pequena para **apoio técnico pontual** (deploy
  inicial e emergências) — é o seguro que falta no modelo puro "Claude + você".

**Custo realista para sair do zero a um MVP no ar:** algo como
**R$3 mil a R$8 mil no total dos meses de desenvolvimento** (assinatura + infra),
fora o seu tempo e um eventual apoio dev pontual. Isso é uma ordem de grandeza
abaixo de qualquer contratação tradicional para o mesmo resultado.
