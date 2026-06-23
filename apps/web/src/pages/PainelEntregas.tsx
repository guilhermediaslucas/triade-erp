import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { numeroPedido } from '../lib/pedido.js';
import { MapaEntrega } from '../components/MapaEntrega.js';

interface Pos { lat: number; lng: number; criadoEm: string; }
interface Eta { km: number; min: number; }
interface Ativa { pedidoId: string; numero: number; clienteNome: string | null; motoboy: string | null; status: string; rastreioToken: string | null; enderecoEntrega: string | null; posicao: Pos | null; eta: Eta | null; }

const cor = (s: string) => s === 'chegou' ? 'st-ciano' : 'st-azul';

export function PainelEntregas() {
  const { token } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const [ativas, setAtivas] = useState<Ativa[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try { const l = await api.get<Ativa[]>('/entregas/ativas', token!); setAtivas(l); if (!sel && l.length) setSel(l[0]!.pedidoId); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 10000); // atualiza a cada 10s
    return () => clearInterval(id);
    /* eslint-disable-next-line */
  }, []);

  const selecionada = ativas.find((a) => a.pedidoId === sel) ?? null;
  function copiarLink(a: Ativa) {
    if (!a.rastreioToken) return;
    const url = window.location.origin + '/rastreio/' + a.rastreioToken;
    navigator.clipboard?.writeText(url).then(() => toast(t('rastreio.link_copiado'))).catch(() => window.prompt(t('rastreio.link_cliente'), url));
  }

  return (
    <div>
      <div className="crumb">{t('rastreio.crumb_painel')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('rastreio.painel')}</h1><div className="muted page-sub">{t('rastreio.painel_sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {ativas.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40 }}><div className="muted">{t('rastreio.sem_ativas')}</div></div>}

      {ativas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ativas.map((a) => (
              <div key={a.pedidoId} className={'card' + (a.pedidoId === sel ? ' clicavel' : '')} style={{ cursor: 'pointer', outline: a.pedidoId === sel ? '2px solid var(--accent)' : 'none' }} onClick={() => setSel(a.pedidoId)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>{numeroPedido(a.numero)}</b>
                  <span className={'pill ' + cor(a.status)}>{t('rastreio.st.' + a.status)}</span>
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{a.clienteNome ?? '—'} · {a.motoboy ?? '—'}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{a.enderecoEntrega ?? '—'}</div>
                {a.rastreioToken && <button className="btn-ghost btn-mini" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); copiarLink(a); }}><Ic name="i-clip" className="sm" /> {t('rastreio.copiar_link')}</button>}
              </div>
            ))}
          </div>
          <div className="card">
            {selecionada
              ? <MapaEntrega lat={selecionada.posicao?.lat ?? null} lng={selecionada.posicao?.lng ?? null} destino={selecionada.enderecoEntrega} altura={420} />
              : <div className="muted">{t('rastreio.selecione')}</div>}
            {selecionada?.eta && <div style={{ marginTop: 8, fontWeight: 500 }}><Ic name="i-clock" className="sm" /> {t('rastreio.faltam')} {selecionada.eta.min} min · {selecionada.eta.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</div>}
            {selecionada?.posicao && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t('rastreio.atualizado_em')}: {new Date(selecionada.posicao.criadoEm).toLocaleString('pt-BR')}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
