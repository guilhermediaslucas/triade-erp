import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useI18n } from '../i18n/I18nContext.js';
import { MapaEntrega } from '../components/MapaEntrega.js';
import { ConfirmarEntrega } from '../components/ConfirmarEntrega.js';

type StatusEntrega = 'aguardando' | 'a_caminho' | 'chegou' | 'entregue';
interface Pos { lat: number; lng: number; criadoEm: string; }
interface Eta { km: number; min: number; }
interface Parada { pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; status: StatusEntrega; ordemRota: number | null; posicao: Pos | null; eta: Eta | null; }
interface Rota { motoboyNome: string; paradas: Parada[]; }

const proximo = (s: StatusEntrega): { st: StatusEntrega; k: string } | null =>
  s === 'aguardando' ? { st: 'a_caminho', k: 'rastreio.btn_a_caminho' }
  : s === 'a_caminho' ? { st: 'chegou', k: 'rastreio.btn_cheguei' }
  : s === 'chegou' ? { st: 'entregue', k: 'rastreio.btn_entregue' } : null;
const pillCor = (s: StatusEntrega) => s === 'entregue' ? 'st-verde' : s === 'chegou' ? 'st-ciano' : s === 'a_caminho' ? 'st-azul' : 'st-cinza';

export function RotaPublica() {
  const { token } = useParams();
  const { t } = useI18n();
  const [rota, setRota] = useState<Rota | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [confirmar, setConfirmar] = useState<Parada | null>(null);
  const watchRef = useRef<number | null>(null);

  async function carregar() {
    try { setRota(await api.get<Rota>('/rota-publica/' + token)); } catch { setNaoAchou(true); }
  }
  useEffect(() => { carregar(); const id = setInterval(carregar, 15000); return () => clearInterval(id); /* eslint-disable-next-line */ }, [token]);

  // Parada ativa = a que está em rota (envia o GPS p/ ela).
  const ativa = rota?.paradas.find((p) => p.status === 'a_caminho' || p.status === 'chegou') ?? null;
  const ativoId = ativa?.pedidoId ?? null;
  // Foco do mapa: a parada em rota OU, antes de iniciar, a próxima parada pendente (preview do destino).
  const foco = ativa ?? (rota?.paradas.find((p) => p.status !== 'entregue') ?? null);
  useEffect(() => {
    if (!ativoId) { if (watchRef.current != null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; } return; }
    if (!('geolocation' in navigator)) { setErro('rastreio.sem_gps'); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => { api.post('/rota-publica/' + token + '/' + ativoId + '/posicao', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {}); },
      () => { setErro('rastreio.gps_negado'); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => { if (watchRef.current != null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; } };
    /* eslint-disable-next-line */
  }, [ativoId]);

  async function mudar(p: Parada) {
    const prox = proximo(p.status); if (!prox) return;
    if (prox.st === 'entregue') { setConfirmar(p); return; }
    setErro(null);
    try { await api.patch('/rota-publica/' + token + '/' + p.pedidoId + '/status', { status: prox.st }); carregar(); }
    catch (err) { setErro((err as { chaveI18n?: string }).chaveI18n ?? 'rastreio.erro_status'); }
  }

  if (naoAchou) return <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }} className="card"><h2>{t('rastreio.nao_encontrado')}</h2></div>;
  if (!rota) return <div style={{ maxWidth: 560, margin: '60px auto' }} className="muted">{t('common.carregando')}</div>;

  const pendentes = rota.paradas.filter((p) => p.status !== 'entregue').length;

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
      <div className="brand-logo" style={{ textAlign: 'center', marginBottom: 6 }}>TR<span style={{ color: '#e1483b' }}>Í</span>ADE</div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{t('rota.publica_titulo')}</h2>
        <div className="muted">{rota.motoboyNome} · {pendentes} {t('rota.pendentes')}</div>
      </div>

      {erro && <div className="alerta-erro" style={{ marginBottom: 10 }}>{t(erro)}</div>}

      {foco && (foco.enderecoEntrega || foco.posicao) && (
        <div className="card" style={{ marginBottom: 12 }}>
          <MapaEntrega lat={foco.posicao?.lat ?? null} lng={foco.posicao?.lng ?? null} destino={foco.enderecoEntrega} altura={280} />
          {foco.eta && <div style={{ textAlign: 'center', marginTop: 8, fontWeight: 500 }}>{t('rastreio.faltam')} {foco.eta.min} min · {foco.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rota.paradas.map((p, i) => {
          const prox = proximo(p.status);
          return (
            <div key={p.pedidoId} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: p.status === 'entregue' ? 0.6 : 1 }}>
              <span style={{ flex: '0 0 30px', height: 30, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <b>#{String(p.numero).padStart(6, '0')}</b>
                  <span className={'pill ' + pillCor(p.status)}>{t('rastreio.st.' + p.status)}</span>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>{p.clienteNome ?? '—'}</div>
                <div className="muted" style={{ fontSize: 12 }}>{p.enderecoEntrega ?? '—'}</div>
                {prox && <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => mudar(p)}>{t(prox.k)}</button>}
              </div>
            </div>
          );
        })}
      </div>
      {pendentes === 0 && <div className="muted" style={{ textAlign: 'center', padding: 20 }}>{t('rota.tudo_entregue')}</div>}
      {confirmar && (
        <ConfirmarEntrega
          pedido={'#' + String(confirmar.numero).padStart(6, '0') + ' · ' + (confirmar.clienteNome ?? '')}
          onFechar={() => setConfirmar(null)}
          onConfirmar={async (codigo) => {
            await api.patch('/rota-publica/' + token + '/' + confirmar.pedidoId + '/status', { status: 'entregue', codigoConfirmacao: codigo });
            setConfirmar(null); carregar();
          }}
        />
      )}
    </div>
  );
}
