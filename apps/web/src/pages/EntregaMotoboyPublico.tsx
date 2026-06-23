import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useI18n } from '../i18n/I18nContext.js';
import { MapaEntrega } from '../components/MapaEntrega.js';

type StatusEntrega = 'aguardando' | 'a_caminho' | 'chegou' | 'entregue';
interface Entrega { pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; status: StatusEntrega; total: number; posicao: { lat: number; lng: number; criadoEm: string } | null; eta: { km: number; min: number } | null; }

const proximo = (s: StatusEntrega): { st: StatusEntrega; k: string } | null =>
  s === 'aguardando' ? { st: 'a_caminho', k: 'rastreio.btn_a_caminho' }
  : s === 'a_caminho' ? { st: 'chegou', k: 'rastreio.btn_cheguei' }
  : s === 'chegou' ? { st: 'entregue', k: 'rastreio.btn_entregue' } : null;

export function EntregaMotoboyPublico() {
  const { token } = useParams();
  const { t } = useI18n();
  const [e, setE] = useState<Entrega | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const watchRef = useRef<number | null>(null);

  async function carregar() {
    try { setE(await api.get<Entrega>('/entrega-motoboy/' + token)); } catch { setNaoAchou(true); }
  }
  useEffect(() => { carregar(); const id = setInterval(carregar, 15000); return () => clearInterval(id); /* eslint-disable-next-line */ }, [token]);

  const emRota = e && (e.status === 'a_caminho' || e.status === 'chegou');
  useEffect(() => {
    if (!emRota) { if (watchRef.current != null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; } return; }
    if (!('geolocation' in navigator)) { setErro('rastreio.sem_gps'); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => { api.post('/entrega-motoboy/' + token + '/posicao', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {}); },
      () => { setErro('rastreio.gps_negado'); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => { if (watchRef.current != null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; } };
    /* eslint-disable-next-line */
  }, [emRota]);

  async function mudar(status: StatusEntrega) {
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
    try { await api.patch('/entrega-motoboy/' + token + '/status', { status, recebidoPor, codigoConfirmacao }); carregar(); }
    catch (err) { setErro((err as { chaveI18n?: string }).chaveI18n ?? 'rastreio.erro_status'); }
  }

  if (naoAchou) return <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }} className="card"><h2>{t('rastreio.nao_encontrado')}</h2></div>;
  if (!e) return <div style={{ maxWidth: 520, margin: '60px auto' }} className="muted">{t('common.carregando')}</div>;
  const prox = proximo(e.status);

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: '0 16px' }}>
      <div className="brand-logo" style={{ textAlign: 'center', marginBottom: 12 }}>TR<span style={{ color: '#e1483b' }}>Í</span>ADE</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('rastreio.pedido')} #{String(e.numero).padStart(6, '0')}</h2>
          <span className={'pill ' + (e.status === 'entregue' ? 'st-verde' : e.status === 'chegou' ? 'st-ciano' : e.status === 'a_caminho' ? 'st-azul' : 'st-cinza')}>{t('rastreio.st.' + e.status)}</span>
        </div>
        <div className="muted" style={{ margin: '6px 0 10px' }}>{e.clienteNome ?? '—'}{e.enderecoEntrega ? ' · ' + e.enderecoEntrega : ''}</div>

        {e.status !== 'entregue' && (e.enderecoEntrega || e.posicao) && (<>
          <MapaEntrega lat={e.posicao?.lat ?? null} lng={e.posicao?.lng ?? null} destino={e.enderecoEntrega} altura={300} />
          {e.eta && <div style={{ textAlign: 'center', marginTop: 8, fontWeight: 500 }}>{t('rastreio.faltam')} {e.eta.min} min · {e.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
        </>)}

        {erro && <div className="alerta-erro" style={{ marginTop: 10 }}>{t(erro)}</div>}

        {prox
          ? <button className="btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => mudar(prox.st)}>{t(prox.k)}</button>
          : <div className="muted" style={{ textAlign: 'center', padding: 20 }}>{t('rastreio.entregue_msg')}</div>}
        {emRota && <div className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 10 }}>{t('rastreio.aguardando_msg_motoboy')}</div>}
      </div>
    </div>
  );
}
