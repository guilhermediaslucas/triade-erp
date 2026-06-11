# Refinamentos pendentes — alinhar o sistema ao mockup

> Checklist mestre do que o **mockup** (`Info/mockups/erp-mockup.html`) tem e o
> **sistema** ainda não. Objetivo: não deixar nada de fora. Marcar `[x]` ao concluir.
> O que já está pronto está no histórico do `CLAUDE.md` (Fases 0–6 + preço por cliente).

## Comercial
- [x] **Campanhas de preço** (preço promocional por período sobre o preço base)
- [x] Preço por cliente (negociado, sobrepõe o base no pedido)
- [x] Condições de pagamento (cadastro) + **parcelamento** do título no pedido
- [ ] Orçamentos como etapa explícita (hoje é o status "orçamento" do pedido)
- [ ] CRM (histórico por cliente, previsão de recompra, funil de oportunidades, inativos)
- [x] Comissões por vendedor (apuração + fechar competência → título a pagar)

## Estoque / Logística
- [x] Código de barras na **entrada** (bipagem dos códigos já afixados nos produtos; quantidade = nº de códigos lidos; recusa código já no estoque; consulta por código → produto/lote/validade)
- [x] Código de barras na **separação** (bipar o item → traz produto/lote/validade → baixa do lote certo, casando com o pedido)
- [x] Inventário por leitor (bipa a contagem, compara com o esperado, baixa faltantes como perda + histórico)
- [~] Transferência entre locais/depósitos — **fora de escopo** (decisão do Gui: não faz sentido p/ esta operação)
- [x] Marcas de produtos (cadastro) usado no recebimento
- [x] Formas de entrega + frete (retirada/motoboy/correios/transportadora; motoboy = km simulado por CEP × valor/km com mínimo; correios/transp = manual)
- [x] Gestão de fretes (Logística) + geração de títulos por motoboy
- [x] Romaneio imprimível (logo + vendedor + itens/endereço; lotes por item: evolução futura)
- [x] Recebimento multi-lote com bipagem (N lotes por nota, cada um com marca + bipagem; soma = qtd da nota)

## Financeiro
- [x] Controle de comissões (fechar competência → título a pagar)
- [x] Contas correntes / Bancos (cadastro + saldos + vínculo na baixa)
- [x] Conciliação bancária — etapa 1 (manual por conta) + etapa 2 (importar extrato OFX/CSV com match automático por valor)
- [x] Parcelar / Multiplicar títulos (dividir o valor em N parcelas ou replicar o valor recorrente; substitui o original)
- [x] Categorias financeiras (cadastro receita/despesa + vínculo no título) — Tipos de documento / Credores: futuro
- [ ] KPIs clicáveis + filtros avançados nas contas (mockup tem modal de 14 filtros)
- [x] Exportar Excel formatado (.xls SpreadsheetML, sem dependência) ao lado do CSV em todos os relatórios

## Cadastros (Pessoas)
- [x] Motoboys (cadastro + configuração de frete km/mín)
- [x] Favorecidos (para reembolso) — cadastro PF/PJ, documento, PIX e dados bancários (CRUD + ativo) + vínculo no título a pagar

## Relatórios (além de Vendas e Produtos mais vendidos, já prontos)
- [x] DRE simplificada (resultado do período — caixa realizado por origem; receitas/despesas/resultado, export CSV)
- [x] DRE por categoria financeira (seletor origem/categoria no relatório)
- [x] Curva ABC de produtos (classe A/B/C por receita, % acumulado, resumo, export CSV) — por cliente: futuro
- [x] Aging de recebíveis (faixas de atraso, KPIs por faixa, export CSV) — Fluxo projetado: futuro
- [x] Validade de lotes (vencidos / a vencer, KPIs, export CSV)
- [x] Estoque parado (produtos com saldo sem saída há X dias, valor parado, export CSV)
- [x] Vendas por categoria (período, ranking, export CSV) — "por vendedor" já no relatório de Vendas
- [x] Perdas de estoque (baixas por perda no período, motivo, valor, KPIs, CSV)
- [x] Histórico de inventários (contagens no período, acuracidade média, faltantes, drill por inventário, CSV)

## Polimento visual / UX (passada dedicada, ao final)
- [ ] Formulários em página inteira onde o mockup usa (ex.: Produto)
- [x] Busca global (Ctrl+K) — paleta de navegação por todas as telas (respeita permissões)
- [x] Toasts de confirmação (sucesso/erro flutuantes; ligados em Contas e ações do pedido)
- [x] Sino de notificações (topbar: títulos vencidos, lotes vencendo, estoque baixo; respeita permissões)
- [x] Ações em massa (Contas: selecionar títulos → baixar/excluir em lote)
- [ ] Esconder/mostrar e redimensionar colunas das listas
- [ ] Ajuste fino de espaçamentos/cores para casar com o mockup

---

**Ordem recomendada de execução:** campanhas de preço → condições de pagamento/parcelas →
comissões → contas correntes/bancos → código de barras + inventário → fretes/motoboys/romaneio →
CRM → relatórios extras → polimento visual.
