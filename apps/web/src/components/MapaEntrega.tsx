import { useI18n } from '../i18n/I18nContext.js';

// Mapa simples com o pin do motoboy (Google Maps Embed, modo place).
// Precisa de uma chave de NAVEGADOR em VITE_GOOGLE_MAPS_KEY (restrita por referrer).
// Sem chave, cai num fallback com link para o Google Maps.
const KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY as string | undefined;

export function MapaEntrega({ lat, lng, altura = 320 }: { lat: number | null; lng: number | null; altura?: number }) {
  const { t } = useI18n();
  if (lat == null || lng == null) {
    return <div className="muted" style={{ padding: 24, textAlign: 'center', border: '0.5px solid var(--borda)', borderRadius: 12 }}>{t('rastreio.sem_posicao')}</div>;
  }
  if (!KEY) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 18 }}>
        <div className="muted" style={{ marginBottom: 8 }}>{t('rastreio.lat')}: {lat.toFixed(5)} · {t('rastreio.lng')}: {lng.toFixed(5)}</div>
        <a className="btn-primary" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">{t('rastreio.ver_mapa')}</a>
      </div>
    );
  }
  const src = `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${lat},${lng}&zoom=16`;
  return <iframe title="mapa" src={src} style={{ width: '100%', height: altura, border: 0, borderRadius: 12 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
}
