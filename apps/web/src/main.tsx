import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA: registra o service worker para o app ser instalável pelo navegador.
// Não roda no app nativo (APK/Capacitor) — lá a instalação já é o próprio APK.
const ehNativo = (window as any).Capacitor?.isNativePlatform?.() === true;
if (!ehNativo && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* sem PWA não quebra o app */ });
  });
}
