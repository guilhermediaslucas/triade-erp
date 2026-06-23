import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda, numeroPedido } from '../lib/pedido.js';
import { MapaEntrega } from '../components/MapaEntrega.js';
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
        // App nativo: usa o plugin do Capacitor (pede a permissão de localização).
        try {
          const perm = await Geolocation.requestPermissions();
          if (perm.location === 'denied') { setErro('rastreio.gps_negado'); return; }
          const wid = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
            if (pos && !cancelado) enviar(pos.coords.latitude, pos.coords.longitude);
          });
          cleanupRef.current = () => { Geolocation.clearWatch({ id: wid }).catch(() => {}); };
        } catch { setErro('rastreio.sem_gps'); }
      } else if ('geolocation' in navigator) {
        // Navegador (web/celular): usa a API do navegador.
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

  async function mudar(e: Entrega, status: StatusEntrega) {
    setErro(null);
    let recebidoPor: string | undefined;
    let codigoConfirmacao: string | undefined;
    if (status === 'entregue') {
      const quem = window.prompt(t('rastreio.quem_recebeu'));
      if (quem == null || !quem.trim()) return;
      recebidoPor = quem.trim();
      const cod = window.prompt(t('rastreio.codigo_telefone'));
      if (cod == null || !cod.trim()) return;
      codigoConfirmacao = cod.trim();
    }
    try {
      await api.patch('/entregas/' + e.pedidoId + '/status', { status, recebidoPor, codigoConfirmacao }, token!);
      carregar(); toast(t('rastreio.atualizado'));
    } catch (err) { const k = (err as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  function copiarLink(e: Entrega) {
    if (!e.rastreioToken) return;
    const url = window.location.origin + '/rastreio/' + e.rastreioToken;
    navigator.clipboard?.writeText(url).then(() => toast(t('rastreio.link_copiado'))).catch(() => { window.prompt(t('rastreio.link_cliente'), url); });
  }

  const proximo = (s: StatusEntrega): { st: StatusEntrega; k: string } | null =>
    s === 'aguardando' ? { st: 'a_caminho', k: 'rastreio.btn_a_caminho' }
    : s === 'a_caminho' ? { st: 'chegou', k: 'rastreio.btn_cheguei' }
    : s === 'chegou' ? { st: 'entregue', k: 'rastreio.btn_entregue' }
    : null;

  return (
    <div>
      <div className="crumb">{t('rastreio.crumb_minhas')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('rastreio.minhas')}</h1><div className="muted page-sub">{t('rastreio.minhas_sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ativasIds.length > 0 && <div className="alerta-ok" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Ic name="i-truck" className="sm" /> {t('rastreio.gps_ativo')}</div>}
      {carregando && <div className="muted">{t('common.carregando')}</div>}
      {!carregando && entregas.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40 }} ><div className="muted">{t('rastreio.sem_entregas')}</div></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entregas.map((e) => {
          const prox = proximo(e.status);
          return (
            <div key={e.pedidoId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <b>{numeroPedido(e.numero)}</b> · {e.clienteNome ?? '—'} · <b>{moeda(e.total)}</b>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}><Ic name="i-pin" className="sm" /> {e.enderecoEntrega ?? '—'}</div>
                </div>
                <span className={'pill ' + corStatus(e.status)}>{t('rastreio.st.' + e.status)}</span>
              </div>
              {(e.status === 'a_caminho' || e.status === 'chegou') && e.posicao && (
                <div style={{ marginTop: 10 }}>
                  <MapaEntrega lat={e.posicao.lat} lng={e.posicao.lng} destino={e.enderecoEntrega} altura={170} />
                  {e.eta && <div style={{ marginTop: 6, fontWeight: 500, fontSize: 13 }}><Ic name="i-clock" className="sm" /> {t('rastreio.faltam')} {e.eta.min} min · {e.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {prox && <button className="btn-primary" onClick={() => mudar(e, prox.st)}>{t(prox.k)}</button>}
                {e.rastreioToken && <button className="btn-ghost" onClick={() => copiarLink(e)}><Ic name="i-clip" className="sm" /> {t('rastreio.copiar_link')}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
