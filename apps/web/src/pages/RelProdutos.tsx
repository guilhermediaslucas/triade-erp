import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';
import { FiltrosModal } from '../components/FiltrosModal.js';

interface Linha { nome: string; quantidade: number; total: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelProdutos() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]); const [erro, setErro] = useState<string | null>(null);

  async function gerar(dd = de, aa = ate) {
    setErro(null);
    try { setLinhas(await api.get<Linha[]>(`/relatorios/produtos-vendidos?de=${dd}&ate=${aa}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const qtdFiltros = (de !== primeiroDia() ? 1 : 0) + (ate !== hoje() ? 1 : 0);
  function limparFiltros() { const dd = primeiroDia(), aa = hoje(); setDe(dd); setAte(aa); gerar(dd, aa); }
  const max = Math.max(1, ...linhas.map((l) => l.quantidade));

  return (
    <div>
      <CabecalhoRelatorio titulo={t('rel.produtos')} />
      <div className="crumb">{t('rel.crumb_produtos')}</div><h1 className="page-titulo">{t('rel.produtos')}</h1>
      <div className="rel-filtro">
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} onAplicar={() => gerar()} titulo={t('rel.produtos')}>
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </FiltrosModal>
        {linhas.length > 0 && <><button className="btn-ghost" onClick={() => baixarCsv('produtos_' + de + '_' + ate, [t('precos.produto'), t('rel.qtd'), t('rel.total')], linhas.map((l) => [l.nome, l.quantidade, l.total]))}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => baixarExcel('produtos_' + de + '_' + ate, [t('precos.produto'), t('rel.qtd'), t('rel.total')], linhas.map((l) => [l.nome, l.quantidade, l.total]), { periodo: rotuloPeriodo(de, ate) })} /></>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('rel.qtd')}</th><th></th><th>{t('rel.total')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={4} className="vazio">{t('rel.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.nome}><td>{l.nome}</td><td><b>{l.quantidade}</b></td>
              <td style={{ width: 200 }}><div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: (l.quantidade / max * 100) + '%' }}></div></div></td>
              <td>{moeda(l.total)}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
