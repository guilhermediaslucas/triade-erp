import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Titulo {
  id: string; numero: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string;
  status: 'aberto' | 'pago'; categoriaFinanceiraNome: string | null; favorecidoNome: string | null;
}
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string) => new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');

export function RelContasPagarContabil() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [itens, setItens] = useState<Titulo[]>([]); const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Titulo[]>('/financeiro/pagar', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  const filtrados = useMemo(() => itens.filter((x) => {
    const v = x.vencimento.slice(0, 10);
    return (!de || v >= de) && (!ate || v <= ate);
  }), [itens, de, ate]);
  const total = filtrados.reduce((a, x) => a + x.valor, 0);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('fin.numero'), t('fin.descricao'), t('relcp.categoria'), t('relcp.fornecedor'), t('fin.vencimento'), t('fin.valor'), t('fin.situacao')];
    const dados = filtrados.map((x) => [x.numero, x.descricao, x.categoriaFinanceiraNome ?? '', x.pessoaNome ?? x.favorecidoNome ?? '', fmtData(x.vencimento), x.valor, t('fin.' + x.status)]);
    if (fmt === 'xlsx') baixarExcel('contas_pagar_' + de + '_' + ate, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('contas_pagar_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <CabecalhoRelatorio titulo={t('relcp.titulo')} />
      <div className="crumb">{t('relcp.crumb')}</div><h1 className="page-titulo">{t('relcp.titulo')}</h1><p className="muted page-sub">{t('relcp.sub')}</p>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        {filtrados.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relcp.total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relcp.titulos')}</div><div className="kpi-val">{filtrados.length}</div></div></div>
      </div>
      <div className="card pad0">
        <table className="tabela tabela-1linha">
          <thead><tr><th>{t('fin.numero')}</th><th>{t('fin.descricao')}</th><th>{t('relcp.categoria')}</th><th>{t('relcp.fornecedor')}</th><th>{t('fin.vencimento')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'center' }}>{t('fin.situacao')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={7} className="vazio">{t('rel.vazio')}</td></tr>}
            {filtrados.map((x) => (
              <tr key={x.id}>
                <td style={{ fontWeight: 700 }}>{x.numero}</td><td>{x.descricao}</td><td>{x.categoriaFinanceiraNome ?? '—'}</td>
                <td>{x.pessoaNome ?? x.favorecidoNome ?? '—'}</td><td>{fmtData(x.vencimento)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(x.valor)}</td>
                <td style={{ textAlign: 'center' }}><span className={'pill ' + (x.status === 'pago' ? 'st-verde' : 'st-vermelho')}>{t('fin.' + x.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
