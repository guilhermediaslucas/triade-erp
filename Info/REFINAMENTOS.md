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
- [ ] Transferência entre locais/depósitos
- [x] Marcas de produtos (cadastro) usado no recebimento
- [x] Formas de entrega + frete (retirada/motoboy/correios/transportadora; motoboy = km simulado por CEP × valor/km com mínimo; correios/transp = manual)
- [ ] Gestão de fretes (Logística) + geração de títulos por motoboy
- [ ] Romaneio imprimível (logo + vendedor + itens/lotes/endereço)
- [x] Recebimento multi-lote com bipagem (N lotes por nota, cada um com marca + bipagem; soma = qtd da nota)

## Financeiro
- [x] Controle de comissões (fechar competência → título a pagar)
- [x] Contas correntes / Bancos (cadastro + saldos + vínculo na baixa)
- [ ] Conciliação bancária
- [ ] Parcelar / Multiplicar títulos
- [ ] Tipos de documento, Categorias financeiras, Credores/Reembolso (cadastros)
- [ ] KPIs clicáveis + filtros avançados nas contas (mockup tem modal de 14 filtros)
- [ ] Exportar Excel formatado (hoje os relatórios exportam CSV)

## Cadastros (Pessoas)
- [x] Motoboys (cadastro + configuração de frete km/mín)
- [ ] Favorecidos (para reembolso)

## Relatórios (além de Vendas e Produtos mais vendidos, já prontos)
- [ ] DRE simplificada (resultado do período)
- [ ] Curva ABC (clientes / produtos)
- [ ] Aging de recebíveis / Fluxo projetado
- [ ] Vendas por vendedor/categoria, Estoque parado, Validade de lotes, etc.

## Polimento visual / UX (passada dedicada, ao final)
- [ ] Formulários em página inteira onde o mockup usa (ex.: Produto)
- [ ] Busca global (Ctrl+K)
- [ ] Sino de notificações + toasts de pendência
- [ ] Ações em massa (excluir/baixar selecionados)
- [ ] Esconder/mostrar e redimensionar colunas das listas
- [ ] Ajuste fino de espaçamentos/cores para casar com o mockup

---

**Ordem recomendada de execução:** campanhas de preço → condições de pagamento/parcelas →
comissões → contas correntes/bancos → código de barras + inventário → fretes/motoboys/romaneio →
CRM → relatórios extras → polimento visual.
