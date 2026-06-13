import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';
import { escanearCodigo, scannerNativo } from '../lib/scanner.js';
import { Ic } from './Icones.js';

// Botão "Escanear" que abre a câmera e devolve o código lido via onLido().
// Só aparece no app nativo (Android/iOS); no navegador some (usa-se o leitor
// USB / digitação no próprio campo de bipagem).
export function BotaoEscanear({ onLido }: { onLido: (codigo: string) => void }) {
  const { t } = useI18n();
  const [lendo, setLendo] = useState(false);
  if (!scannerNativo()) return null;
  async function escanear() {
    setLendo(true);
    try { const c = await escanearCodigo(); if (c) onLido(c); }
    finally { setLendo(false); }
  }
  return (
    <button type="button" className="btn-ghost btn-mini" disabled={lendo} onClick={escanear}>
      {lendo ? '...' : <><Ic name="i-camera" className="sm" /> {t('scan.escanear')}</>}
    </button>
  );
}
