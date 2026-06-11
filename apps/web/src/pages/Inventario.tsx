import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Faltante { codigo: string; produtoNome: string; lote: string | null; validade: string | null; }
interface Resultado { id: string; esperadas: number; encontradas: number; faltantes: number; desconhecidas: number; baixouPerda: boolean; faltantesDetalhe: Faltante[]; }
interface Hist { id: string; responsavel: string | null; esperadas: number; encontradas: number; faltantes: number; baixouPerda: boolean; criadoEm: string; }

export function Inventario() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('estoque.inventario.gerenciar');
  const [responsavel, setResponsavel] = useState('');
  const [scan, setScan] = useState('');
  const [codigos, setCodigos] = useState<string[]>([]);
  const [res, setRes] = useState<Resultado | null>(null);
  const [hist, setHist] = useState<Hist[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');
  const fmtD = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  async function carregarHist() { try { setHist(await api.get('/inventario', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregarHist(); /* eslint-disable-next-line */ }, []);

  function bipar(v: string) {
    const c = v.trim().toUpperCase(); if (!c) return;
    if (!codigos.includes(c)) setCodigos((cs) => [...cs, c]);
    setScan(''); scanRef.current?.focus();
  }
  async function finalizar(baixarPerda: boolean) {
    setErro(null); setSalv(true);
    try {
      const r = await api.post<Resultado>('/inventario', { responsavel, codigos, baixarPerda }, token!);
      setRes(r); setCodigos([]); setScan(''); carregarHist();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('inv.crumb')}</div><h1 className="page-titulo">{t('inv.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('inv.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {pode && (
        <div className="card" style={{ maxWidth: 640, marginBottom: 16 }}>
          <label className="campo">{t('inv.responsavel')}<input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></label>
          <label className="campo">
            {t('inv.bipe')} <span className="muted">· {codigos.length} {t('etq.bipados')}</span>
            <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bipar(scan); } }} />
          </label>
          {codigos.length > 0 && (
            <div className="chips">
              {codigos.map((c) => <span key={c} className="chip" style={{ fontFamily: 'monospace' }}>{c}<button type="button" className="chip-x" onClick={() => setCodigos((cs) => cs.filter((x) => x !== c))}>×</button></span>)}
            </div>
          )}
          <div className="modal-acoes">
            <button className="btn-ghost" disabled={salv} onClick={() => finalizar(false)}>{t('inv.finalizar')}</button>
            <button className="btn-primary" disabled={salv} onClick={() => finalizar(true)}>{t('inv.finalizar_baixar')}</button>
          </div>
        </div>
      )}

      {res && (
        <div className="card" style={{ maxWidth: 720, marginBottom: 16 }}>
          <h2>{t('inv.resultado')}</h2>
          <div className="kpis">
            <div className="kpi-card"><div className="kpi-l">{t('inv.esperadas')}</div><div className="kpi-v">{res.esperadas}</div></div>
            <div className="kpi-card"><div className="kpi-l">{t('inv.encontradas')}</div><div className="kpi-v">{res.encontradas}</div></div>
            <div className="kpi-card"><div className="kpi-l">{t('inv.faltantes')}</div><div className={res.faltantes ? 'kpi-v kpi-vermelho' : 'kpi-v'}>{res.faltantes}</div></div>
            <div className="kpi-card"><div className="kpi-l">{t('inv.desconhecidas')}</div><div className="kpi-v">{res.desconhecidas}</div></div>
          </div>
          {res.baixouPerda && <div className="alerta-ok">{t('inv.baixou_ok')}</div>}
          {res.faltantesDetalhe.length > 0 && (
            <div className="card pad0" style={{ marginTop: 10 }}><table className="tabela">
              <thead><tr><th>{t('etq.codigo')}</th><th>{t('precos.produto')}</th><th>{t('estoque.lote')}</th><th>{t('estoque.validade')}</th></tr></thead>
              <tbody>{res.faltantesDetalhe.map((f) => <tr key={f.codigo}><td style={{ fontFamily: 'monospace' }}>{f.codigo}</td><td>{f.produtoNome}</td><td>{f.lote ?? '—'}</td><td>{fmtD(f.validade)}</td></tr>)}</tbody>
            </table></div>
          )}
        </div>
      )}

      <h2 className="page-titulo" style={{ fontSize: 18 }}>{t('inv.historico')}</h2>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('inv.data')}</th><th>{t('inv.responsavel')}</th><th>{t('inv.esperadas')}</th><th>{t('inv.encontradas')}</th><th>{t('inv.faltantes')}</th><th>{t('inv.baixa')}</th></tr></thead>
        <tbody>
          {hist.length === 0 && <tr><td colSpan={6} className="vazio">{t('inv.vazio')}</td></tr>}
          {hist.map((h) => (
            <tr key={h.id}>
              <td>{fmt(h.criadoEm)}</td><td>{h.responsavel ?? '—'}</td>
              <td>{h.esperadas}</td><td>{h.encontradas}</td>
              <td className={h.faltantes ? 'kpi-vermelho' : ''}>{h.faltantes}</td>
              <td>{h.baixouPerda ? t('inv.baixados') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
