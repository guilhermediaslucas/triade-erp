import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';

interface Linha { origem: string; total: number; }
interface Dre { receitas: Linha[]; despesas: Linha[]; totalReceitas: number; totalDespesas: number; resultado: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelDRE() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [d, setD] = useState<Dre | null>(null); const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setD(await api.get<Dre>(`/financeiro/dre?de=${de}&ate=${ate}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const ori = (o: string) => t('origem.' + o) === 'origem.' + o ? o : t('origem.' + o);

  function exportar() {
    if (!d) return;
    const linhas: (string | number)[][] = [
      ...d.receitas.map((l) => [t('dre.receitas'), ori(l.origem), l.total]),
      ...d.despesas.map((l) => [t('dre.despesas'), ori(l.origem), -l.total]),
    ];
    baixarCsv('dre_' + de + '_' + ate, [t('dre.grupo'), t('dre.origem'), t('fin.valor')], linhas);
  }

  return (
    <div>
      <h1 className="page-titulo">{t('dre.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('dre.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {d && <button className="btn-ghost" onClick={exportar}>{t('rel.exportar')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {d && (
        <>
          <div className="kpis">
            <div className="kpi-card"><div className="kpi-l">{t('dre.receitas')}</div><div className="kpi-v" style={{ color: '#166534' }}>{moeda(d.totalReceitas)}</div></div>
            <div className="kpi-card"><div className="kpi-l">{t('dre.despesas')}</div><div className="kpi-v" style={{ color: '#b91c1c' }}>{moeda(d.totalDespesas)}</div></div>
            <div className="kpi-card"><div className="kpi-l">{t('dre.resultado')}</div><div className="kpi-v" style={{ color: d.resultado >= 0 ? '#166534' : '#b91c1c' }}>{moeda(d.resultado)}</div></div>
          </div>
          <div className="cores-grid" style={{ alignItems: 'start' }}>
            <div className="card pad0">
              <div className="perm-titulo" style={{ padding: '10px 12px 0' }}>{t('dre.receitas')}</div>
              <table className="tabela">
                <thead><tr><th>{t('dre.origem')}</th><th>{t('fin.valor')}</th></tr></thead>
                <tbody>
                  {d.receitas.length === 0 && <tr><td colSpan={2} className="vazio">{t('rel.vazio')}</td></tr>}
                  {d.receitas.map((l) => <tr key={l.origem}><td>{ori(l.origem)}</td><td>{moeda(l.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="card pad0">
              <div className="perm-titulo" style={{ padding: '10px 12px 0' }}>{t('dre.despesas')}</div>
              <table className="tabela">
                <thead><tr><th>{t('dre.origem')}</th><th>{t('fin.valor')}</th></tr></thead>
                <tbody>
                  {d.despesas.length === 0 && <tr><td colSpan={2} className="vazio">{t('rel.vazio')}</td></tr>}
                  {d.despesas.map((l) => <tr key={l.origem}><td>{ori(l.origem)}</td><td>{moeda(l.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
