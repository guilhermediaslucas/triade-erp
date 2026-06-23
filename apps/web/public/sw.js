// Service worker mínimo do Tríade ERP.
// Objetivo: habilitar a instalação como app (PWA) — o navegador passa a oferecer
// "Instalar app". NÃO faz cache do app-shell: toda navegação vai à rede, então a
// versão sempre é a mais nova (evita o app ficar preso numa versão antiga após deploy).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  // Só intercepta navegações de página; o restante (JS/CSS/API) segue direto pela rede.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
