import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

type Classe = 'A' | 'B' | 'C';
interface Linha { nome: string; quantidade: number; total: number; pct: number; acumuladoPct: number; classe: Classe; }
interface Abc { linhas: Linha[]; totalGeral: number; resumo: Record<Classe, { itens: number; total: number }>; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const corClasse: Record<Classe, any> = {
  A: { background: '#dcfce7', color: '#166534' },
  B: { background: '#fef9c3', color: '#854d0e' },
  C: { background: '#fee2e2', color: '#b91c1c' },
};

export function RelAbc() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [d, setD] = useState<Abc | null>(null); const [erro, setErro] = useState<string | null>(null);
  const [por, setPor] = useState<'produtos' | 'clientes'>('produtos');

  async function gerar() {
    setErro(null);
    try { setD(await api.get<Abc>(`/relatorios/curva-abc?de=${de}&ate=${ate}&por=${por}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, [por]);

  return (
    <div>
      <div className="crumb">{t('rel.crumb_abc')}</div><h1 className="page-titulo">{t(por === 'clientes' ? 'abc.titulo_clientes' : 'abc.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('abc.sub')}</p>
      <div className="toolbar">
        {(['produtos', 'clientes'] as const).map((m) => (
          <span key={m} className={'chip-f' + (por === m ? ' on' : '')} onClick={() => setPor(m)}>{t('abc.por_' + m)}</span>
        ))}
      </div>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {d && d.linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('curva_abc_' + de + '_' + ate,
            [t('precos.produto'), t('rel.qtd'), t('rel.total'), t('abc.pct'), t('abc.acumulado'), t('abc.classe')],
            d.linhas.map((l) => [l.nome, l.quantidade, l.total, l.pct, l.acumuladoPct, l.classe]))}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => baixarExcel('curva_abc_' + de + '_' + ate,
            [t('precos.produto'), t('rel.qtd'), t('rel.total'), t('abc.pct'), t('abc.acumulado'), t('abc.classe')],
            d.linhas.map((l) => [l.nome, l.quantidade, l.total, l.pct, l.acumuladoPct, l.classe]))}>{t('rel.exportar_xlsx')}</button></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {d && (
        <>
          <div className="kpis">
            {(['A', 'B', 'C'] as Classe[]).map((c) => (
              <div className="kpi-card" key={c}>
                <div className="kpi-l"><span className="pill" style={corClasse[c]}>{t('abc.classe')} {c}</span></div>
                <div className="kpi-v" style={{ fontSize: 18 }}>{moeda(d.resumo[c].total)}</div>
                <div className="kpi-sub">{d.resumo[c].itens} {t('abc.itens')}</div>
              </div>
            ))}
          </div>
          <div className="card pad0"><table className="tabela">
            <thead><tr><th>{t(por === 'clientes' ? 'dash.col_cliente' : 'precos.produto')}</th><th>{t(por === 'clientes' ? 'abc.qtd_pedidos' : 'rel.qtd')}</th><th>{t('rel.total')}</th><th>{t('abc.pct')}</th><th>{t('abc.acumulado')}</th><th>{t('abc.classe')}</th></tr></thead>
            <tbody>
              {d.linhas.length === 0 && <tr><td colSpan={6} className="vazio">{t('rel.vazio')}</td></tr>}
              {d.linhas.map((l) => (
                <tr key={l.nome}>
                  <td>{l.nome}</td><td>{l.quantidade}</td><td>{moeda(l.total)}</td>
                  <td>{l.pct}%</td><td>{l.acumuladoPct}%</td>
                  <td><span className="pill" style={corClasse[l.classe]}>{l.classe}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </div>
  );
}
