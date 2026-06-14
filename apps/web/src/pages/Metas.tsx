import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';
import { MoedaInput, fmtMoedaBR } from '../components/MoedaInput.js';
import { Ic } from '../components/Icones.js';

interface MetaMes { mes: number; valor: number; metaDiaUtil: number; metaSabado: number; }
interface MetaDiaApi { mes: number; dia: number; valor: number; feriado: boolean; }
interface Linha { valor: number; diaUtil: number; sabado: number; }
interface DiaMeta { valor: number; feriado: boolean; }

const vazia = (): Linha => ({ valor: 0, diaUtil: 0, sabado: 0 });
// Abreviações de dia da semana no idioma corrente (2/jan/2000 é domingo).
const wdNome = (idx: number) => new Date(2000, 0, 2 + idx).toLocaleDateString(undefined, { weekday: 'short' });

export function Metas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('comercial.meta.gerenciar');

  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [linhas, setLinhas] = useState<Linha[]>(() => Array.from({ length: 12 }, vazia));
  // dias[mes] = { [dia]: {valor, feriado} } — só os meses ajustados pelo calendário.
  const [dias, setDias] = useState<Record<number, Record<number, DiaMeta>>>({});
  const [abertos, setAbertos] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<{ mes: number; dia: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  const nomeMes = (m: number) => new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: 'long' });
  const anos = Array.from({ length: 7 }, (_, i) => anoAtual - 2 + i);
  const diasNoMes = (m: number) => new Date(ano, m, 0).getDate();
  const weekday = (m: number, d: number) => new Date(ano, m - 1, d).getDay();
  const temCalendario = (m: number) => !!dias[m] && Object.keys(dias[m]!).length > 0;
  const totalMes = (m: number) => temCalendario(m)
    ? Object.values(dias[m]!).reduce((a, x) => a + (x.feriado ? 0 : x.valor), 0)
    : linhas[m - 1]!.valor;

  function carregar(a: number) {
    Promise.all([
      api.get<MetaMes[]>('/metas?ano=' + a, token!),
      api.get<MetaDiaApi[]>('/metas/dias?ano=' + a, token!).catch(() => [] as MetaDiaApi[]),
    ]).then(([ms, ds]) => {
      setLinhas(ms.map((m) => ({ valor: m.valor ?? 0, diaUtil: m.metaDiaUtil ?? 0, sabado: m.metaSabado ?? 0 })));
      const mapa: Record<number, Record<number, DiaMeta>> = {};
      for (const d of ds) { (mapa[d.mes] ??= {})[d.dia] = { valor: Number(d.valor) || 0, feriado: !!d.feriado }; }
      setDias(mapa); setSel(null);
    }).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  useEffect(() => { carregar(ano); /* eslint-disable-next-line */ }, [ano]);

  function setLinha(i: number, campo: keyof Linha, v: number) {
    setLinhas((cur) => cur.map((l, idx) => (idx === i ? { ...l, [campo]: v } : l)));
  }
  function toggle(i: number) { setAbertos((c) => { const n = new Set(c); n.has(i) ? n.delete(i) : n.add(i); return n; }); setSel(null); }

  // Preenche o calendário do mês a partir da meta por dia útil / sábado.
  function preencher(m: number) {
    const l = linhas[m - 1]!;
    const dd: Record<number, DiaMeta> = {};
    for (let d = 1; d <= diasNoMes(m); d++) {
      const wd = weekday(m, d);
      const valor = wd === 0 ? 0 : wd === 6 ? l.sabado : l.diaUtil;
      dd[d] = { valor, feriado: false };
    }
    setDias((cur) => ({ ...cur, [m]: dd }));
  }
  function setDia(m: number, d: number, patch: Partial<DiaMeta>) {
    setDias((cur) => ({ ...cur, [m]: { ...(cur[m] ?? {}), [d]: { ...(cur[m]?.[d] ?? { valor: 0, feriado: false }), ...patch } } }));
  }

  const totalAno = useMemo(() => Array.from({ length: 12 }, (_, i) => totalMes(i + 1)).reduce((a, b) => a + b, 0), [linhas, dias]);

  async function salvar() {
    setErro(null); setSalv(true);
    const meses = linhas.map((l, i) => ({ mes: i + 1, valor: totalMes(i + 1), metaDiaUtil: l.diaUtil, metaSabado: l.sabado }));
    const diasFlat: MetaDiaApi[] = [];
    for (const mStr of Object.keys(dias)) {
      const m = Number(mStr);
      for (const dStr of Object.keys(dias[m]!)) {
        const d = Number(dStr); const o = dias[m]![d]!;
        diasFlat.push({ mes: m, dia: d, valor: o.valor, feriado: o.feriado });
      }
    }
    try { await api.put('/metas', { ano, meses, dias: diasFlat }, token!); toast(t('metas.salvo')); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  function corDia(o: DiaMeta | undefined, wd: number): { bg: string; bd: string; col: string; sub: string } {
    if (wd === 0 && (!o || o.valor === 0) && !o?.feriado) return { bg: '#fafafa', bd: '#f0f0f4', col: '#c3c6d0', sub: '—' };
    if (o?.feriado) return { bg: '#fcebeb', bd: '#f7c1c1', col: '#a32d2d', sub: t('metas.feriado') };
    if (!o || o.valor === 0) return { bg: '#f1efe8', bd: '#d3d1c7', col: '#5f5e5a', sub: 'R$ 0,00' };
    return { bg: 'var(--accent-soft)', bd: 'var(--accent)', col: 'var(--accent)', sub: 'R$ ' + fmtMoedaBR(o.valor) };
  }

  return (
    <div>
      <div className="crumb">{t('metas.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('metas.titulo')}</h1><div className="muted page-sub">{t('metas.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar" style={{ alignItems: 'center' }}>
        <label className="campo" style={{ margin: 0 }}>{t('metas.ano')}
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} style={{ maxWidth: 120 }}>
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <div style={{ marginLeft: 'auto', background: 'var(--bg)', borderRadius: 10, padding: '8px 14px' }}>
          <span className="muted" style={{ fontSize: 12 }}>{t('metas.total_ano')}</span>
          <b style={{ fontSize: 18, marginLeft: 8 }}>{moeda(totalAno)}</b>
        </div>
      </div>

      <div className="dash-row c2" style={{ marginTop: 12 }}>
        {linhas.map((l, i) => {
          const m = i + 1;
          const comCal = temCalendario(m);
          const aberto = abertos.has(i);
          return (
            <div key={i} className="card" style={{ maxWidth: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <b style={{ textTransform: 'capitalize' }}>{nomeMes(m)}</b>
                {comCal
                  ? <span style={{ fontWeight: 600 }}>{moeda(totalMes(m))}</span>
                  : <div style={{ flex: '0 0 160px' }}><MoedaInput value={l.valor} disabled={!pode} onChange={(n) => setLinha(i, 'valor', n)} style={{ textAlign: 'right', width: '100%' }} /></div>}
              </div>
              {comCal && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t('metas.def_calendario')}</div>}

              <div style={{ borderTop: '0.5px solid var(--borda)', marginTop: 10, paddingTop: 10 }}>
                <button className="btn-link" onClick={() => toggle(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Ic name="i-chev" className="sm" style={{ transform: aberto ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} /> {t('metas.calendario')}
                </button>

                {aberto && (
                  <div style={{ marginTop: 10 }}>
                    {pode && (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
                        <label className="campo" style={{ margin: 0 }}>{t('metas.dia_util')}<MoedaInput value={l.diaUtil} onChange={(n) => setLinha(i, 'diaUtil', n)} style={{ width: 130 }} /></label>
                        <label className="campo" style={{ margin: 0 }}>{t('metas.sabado')}<MoedaInput value={l.sabado} onChange={(n) => setLinha(i, 'sabado', n)} style={{ width: 130 }} /></label>
                        <button className="btn-ghost btn-mini" onClick={() => preencher(m)}><Ic name="i-grid" className="sm" /> {t('metas.preencher')}</button>
                      </div>
                    )}

                    <div className="cal-wd">{Array.from({ length: 7 }).map((_, w) => <div key={w}>{wdNome(w)}</div>)}</div>
                    <div className="cal-grid">
                      {Array.from({ length: weekday(m, 1) }).map((_, k) => <div key={'b' + k} />)}
                      {Array.from({ length: diasNoMes(m) }).map((_, k) => {
                        const d = k + 1; const wd = weekday(m, d);
                        const o = dias[m]?.[d];
                        const c = corDia(o, wd);
                        const selecionado = sel?.mes === m && sel.dia === d;
                        return (
                          <div key={d} className="cal-cel" style={{ background: c.bg, border: '1px solid ' + (selecionado ? 'var(--accent)' : c.bd), cursor: pode && comCal ? 'pointer' : 'default' }}
                            onClick={() => { if (pode && comCal) setSel({ mes: m, dia: d }); }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: c.col }}>{d}</div>
                            <div style={{ fontSize: 10, marginTop: 2, color: c.col }}>{c.sub}</div>
                          </div>
                        );
                      })}
                    </div>

                    {!comCal && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t('metas.preencher_dica')}</div>}

                    {pode && comCal && sel && sel.mes === m && (
                      <div className="cal-editor">
                        <b style={{ fontSize: 13 }}>{t('metas.dia')} {String(sel.dia).padStart(2, '0')}/{String(m).padStart(2, '0')}</b>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>{t('fin.valor')}
                          <MoedaInput value={dias[m]?.[sel.dia]?.valor ?? 0} onChange={(n) => setDia(m, sel.dia, { valor: n, feriado: false })} style={{ width: 120 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                          <input type="checkbox" checked={!!dias[m]?.[sel.dia]?.feriado} onChange={(e) => setDia(m, sel.dia, { feriado: e.target.checked, ...(e.target.checked ? { valor: 0 } : {}) })} /> {t('metas.feriado')}
                        </label>
                        <button className="btn-ghost btn-mini" onClick={() => setDia(m, sel.dia, { valor: 0, feriado: false })}>{t('metas.zerar_dia')}</button>
                      </div>
                    )}

                    <div className="muted" style={{ fontSize: 12, marginTop: 10, textAlign: 'right' }}>{t('metas.total_mes')}: <b style={{ color: '#0f6e56' }}>{moeda(totalMes(m))}</b></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="nota-info" style={{ marginTop: 12 }}><Ic name="i-shield" className="sm" /> {t('metas.nota')}</div>
      {pode && <div className="form-actions"><button className="btn-primary" disabled={salv} onClick={salvar}><Ic name="i-check" className="sm" /> {t('metas.salvar')}</button></div>}
    </div>
  );
}
