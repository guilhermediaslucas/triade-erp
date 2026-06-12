import { Fragment, useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Hist { id: string; responsavel: string | null; esperadas: number; encontradas: number; faltantes: number; baixouPerda: boolean; criadoEm: string; }
interface Faltante { codigo: string; produtoNome: string; lote: string | null; validade: string | null; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelInventarios() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [todos, setTodos] = useState<Hist[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<Faltante[]>([]);

  async function carregar() {
    setErro(null);
    try { setTodos(await api.get<Hist[]>('/inventario', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');
  const fmtD = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const acur = (h: Hist) => h.esperadas > 0 ? Math.round((h.encontradas / h.esperadas) * 100) : 100;

  // Filtro de período pela data de criação (o histórico vem completo do backend).
  const linhas = useMemo(() => todos.filter((h) => {
    const d = h.criadoEm.slice(0, 10);
    return d >= de && d <= ate;
  }), [todos, de, ate]);

  const totalFalt = useMemo(() => linhas.reduce((a, h) => a + h.faltantes, 0), [linhas]);
  const totalBaixados = useMemo(() => linhas.filter((h) => h.baixouPerda).reduce((a, h) => a + h.faltantes, 0), [linhas]);
  const acurMedia = useMemo(() => {
    if (linhas.length === 0) return 100;
    return Math.round(linhas.reduce((a, h) => a + acur(h), 0) / linhas.length);
  }, [linhas]);

  async function verFaltantes(id: string) {
    if (aberto === id) { setAberto(null); setFaltantes([]); return; }
    setAberto(id); setFaltantes([]);
    try { setFaltantes(await api.get<Faltante[]>(`/inventario/${id}/faltantes`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="crumb">{t('rel.crumb_inv')}</div><h1 className="page-titulo">{t('relinv.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('relinv.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={carregar}>{t('rel.gerar')}</button>
        {linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('inventarios_' + de + '_' + ate,
            [t('inv.data'), t('inv.responsavel'), t('inv.esperadas'), t('inv.encontradas'), t('inv.faltantes'), t('relinv.acuracidade'), t('inv.baixa')],
            linhas.map((h) => [fmt(h.criadoEm), h.responsavel ?? '—', h.esperadas, h.encontradas, h.faltantes, acur(h) + '%', h.baixouPerda ? t('inv.baixados') : '—']))}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => baixarExcel('inventarios_' + de + '_' + ate,
            [t('inv.data'), t('inv.responsavel'), t('inv.esperadas'), t('inv.encontradas'), t('inv.faltantes'), t('relinv.acuracidade'), t('inv.baixa')],
            linhas.map((h) => [fmt(h.criadoEm), h.responsavel ?? '—', h.esperadas, h.encontradas, h.faltantes, acur(h) + '%', h.baixouPerda ? t('inv.baixados') : '—']))}>{t('rel.exportar_xlsx')}</button></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card kpi-mock"><div className="kpi-ic tint-bl">🔢</div><div><div className="kpi-l">{t('relinv.kpi_total')}</div><div className="kpi-v">{linhas.length}</div></div></div>
        <div className="kpi-card kpi-mock"><div className="kpi-ic tint-pp">🎯</div><div><div className="kpi-l">{t('relinv.kpi_acur')}</div><div className="kpi-v">{acurMedia}%</div></div></div>
        <div className="kpi-card kpi-vermelho kpi-mock"><div className="kpi-ic tint-rd">⚠️</div><div><div className="kpi-l">{t('relinv.kpi_falt')}</div><div className="kpi-v">{totalFalt}</div></div></div>
        <div className="kpi-card kpi-mock"><div className="kpi-ic tint-or">📉</div><div><div className="kpi-l">{t('relinv.kpi_baixados')}</div><div className="kpi-v">{totalBaixados}</div></div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('inv.data')}</th><th>{t('inv.responsavel')}</th><th>{t('inv.esperadas')}</th><th>{t('inv.encontradas')}</th><th>{t('inv.faltantes')}</th><th>{t('relinv.acuracidade')}</th><th>{t('inv.baixa')}</th><th></th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={8} className="vazio">{t('relinv.vazio')}</td></tr>}
          {linhas.map((h) => (
            <Fragment key={h.id}>
              <tr>
                <td>{fmt(h.criadoEm)}</td><td>{h.responsavel ?? '—'}</td>
                <td>{h.esperadas}</td><td>{h.encontradas}</td>
                <td className={h.faltantes ? 'kpi-vermelho' : ''}>{h.faltantes}</td>
                <td><span className="pill" style={{ background: acur(h) >= 95 ? '#dcfce7' : acur(h) >= 80 ? '#fef9c3' : '#fee2e2', color: acur(h) >= 95 ? '#15803d' : acur(h) >= 80 ? '#a16207' : '#b91c1c' }}>{acur(h)}%</span></td>
                <td>{h.baixouPerda ? t('inv.baixados') : '—'}</td>
                <td>{h.faltantes > 0 && <button className="btn-link" onClick={() => verFaltantes(h.id)}>{aberto === h.id ? t('relinv.ocultar') : t('relinv.ver_falt')}</button>}</td>
              </tr>
              {aberto === h.id && (
                <tr><td colSpan={8} style={{ background: '#fafafa' }}>
                  <table className="tabela" style={{ margin: 0 }}>
                    <thead><tr><th>{t('etq.codigo')}</th><th>{t('precos.produto')}</th><th>{t('estoque.lote')}</th><th>{t('estoque.validade')}</th></tr></thead>
                    <tbody>
                      {faltantes.length === 0 && <tr><td colSpan={4} className="vazio">…</td></tr>}
                      {faltantes.map((f) => <tr key={f.codigo}><td style={{ fontFamily: 'monospace' }}>{f.codigo}</td><td>{f.produtoNome}</td><td>{f.lote ?? '—'}</td><td>{fmtD(f.validade)}</td></tr>)}
                    </tbody>
                  </table>
                </td></tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
