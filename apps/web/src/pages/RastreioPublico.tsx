import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useI18n } from '../i18n/I18nContext.js';
import { MapaEntrega } from '../components/MapaEntrega.js';

type StatusEntrega = 'aguardando' | 'a_caminho' | 'chegou' | 'entregue';
interface Pub { numero: number; status: StatusEntrega; destino: string | null; motoboy: string | null; posicao: { lat: number; lng: number; criadoEm: string } | null; eta: { km: number; min: number } | null; }
const PASSOS: StatusEntrega[] = ['aguardando', 'a_caminho', 'chegou', 'entregue'];

export function RastreioPublico() {
  const { token } = useParams();
  const { t } = useI18n();
  const [dados, setDados] = useState<Pub | null>(null);
  const [erro, setErro] = useState(false);

  async function carregar() {
    try { setDados(await api.get<Pub>('/rastreio/' + token)); }
    catch { setErro(true); }
  }
  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 10000);
    return () => clearInterval(id);
    /* eslint-disable-next-line */
  }, [token]);

  if (erro) return <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }} className="card"><h2>{t('rastreio.nao_encontrado')}</h2></div>;
  if (!dados) return <div style={{ maxWidth: 520, margin: '60px auto' }} className="muted">{t('common.carregando')}</div>;
  const idx = PASSOS.indexOf(dados.status);

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: '0 16px' }}>
      <div className="brand-logo" style={{ textAlign: 'center', marginBottom: 12 }}>TR<span style={{ color: '#e1483b' }}>Í</span>ADE</div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{t('rastreio.pedido')} #{String(dados.numero).padStart(6, '0')}</h2>
        <div className="muted" style={{ marginBottom: 12 }}>{dados.motoboy ? t('rastreio.entregador') + ': ' + dados.motoboy : ''}{dados.destino ? ' · ' + dados.destino : ''}</div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {PASSOS.map((p, i) => (
            <div key={p} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 6, borderRadius: 3, background: i <= idx ? 'var(--accent)' : 'var(--borda)' }} />
              <div style={{ fontSize: 11, marginTop: 4, color: i <= idx ? 'var(--ink)' : 'var(--muted)' }}>{t('rastreio.st.' + p)}</div>
            </div>
          ))}
        </div>

        {dados.status === 'entregue'
          ? <div className="muted" style={{ textAlign: 'center', padding: 24 }}>{t('rastreio.entregue_msg')}</div>
          : (dados.destino || dados.posicao)
            ? <>
                <MapaEntrega lat={dados.posicao?.lat ?? null} lng={dados.posicao?.lng ?? null} destino={dados.destino} altura={360} />
                {dados.eta && <div style={{ textAlign: 'center', marginTop: 8, fontWeight: 500 }}>{t('rastreio.faltam')} {dados.eta.min} min · {dados.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
                {dados.status === 'aguardando' && <div className="muted" style={{ textAlign: 'center', marginTop: 8 }}>{t('rastreio.aguardando_msg')}</div>}
              </>
            : <div className="muted" style={{ textAlign: 'center', padding: 24 }}>{t('rastreio.aguardando_msg')}</div>}

        {dados.posicao && (dados.status === 'a_caminho' || dados.status === 'chegou') &&
          <div className="muted" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>{t('rastreio.atualizado_em')}: {new Date(dados.posicao.criadoEm).toLocaleString('pt-BR')}</div>}
      </div>
    </div>
  );
}
