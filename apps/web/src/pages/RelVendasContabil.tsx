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

interface Linha { numero: number; data: string; cliente: string | null; venda: number; freteCobrado: number; freteCusto: number; absorvido: number; tipoFrete: string; total: number; }
interface Resp { linhas: Linha[]; venda: number; freteCobrado: number; freteCusto: number; absorvido: number; total: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string) => new Date(s).toLocaleDateString('pt-BR');

export function RelVendasContabil() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [r, setR] = useState<Resp | null>(null); const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    api.get<Resp>(`/relatorios/vendas-contabil?de=${de}&ate=${ate}`, token!).then(setR).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [de, ate]);

  function exportar(fmt: 'csv' | 'xlsx') {
    if (!r) return;
    const cab = [t('relvc.numero'), t('rel.data'), t('relvc.cliente'), t('relvc.venda'), t('relvc.frete_cobrado'), t('relvc.frete_custo'), t('relvc.absorvido'), t('relvc.tipo_frete'), t('relvc.total')];
    const dados = r.linhas.map((l) => ['PE-' + String(l.numero).padStart(6, '0'), fmtData(l.data), l.cliente ?? '', l.venda, l.freteCobrado, l.freteCusto, l.absorvido, t('frete.entrega_' + l.tipoFrete), l.total]);
    if (fmt === 'xlsx') baixarExcel('vendas_contabil_' + de + '_' + ate, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('vendas_contabil_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <CabecalhoRelatorio titulo={t('relvc.titulo')} />
      <div className="crumb">{t('relvc.crumb')}</div><h1 className="page-titulo">{t('relvc.titulo')}</h1><p className="muted page-sub">{t('relvc.sub')}</p>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        {r && r.linhas.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relvc.venda')}</div><div className="kpi-val">{moeda(r?.venda ?? 0)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-truck" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relvc.frete_cobrado')}</div><div className="kpi-val">{moeda(r?.freteCobrado ?? 0)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-truck" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relvc.frete_custo')}</div><div className="kpi-val">{moeda(r?.freteCusto ?? 0)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relvc.absorvido')}</div><div className="kpi-val" style={{ color: '#b91c1c' }}>{moeda(r?.absorvido ?? 0)}</div></div></div>
      </div>
      <div className="card pad0">
        <table className="tabela tabela-1linha">
          <thead><tr>
            <th>{t('relvc.numero')}</th><th>{t('rel.data')}</th><th>{t('relvc.cliente')}</th>
            <th style={{ textAlign: 'right' }}>{t('relvc.venda')}</th><th style={{ textAlign: 'right' }}>{t('relvc.frete_cobrado')}</th>
            <th style={{ textAlign: 'right' }}>{t('relvc.frete_custo')}</th><th style={{ textAlign: 'right' }}>{t('relvc.absorvido')}</th>
            <th>{t('relvc.tipo_frete')}</th><th style={{ textAlign: 'right' }}>{t('relvc.total')}</th>
          </tr></thead>
          <tbody>
            {(!r || r.linhas.length === 0) && <tr><td colSpan={9} className="vazio">{t('rel.vazio')}</td></tr>}
            {r?.linhas.map((l) => (
              <tr key={l.numero}>
                <td style={{ fontWeight: 700 }}>PE-{String(l.numero).padStart(6, '0')}</td><td>{fmtData(l.data)}</td><td>{l.cliente ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>{moeda(l.venda)}</td><td style={{ textAlign: 'right' }}>{moeda(l.freteCobrado)}</td>
                <td style={{ textAlign: 'right' }}>{moeda(l.freteCusto)}</td><td style={{ textAlign: 'right', color: l.absorvido > 0 ? '#b91c1c' : undefined }}>{moeda(l.absorvido)}</td>
                <td>{t('frete.entrega_' + l.tipoFrete)}</td><td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
