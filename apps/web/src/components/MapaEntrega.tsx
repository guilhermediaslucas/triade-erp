import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';

// Mapa do rastreio via Google Maps JS SDK.
//  - Com posição do motoboy (a_caminho/chegou): pin que desliza (panTo/setPosition) +
//    rota até o cliente (DirectionsRenderer).
//  - Sem posição, mas com endereço de destino: mostra o DESTINO no mapa (preview antes
//    de iniciar a corrida) — geocodifica o endereço e centraliza nele.
// Precisa, na chave de NAVEGADOR (VITE_GOOGLE_MAPS_KEY): "Maps JavaScript API",
// "Directions API" (rota) e "Geocoding API" (preview do destino). Sem chave → fallback com link.
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
  const markerRef = useRef<any>(null);       // pin do motoboy
  const destMarkerRef = useRef<any>(null);   // pin do destino
  const dirRef = useRef<any>(null);
  const destinoRef = useRef<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  const temPos = lat != null && lng != null;
  const dest = destino && destino.trim() ? destino.trim() : null;

  useEffect(() => {
    if (!KEY || (!temPos && !dest)) return;
    let cancel = false;
    carregarMaps(KEY).then((maps) => {
      if (cancel || !divRef.current) return;
      if (!mapRef.current) {
        mapRef.current = new maps.Map(divRef.current, {
          center: temPos ? { lat, lng } : { lat: -14.235, lng: -51.925 },
          zoom: temPos ? 15 : 4, disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
        });
      }
      const map = mapRef.current;

      if (temPos) {
        const pos = { lat, lng };
        if (!markerRef.current) markerRef.current = new maps.Marker({ position: pos, map });
        else markerRef.current.setPosition(pos);
        if (dest && dest !== destinoRef.current) {
          // Desenha a rota motoboy → cliente uma vez por destino (enquadra os dois pontos).
          destinoRef.current = dest;
          if (dirRef.current) { dirRef.current.setMap(null); dirRef.current = null; }
          const ds = new maps.DirectionsService();
          const dr = new maps.DirectionsRenderer({ map, suppressMarkers: true, preserveViewport: false });
          dirRef.current = dr;
          ds.route({ origin: pos, destination: dest, travelMode: maps.TravelMode.DRIVING }, (res: any, status: string) => {
            if (cancel || status !== 'OK' || dirRef.current !== dr) return;
            dr.setDirections(res);
            const fim = res?.routes?.[0]?.legs?.[0]?.end_location;
            if (fim) { if (!destMarkerRef.current) destMarkerRef.current = new maps.Marker({ position: fim, map }); else destMarkerRef.current.setPosition(fim); }
          });
        } else if (!dest) {
          map.panTo(pos);  // sem destino: segue o motoboy
        }
      } else if (dest && dest !== destinoRef.current) {
        // Sem posição do motoboy: mostra só o destino (preview antes da corrida).
        destinoRef.current = dest;
        new maps.Geocoder().geocode({ address: dest }, (res: any, status: string) => {
          if (cancel || status !== 'OK' || !res?.[0]) return;
          const loc = res[0].geometry.location;
          map.setCenter(loc); map.setZoom(15);
          if (!destMarkerRef.current) destMarkerRef.current = new maps.Marker({ position: loc, map });
          else destMarkerRef.current.setPosition(loc);
        });
      }
    }).catch(() => { if (!cancel) setFalhou(true); });
    return () => { cancel = true; };
  }, [lat, lng, destino]);

  // Fallback (sem chave do Google ou falha ao carregar): card com link.
  if (!KEY || falhou) {
    const link = dest
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
      : (temPos ? `https://www.google.com/maps?q=${lat},${lng}` : null);
    return (
      <div className="card" style={{ textAlign: 'center', padding: 22, minHeight: Math.min(altura, 220), display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        {dest && <div style={{ fontWeight: 500 }}>{dest}</div>}
        {temPos && <div className="muted" style={{ fontSize: 13 }}>{t('rastreio.lat')}: {lat!.toFixed(5)} · {t('rastreio.lng')}: {lng!.toFixed(5)}</div>}
        {link && <div><a className="btn-primary" href={link} target="_blank" rel="noreferrer">{t('rastreio.ver_mapa')}</a></div>}
        <div className="muted" style={{ fontSize: 12 }}>{t('rastreio.mapa_sem_chave')}</div>
      </div>
    );
  }
  if (!temPos && !dest) {
    return <div className="muted" style={{ padding: 24, textAlign: 'center', border: '0.5px solid var(--borda)', borderRadius: 12 }}>{t('rastreio.sem_posicao')}</div>;
  }
  return <div ref={divRef} style={{ width: '100%', height: altura, borderRadius: 12, overflow: 'hidden' }} />;
}
