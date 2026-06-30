import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

// Banner próprio de instalação do PWA: captura o evento do navegador e dispara
// a instalação nativa. Aparece 1× quando dá pra instalar; "Agora não" guarda a
// escolha por alguns dias. Some no APK nativo ou se já estiver instalado.
type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const LS = 'triade_pwa_dispensado';
const COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function InstalarApp() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const instalado = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
    if (instalado) return;
    if (Date.now() - Number(localStorage.getItem(LS) || 0) < COOLDOWN) return;

    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as PromptEvent); };
    const onInstalado = () => setEvt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalado);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalado);
    };
  }, []);

  if (!evt) return null;

  async function instalar() {
    try { await evt!.prompt(); } catch { /* usuário pode cancelar */ }
    setEvt(null);
  }
  function agoraNao() {
    localStorage.setItem(LS, String(Date.now()));
    setEvt(null);
  }

  return (
    <div className="pwa-card" role="dialog" aria-label="Instalar aplicativo">
      <button className="pwa-x" onClick={agoraNao} aria-label="Fechar">✕</button>
      <div className="pwa-h">
        <span className="pwa-ico">TR</span>
        <div>
          <div className="pwa-tt">Instalar Tríade ERP</div>
          <div className="pwa-fo">Fornecedor: triade-erp.com</div>
        </div>
      </div>
      <div className="pwa-q">Usar todo dia? Instale o app e tenha:</div>
      <div className="pwa-li"><span className="pwa-b" />Abre em janela própria, sem abas do navegador</div>
      <div className="pwa-li"><span className="pwa-b" />Atalho na barra de tarefas e no menu Iniciar</div>
      <div className="pwa-li"><span className="pwa-b" />Acesso rápido no celular e no computador</div>
      <div className="pwa-bt">
        <button className="pwa-btf" onClick={instalar}>Instalar</button>
        <button className="pwa-btg" onClick={agoraNao}>Agora não</button>
      </div>
    </div>
  );
}
