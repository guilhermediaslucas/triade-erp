import { useI18n } from '../i18n/I18nContext.js';
import type { Idioma } from '@triade/shared';

const ROTULOS: Record<Idioma, string> = { 'pt-BR': 'PT', 'en-US': 'EN', es: 'ES' };

export function SeletorIdioma() {
  const { idioma, idiomas, setIdioma } = useI18n();
  return (
    <select value={idioma} onChange={(e) => setIdioma(e.target.value as Idioma)} className="sel-idioma" aria-label="Idioma">
      {idiomas.map((i) => (
        <option key={i} value={i}>{ROTULOS[i]}</option>
      ))}
    </select>
  );
}
