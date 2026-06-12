import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Linha { numero: number; data: string; cliente: string | null; vendedor: string | null; status: string; total: number; }
interface PorVend { vendedor: string; quantidade: number; total: number; }
interface Resp { linhas: Linha[]; total: number; quantidade: number; porVendedor: PorVend[]; }

const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelVendas() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [d, setD] = useState<Resp | null>(null); const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setD(await api.get<Resp>(`/relatorios/vendas?de=${de}&ate=${ate}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  function exportar(fmt: 'csv' | 'xlsx' = 'csv') {
    if (!d) return;
    (fmt === 'xlsx' ? baixarExcel : baixarCsv)('vendas_' + de + '_' + ate, [t('pedidos.numero'), t('pedidos.data'), t('pedidos.cliente'), t('pedidos.vendedor'), t('pedidos.status'), t('pedidos.total')],
      d.linhas.map((l) => [numeroPedido(l.numero), new Date(l.data).toLocaleDateString('pt-BR'), l.cliente ?? '', l.vendedor ?? '', t('status.' + l.status), l.total]));
  }

  return (
    <div>
      <div className="crumb">{t('rel.crumb_vendas')}</div><h1 className="page-titulo">{t('rel.vendas')}</h1>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {d && d.linhas.length > 0 && <><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => exportar('xlsx')}>{t('rel.exportar_xlsx')}</button></>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {d && <>
        <div className="kpis">
          <div className="kpi-card kpi-mock"><div className="kpi-ic tint-gr">💰</div><div><div className="kpi-l">{t('rel.total_vendas')}</div><div className="kpi-v">{moeda(d.total)}</div><div className="kpi-s">{d.quantidade} {t('pedidos.titulo').toLowerCase()}</div></div></div>
        </div>
        <div className="dash-grid2">
          <div className="card pad0"><table className="tabela">
            <thead><tr><th>{t('pedidos.numero')}</th><th>{t('pedidos.data')}</th><th>{t('pedidos.cliente')}</th><th>{t('pedidos.vendedor')}</th><th>{t('pedidos.total')}</th></tr></thead>
            <tbody>
              {d.linhas.length === 0 && <tr><td colSpan={5} className="vazio">{t('rel.vazio')}</td></tr>}
              {d.linhas.map((l) => (<tr key={l.numero}><td><b>{numeroPedido(l.numero)}</b></td><td>{new Date(l.data).toLocaleDateString('pt-BR')}</td><td>{l.cliente ?? '—'}</td><td>{l.vendedor ?? '—'}</td><td>{moeda(l.total)}</td></tr>))}
            </tbody>
          </table></div>
          <div className="card"><h3 style={{ marginTop: 0 }}>{t('rel.por_vendedor')}</h3>
            {d.porVendedor.length === 0 && <div className="muted">—</div>}
            {d.porVendedor.map((v) => (<div key={v.vendedor} className="dash-status-item"><span className="dash-status-nome">{v.vendedor}</span><span className="muted">{v.quantidade}</span><span className="dash-status-q">{moeda(v.total)}</span></div>))}
          </div>
        </div>
      </>}
    </div>
  );
}
