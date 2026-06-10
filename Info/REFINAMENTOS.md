# Refinamentos pendentes — alinhar o sistema ao mockup

> Checklist mestre do que o **mockup** (`Info/mockups/erp-mockup.html`) tem e o
> **sistema** ainda não. Objetivo: não deixar nada de fora. Marcar `[x]` ao concluir.
> O que já está pronto está no histórico do `CLAUDE.md` (Fases 0–6 + preço por cliente).

## Comercial
- [x] **Campanhas de preço** (preço promocional por período sobre o preço base)
- [x] Preço por cliente (negociado, sobrepõe o base no pedido)
- [ ] Condições de pagamento (cadastro) + **parcelamento** do título no pedido
- [ ] Orçamentos como etapa explícita (hoje é o status "orçamento" do pedido)
- [ ] CRM (histórico por cliente, previsão de recompra, funil de oportunidades, inativos)
- [ ] Comissões por vendedor (apuração) — ver também Financeiro

## Estoque / Logística
- [ ] Código de barras / etiquetas por item (bipagem na entrada e na separação)
- [ ] Inventário (contagem + ajuste; por leitor no mockup)
- [ ] Transferência entre locais/depósitos
- [ ] Marcas de produtos (cadastro) usado no recebimento
- [ ] Formas de entrega + frete (motoboy por CEP×km, correios/transportadora manual)
- [ ] Gestão de fretes (Logística) + geração de títulos por motoboy
- [ ] Romaneio imprimível (logo + vendedor + itens/lotes/endereço)
- [ ] Recebimento multi-lote com bipagem (hoje é 1 lote simples)

## Financeiro
- [ ] Controle de comissões (fechar competência → título a pagar)
- [ ] Contas correntes / Bancos (cadastro + saldos)
- [ ] Conciliação bancária
- [ ] Parcelar / Multiplicar títulos
- [ ] Tipos de documento, Categorias financeiras, Credores/Reembolso (cadastros)
- [ ] KPIs clicáveis + filtros avançados nas contas (mockup tem modal de 14 filtros)
- [ ] Exportar Excel formatado (hoje os relatórios exportam CSV)

## Cadastros (Pessoas)
- [ ] Motoboys
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
