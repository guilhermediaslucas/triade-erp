import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Linha {
  numero: number; data: string; cliente: string | null; vendedor: string | null;
  formaEntrega: string; formaEnvio: string | null; status: string; total: number; entregueEm: string | null;
}
const STATUS: StatusPedido[] = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue', 'cancelado'];
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string) => new Date(s).toLocaleDateString('pt-BR');

export function RelPedidos() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [status, setStatus] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]); const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setLinhas(await api.get<Linha[]>(`/relatorios/pedidos?de=${de}&ate=${ate}&status=${status}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const total = linhas.reduce((a, l) => a + l.total, 0);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('pedidos.numero'), t('pedidos.data'), t('pedidos.cliente'), t('pedidos.vendedor'), t('entrega.forma'), t('pedido.forma_envio'), t('pedidos.status'), t('pedido.entregue_em'), t('pedidos.total')];
    const dados = linhas.map((l) => [numeroPedido(l.numero), fmtData(l.data), l.cliente ?? '', l.vendedor ?? '', t('entrega.' + l.formaEntrega), l.formaEnvio ?? '', t('status.' + l.status), l.entregueEm ? new Date(l.entregueEm + 'T00:00:00').toLocaleDateString('pt-BR') : '', l.total]);
    (fmt === 'xlsx' ? baixarExcel : baixarCsv)('pedidos_' + de + '_' + ate, cab, dados);
  }

  return (
    <div>
      <div className="crumb">{t('relped.crumb')}</div><h1 className="page-titulo">{t('relped.titulo')}</h1><p className="muted page-sub">{t('relped.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <label className="campo">{t('pedidos.status')}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('relped.todos')}</option>
            {STATUS.map((s) => <option key={s} value={s}>{t('status.' + s)}</option>)}
          </select>
        </label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {linhas.length > 0 && <><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => exportar('xlsx')}>{t('rel.exportar_xlsx')}</button></>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp">🧾</div><div className="kpi-body"><div className="kpi-lbl">{t('relped.qtd')}</div><div className="kpi-val">{linhas.length}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr">💰</div><div className="kpi-body"><div className="kpi-lbl">{t('relped.total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('pedidos.numero')}</th><th>{t('pedidos.data')}</th><th>{t('pedidos.cliente')}</th><th>{t('pedidos.vendedor')}</th><th>{t('entrega.forma')}</th><th>{t('pedido.forma_envio')}</th><th>{t('pedidos.status')}</th><th>{t('pedido.entregue_em')}</th><th>{t('pedidos.total')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={9} className="vazio">{t('rel.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.numero}>
              <td><b>{numeroPedido(l.numero)}</b></td><td>{fmtData(l.data)}</td><td>{l.cliente ?? '—'}</td><td>{l.vendedor ?? '—'}</td>
              <td>{t('entrega.' + l.formaEntrega)}</td><td>{l.formaEnvio ?? '—'}</td>
              <td><span className={'pill ' + corStatus(l.status as StatusPedido)}>{t('status.' + l.status)}</span></td>
              <td>{l.entregueEm ? new Date(l.entregueEm + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
              <td>{moeda(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
