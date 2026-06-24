import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as { version: string };
const versao = pkg.version;
// id único por build — muda a cada deploy do site (base da detecção de "nova versão" no PWA).
const buildId = String(Date.now());

export default defineConfig({
  plugins: [
    react(),
    {
      // grava dist/version.json (versão + buildId) após o bundle — consumido pelo checador de versão.
      name: 'emitir-version-json',
      closeBundle() {
        writeFileSync(resolve(process.cwd(), 'dist/version.json'), JSON.stringify({ versao, buildId }));
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(versao),
    __BUILD_ID__: JSON.stringify(buildId),
  },
  server: {
    port: 5173,
    proxy: {
      // Encaminha chamadas /api/* para a API (evita CORS no dev).
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
