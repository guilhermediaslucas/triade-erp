import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { TVHeader } from '../components/TVHeader.js';
import { SpriteIcones } from '../components/Icones.js';

// Painel de vendas em "Modo TV": tela cheia, sem menu, números grandes e
// atualização automática — feito para deixar rodando numa televisão.
interface Resumo { vendasDia: number; vendasSemana: number; vendasMes: number; }
interface Serie { labels: string[]; data: number[]; }

const REFRESH_MS = 45000;

// Moeda compacta para a TV: sem casas decimais; abrevia valores grandes (milhões).
function moedaTV(v: number): string {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1_000_000) return 'R$ ' + (n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

// Gráfico de barras (vendas por dia). O SVG preenche a altura do card (barras
// esticadas, preserveAspectRatio=none); as datas vão em HTML embaixo, sem distorcer.
function Barras({ labels, data }: { labels: string[]; data: number[] }) {
  const W = 1000, H = 300;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data);
  const bw = (W / n) * 0.64;
  const passo = Math.ceil(n / 8);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', flex: 1, minHeight: 0, display: 'block' }} role="img">
        <line x1="0" y1={H - 1} x2={W} y2={H - 1} stroke="var(--tvborda)" strokeWidth="1" />
        {data.map((v, i) => {
          const h = (v / max) * (H - 6);
          const cx = (W / n) * (i + 0.5);
          return <rect key={i} x={cx - bw / 2} y={H - h} width={bw} height={h} fill="#16a34a"><title>{labels[i]}: {moeda(v)}</title></rect>;
        })}
      </svg>
      <div className="tv-graf-datas">
        {labels.map((lb, i) => (i % passo === 0 || i === n - 1)
          ? <span key={i}>{lb}</span>
          : null)}
      </div>
    </>
  );
}

export function DashboardTV() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [d, setD] = useState<Resumo | null>(null);
  const [serie, setSerie] = useState<Serie | null>(null);
  const [hora, setHora] = useState(new Date());
  const [atualizado, setAtualizado] = useState<Date | null>(null);

  async function carregar() {
    try {
      const [resumo, sd] = await Promise.all([
        api.get<Resumo>('/dashboard', token!),
        api.get<Serie>('/dashboard/serie?tipo=dia', token!).catch(() => null),
      ]);
      setD(resumo);
      if (sd) setSerie({ labels: sd.labels.slice(-14), data: sd.data.slice(-14) });
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

  return (
    <div className="tv tv-flex">
      <SpriteIcones />
      <TVHeader titulo={t('tv.titulo')} hora={hora} atualizado={atualizado} />

      {!d ? <div className="tv-load">{t('common.carregando')}</div> : (
        <div className="tv-vendas-grid">
          <div className="tv-card tv-grafico">
            <div className="tv-card-h">{t('tv.vendas_dia')}</div>
            {serie && serie.data.some((v) => v > 0)
              ? <Barras labels={serie.labels} data={serie.data} />
              : <div className="tv-vazio">{t('dash.serie_vazio')}</div>}
          </div>
          <div className="tv-kpis-col">
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.dia')}</div><div className="tv-kpi-val">{moedaTV(d.vendasDia)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.semana')}</div><div className="tv-kpi-val">{moedaTV(d.vendasSemana)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.mes')}</div><div className="tv-kpi-val">{moedaTV(d.vendasMes)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
