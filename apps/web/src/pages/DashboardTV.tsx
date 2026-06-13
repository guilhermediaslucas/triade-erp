import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido } from '../lib/pedido.js';
import { TVAcoes } from '../components/TVAcoes.js';
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

// Gráfico de barras (vendas por dia) — SVG, sem dependência.
function Barras({ labels, data }: { labels: string[]; data: number[] }) {
  const W = 300, H = 130, padB = 16;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data);
  const bw = (W / n) * 0.62;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 150 }} role="img">
      {data.map((v, i) => {
        const h = (v / max) * (H - padB);
        const cx = (W / n) * (i + 0.5);
        return <rect key={i} x={cx - bw / 2} y={H - padB - h} width={bw} height={h} rx="2" fill="#4ade80"><title>{labels[i]}: {moeda(v)}</title></rect>;
      })}
    </svg>
  );
}

export function DashboardTV() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { branding } = useBranding();
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
  const hhmmss = (x: Date) => x.toLocaleTimeString('pt-BR');
  const maxDisp = Math.max(1, ...estoque.map((e) => e.disponivel));

  return (
    <div className="tv">
      <SpriteIcones />
      <div className="tv-top">
        <div className="tv-marca">
          {branding?.logo ? <img src={branding.logo} alt="" className="tv-logo" /> : null}
          <div>
            <div className="tv-titulo">
              <span className="tv-wordmark">TR<span className="tv-rm-i">Í</span>ADE <span className="tv-rm-erp">ERP</span></span>
              <span className="tv-sep"> · {t('tv.titulo')}</span>
            </div>
            <div className="tv-empresa">{branding?.fantasia ?? ''}</div>
          </div>
        </div>
        <div className="tv-top-dir">
          <div className="tv-relogio">{hhmmss(hora)}</div>
          <div className="tv-data">{hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
          {atualizado && <div className="tv-upd">{t('tv.atualizado')} {hhmmss(atualizado)}</div>}
          <TVAcoes />
        </div>
      </div>

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
