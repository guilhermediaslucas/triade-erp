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
interface MetaAtual { valor: number; metaDiaUtil: number; metaSabado: number; mes: number; metaHoje: number; metaSemana: number; metaMes: number; diasMeta: number[]; }

const REFRESH_MS = 45000;

// Moeda compacta para a TV: sem casas decimais; abrevia valores grandes (milhões).
function moedaTV(v: number): string {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1_000_000) return 'R$ ' + (n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

// Gráfico de barras (vendas por dia). O SVG preenche a altura do card (barras
// esticadas, preserveAspectRatio=none); as datas vão em HTML embaixo, sem distorcer.
// Por dia: realizado (azul) e meta (vermelho) lado a lado — a meta varia por dia.
function Barras({ labels, data, metas }: { labels: string[]; data: number[]; metas: number[] }) {
  const W = 1000, H = 300;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data, ...metas);
  const bw = (W / n) * 0.3;
  const passo = Math.ceil(n / 8);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', flex: 1, minHeight: 0, display: 'block' }} role="img">
        <line x1="0" y1={H - 1} x2={W} y2={H - 1} stroke="var(--tvborda)" strokeWidth="1" />
        {data.map((v, i) => {
          const cx = (W / n) * (i + 0.5);
          const h = (v / max) * (H - 6);
          const meta = metas[i] ?? 0;
          const hm = (meta / max) * (H - 6);
          return (
            <g key={i}>
              <rect x={cx - bw - 2} y={H - h} width={bw} height={h} fill="#378ADD"><title>{labels[i]}: {moeda(v)}</title></rect>
              {meta > 0 && <rect x={cx + 2} y={H - hm} width={bw} height={hm} fill="#e1483b"><title>Meta: {moeda(meta)}</title></rect>}
            </g>
          );
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
  const [meta, setMeta] = useState<MetaAtual>({ valor: 0, metaDiaUtil: 0, metaSabado: 0, mes: new Date().getMonth() + 1, metaHoje: 0, metaSemana: 0, metaMes: 0, diasMeta: [] });
  const [hora, setHora] = useState(new Date());
  const [atualizado, setAtualizado] = useState<Date | null>(null);

  async function carregar() {
    try {
      const [resumo, sd, m] = await Promise.all([
        api.get<Resumo>('/dashboard', token!),
        api.get<Serie>('/dashboard/serie?tipo=dia', token!).catch(() => null),
        api.get<MetaAtual>('/metas/atual', token!).catch(() => null),
      ]);
      setD(resumo);
      if (sd) setSerie({ labels: sd.labels.slice(-14), data: sd.data.slice(-14) });
      if (m) setMeta({
        valor: Number(m.valor) || 0, metaDiaUtil: Number(m.metaDiaUtil) || 0, metaSabado: Number(m.metaSabado) || 0,
        mes: Number(m.mes) || (new Date().getMonth() + 1),
        metaHoje: Number(m.metaHoje) || 0, metaSemana: Number(m.metaSemana) || 0, metaMes: Number(m.metaMes) || 0,
        diasMeta: Array.isArray(m.diasMeta) ? m.diasMeta.map(Number) : [],
      });
      setAtualizado(new Date());
    } catch { /* mantém */ }
  }

  // Meta de um dia (fallback por dia da semana — usado p/ dias de outro mês na série).
  const metaDoDiaSemana = (wd: number) => (wd === 0 ? 0 : wd === 6 ? meta.metaSabado : meta.metaDiaUtil);
  // Label 'DD/MM' → meta do dia: do CALENDÁRIO (diasMeta) quando é o mês corrente; senão fallback.
  function metaDoLabel(lb: string): number {
    const [dd, mm] = lb.split('/').map(Number);
    if (!dd || !mm) return 0;
    if (mm === meta.mes && meta.diasMeta.length >= dd) return meta.diasMeta[dd - 1] ?? 0;
    return metaDoDiaSemana(new Date(new Date().getFullYear(), mm - 1, dd).getDay());
  }
  const metaHoje = meta.metaHoje;
  const metaSemana = meta.metaSemana;
  const metaMes = meta.metaMes;
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
            <div className="tv-card-h">{t('tv.vendas_dia')}
              <span className="tv-legend">
                <span><i style={{ background: '#378ADD' }} />{t('dash.realizado')}</span>
                <span><i style={{ background: '#e1483b' }} />{t('dash.meta')}</span>
              </span>
            </div>
            {serie && serie.data.some((v) => v > 0)
              ? <Barras labels={serie.labels} data={serie.data} metas={serie.labels.map(metaDoLabel)} />
              : <div className="tv-vazio">{t('dash.serie_vazio')}</div>}
          </div>
          <div className="tv-kpis-col">
            <div className="tv-kpi">
              <div className="tv-kpi-lbl">{t('tv.dia')}</div>
              <div className="tv-kpi-val tv-realizado">{moedaTV(d.vendasDia)}</div>
              {metaHoje > 0 && <div className="tv-kpi-meta">{t('dash.meta')} {moedaTV(metaHoje)}</div>}
            </div>
            <div className="tv-kpi">
              <div className="tv-kpi-lbl">{t('tv.semana')}</div>
              <div className="tv-kpi-val tv-realizado">{moedaTV(d.vendasSemana)}</div>
              {metaSemana > 0 && <div className="tv-kpi-meta">{t('dash.meta')} {moedaTV(metaSemana)}</div>}
            </div>
            <div className="tv-kpi">
              <div className="tv-kpi-lbl">{t('tv.mes')}</div>
              <div className="tv-kpi-val tv-realizado">{moedaTV(d.vendasMes)}</div>
              {metaMes > 0 && <div className="tv-kpi-meta">{t('dash.meta')} {moedaTV(metaMes)}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
