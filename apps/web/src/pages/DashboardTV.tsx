import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido } from '../lib/pedido.js';
import { TVHeader } from '../components/TVHeader.js';
import { SpriteIcones } from '../components/Icones.js';

// Painel de vendas em "Modo TV": tela cheia, sem menu, números grandes e
// atualização automática — feito para deixar rodando numa televisão.
interface Resumo {
  vendasDia: number; vendasSemana: number; vendasMes: number; vendasAno: number;
  estoqueBaixo: number;
  pedidosPorStatus: { status: string; quantidade: number }[];
  pedidosRecentes: { numero: number; cliente: string; valor: number; status: string; data: string }[];
}
interface Serie { labels: string[]; data: number[]; }
interface ItemEstoque { produtoNome: string; disponivel: number; abaixoMinimo: boolean; }

const REFRESH_MS = 45000;

// Gráfico de barras (vendas por dia) — SVG, sem dependência. Mostra os dias no eixo X.
function Barras({ labels, data }: { labels: string[]; data: number[] }) {
  const W = 320, H = 140, padB = 22;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data);
  const bw = (W / n) * 0.6;
  const passo = Math.ceil(n / 7);   // no máx ~7 rótulos p/ não sobrepor
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }} role="img">
      <line x1="0" y1={H - padB} x2={W} y2={H - padB} stroke="var(--tvborda)" strokeWidth="1" />
      {data.map((v, i) => {
        const h = (v / max) * (H - padB - 6);
        const cx = (W / n) * (i + 0.5);
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={H - padB - h} width={bw} height={h} rx="2" fill="#16a34a"><title>{labels[i]}: {moeda(v)}</title></rect>
            {(i % passo === 0 || i === n - 1) && (
              <text x={cx} y={H - 6} fontSize="9" textAnchor="middle" fill="var(--tvmuted)">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DashboardTV() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [d, setD] = useState<Resumo | null>(null);
  const [serie, setSerie] = useState<Serie | null>(null);
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [hora, setHora] = useState(new Date());
  const [atualizado, setAtualizado] = useState<Date | null>(null);

  async function carregar() {
    try {
      const [resumo, sd, est] = await Promise.all([
        api.get<Resumo>('/dashboard', token!),
        api.get<Serie>('/dashboard/serie?tipo=dia', token!).catch(() => null),
        api.get<ItemEstoque[]>('/estoque', token!).catch(() => [] as ItemEstoque[]),
      ]);
      setD(resumo);
      if (sd) setSerie({ labels: sd.labels.slice(-14), data: sd.data.slice(-14) });
      setEstoque([...est].sort((a, b) => b.disponivel - a.disponivel).slice(0, 8));
      setAtualizado(new Date());
    } catch { /* mantém */ }
  }
  useEffect(() => {
    carregar();
    const r = setInterval(carregar, REFRESH_MS);
    const c = setInterval(() => setHora(new Date()), 1000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nav('/'); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(r); clearInterval(c); window.removeEventListener('keydown', onKey); };
    /* eslint-disable-next-line */
  }, []);

  const aguardSep = d?.pedidosPorStatus.find((p) => p.status === 'aprovado')?.quantidade ?? 0;
  const maxDisp = Math.max(1, ...estoque.map((e) => e.disponivel));

  return (
    <div className="tv">
      <SpriteIcones />
      <TVHeader titulo={t('tv.titulo')} hora={hora} atualizado={atualizado} />

      {!d ? <div className="tv-load">{t('common.carregando')}</div> : (
        <>
          <div className="tv-kpis">
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.dia')}</div><div className="tv-kpi-val">{moeda(d.vendasDia)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.semana')}</div><div className="tv-kpi-val">{moeda(d.vendasSemana)}</div></div>
            <div className="tv-kpi tv-destaque"><div className="tv-kpi-lbl">{t('tv.mes')}</div><div className="tv-kpi-val">{moeda(d.vendasMes)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.ano')}</div><div className="tv-kpi-val">{moeda(d.vendasAno)}</div></div>
          </div>

          <div className="tv-mid tv-mid2">
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.aguard_sep')}</div><div className="tv-mini-val">{aguardSep}</div></div>
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.estoque_baixo')}</div><div className={'tv-mini-val' + (d.estoqueBaixo > 0 ? ' tv-alerta' : '')}>{d.estoqueBaixo}</div></div>
          </div>

          <div className="tv-cols">
            <div className="tv-card">
              <div className="tv-card-h">{t('tv.vendas_dia')}</div>
              {serie && serie.data.some((v) => v > 0)
                ? <Barras labels={serie.labels} data={serie.data} />
                : <div className="tv-vazio">—</div>}
            </div>
            <div className="tv-card">
              <div className="tv-card-h">{t('tv.estoque_disp')}</div>
              {estoque.length === 0 && <div className="tv-vazio">—</div>}
              {estoque.map((e, i) => (
                <div key={i} className="tv-bar-lin">
                  <span className="tv-bar-nm">{e.produtoNome}</span>
                  <span className="tv-bar-track"><span className="tv-bar-fill" style={{ width: Math.round((e.disponivel / maxDisp) * 100) + '%', background: e.abaixoMinimo ? '#f87171' : '#3b82f6' }} /></span>
                  <b className="tv-bar-q" style={e.abaixoMinimo ? { color: '#f87171' } : undefined}>{e.disponivel}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="tv-card" style={{ marginTop: 14 }}>
            <div className="tv-card-h">{t('tv.recentes')}</div>
            {(d.pedidosRecentes ?? []).slice(0, 6).map((p, i) => (
              <div key={i} className="tv-lin"><span className="tv-lin-nm"><b>{numeroPedido(p.numero)}</b> · {p.cliente}</span><span className="tv-lin-st">{t('status.' + p.status)}</span><span className="tv-lin-v">{moeda(p.valor)}</span></div>
            ))}
            {(d.pedidosRecentes ?? []).length === 0 && <div className="tv-vazio">—</div>}
          </div>
        </>
      )}
    </div>
  );
}
