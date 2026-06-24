import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3333';
const APK_URL = (import.meta.env.VITE_APK_URL as string | undefined) || '';
const INTERVALO = 3 * 60 * 1000; // checa a cada 3 min (e ao focar a aba)

/** true se a versão `a` é maior que `b` (semver simples X.Y.Z). */
function versaoMaior(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => Number(n) || 0);
  const pb = b.split('.').map((n) => Number(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0, y = pb[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

function IcoRefresh() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6l3 3M21 12a9 9 0 0 1-15 6l-3-3" /><path d="M21 3v6h-6M3 21v-6h6" /></svg>;
}
function IcoDownload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v11M8 10l4 4 4-4M5 21h14" /></svg>;
}

/**
 * Avisa quando há versão mais nova publicada.
 * - Site/PWA: compara o `buildId` do `version.json` (qualquer deploy novo) → "Recarregar agora".
 * - APK nativo: compara a versão (semver) do backend (`GET /version`) → "Baixar nova versão" (abre o APK).
 */
export function NovaVersao() {
  const nativo = Capacitor.isNativePlatform();
  const [versaoNova, setVersaoNova] = useState<string | null>(null);
  const [oculto, setOculto] = useState(false);
  const dispensado = useRef<string | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) return; // não incomoda em desenvolvimento
    let vivo = true;

    async function checar() {
      try {
        const url = nativo ? `${API_BASE}/version?_=${Date.now()}` : `/version.json?_=${Date.now()}`;
        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok || !vivo) return;
        const d = (await r.json()) as { versao?: string; buildId?: string };
        const novo = nativo
          ? (d.versao && versaoMaior(d.versao, __APP_VERSION__) ? d.versao : null)
          : (d.buildId && d.buildId !== __BUILD_ID__ ? (d.versao ?? 'nova') : null);
        if (vivo && novo && dispensado.current !== novo) { setVersaoNova(novo); setOculto(false); }
      } catch { /* offline / falha de rede: ignora */ }
    }

    void checar();
    const id = window.setInterval(checar, INTERVALO);
    const aoFocar = () => { if (document.visibilityState === 'visible') void checar(); };
    document.addEventListener('visibilitychange', aoFocar);
    return () => { vivo = false; window.clearInterval(id); document.removeEventListener('visibilitychange', aoFocar); };
  }, [nativo]);

  if (!versaoNova || oculto) return null;

  async function atualizar() {
    if (nativo) {
      if (APK_URL) window.open(APK_URL, '_blank');
      return;
    }
    // Site: limpa SW + caches e recarrega para pegar os assets novos.
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.update().catch(() => {})));
      }
      if ('caches' in window) {
        const chaves = await caches.keys();
        await Promise.all(chaves.map((k) => caches.delete(k)));
      }
    } catch { /* segue para o reload mesmo assim */ }
    location.reload();
  }

  function dispensar() { dispensado.current = versaoNova; setOculto(true); }

  const rotulo = versaoNova && versaoNova !== 'nova' ? ` — v${versaoNova}` : '';
  const podeAgir = !nativo || !!APK_URL;

  return (
    <div className="nv-toast" role="status" aria-live="polite">
      <div className="nv-ic">{nativo ? <IcoDownload /> : <IcoRefresh />}</div>
      <div className="nv-body">
        <div className="nv-tt">Nova versão disponível{rotulo}</div>
        <div className="nv-sub">
          {nativo
            ? 'Saiu uma nova versão do app. Baixe o APK atualizado para continuar.'
            : 'Há uma atualização do Tríade ERP. Recarregue para usar a versão mais recente.'}
        </div>
        {podeAgir && (
          <button className="nv-act" onClick={atualizar}>
            {nativo ? <IcoDownload /> : <IcoRefresh />} {nativo ? 'Baixar nova versão' : 'Recarregar agora'}
          </button>
        )}
      </div>
      <button className="nv-x" onClick={dispensar} aria-label="Dispensar">×</button>
    </div>
  );
}
