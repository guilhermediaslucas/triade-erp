import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';
import { FiltrosModal } from '../components/FiltrosModal.js';

interface Linha { origem: string; total: number; }
interface Dre { por: 'origem' | 'categoria'; receitas: Linha[]; despesas: Linha[]; totalReceitas: number; totalDespesas: number; resultado: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelDRE() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [por, setPor] = useState<'origem' | 'categoria'>('origem');
  const [d, setD] = useState<Dre | null>(null); const [erro, setErro] = useState<string | null>(null);

  async function gerar(dd = de, aa = ate, pp = por) {
    setErro(null);
    try { setD(await api.get<Dre>(`/financeiro/dre?de=${dd}&ate=${aa}&por=${pp}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const qtdFiltros = (de !== primeiroDia() ? 1 : 0) + (ate !== hoje() ? 1 : 0) + (por !== 'origem' ? 1 : 0);
  function limparFiltros() { const dd = primeiroDia(), aa = hoje(); setDe(dd); setAte(aa); setPor('origem'); gerar(dd, aa, 'origem'); }
  // Quando agrupado por origem, traduz a chave; por categoria, mostra o nome como está.
  const rotulo = (chave: string) => (d?.por === 'categoria' ? chave : (t('origem.' + chave) === 'origem.' + chave ? chave : t('origem.' + chave)));

  function exportar(fmt: 'csv' | 'xlsx' = 'csv') {
    if (!d) return;
    const linhas: (string | number)[][] = [
      ...d.receitas.map((l) => [t('dre.receitas'), rotulo(l.origem), l.total]),
      ...d.despesas.map((l) => [t('dre.despesas'), rotulo(l.origem), -l.total]),
    ];
    const cab = [t('dre.grupo'), d.por === 'categoria' ? t('catfin.titulo_s') : t('dre.origem'), t('fin.valor')];
    if (fmt === 'xlsx') baixarExcel('dre_' + por + '_' + de + '_' + ate, cab, linhas, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('dre_' + por + '_' + de + '_' + ate, cab, linhas);
  }

  const colRot = d?.por === 'categoria' ? t('catfin.titulo_s') : t('dre.origem');

  return (
    <div>
      <CabecalhoRelatorio titulo={t('dre.titulo')} />
      <div className="crumb">{t('rel.crumb_dre')}</div><h1 className="page-titulo">{t('dre.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('dre.sub')}</p>
      <div className="rel-filtro">
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} onAplicar={() => gerar()} titulo={t('dre.titulo')}>
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
          <label className="campo">{t('dre.agrupar')}
            <select value={por} onChange={(e) => setPor(e.target.value as 'origem' | 'categoria')}>
              <option value="origem">{t('dre.por_origem')}</option>
              <option value="categoria">{t('dre.por_categoria')}</option>
            </select>
          </label>
        </FiltrosModal>
        {d && <><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></>}
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
