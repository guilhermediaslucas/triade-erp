import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface MetaMes { mes: number; valor: number; metaDiaUtil: number; metaSabado: number; }
interface Linha { valor: string; diaUtil: string; sabado: string; }

// Conta dias úteis (seg–sex) e sábados de um mês (domingo = sem meta).
function contarDias(ano: number, mes: number): { uteis: number; sabados: number } {
  let uteis = 0, sabados = 0;
  const dias = new Date(ano, mes, 0).getDate();
  for (let d = 1; d <= dias; d++) {
    const wd = new Date(ano, mes - 1, d).getDay();
    if (wd === 6) sabados++;
    else if (wd >= 1 && wd <= 5) uteis++;
  }
  return { uteis, sabados };
}
const vazia = (): Linha => ({ valor: '0', diaUtil: '0', sabado: '0' });

export function Metas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('comercial.meta.gerenciar');

  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [linhas, setLinhas] = useState<Linha[]>(() => Array.from({ length: 12 }, vazia));
  const [abertos, setAbertos] = useState<Set<number>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  const nomeMes = (m: number) => new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: 'long' });
  const anos = Array.from({ length: 7 }, (_, i) => anoAtual - 2 + i);

  function carregar(a: number) {
    api.get<MetaMes[]>('/metas?ano=' + a, token!).then((ms) => {
      setLinhas(ms.map((m) => ({ valor: String(m.valor ?? 0), diaUtil: String(m.metaDiaUtil ?? 0), sabado: String(m.metaSabado ?? 0) })));
    }).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  useEffect(() => { carregar(ano); /* eslint-disable-next-line */ }, [ano]);

  function set(i: number, campo: keyof Linha, v: string) {
    setLinhas((cur) => cur.map((l, idx) => (idx === i ? { ...l, [campo]: v } : l)));
  }
  function toggle(i: number) { setAbertos((c) => { const n = new Set(c); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  function aplicarDiluicao(i: number) {
    const { uteis, sabados } = contarDias(ano, i + 1);
    const total = uteis * (Number(linhas[i]!.diaUtil) || 0) + sabados * (Number(linhas[i]!.sabado) || 0);
    set(i, 'valor', String(Math.round(total * 100) / 100));
  }

  const totalAno = useMemo(() => linhas.reduce((s, l) => s + (Number(l.valor) || 0), 0), [linhas]);

  async function salvar() {
    setErro(null); setSalv(true);
    const meses = linhas.map((l, i) => ({ mes: i + 1, valor: Number(l.valor) || 0, metaDiaUtil: Number(l.diaUtil) || 0, metaSabado: Number(l.sabado) || 0 }));
    try { await api.put('/metas', { ano, meses }, token!); toast(t('metas.salvo')); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
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
        {linhas.map((l, i) => (
          <div key={i} className="card" style={{ maxWidth: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <b style={{ textTransform: 'capitalize' }}>{nomeMes(i + 1)}</b>
              <label className="campo" style={{ margin: 0, flex: '0 0 160px' }}>
                <input type="number" min="0" step="0.01" value={l.valor} onChange={(e) => set(i, 'valor', e.target.value)} disabled={!pode} style={{ textAlign: 'right' }} />
              </label>
            </div>
            <div style={{ borderTop: '0.5px solid var(--borda)', marginTop: 10, paddingTop: 10 }}>
              <button className="btn-link" onClick={() => toggle(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Ic name="i-chev" className="sm" style={{ transform: abertos.has(i) ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} /> {t('metas.diluir')}
              </button>
              {abertos.has(i) && (
                <div style={{ marginTop: 8 }}>
                  <div className="cores-grid">
                    <label className="campo">{t('metas.dia_util')}<input type="number" min="0" step="0.01" value={l.diaUtil} onChange={(e) => set(i, 'diaUtil', e.target.value)} disabled={!pode} /></label>
                    <label className="campo">{t('metas.sabado')}<input type="number" min="0" step="0.01" value={l.sabado} onChange={(e) => set(i, 'sabado', e.target.value)} disabled={!pode} /></label>
                  </div>
                  {(() => { const c = contarDias(ano, i + 1); return (
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {c.uteis} {t('metas.dias_uteis')} + {c.sabados} {t('metas.sabados')} · {t('metas.domingo_sem')}
                    </div>
                  ); })()}
                  {pode && <button className="btn-ghost btn-mini" style={{ marginTop: 8 }} onClick={() => aplicarDiluicao(i)}><Ic name="i-check" className="sm" /> {t('metas.aplicar_diluicao')}</button>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="nota-info" style={{ marginTop: 12 }}><Ic name="i-shield" className="sm" /> {t('metas.nota')}</div>
      {pode && <div className="form-actions"><button className="btn-primary" disabled={salv} onClick={salvar}><Ic name="i-check" className="sm" /> {t('metas.salvar')}</button></div>}
    </div>
  );
}
