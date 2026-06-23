import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';

// Mapa do rastreio via Google Maps JS SDK: o pin do motoboy se move sem recarregar a
// tela (panTo + setPosition), e a rota até o cliente é desenhada uma vez (DirectionsRenderer).
// Precisa da "Maps JavaScript API" (e Directions API p/ a linha) ativadas na chave de NAVEGADOR
// em VITE_GOOGLE_MAPS_KEY. Sem chave → fallback com link.
const KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY as string | undefined;

let mapsPromise: Promise<any> | null = null;
function carregarMaps(key: string): Promise<any> {
  const g = (window as any).google;
  if (g?.maps) return Promise.resolve(g.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
    s.async = true; s.defer = true;
    s.onload = () => { const gg = (window as any).google; gg?.maps ? resolve(gg.maps) : reject(new Error('maps')); };
    s.onerror = () => { mapsPromise = null; reject(new Error('maps')); };
    document.head.appendChild(s);
  });
  return mapsPromise;
}

export function MapaEntrega({ lat, lng, destino, altura = 320 }: { lat: number | null; lng: number | null; destino?: string | null; altura?: number }) {
  const { t } = useI18n();
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const dirRef = useRef<any>(null);
  const destinoRef = useRef<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!KEY || lat == null || lng == null) return;
    let cancel = false;
    carregarMaps(KEY).then((maps) => {
      if (cancel || !divRef.current) return;
      const pos = { lat, lng };
      if (!mapRef.current) {
        mapRef.current = new maps.Map(divRef.current, { center: pos, zoom: 15, disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' });
        markerRef.current = new maps.Marker({ position: pos, map: mapRef.current });
      } else {
        markerRef.current.setPosition(pos);
        mapRef.current.panTo(pos);
      }
      // Rota motoboy → cliente: desenha uma vez por destino (redesenha se o destino mudar).
      const dest = destino && destino.trim() ? destino.trim() : null;
      if (dest && dest !== destinoRef.current) {
        destinoRef.current = dest;
        if (dirRef.current) { dirRef.current.setMap(null); dirRef.current = null; }
        const ds = new maps.DirectionsService();
        const dr = new maps.DirectionsRenderer({ map: mapRef.current, suppressMarkers: true, preserveViewport: true });
        dirRef.current = dr;
        ds.route({ origin: pos, destination: dest, travelMode: maps.TravelMode.DRIVING }, (res: any, status: string) => {
          if (!cancel && status === 'OK' && dirRef.current === dr) dr.setDirections(res);
        });
      }
    }).catch(() => { if (!cancel) setFalhou(true); });
    return () => { cancel = true; };
  }, [lat, lng, destino]);

  if (lat == null || lng == null) {
    return <div className="muted" style={{ padding: 24, textAlign: 'center', border: '0.5px solid var(--borda)', borderRadius: 12 }}>{t('rastreio.sem_posicao')}</div>;
  }
  if (!KEY || falhou) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 18 }}>
        <div className="muted" style={{ marginBottom: 8 }}>{t('rastreio.lat')}: {lat.toFixed(5)} · {t('rastreio.lng')}: {lng.toFixed(5)}</div>
        <a className="btn-primary" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">{t('rastreio.ver_mapa')}</a>
      </div>
    );
  }
  return <div ref={divRef} style={{ width: '100%', height: altura, borderRadius: 12, overflow: 'hidden' }} />;
}
