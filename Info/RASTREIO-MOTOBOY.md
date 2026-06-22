# Rastreio do motoboy dentro do TRIADE (entrega + mapa)

> Status: **PROJETO / FUNDAÇÃO** (não implementado ainda). Este documento é o desenho
> acionável para construir o módulo numa entrega dedicada, com teste ao vivo (GPS + mapa).
> Decidido com o Gui: o rastreio fica **dentro do próprio TRIADE** (web + APK Capacitor),
> não é um app separado. Modelo de referência: iFood / Zé Delivery.

## 1. Visão

O motoboy abre a entrega no app, marca "a caminho", e o app envia a posição GPS
periodicamente. A empresa acompanha num mapa (web), e o **cliente** acompanha por um
**link público** (sem login) com o pin do motoboy + status da entrega — igual iFood.

## 2. Estados da entrega

`aguardando` (pronto, ainda não saiu) → `a_caminho` (motoboy saiu, GPS ativo) →
`chegou` (no endereço) → `entregue` (fecha; já existe o fluxo de "quem recebeu").
Cancelável: `cancelada`. Os estados convivem com o status do pedido
(`expedido`/`entregue`) — o rastreio é a camada de **última milha**.

## 3. Modelo de dados (migration tenant nova, ex. 070)

- `pedido` += `rastreio_token text` (aleatório, único — usado no link público) e
  `entrega_status text` (default `aguardando`).
- `entrega_posicao` (id, pedido_id FK, lat numeric, lng numeric, criado_em) — histórico
  do trajeto; a última linha é a posição atual. Índice por (pedido_id, criado_em desc).
- (Opcional) `motoboy` += `usuario_id` para o motoboy logar e ver só as entregas dele
  (já existe vínculo usuario↔vendedor; espelhar para motoboy).

## 4. Backend (hexagonal)

- Porta `RastreioRepository` + adapter SQL: `definirStatus`, `registrarPosicao`,
  `posicaoAtual(pedidoId)`, `buscarPorToken(token)`.
- `RastreioService`: gera token na expedição (motoboy), valida transições de estado,
  grava posição (best-effort, alta frequência).
- Rotas autenticadas (cap nova `logistica.entrega.gerenciar`):
  - `PATCH /entregas/:pedidoId/status` (motoboy avança o estado)
  - `POST  /entregas/:pedidoId/posicao` `{lat,lng}` (app envia a cada ~15s)
  - `GET   /entregas/ativas` (painel da empresa: entregas a_caminho)
- Rota **pública** (sem auth, rate-limited): `GET /rastreio/:token` → `{status, destino,
  motoboy: {nome}, posicao: {lat,lng,em}}`. Token aleatório = não enumera pedidos.

## 5. App do motoboy (Capacitor)

- Dep nova: `@capacitor/geolocation` (+ permissão de localização no AndroidManifest).
- Tela "Minhas entregas" (as do motoboy logado): botão **A caminho** inicia
  `Geolocation.watchPosition` → envia posição ao backend em intervalo; **Cheguei** e
  **Entregue** (reusa o modal de "quem recebeu", que já é obrigatório).
- Enviar posição só com a entrega `a_caminho` (economiza bateria); parar no `entregue`.

## 6. Mapa (web) e link do cliente

- Google Maps JS API (a chave já existe no servidor para o cálculo de frete — expor uma
  chave **restringida por referrer** só para o mapa no front, OU proxiar tiles).
- Painel da empresa: lista de entregas ativas + mapa com os pins dos motoboys
  (atualiza por polling a cada ~10s; WebSocket é evolução).
- Página pública `/rastreio/:token` (fora do Layout, sem login): mapa com pin do motoboy
  + destino + barra de status (aguardando → a caminho → chegou → entregue) + ETA simples
  (distância/velocidade média). Link enviável por WhatsApp/SMS ao cliente.

## 7. Decisões padrão (assumidas; ajustáveis)

- **Frequência de posição:** 15s enquanto `a_caminho`. **Atualização do mapa:** polling
  10s (sem WebSocket no MVP).
- **Privacidade:** GPS só roda durante a entrega; token público aleatório; nada de login
  do cliente; a posição some do público quando `entregue`/`cancelada`.
- **Mapa:** Google Maps (já usado no projeto). ETA estimado (não rota turn-by-turn).
- **Permissão:** cap nova `logistica.entrega.*`; motoboy logado vê só as próprias entregas.

## 8. Passos de implementação (ordem sugerida)

1. Migration (token + entrega_status + entrega_posicao) + porta/adapter/serviço + rotas.
2. Vínculo `motoboy.usuario_id` + tela "Minhas entregas" do motoboy (sem GPS ainda:
   avançar estados manualmente) — já entrega valor (status da última milha + link público
   textual).
3. `@capacitor/geolocation` + envio de posição + mapa no link público.
4. Painel da empresa com mapa das entregas ativas.
5. Refinos: WebSocket, ETA por rota, notificação ao cliente ("seu pedido saiu").

## 9. Esforço

Estimativa: **2–3 entregas** (migration+backend; app+GPS; mapa/link+painel). Requer
teste ao vivo no celular (permissão de GPS, precisão, bateria) — por isso não foi
construído no lote de ajustes; é uma fase própria.
