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
  id: string; descricao: string; valor: number; vencimento: string; status: 'aberto' | 'pago';
  formaPagamento: string | null; pagoEm: string | null; favorecidoId: string | null; favorecidoNome: string | null;
}
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string | null) => (s ? new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR') : '—');

export function RelFavorecidos() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [sit, setSit] = useState<'todos' | 'aberto' | 'pago'>('todos');
  const [itens, setItens] = useState<Titulo[]>([]); const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Titulo[]>('/financeiro/pagar', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  // Reembolsos = títulos a pagar vinculados a um favorecido.
  const filtrados = useMemo(() => itens.filter((x) => {
    if (!x.favorecidoId) return false;
    if (sit !== 'todos' && x.status !== sit) return false;
    const v = x.vencimento.slice(0, 10);
    if (de && v < de) return false;
    if (ate && v > ate) return false;
    return true;
  }), [itens, sit, de, ate]);
  const total = filtrados.reduce((a, x) => a + x.valor, 0);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('relfav.favorecido'), t('fin.descricao'), t('fin.valor'), t('fin.vencimento'), t('fin.situacao'), t('relfav.pago_em')];
    const dados = filtrados.map((x) => [x.favorecidoNome ?? '', x.descricao, x.valor, fmtData(x.vencimento), t('fin.' + x.status), fmtData(x.pagoEm)]);
    if (fmt === 'xlsx') baixarExcel('reembolsos_' + de + '_' + ate, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('reembolsos_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <CabecalhoRelatorio titulo={t('relfav.titulo')} />
      <div className="crumb">{t('relfav.crumb')}</div><h1 className="page-titulo">{t('relfav.titulo')}</h1><p className="muted page-sub">{t('relfav.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <label className="campo">{t('fin.situacao')}
          <select value={sit} onChange={(e) => setSit(e.target.value as 'todos' | 'aberto' | 'pago')}>
            <option value="todos">{t('fin.f_todos')}</option><option value="aberto">{t('fin.aberto')}</option><option value="pago">{t('fin.pago')}</option>
          </select>
        </label>
        {filtrados.length > 0 && <><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></>}
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relfav.qtd')}</div><div className="kpi-val">{filtrados.length}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relfav.total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('relfav.favorecido')}</th><th>{t('fin.descricao')}</th><th>{t('fin.valor')}</th><th>{t('fin.vencimento')}</th><th>{t('fin.situacao')}</th><th>{t('relfav.pago_em')}</th></tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={6} className="vazio">{t('rel.vazio')}</td></tr>}
          {filtrados.map((x) => (
            <tr key={x.id}>
              <td>{x.favorecidoNome ?? '—'}</td><td>{x.descricao}</td><td>{moeda(x.valor)}</td><td>{fmtData(x.vencimento)}</td>
              <td><span className={'pill ' + (x.status === 'pago' ? 'st-verde' : 'st-laranja')}>{t('fin.' + x.status)}</span></td>
              <td>{fmtData(x.pagoEm)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
