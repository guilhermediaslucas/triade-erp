import type { CapacitorConfig } from '@capacitor/cli';

// Empacotamento do TRIADE como app Android/iOS (Capacitor).
// Modo "bundled": o app embarca os arquivos do build (webDir = dist) e chama
// a API remota (Render) via VITE_API_URL embutido no build. É o modo correto
// para publicar nas lojas e usar plugins nativos (ex.: leitor de código de barras).
//
// Alternativa "atalho do site" (sem embarcar, sempre na última versão publicada):
// comente o uso do dist e descomente o bloco `server.url` abaixo. A Apple costuma
// recusar apps que são só um wrapper do site, então o modo bundled é o recomendado.
const config: CapacitorConfig = {
  appId: 'br.com.triadeerp.app',
  appName: 'Tríade ERP',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  // server: { url: 'https://triade-erp.pages.dev', cleartext: false },
};

export default config;
