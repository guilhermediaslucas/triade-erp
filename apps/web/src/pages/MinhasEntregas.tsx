import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda, numeroPedido } from '../lib/pedido.js';
import { MapaEntrega } from '../components/MapaEntrega.js';
import { ConfirmarEntrega } from '../components/ConfirmarEntrega.js';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

type StatusEntrega = 'aguardando' | 'a_caminho' | 'chegou' | 'entregue';
interface Entrega { pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; status: StatusEntrega; rastreioToken: string | null; total: number; criadoEm: string; posicao: { lat: number; lng: number; criadoEm: string } | null; eta: { km: number; min: number } | null; }

const corStatus = (s: StatusEntrega) => s === 'entregue' ? 'st-verde' : s === 'chegou' ? 'st-ciano' : s === 'a_caminho' ? 'st-azul' : 'st-cinza';

// Abre o Google Maps com a rota até o endereço (no Android o sistema oferece o Waze também).
function navegar(endereco: string | null) {
  if (!endereco) return;
  const url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + encodeURIComponent(endereco);
  window.open(url, '_blank');
}

export function MinhasEntregas() {
  const { token } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmar, setConfirmar] = useState<Entrega | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  async function carregar() {
    try { setEntregas(await api.get<Entrega[]>('/entregas/minhas', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  // GPS: enquanto houver entrega em rota (a_caminho/chegou), envia a posição.
  const ativasIds = entregas.filter((e) => e.status === 'a_caminho' || e.status === 'chegou').map((e) => e.pedidoId);
  const ativasKey = ativasIds.join(',');
  useEffect(() => {
    let cancelado = false;
    const enviar = (lat: number, lng: number) => {
      for (const id of ativasIds) api.post('/entregas/' + id + '/posicao', { lat, lng }, token!).catch(() => {});
    };
    async function iniciar() {
      if (!ativasIds.length) return;
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await Geolocation.requestPermissions();
          if (perm.location === 'denied') { setErro('rastreio.gps_negado'); return; }
          const wid = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
            if (pos && !cancelado) enviar(pos.coords.latitude, pos.coords.longitude);
          });
          cleanupRef.current = () => { Geolocation.clearWatch({ id: wid }).catch(() => {}); };
        } catch { setErro('rastreio.sem_gps'); }
      } else if ('geolocation' in navigator) {
        const wid = navigator.geolocation.watchPosition(
          (pos) => { if (!cancelado) enviar(pos.coords.latitude, pos.coords.longitude); },
          () => { setErro('rastreio.gps_negado'); },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
        );
        cleanupRef.current = () => navigator.geolocation.clearWatch(wid);
      } else { setErro('rastreio.sem_gps'); }
    }
    iniciar();
    return () => { cancelado = true; if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; } };
    /* eslint-disable-next-line */
  }, [ativasKey]);

  async function avancar(e: Entrega, status: StatusEntrega) {
    setErro(null);
    try {
      await api.patch('/entregas/' + e.pedidoId + '/status', { status }, token!);
      carregar(); toast(t('rastreio.atualizado'));
    } catch (err) { const k = (err as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  const proximo = (s: StatusEntrega): { st: StatusEntrega; k: string } | null =>
    s === 'aguardando' ? { st: 'a_caminho', k: 'rastreio.btn_a_caminho' }
    : s === 'a_caminho' ? { st: 'chegou', k: 'rastreio.btn_cheguei' }
    : s === 'chegou' ? { st: 'entregue', k: 'rastreio.btn_entregue' }
    : null;

  // Modo foco: a parada ATUAL (em rota, ou a 1ª da fila) ocupa a tela; as demais ficam recolhidas.
  const idxAtual = (() => {
    const i = entregas.findIndex((e) => e.status === 'a_caminho' || e.status === 'chegou');
    return i >= 0 ? i : (entregas.length ? 0 : -1);
  })();
  const total = entregas.length;
  const atual = idxAtual >= 0 ? entregas[idxAtual]! : null;
  const proximas = entregas.filter((_, i) => i !== idxAtual);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="crumb">{t('rastreio.crumb_minhas')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('rastreio.minhas')}</h1><div className="muted page-sub">{t('rastreio.minhas_sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ativasIds.length > 0 && <div className="alerta-ok" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Ic name="i-truck" className="sm" /> {t('rastreio.gps_ativo')}</div>}
      {carregando && <div className="muted">{t('common.carregando')}</div>}
      {!carregando && total === 0 && <div className="card" style={{ textAlign: 'center', padding: 40 }}><div className="muted">{t('rastreio.sem_entregas')}</div></div>}

      {atual && (() => {
        const prox = proximo(atual.status);
        return (
          <div className="card" style={{ border: '2px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>{t('rastreio.entrega')} {idxAtual + 1} {t('rastreio.de')} {total}{total - idxAtual - 1 > 0 ? ` · ${total - idxAtual - 1} ${t('rastreio.restantes')}` : ''}</b>
              <span className={'pill ' + corStatus(atual.status)}>{t('rastreio.st.' + atual.status)}</span>
            </div>

            {(atual.enderecoEntrega || atual.posicao) && (
              <div style={{ margin: '10px 0' }}>
                <MapaEntrega lat={atual.posicao?.lat ?? null} lng={atual.posicao?.lng ?? null} destino={atual.enderecoEntrega} altura={220} />
              </div>
            )}

            <div style={{ fontSize: 12, letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--muted)' }}>{t('rastreio.parada_atual')}</div>
            <div style={{ fontWeight: 600, fontSize: 17, marginTop: 2 }}>{numeroPedido(atual.numero)} · {atual.clienteNome ?? '—'} · {moeda(atual.total)}</div>
            <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}><Ic name="i-pin" className="sm" /> {atual.enderecoEntrega ?? '—'}</div>
            {atual.eta && <div className="muted" style={{ fontSize: 13, marginTop: 6 }}><Ic name="i-clock" className="sm" /> {t('rastreio.faltam')} {atual.eta.min} min · {atual.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn-ghost" style={{ flex: 1 }} disabled={!atual.enderecoEntrega} onClick={() => navegar(atual.enderecoEntrega)}><Ic name="i-nav" className="sm" /> {t('rastreio.navegar')}</button>
              {prox && <button className="btn-primary" style={{ flex: 1 }} onClick={() => prox.st === 'entregue' ? setConfirmar(atual) : avancar(atual, prox.st)}>{t(prox.k)}</button>}
            </div>
          </div>
        );
      })()}

      {proximas.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>{t('rastreio.proximas_paradas')} · {proximas.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {entregas.map((e, i) => i === idxAtual ? null : (
              <div key={e.pedidoId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '0.5px solid var(--borda)' }}>
                <span style={{ flex: '0 0 26px', height: 26, borderRadius: '50%', background: 'var(--borda)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}><b>{numeroPedido(e.numero)}</b> · {e.clienteNome ?? '—'}</div>
                  <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.enderecoEntrega ?? '—'}</div>
                </div>
                <button className="btn-ghost btn-mini" disabled={!e.enderecoEntrega} onClick={() => navegar(e.enderecoEntrega)}><Ic name="i-nav" className="sm" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmar && (
        <ConfirmarEntrega
          pedido={numeroPedido(confirmar.numero) + ' · ' + (confirmar.clienteNome ?? '')}
          onFechar={() => setConfirmar(null)}
          onConfirmar={async (codigo) => {
            await api.patch('/entregas/' + confirmar.pedidoId + '/status', { status: 'entregue', codigoConfirmacao: codigo }, token!);
            setConfirmar(null); carregar(); toast(t('rastreio.atualizado'));
          }}
        />
      )}
    </div>
  );
}
