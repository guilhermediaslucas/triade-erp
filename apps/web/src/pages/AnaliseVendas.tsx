import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Linha { nome: string; quantidade: number; total: number; }
type Chip = 'produtos' | 'clientes_valor' | 'clientes_pedidos';
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

const dimDoChip = (c: Chip): string => (c === 'clientes_valor' || c === 'clientes_pedidos') ? 'clientes' : c;
const metricaDoChip = (c: Chip): 'quantidade' | 'total' => (c === 'clientes_pedidos' ? 'quantidade' : 'total');

export function AnaliseVendas() {
  const { token } = useAuth(); const { t } = useI18n();
  const [chip, setChip] = useState<Chip>('produtos');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  // Tipo de gráfico escolhido por cada usuário (salvo na conta via /preferencias).
  const [grafico, setGrafico] = useState<'barras' | 'pizza' | 'linha'>('barras');
  useEffect(() => {
    api.get<{ valor: string | null }>('/preferencias/analise-grafico', token!)
      .then((r) => { const v = r?.valor; if (v === 'barras' || v === 'pizza' || v === 'linha') setGrafico(v); })
      .catch(() => {});
    /* eslint-disable-next-line */
  }, []);
  function trocarGrafico(g: 'barras' | 'pizza' | 'linha') { setGrafico(g); api.put('/preferencias/analise-grafico', { valor: g }, token!).catch(() => {}); }

  function carregar(c = chip, dd = de, aa = ate) {
    setCarregando(true); setErro(null);
    api.get<{ linhas: Linha[] }>(`/comercial/analise?dim=${dimDoChip(c)}&de=${dd}&ate=${aa}`, token!)
      .then((r) => setLinhas(r.linhas)).catch((e) => setErro((e as ErroApi).chaveI18n)).finally(() => setCarregando(false));
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  function trocarChip(c: Chip) { setChip(c); if (dimDoChip(c) !== dimDoChip(chip)) carregar(c); }

  const metrica = metricaDoChip(chip);
  const ordenadas = useMemo(() => [...linhas].sort((a, b) => b[metrica] - a[metrica]), [linhas, metrica]);
  const totalMetrica = useMemo(() => ordenadas.reduce((a, l) => a + l[metrica], 0), [ordenadas, metrica]);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('analise.item'), t('rel.qtd'), t('fin.valor')];
    const ls = ordenadas.map((l) => [l.nome, l.quantidade, l.total]);
    const nome = 'analise_' + chip + '_' + de + '_' + ate;
    if (fmt === 'xlsx') baixarExcel(nome, cab, ls, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv(nome, cab, ls);
  }

  const CHIPS: { c: Chip; k: string }[] = [
    { c: 'produtos', k: 'analise.produtos' },
    { c: 'clientes_valor', k: 'analise.clientes_valor' }, { c: 'clientes_pedidos', k: 'analise.clientes_pedidos' },
  ];

  return (
    <div>
      <div className="crumb">{t('analise.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('analise.titulo')}</h1><div className="muted page-sub">{t('analise.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {CHIPS.map((x) => <button key={x.c} className={'chip-f' + (chip === x.c ? ' on' : '')} onClick={() => trocarChip(x.c)}>{t(x.k)}</button>)}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: 12 }}>{t('analise.grafico')}:</span>
          {(['barras', 'pizza', 'linha'] as const).map((g) => <button key={g} className={'chip-f' + (grafico === g ? ' on' : '')} onClick={() => trocarGrafico(g)}>{t('analise.g_' + g)}</button>)}
        </span>
      </div>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <button className="btn-primary" onClick={() => carregar()}><Ic name="i-search" className="sm" /> {t('rel.gerar')}</button>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button>
          <BotaoExcel onClick={() => exportar('xlsx')} />
        </span>
      </div>

      {carregando ? <div className="muted">{t('common.carregando')}</div> : (
        <div className="card" style={{ maxWidth: 'none', marginTop: 12 }}>
          {ordenadas.length > 0 && (
            <GraficoAnalise tipo={grafico} dados={ordenadas.slice(0, 8).map((l) => ({ nome: l.nome, valor: l[metrica] }))}
              fmt={metrica === 'total' ? moeda : (n) => Math.round(n).toLocaleString('pt-BR')} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>
            <table className="tabela">
              <thead><tr><th style={{ width: 36 }}>#</th><th>{t('analise.item')}</th><th style={{ width: '40%' }} /><th style={{ textAlign: 'right' }}>{t('rel.qtd')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'right' }}>%</th></tr></thead>
              <tbody>
                {ordenadas.length === 0 && <tr><td colSpan={6} className="vazio">{t('rel.vazio')}</td></tr>}
                {ordenadas.map((l, i) => {
                  const p = totalMetrica > 0 ? Math.round((l[metrica] / totalMetrica) * 100) : 0;
                  return (
                    <tr key={l.nome + i}>
                      <td className="muted">{i + 1}</td>
                      <td>{l.nome}</td>
                      <td><span style={{ display: 'block', height: 8, background: '#f0f0f4', borderRadius: 6, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: p + '%', background: '#7b61ff' }} /></span></td>
                      <td style={{ textAlign: 'right' }}>{Math.round(l.quantidade).toLocaleString('pt-BR')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(l.total)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{p}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const CORES_G = ['#7b61ff', '#16a34a', '#ea9213', '#3b82f6', '#e1483b', '#06b6d4', '#a855f7', '#84cc16'];
function abrevia(s: string, n = 14) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// Gráfico da análise (SVG, sem dependência). Tipo escolhido por usuário.
function GraficoAnalise({ tipo, dados, fmt }: { tipo: 'barras' | 'pizza' | 'linha'; dados: { nome: string; valor: number }[]; fmt: (n: number) => string; }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  const total = dados.reduce((a, d) => a + d.valor, 0) || 1;
  const W = 720, H = 240;

  if (tipo === 'pizza') {
    const cx = 130, cy = 120, r = 100;
    let ang = -Math.PI / 2;
    const arcos = dados.map((d, i) => {
      const frac = d.valor / total;
      const a0 = ang, a1 = ang + frac * Math.PI * 2; ang = a1;
      const p = (a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      const large = a1 - a0 > Math.PI ? 1 : 0;
      return { d: `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`, cor: CORES_G[i % CORES_G.length], item: d };
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240, marginBottom: 12 }}>
        {arcos.map((a, i) => <path key={i} d={a.d} fill={a.cor} stroke="#fff" strokeWidth={1} />)}
        {dados.map((d, i) => (
          <g key={i} transform={`translate(280, ${24 + i * 26})`}>
            <rect width={14} height={14} rx={3} fill={CORES_G[i % CORES_G.length]} />
            <text x={20} y={12} fontSize={13} fill="var(--ink)">{abrevia(d.nome, 28)} — {fmt(d.valor)} ({Math.round((d.valor / total) * 100)}%)</text>
          </g>
        ))}
      </svg>
    );
  }

  if (tipo === 'linha') {
    const padL = 40, padB = 28, padT = 14, padR = 14;
    const iw = W - padL - padR, ih = H - padB - padT;
    const n = dados.length;
    const x = (i: number) => padL + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
    const y = (v: number) => padT + ih - (v / max) * ih;
    const pts = dados.map((d, i) => `${x(i).toFixed(1)},${y(d.valor).toFixed(1)}`).join(' ');
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240, marginBottom: 12 }}>
        <line x1={padL} y1={padT + ih} x2={W - padR} y2={padT + ih} stroke="var(--borda)" />
        <polyline points={pts} fill="none" stroke="#7b61ff" strokeWidth={2.5} />
        {dados.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.valor)} r={4} fill="#7b61ff" />
            <text x={x(i)} y={H - 8} fontSize={11} fill="var(--muted)" textAnchor="middle">{abrevia(d.nome, 10)}</text>
          </g>
        ))}
      </svg>
    );
  }

  // barras (vertical)
  const padL = 40, padB = 30, padT = 14, padR = 14;
  const iw = W - padL - padR, ih = H - padB - padT;
  const n = dados.length;
  const bw = Math.min(64, (iw / n) * 0.6);
  const step = iw / n;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240, marginBottom: 12 }}>
      <line x1={padL} y1={padT + ih} x2={W - padR} y2={padT + ih} stroke="var(--borda)" />
      {dados.map((d, i) => {
        const h = (d.valor / max) * ih;
        const cx = padL + step * i + step / 2;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={padT + ih - h} width={bw} height={h} rx={4} fill={CORES_G[i % CORES_G.length]} />
            <text x={cx} y={padT + ih - h - 4} fontSize={11} fill="var(--ink)" textAnchor="middle">{fmt(d.valor)}</text>
            <text x={cx} y={H - 10} fontSize={11} fill="var(--muted)" textAnchor="middle">{abrevia(d.nome, 10)}</text>
          </g>
        );
      })}
    </svg>
  );
}
