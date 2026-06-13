# Frete por motoboy — distância real (Google Maps)

## Como o cálculo funciona

Para a forma de entrega **motoboy**, o frete é:

```
frete = distância(km) × valor_por_km   (respeitando o mínimo)
```

- **valor por km** e **mínimo**: configurados em *Cadastros › Pessoas › Motoboys* →
  bloco "Configuração de frete" (padrão R$ 2,00/km, mínimo R$ 20,00).
- **distância**: vem do **Google Distance Matrix** quando está configurado; senão,
  o sistema usa uma **estimativa** a partir dos dígitos do CEP (3 a 20 km) — é por
  isso que, sem o Google, o frete parece "aleatório". Não é bug: é o modo de estimativa.

A **origem** da rota é o endereço da empresa (*Configurações › Dados da empresa*);
o **destino** é o CEP do endereço de entrega do pedido.

> O cálculo já está pronto no código. Para passar a usar a distância real, basta a
> configuração abaixo — não precisa mexer no sistema.

---

## Passo a passo (uma vez)

### 1. Criar a chave do Google Maps
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto (ou use um existente) e **ative o faturamento** (billing). O Google
   exige cartão, mas dá um crédito mensal grátis que cobre uso pequeno.
3. Em *APIs e serviços › Biblioteca*, ative a **Distance Matrix API**.
4. Em *APIs e serviços › Credenciais*, crie uma **Chave de API**.
5. (Recomendado) Restrinja a chave à **Distance Matrix API** para segurança.

### 2. Configurar a chave no servidor (Render)
1. No painel do **Render**, abra o serviço da API (`triade-api`).
2. *Environment* → *Add Environment Variable*:
   - **Key:** `GOOGLE_MAPS_API_KEY`
   - **Value:** a chave criada no passo 1.
3. Salve. O Render reinicia a API sozinho.

### 3. Preencher o endereço da empresa (origem)
Em *Configurações › Dados da empresa*, preencha **logradouro, bairro, cidade, UF e CEP**.
Esse endereço é a origem da rota do motoboy. (Se faltar, o sistema usa o "CEP de origem"
do bloco de configuração de frete como fallback.)

---

## Como saber se está usando a distância real

Ao montar um pedido com entrega por motoboy, abaixo do frete aparece a **memória de
cálculo**, por exemplo:

- `7.2 km (Google Maps) × R$ 2,00 = R$ 14,40 (mín R$ 20,00)` → **distância real**.
- `11 km (estimado) × R$ 2,00 = R$ 22,00 (mín R$ 20,00)` → ainda na **estimativa**
  (falta a chave ou o endereço da empresa).

Se aparecer "(estimado)" mesmo após configurar, confira: a chave está certa no Render?
O faturamento do Google está ativo? O endereço da empresa está preenchido?

---

## Custo

A Distance Matrix cobra por requisição, mas o Google concede um crédito mensal gratuito
(US$ 200) que, para o volume de uma distribuidora pequena, costuma cobrir o uso sem custo.
Acompanhe o consumo no Google Cloud Console.
