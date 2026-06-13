import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';

// Botão de tela cheia (Fullscreen API) — espelha o "Modo apresentação" do mockup.
// Reutilizado na topbar (perto do botão de tema) e no Modo TV.
export function BotaoTelaCheia({ className }: { className?: string }) {
  const { t } = useI18n();
  const [cheia, setCheia] = useState<boolean>(typeof document !== 'undefined' && !!document.fullscreenElement);

  useEffect(() => {
    const on = () => setCheia(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  function alternar() {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    } catch { /* alguns navegadores bloqueiam — ignora */ }
  }

  return (
    <button className={className ?? 'btn-tema'} onClick={alternar} title={t('tela.cheia')} aria-label={t('tela.cheia')}>
      <Ic name={cheia ? 'i-compress' : 'i-expand'} className="sm" />
    </button>
  );
}
