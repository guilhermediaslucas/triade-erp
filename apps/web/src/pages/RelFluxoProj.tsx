import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { abrevMoeda, moeda } from '../lib/pedido.js';

interface Semana { rotulo: string; de: string; ate: string; entradas: number; saidas: number; saldo: number; }
interface Resp { saldoInicial: number; semanas: Semana[]; }
const fmtData = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('pt-BR');

// Gráfico SVG do saldo projetado (pode ser negativo): linha + zero baseline.
function GraficoProj({ semanas }: { semanas: Semana[] }) {
  const W = 720, H = 220, padL = 52, padR = 12, padT = 12, padB = 24;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const vals = semanas.map((s) => s.saldo);
  const max = Math.max(1, ...vals), min = Math.min(0, ...vals);
  const span = max - min || 1;
  const n = vals.length;
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => padT + innerH - ((v - min) / span) * innerH;
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const yZero = y(0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }}>
      {[0, 0.5, 1].map((g) => { const yy = padT + innerH * (1 - g); return (
        <g key={g}><line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--borda)" strokeWidth="1" />
          <text x={padL - 6} y={yy + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{abrevMoeda(min + span * g)}</text></g>
      ); })}
      <line x1={padL} x2={W - padR} y1={yZero} y2={yZero} stroke="var(--dash-red)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {vals.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="3" fill="var(--accent)" />
          <text x={x(i)} y={H - 8} fontSize="9" textAnchor="middle" fill="var(--muted)">{semanas[i]!.rotulo}</text>
        </g>
      ))}
    </svg>
  );
}

export function RelFluxoProj() {
  const { token } = useAuth(); const { t } = useI18n();
  const [d, setD] = useState<Resp | null>(null); const [erro, setErro] = useState<string | null>(null);
  useEffect(() => { api.get<Resp>('/financeiro/fluxo-projetado', token!).then(setD).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  if (!d) return <div className="muted">{t('common.carregando')}</div>;
  const saldoFinal = d.semanas.length ? d.semanas[d.semanas.length - 1]!.saldo : d.saldoInicial;

  return (
    <div>
      <div className="crumb">{t('fluxoproj.crumb')}</div><h1 className="page-titulo">{t('fluxoproj.titulo')}</h1><p className="muted page-sub">{t('fluxoproj.sub')}</p>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-bl">🏦</div><div className="kpi-body"><div className="kpi-lbl">{t('fluxoproj.saldo_inicial')}</div><div className="kpi-val">{moeda(d.saldoInicial)}</div></div></div>
        <div className="card kpi-mock"><div className={'kpi-ic ' + (saldoFinal >= 0 ? 'tint-gr' : 'tint-rd')}>{saldoFinal >= 0 ? '📈' : '📉'}</div><div className="kpi-body"><div className="kpi-lbl">{t('fluxoproj.saldo_final')}</div><div className="kpi-val">{moeda(saldoFinal)}</div></div></div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><h3>{t('fluxoproj.grafico')}</h3></div>
        <GraficoProj semanas={d.semanas} />
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('fluxoproj.semana')}</th><th>{t('fluxoproj.periodo')}</th><th>{t('dash.entradas')}</th><th>{t('dash.saidas')}</th><th>{t('fluxoproj.saldo')}</th></tr></thead>
        <tbody>
          {d.semanas.map((s) => (
            <tr key={s.rotulo}>
              <td><b>{s.rotulo}</b></td>
              <td>{fmtData(s.de)} – {fmtData(s.ate)}</td>
              <td style={{ color: 'var(--dash-green)' }}>{moeda(s.entradas)}</td>
              <td style={{ color: 'var(--dash-red)' }}>{moeda(s.saidas)}</td>
              <td><b style={{ color: s.saldo >= 0 ? 'var(--ink)' : 'var(--dash-red)' }}>{moeda(s.saldo)}</b></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
