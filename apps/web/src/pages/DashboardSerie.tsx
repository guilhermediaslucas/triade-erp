import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { corStatus, moeda, numeroPedido } from '../lib/pedido.js';

type TipoSerie = 'dia' | 'semana' | 'mes' | 'ano' | 'clientes';
interface Serie { tipo: TipoSerie; labels: string[]; data: number[]; formato: 'moeda' | 'quantidade'; }
interface ItemSerie { numero: number | null; cliente: string; vendedor: string; data: string | null; status: string | null; valor: number; }

const TIPOS: TipoSerie[] = ['dia', 'semana', 'mes', 'ano', 'clientes'];
const iso = (d: Date) => d.toISOString().slice(0, 10);

// Gráfico SVG (barras, ou linha quando "mes"), sem dependência externa.
function SerieChart({ s, fmt }: { s: Serie; fmt: (v: number) => string }) {
  const W = 760, H = 280, padL = 8, padR = 8, padT = 16, padB = 28;
  const n = s.data.length;
  const max = Math.max(1, ...s.data);
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const linha = s.tipo === 'mes';
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  // rótulos do eixo X: no máx ~12 visíveis
  const passo = Math.ceil(n / 12);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 300 }} role="img">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={padL} x2={W - padR} y1={padT + innerH * (1 - g)} y2={padT + innerH * (1 - g)} stroke="var(--borda)" strokeWidth="1" />
      ))}
      {linha ? (
        <>
          <polyline points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
          {s.data.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--accent)"><title>{s.labels[i]}: {fmt(v)}</title></circle>
          ))}
        </>
      ) : (
        s.data.map((v, i) => {
          const bw = Math.max(3, (innerW / n) * 0.62);
          const cx = padL + (innerW / n) * (i + 0.5);
          const h = (v / max) * innerH;
          return <rect key={i} x={cx - bw / 2} y={padT + innerH - h} width={bw} height={h} rx="3" fill="var(--accent)"><title>{s.labels[i]}: {fmt(v)}</title></rect>;
        })
      )}
      {s.labels.map((lb, i) => (i % passo === 0 || i === n - 1) && (
        <text key={i} x={linha ? x(i) : padL + (innerW / n) * (i + 0.5)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--muted)">{lb}</text>
      ))}
    </svg>
  );
}

export function DashboardSerie() {
  const { tipo } = useParams<{ tipo: string }>();
  const t0 = (TIPOS.includes(tipo as TipoSerie) ? tipo : 'dia') as TipoSerie;
  const { token } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const hoje = new Date();
  const ini30 = new Date(hoje); ini30.setDate(hoje.getDate() - 29);
  const [de, setDe] = useState(iso(ini30));
  const [ate, setAte] = useState(iso(hoje));
  const [s, setS] = useState<Serie | null>(null);
  const [itens, setItens] = useState<ItemSerie[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(dde?: string, aate?: string) {
    setErro(null);
    try {
      const qs = t0 === 'dia' ? `&de=${dde ?? de}&ate=${aate ?? ate}` : '';
      const [serie, lista] = await Promise.all([
        api.get<Serie>(`/dashboard/serie?tipo=${t0}${qs}`, token!),
        api.get<ItemSerie[]>(`/dashboard/serie-itens?tipo=${t0}${qs}`, token!).catch(() => [] as ItemSerie[]),
      ]);
      setS(serie); setItens(lista);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { setS(null); setItens([]); carregar(); /* eslint-disable-next-line */ }, [t0]);

  const fmt = (v: number) => (s?.formato === 'quantidade'
    ? Math.round(v).toLocaleString('pt-BR')
    : moeda(v));
  const total = s ? s.data.reduce((a, b) => a + b, 0) : 0;
  const media = s && s.data.length ? total / s.data.length : 0;
  const pico = s && s.data.length ? Math.max(...s.data) : 0;
  const titulo = t('dash.serie_' + t0);

  return (
    <div>
      <div className="crumb">{t('dashboard.titulo')} / {t('dash.serie_crumb')}</div>
      <div className="page-head" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-ghost" onClick={() => navigate('/')}>← {t('common.voltar')}</button>
        <h1 className="page-titulo" style={{ margin: 0 }}>{titulo}</h1>
      </div>

      {t0 === 'dia' && (
        <div className="rel-filtro">
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
          <button className="btn-primary" onClick={() => carregar()}>{t('rel.gerar')}</button>
          <button className="btn-ghost" onClick={() => { setDe(iso(ini30)); setAte(iso(hoje)); carregar(iso(ini30), iso(hoje)); }}>{t('dash.serie_limpar')}</button>
        </div>
      )}

      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {!s && !erro && <div className="muted">{t('common.carregando')}</div>}

      {s && <>
        <div className="dash-row c3" style={{ marginTop: 12 }}>
          <div className="card"><div className="kpi"><div className="kpi-ic tint-pp"><Ic name="i-chart" className="sm" /></div><div><div className="lbl">{t('dash.serie_total')}</div><div className="val">{fmt(total)}</div></div></div></div>
          <div className="card"><div className="kpi"><div className="kpi-ic tint-bl"><Ic name="i-clock" className="sm" /></div><div><div className="lbl">{t('dash.serie_media')}</div><div className="val">{fmt(media)}</div></div></div></div>
          <div className="card"><div className="kpi"><div className="kpi-ic tint-gr"><Ic name="i-arrow-up" className="sm" /></div><div><div className="lbl">{t('dash.serie_pico')}</div><div className="val">{fmt(pico)}</div></div></div></div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-head"><h3>{titulo}</h3></div>
          {s.data.every((v) => v === 0)
            ? <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.serie_vazio')}</div>
            : <SerieChart s={s} fmt={fmt} />}
        </div>

        <div className="card pad0" style={{ marginTop: 12 }}>
          <div className="card-head" style={{ padding: '16px 18px 4px' }}><h3>{t0 === 'clientes' ? t('dash.itens_clientes') : t('dash.itens_vendas')} <span className="muted" style={{ fontWeight: 400 }}>· {itens.length}</span></h3></div>
          <table className="tabela">
            <thead>
              {t0 === 'clientes'
                ? <tr><th>{t('pedidos.cliente')}</th><th>{t('dash.col_status')}</th></tr>
                : <tr><th>{t('dash.col_pedido')}</th><th>{t('pedidos.cliente')}</th><th>{t('pedidos.vendedor')}</th><th>{t('pedidos.data')}</th><th>{t('dash.col_status')}</th><th style={{ textAlign: 'right' }}>{t('pedidos.total')}</th></tr>}
            </thead>
            <tbody>
              {itens.length === 0 && <tr><td colSpan={t0 === 'clientes' ? 2 : 6} className="vazio">{t('dash.serie_vazio')}</td></tr>}
              {t0 === 'clientes'
                ? itens.map((it, i) => <tr key={i}><td>{it.cliente}</td><td><span className="pill ok">{it.status}</span></td></tr>)
                : itens.map((it, i) => (
                  <tr key={i}>
                    <td><b>{it.numero != null ? numeroPedido(it.numero) : '—'}</b></td>
                    <td>{it.cliente}</td><td>{it.vendedor}</td>
                    <td>{it.data ? new Date(it.data).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{it.status ? <span className={'pill ' + corStatus(it.status as any)}>{t('status.' + it.status)}</span> : '—'}</td>
                    <td style={{ textAlign: 'right' }}>{moeda(it.valor)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  );
}
