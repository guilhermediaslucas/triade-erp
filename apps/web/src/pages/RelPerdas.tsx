import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Linha { produtoId: string; produto: string; lote: string | null; quantidade: number; motivo: string | null; data: string; valor: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function RelPerdas() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [todas, setTodas] = useState<Linha[]>([]);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setTodas(await api.get<Linha[]>(`/relatorios/perdas-estoque?de=${de}&ate=${ate}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  const motivos = useMemo(() => Array.from(new Set(todas.map((l) => l.motivo ?? '—'))).sort(), [todas]);
  const linhas = useMemo(() => (motivo ? todas.filter((l) => (l.motivo ?? '—') === motivo) : todas), [todas, motivo]);
  const totalQtd = useMemo(() => linhas.reduce((a, l) => a + l.quantidade, 0), [linhas]);
  const totalValor = useMemo(() => linhas.reduce((a, l) => a + l.valor, 0), [linhas]);

  return (
    <div>
      <h1 className="page-titulo">{t('perdas.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('perdas.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <label className="campo">{t('perdas.motivo')}
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="">{t('perdas.todos')}</option>{motivos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('perdas_estoque_' + de + '_' + ate,
            [t('precos.produto'), t('estoque.lote'), t('perdas.motivo'), t('pedidos.data'), t('rel.qtd'), t('rel.valor')],
            linhas.map((l) => [l.produto, l.lote ?? '', l.motivo ?? '—', l.data.slice(0, 10), l.quantidade, l.valor]))}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => baixarExcel('perdas_estoque_' + de + '_' + ate,
            [t('precos.produto'), t('estoque.lote'), t('perdas.motivo'), t('pedidos.data'), t('rel.qtd'), t('rel.valor')],
            linhas.map((l) => [l.produto, l.lote ?? '', l.motivo ?? '—', l.data.slice(0, 10), l.quantidade, l.valor]))}>{t('rel.exportar_xlsx')}</button></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card kpi-vermelho"><div className="kpi-l">{t('perdas.kpi_valor')}</div><div className="kpi-v">{moeda(totalValor)}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('perdas.kpi_itens')}</div><div className="kpi-v">{totalQtd}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('perdas.kpi_lancamentos')}</div><div className="kpi-v">{linhas.length}</div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('pedidos.data')}</th><th>{t('precos.produto')}</th><th>{t('estoque.lote')}</th><th>{t('perdas.motivo')}</th><th>{t('rel.qtd')}</th><th>{t('rel.valor')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={6} className="vazio">{t('perdas.vazio')}</td></tr>}
          {linhas.map((l, i) => (
            <tr key={l.produtoId + '_' + i}>
              <td>{new Date(l.data).toLocaleString('pt-BR')}</td>
              <td>{l.produto}</td><td>{l.lote ?? '—'}</td>
              <td><span className="pill" style={{ background: '#fee2e2', color: '#b91c1c' }}>{l.motivo ?? '—'}</span></td>
              <td><b>{l.quantidade}</b></td><td>{moeda(l.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
