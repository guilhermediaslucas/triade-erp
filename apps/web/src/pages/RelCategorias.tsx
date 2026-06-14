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

interface Linha { categoria: string; quantidade: number; total: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelCategorias() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]); const [erro, setErro] = useState<string | null>(null);

  async function gerar(dd = de, aa = ate) {
    setErro(null);
    try { setLinhas(await api.get<Linha[]>(`/relatorios/vendas-categoria?de=${dd}&ate=${aa}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const qtdFiltros = (de !== primeiroDia() ? 1 : 0) + (ate !== hoje() ? 1 : 0);
  function limparFiltros() { const dd = primeiroDia(), aa = hoje(); setDe(dd); setAte(aa); gerar(dd, aa); }
  const max = Math.max(1, ...linhas.map((l) => l.total));
  const total = linhas.reduce((a, l) => a + l.total, 0);

  return (
    <div>
      <CabecalhoRelatorio titulo={t('rel.categorias')} />
      <div className="crumb">{t('rel.crumb_categorias')}</div><h1 className="page-titulo">{t('rel.categorias')}</h1>
      <div className="rel-filtro">
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} onAplicar={() => gerar()} titulo={t('rel.categorias')}>
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </FiltrosModal>
        {linhas.length > 0 && <><button className="btn-ghost" onClick={() => baixarCsv('vendas_categoria_' + de + '_' + ate, [t('produtos.categoria'), t('rel.qtd'), t('rel.total')], linhas.map((l) => [l.categoria, l.quantidade, l.total]))}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => baixarExcel('vendas_categoria_' + de + '_' + ate, [t('produtos.categoria'), t('rel.qtd'), t('rel.total')], linhas.map((l) => [l.categoria, l.quantidade, l.total]), { periodo: rotuloPeriodo(de, ate) })} /></>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis"><div className="kpi-card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div><div className="kpi-l">{t('com.total')}</div><div className="kpi-v">{moeda(total)}</div></div></div></div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('produtos.categoria')}</th><th>{t('rel.qtd')}</th><th></th><th>{t('rel.total')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={4} className="vazio">{t('rel.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.categoria}><td>{l.categoria}</td><td><b>{l.quantidade}</b></td>
              <td style={{ width: 200 }}><div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: (l.total / max * 100) + '%' }}></div></div></td>
              <td>{moeda(l.total)}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
