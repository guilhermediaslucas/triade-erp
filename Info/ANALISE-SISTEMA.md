# Análise ampla do mockup TRIADE ERP

> Varredura geral do `Info/mockups/erp-mockup.html` — saúde técnica, estado dos
> relatórios, possíveis problemas e sugestões de melhoria. Data: 2026-06-08.
> Lembrete: tudo é **mockup** (fase de planejamento); "funciona" aqui = o
> comportamento no protótipo, com dados em `localStorage` por empresa.

## 1. Resumo executivo

O protótipo está sólido e coeso: navegação por 60 telas, multi-empresa com
isolamento (tenant zerado), white-label, permissões por tela/perfil, e os
fluxos centrais (pedido → estoque/expedição → financeiro) encadeados. Os blocos
de JavaScript adicionados nas últimas rodadas foram validados com `node --check`.

O ponto que mais merece atenção é **inconsistência nos relatórios**: parte deles
puxa dados reais do sistema, mas vários ainda exibem **dados fictícios fixos no
HTML** — então, num tenant zerado, mostram números que não existem.

## 2. Saúde técnica

- **Sintaxe JS:** os blocos novos passam em `node --check`. Não foi possível
  rodar um check do arquivo inteiro pelo shell desta sessão (o mount fica
  truncado), então recomenda-se um teste de fumaça abrindo o mockup no
  navegador e olhando o console (deve estar limpo; o boot é protegido por
  `try/catch`).
- **Estrutura:** 60 `section.screen`, navegação por `data-go`, modais isolados.
  Boot resiliente (`window.addEventListener('DOMContentLoaded'...)` com
  `try/catch`), persistência centralizada (`_persistAll`/`_restoreAll`).
- **Arquivo grande:** o `erp-mockup.html` passou de ~10 mil linhas. Para o
  código real isso vira vários módulos; no mockup, convém **quebrar em parciais**
  (head/estilos, telas por módulo, scripts por módulo) se for evoluir muito mais.

## 3. Relatórios — estado atual

| Relatório | Tela | Estado | Observação |
|---|---|---|---|
| Contas a receber | `rel-receber` | **Dinâmico** | Filtra de `tblReceber`, KPIs/total reais, exporta Excel |
| Contas a pagar | `rel-pagar` | **Dinâmico** | Idem, de `tblPagar` |
| Comissões a vendedores | `rel-comissoes` | **Dinâmico** | Base: títulos pagos com vendedor |
| Favorecidos / reembolso | `rel-favorecidos` | **Dinâmico (parcial)** | KPIs zeram corretamente |
| Pedidos (estoque) | `rel-estoque-pedidos` | **Dinâmico** | Lê do Kanban, filtros, exporta Excel |
| Vendas por vendedor | `rel-vendas-vendedor` | **Estático** | Tabela e gráfico com dados fixos |
| Curva ABC de clientes | `rel-vendas-abc` | **Estático** | Linhas fixas |
| Funil & conversão | `rel-vendas-funil` | **Estático** | Gráficos com dados fixos |
| Curva ABC de produtos | `rel-estoque-abc` | **Estático** | Linhas fixas |
| Estoque parado | `rel-estoque-parado` | **Estático** | Linhas fixas |
| Validade de lotes | `rel-estoque-validade` | **Estático** | Linhas fixas |
| Fluxo projetado | `rel-fluxo-proj` | **Estático** | Projeção fixa |
| Aging (vencidos) | `rel-aging` | **Estático** | Faixas fixas |

**Recomendação:** tornar dinâmicos os relatórios comerciais e de estoque (eles
já têm a fonte de dados no sistema — pedidos, clientes, produtos, estoque):

- **Vendas por vendedor**: somar pedidos por vendedor vs. meta do cadastro de
  vendedores (já reutiliza `_pedidoData` + `tblVendedores`).
- **Curva ABC de clientes**: ordenar clientes por receita (de `_pedidoData`),
  classes A/B/C por participação acumulada — reaproveita o ranking do dashboard.
- **Funil & conversão**: alimentar do **funil de oportunidades do CRM**
  (`triade_crm_oport_<emp>`), que já existe.
- **ABC de produtos / estoque parado / validade**: derivar de `tblEstoque`
  (saldo, valor, lotes, validade) — a tela de Posição de estoque já tem tudo.
- **Fluxo projetado / Aging**: derivar de `tblReceber`/`tblPagar` por
  vencimento (aging já tem faixas; basta contar por status/vencimento).

Enquanto não forem dinâmicos, vale ao menos uma **faixa/aviso "dados de
exemplo"** nesses relatórios para não confundir com dados reais.

## 4. Pontos de atenção / possíveis melhorias de robustez

- **Tela morta:** `s-comissoes-cad` (Cadastros › Comissões) continua no HTML,
  mas o menu/permite/registro foram removidos. Pode ser **excluída** do HTML
  para limpar (hoje fica inacessível, mas ocupa espaço).
- **`s-pedido-det`** (detalhe de pedido em tela cheia) é **estático/demo** e não
  é alcançado pela navegação — a visualização real do pedido é o modal
  `modalPedidoView`. Considerar remover ou ligar.
- **Excel `.xls` (HTML):** valores agora saem como número/moeda e há linha de
  Total, mas o símbolo "R$" e a imagem da logo dependem da versão do Excel
  (limitação da técnica). Já está anotado como requisito de `.xlsx` nativo na
  fase de código (`PLANO-DESENVOLVIMENTO.md` §6.4).
- **Parcelas do pedido:** a condição de pagamento gera N títulos com a divisão
  igualitária (último centavo ajustado). Para o código real, "congelar" o valor
  no fechamento (snapshot) — já anotado para comissões; vale o mesmo aqui.
- **Inativar fornecedor/produto:** como não há coluna de status nessas tabelas,
  o inativo aparece como selo + linha esmaecida. Se quiser, dá para padronizar
  com uma **coluna Status** igual à de clientes.
- **Reports x permissão:** o hub de relatórios respeita `rel:<cat>`; ao tornar
  os relatórios dinâmicos, manter o gating.

## 5. Sugestões de melhoria de telas (UX)

- **Dashboard:** os cards de avisos (aguardando aprovação/pagamento, estoque
  baixo, boletos vencidos) têm números fixos no HTML — vale ligá-los aos
  contadores reais (já existem `_refreshNotificacoes`/`_refreshEstoqueKPI`).
- **Posição de estoque:** botão "Colunas" (como no financeiro) e exportação
  Excel formatada (hoje o financeiro já tem; estender às listagens grandes).
- **CRM:** pequeno painel de conversão do funil (valor no pipeline, taxa por
  estágio) e registrar a oportunidade **perdida** no histórico do cliente.
- **Pedido:** mostrar a **condição de pagamento** escolhida no preview de
  confirmação e no modal de visualização do pedido.
- **Busca global:** já existe o atalho/registro de telas; vale incluir busca por
  **cliente/pedido/título** (não só por tela).

## 6. Novos relatórios sugeridos

- **Resultado do período (DRE simplificada):** receitas (recebidas) − despesas
  (pagas) por categoria, no período — alto valor gerencial.
- **Produtos mais vendidos (período):** ranking por quantidade e por valor (o
  dashboard já tem Top 5; virar relatório com filtro de data e export).
- **Recompra/clientes inativos:** o CRM já calcula; virar relatório exportável.
- **Comissões por competência (fechadas):** lista dos títulos de comissão
  gerados (do Contas a pagar com `data-comissao-comp`).
- **Posição de estoque por validade (vencendo em X dias):** já há a base em
  `tblEstoque`/lotes.

## 7. Prioridades sugeridas

1. **Tornar dinâmicos** os relatórios comerciais e de estoque (maior impacto de
   credibilidade do protótipo).
2. **Ligar os avisos do Dashboard** aos contadores reais.
3. **Limpeza:** remover telas mortas (`s-comissoes-cad`, `s-pedido-det`).
4. **Novos relatórios:** DRE simplificada e Produtos mais vendidos.
5. Pequenos polimentos de UX (condição no preview do pedido, Colunas no estoque).

> Recomendação final de teste: abrir o mockup, criar 2–3 pedidos com condições
> e formas diferentes, baixar títulos, fechar uma competência de comissões e
> percorrer os relatórios — validando que os **dinâmicos** refletem o que foi
> lançado e marcando os **estáticos** para conversão.
