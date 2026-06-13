import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { baixarExcel } from '../lib/excel.js';
import { BotaoEscanear } from '../components/BotaoEscanear.js';

interface Faltante { codigo: string; produtoNome: string; lote: string | null; validade: string | null; }
interface Resultado { id: string; esperadas: number; encontradas: number; faltantes: number; desconhecidas: number; baixouPerda: boolean; faltantesDetalhe: Faltante[]; }
interface Hist { id: string; responsavel: string | null; esperadas: number; encontradas: number; faltantes: number; baixouPerda: boolean; criadoEm: string; }
const hojeISO = () => new Date().toISOString().slice(0, 10);

export function Inventario() {
  const { token, temCapability, usuario } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const pode = temCapability('estoque.inventario.gerenciar');
  const [iniciado, setIniciado] = useState(false);
  const [data, setData] = useState(hojeISO());
  const [responsavel, setResponsavel] = useState('');
  const [scan, setScan] = useState('');
  const [codigos, setCodigos] = useState<string[]>([]);
  const [res, setRes] = useState<Resultado | null>(null);
  const [hist, setHist] = useState<Hist[]>([]);
  const [verId, setVerId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');
  async function carregarHist() { try { setHist(await api.get('/inventario', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregarHist(); if (!responsavel && usuario?.nome) setResponsavel(usuario.nome); /* eslint-disable-next-line */ }, []);

  function iniciar() { setIniciado(true); setRes(null); setCodigos([]); setTimeout(() => scanRef.current?.focus(), 50); }
  function bipar(v: string) {
    const c = v.trim().toUpperCase(); if (!c) return;
    if (!codigos.includes(c)) setCodigos((cs) => [...cs, c]);
    setScan(''); scanRef.current?.focus();
  }
  async function finalizar(baixarPerda: boolean) {
    setErro(null); setSalv(true);
    try {
      const r = await api.post<Resultado>('/inventario', { responsavel, codigos, baixarPerda }, token!);
      setRes(r); setCodigos([]); setScan(''); setIniciado(false); carregarHist();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }
  function exportar() {
    const cab = [t('inv.data'), t('inv.responsavel'), t('inv.esperadas'), t('inv.encontradas'), t('inv.faltantes'), t('inv.baixa')];
    const linhas = hist.map((h) => [fmt(h.criadoEm), h.responsavel ?? '', h.esperadas, h.encontradas, h.faltantes, h.baixouPerda ? t('inv.baixados') : '—']);
    baixarExcel('inventarios', cab, linhas);
  }

  return (
    <div>
      <div className="crumb">{t('inv.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('inv.titulo')}</h1><div className="muted page-sub">{t('inv.sub')}</div></div>
        <button className="btn-ghost" onClick={() => nav(-1)}>← {t('pedidos.voltar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {pode && (
        <div className="card" style={{ maxWidth: 'none', marginBottom: 16 }}>
          <div className="card-head"><h3>{t('inv.iniciar')}</h3></div>
          {!iniciado ? (
            <>
              <div className="cores-grid">
                <label className="campo">{t('inv.data_inv')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
                <label className="campo">{t('inv.responsavel')}<input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></label>
              </div>
              <div className="modal-acoes" style={{ justifyContent: 'flex-start' }}>
                <button className="btn-primary" onClick={iniciar}>✓ {t('inv.iniciar_btn')}</button>
              </div>
            </>
          ) : (
            <>
              <label className="campo">
                {t('inv.bipe')} <span className="muted">· {codigos.length} {t('etq.bipados')}</span>
                <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
                  onChange={(e) => setScan(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bipar(scan); } }} />
              </label>
              <div style={{ marginTop: 6 }}><BotaoEscanear onLido={bipar} /></div>
              {codigos.length > 0 && (
                <div className="chips">
                  {codigos.map((c) => <span key={c} className="chip" style={{ fontFamily: 'monospace' }}>{c}<button type="button" className="chip-x" onClick={() => setCodigos((cs) => cs.filter((x) => x !== c))}>×</button></span>)}
                </div>
              )}
              <div className="modal-acoes">
                <button className="btn-ghost" disabled={salv} onClick={() => finalizar(false)}>{t('inv.finalizar')}</button>
                <button className="btn-primary" disabled={salv} onClick={() => finalizar(true)}>{t('inv.finalizar_baixar')}</button>
              </div>
            </>
          )}
        </div>
      )}

      {res && (
        <div className="card" style={{ maxWidth: 'none', marginBottom: 16 }}>
          <div className="card-head"><h3>{t('inv.resultado')}</h3></div>
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card kpi-mock"><div className="kpi-body"><div className="kpi-lbl">{t('inv.esperadas')}</div><div className="kpi-val">{res.esperadas}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-body"><div className="kpi-lbl">{t('inv.encontradas')}</div><div className="kpi-val">{res.encontradas}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-body"><div className="kpi-lbl">{t('inv.faltantes')}</div><div className={res.faltantes ? 'kpi-val kpi-vermelho' : 'kpi-val'}>{res.faltantes}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-body"><div className="kpi-lbl">{t('inv.desconhecidas')}</div><div className="kpi-val">{res.desconhecidas}</div></div></div>
          </div>
          {res.baixouPerda && <div className="alerta-ok" style={{ marginTop: 10 }}>{t('inv.baixou_ok')}</div>}
        </div>
      )}

      <div className="card pad0">
        <div className="card-head" style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ marginRight: 'auto' }}>{t('inv.realizados')}</h3>
          {hist.length > 0 && <button className="btn-acao verde" onClick={exportar}>⬇ {t('rel.exportar_xlsx')}</button>}
        </div>
        <table className="tabela">
          <thead><tr><th>{t('inv.data')}</th><th>{t('inv.responsavel')}</th><th>{t('inv.esperadas')}</th><th>{t('inv.encontradas')}</th><th>{t('inv.faltantes')}</th><th>{t('inv.baixa')}</th><th style={{ textAlign: 'right' }}>{t('inv.detalhe')}</th></tr></thead>
          <tbody>
            {hist.length === 0 && <tr><td colSpan={7} className="vazio">{t('inv.vazio')}</td></tr>}
            {hist.map((h) => (
              <tr key={h.id}>
                <td>{fmt(h.criadoEm)}</td><td>{h.responsavel ?? '—'}</td>
                <td>{h.esperadas}</td><td>{h.encontradas}</td>
                <td className={h.faltantes ? 'kpi-vermelho' : ''}>{h.faltantes}</td>
                <td>{h.baixouPerda ? t('inv.baixados') : '—'}</td>
                <td style={{ textAlign: 'right' }}>{h.faltantes > 0 ? <button className="btn-link" onClick={() => setVerId(h.id)}>{t('inv.ver_faltantes')}</button> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verId && <ModalFaltantes id={verId} onFechar={() => setVerId(null)} />}
    </div>
  );
}

function ModalFaltantes({ id, onFechar }: { id: string; onFechar: () => void }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [faltantes, setFaltantes] = useState<Faltante[]>([]);
  const fmtD = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  useEffect(() => { api.get<Faltante[]>(`/inventario/${id}/faltantes`, token!).then(setFaltantes).catch(() => {}); /* eslint-disable-next-line */ }, [id]);
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('inv.faltantes')}</h2>
      <div className="card pad0" style={{ maxHeight: 360, overflow: 'auto' }}><table className="tabela">
        <thead><tr><th>{t('etq.codigo')}</th><th>{t('precos.produto')}</th><th>{t('estoque.lote')}</th><th>{t('estoque.validade')}</th></tr></thead>
        <tbody>
          {faltantes.length === 0 && <tr><td colSpan={4} className="vazio">—</td></tr>}
          {faltantes.map((f) => <tr key={f.codigo}><td style={{ fontFamily: 'monospace' }}>{f.codigo}</td><td>{f.produtoNome}</td><td>{f.lote ?? '—'}</td><td>{fmtD(f.validade)}</td></tr>)}
        </tbody>
      </table></div>
      <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}
