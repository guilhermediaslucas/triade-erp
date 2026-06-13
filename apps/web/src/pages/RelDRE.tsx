import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Linha { origem: string; total: number; }
interface Dre { por: 'origem' | 'categoria'; receitas: Linha[]; despesas: Linha[]; totalReceitas: number; totalDespesas: number; resultado: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelDRE() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [por, setPor] = useState<'origem' | 'categoria'>('origem');
  const [d, setD] = useState<Dre | null>(null); const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setD(await api.get<Dre>(`/financeiro/dre?de=${de}&ate=${ate}&por=${por}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  // Quando agrupado por origem, traduz a chave; por categoria, mostra o nome como está.
  const rotulo = (chave: string) => (d?.por === 'categoria' ? chave : (t('origem.' + chave) === 'origem.' + chave ? chave : t('origem.' + chave)));

  function exportar(fmt: 'csv' | 'xlsx' = 'csv') {
    if (!d) return;
    const linhas: (string | number)[][] = [
      ...d.receitas.map((l) => [t('dre.receitas'), rotulo(l.origem), l.total]),
      ...d.despesas.map((l) => [t('dre.despesas'), rotulo(l.origem), -l.total]),
    ];
    (fmt === 'xlsx' ? baixarExcel : baixarCsv)('dre_' + por + '_' + de + '_' + ate, [t('dre.grupo'), d.por === 'categoria' ? t('catfin.titulo_s') : t('dre.origem'), t('fin.valor')], linhas);
  }

  const colRot = d?.por === 'categoria' ? t('catfin.titulo_s') : t('dre.origem');

  return (
    <div>
      <div className="crumb">{t('rel.crumb_dre')}</div><h1 className="page-titulo">{t('dre.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('dre.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <label className="campo">{t('dre.agrupar')}
          <select value={por} onChange={(e) => setPor(e.target.value as 'origem' | 'categoria')}>
            <option value="origem">{t('dre.por_origem')}</option>
            <option value="categoria">{t('dre.por_categoria')}</option>
          </select>
        </label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {d && <><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => exportar('xlsx')}>{t('rel.exportar_xlsx')}</button></>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {d && (
        <>
          <div className="kpis">
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div><div className="kpi-l">{t('dre.receitas')}</div><div className="kpi-v" style={{ color: '#166534' }}>{moeda(d.totalReceitas)}</div></div></div>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-receipt" className="sm" /></div><div><div className="kpi-l">{t('dre.despesas')}</div><div className="kpi-v" style={{ color: '#b91c1c' }}>{moeda(d.totalDespesas)}</div></div></div>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-check" className="sm" /></div><div><div className="kpi-l">{t('dre.resultado')}</div><div className="kpi-v" style={{ color: d.resultado >= 0 ? '#166534' : '#b91c1c' }}>{moeda(d.resultado)}</div></div></div>
          </div>
          <div className="cores-grid" style={{ alignItems: 'start' }}>
            <div className="card pad0">
              <div className="perm-titulo" style={{ padding: '10px 12px 0' }}>{t('dre.receitas')}</div>
              <table className="tabela">
                <thead><tr><th>{colRot}</th><th>{t('fin.valor')}</th></tr></thead>
                <tbody>
                  {d.receitas.length === 0 && <tr><td colSpan={2} className="vazio">{t('rel.vazio')}</td></tr>}
                  {d.receitas.map((l) => <tr key={l.origem}><td>{rotulo(l.origem)}</td><td>{moeda(l.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="card pad0">
              <div className="perm-titulo" style={{ padding: '10px 12px 0' }}>{t('dre.despesas')}</div>
              <table className="tabela">
                <thead><tr><th>{colRot}</th><th>{t('fin.valor')}</th></tr></thead>
                <tbody>
                  {d.despesas.length === 0 && <tr><td colSpan={2} className="vazio">{t('rel.vazio')}</td></tr>}
                  {d.despesas.map((l) => <tr key={l.origem}><td>{rotulo(l.origem)}</td><td>{moeda(l.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
