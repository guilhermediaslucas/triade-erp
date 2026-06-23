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

  // GPS: enquanto houver entrega em rota (a_caminho/chegou), acompanha a posição e a envia
  // para cada entrega ativa. Usa a geolocalização do navegador (no app, requer permissão de localização).
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

  // Avança o status (A caminho / Cheguei). "Entregue" passa pelo modal de código.
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

  // Parada "atual": a que está em rota; se nenhuma, a primeira da lista (a próxima a sair).
  const idxAtual = (() => {
    const i = entregas.findIndex((e) => e.status === 'a_caminho' || e.status === 'chegou');
    return i >= 0 ? i : (entregas.length ? 0 : -1);
  })();
  const pendentes = entregas.length;

  return (
    <div>
      <div className="crumb">{t('rastreio.crumb_minhas')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('rastreio.minhas')}</h1><div className="muted page-sub">{t('rastreio.minhas_sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ativasIds.length > 0 && <div className="alerta-ok" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Ic name="i-truck" className="sm" /> {t('rastreio.gps_ativo')}</div>}
      {!carregando && pendentes > 0 && <div className="muted" style={{ marginBottom: 10, fontSize: 13 }}>{pendentes} {t('rota.pendentes')} · {t('rastreio.siga_rota')}</div>}
      {carregando && <div className="muted">{t('common.carregando')}</div>}
      {!carregando && entregas.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40 }}><div className="muted">{t('rastreio.sem_entregas')}</div></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entregas.map((e, i) => {
          const prox = proximo(e.status);
          const atual = i === idxAtual;
          return (
            <div key={e.pedidoId} className="card" style={atual ? { outline: '2px solid var(--accent)', outlineOffset: 0 } : undefined}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ flex: '0 0 34px', height: 34, borderRadius: '50%', background: atual ? 'var(--accent)' : 'var(--borda)', color: atual ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div><b>{numeroPedido(e.numero)}</b> · {e.clienteNome ?? '—'} · <b>{moeda(e.total)}</b></div>
                    <span className={'pill ' + corStatus(e.status)}>{atual && e.status === 'aguardando' ? t('rastreio.proxima') : t('rastreio.st.' + e.status)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}><Ic name="i-pin" className="sm" /> {e.enderecoEntrega ?? '—'}</div>
                </div>
              </div>
              {(e.enderecoEntrega || e.posicao) && (
                <div style={{ marginTop: 10 }}>
                  <MapaEntrega lat={e.posicao?.lat ?? null} lng={e.posicao?.lng ?? null} destino={e.enderecoEntrega} altura={260} />
                  {e.eta && <div style={{ marginTop: 6, fontWeight: 500, fontSize: 13 }}><Ic name="i-clock" className="sm" /> {t('rastreio.faltam')} {e.eta.min} min · {e.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
                </div>
              )}
              {prox && (
                <button className="btn-primary" style={{ width: '100%', marginTop: 12 }}
                  onClick={() => prox.st === 'entregue' ? setConfirmar(e) : avancar(e, prox.st)}>
                  {t(prox.k)}
                </button>
              )}
            </div>
          );
        })}
      </div>

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
