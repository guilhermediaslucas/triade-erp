import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { baixarArquivo } from '../lib/download.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarZip, type ArquivoZip } from '../lib/zip.js';

type Status = 'processando' | 'autorizado' | 'erro' | 'cancelado';
interface NotaResumo {
  id: string; pedidoId: string; pedidoNumero: number; clienteNome: string | null;
  status: Status; mensagemSefaz: string | null; chave: string | null;
  numero: string | null; serie: string | null; valor: number; criadoEm: string;
}

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (s: string) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const pillStatus = (s: Status) => s === 'autorizado' ? 'st-verde' : s === 'processando' ? 'st-laranja' : s === 'cancelado' ? 'st-cinza' : 'st-vermelho';
const FILTROS: Array<{ k: '' | Status; r: string }> = [
  { k: '', r: 'nf.f_todas' }, { k: 'autorizado', r: 'nf.status_autorizado' },
  { k: 'processando', r: 'nf.status_processando' }, { k: 'erro', r: 'nf.status_erro' }, { k: 'cancelado', r: 'nf.status_cancelado' },
];

export function NotasFiscais() {
  const { token } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [itens, setItens] = useState<NotaResumo[]>([]);
  const [status, setStatus] = useState<'' | Status>('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [baixandoZip, setBaixandoZip] = useState(false);

  async function carregar() {
    setErro(null);
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (de) qs.set('de', de);
    if (ate) qs.set('ate', ate);
    try { setItens(await api.get('/fiscal/notas' + (qs.toString() ? '?' + qs.toString() : ''), token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [status, de, ate]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((n) => (`${n.numero ?? ''} ${n.chave ?? ''} ${n.clienteNome ?? ''} ${n.pedidoNumero}`).toLowerCase().includes(q));
  }, [itens, busca]);

  const kpis = useMemo(() => {
    const aut = itens.filter((n) => n.status === 'autorizado');
    return {
      autorizadas: aut.length, valor: aut.reduce((a, n) => a + n.valor, 0),
      canceladas: itens.filter((n) => n.status === 'cancelado').length,
      erro: itens.filter((n) => n.status === 'erro').length,
    };
  }, [itens]);

  async function baixar(n: NotaResumo, tipo: 'danfe' | 'xml') {
    try {
      const blob = await api.blob('/pedidos/' + n.pedidoId + '/nota/' + tipo, token!);
      await baixarArquivo('nfe-' + (n.numero || n.pedidoNumero) + '.' + (tipo === 'xml' ? 'xml' : 'pdf'), blob);
    } catch (e) { toast(t((e as ErroApi).chaveI18n), 'erro'); }
  }

  // Baixa todos os XMLs autorizados do filtro num zip só (para a contabilidade).
  async function baixarXmls() {
    const autorizadas = lista.filter((n) => n.status === 'autorizado');
    if (autorizadas.length === 0) { toast(t('nf.sem_xml'), 'erro'); return; }
    setBaixandoZip(true);
    try {
      const arquivos: ArquivoZip[] = [];
      for (const n of autorizadas) {
        const blob = await api.blob('/pedidos/' + n.pedidoId + '/nota/xml', token!);
        const buf = new Uint8Array(await blob.arrayBuffer());
        arquivos.push({ nome: `nfe-${n.numero || n.pedidoNumero}-${(n.chave ?? '').slice(-8)}.xml`, dados: buf });
      }
      await baixarZip('notas-fiscais', arquivos);
    } catch (e) { toast(t((e as ErroApi).chaveI18n), 'erro'); }
    finally { setBaixandoZip(false); }
  }

  function exportarCsv() {
    baixarCsv('notas-fiscais',
      [t('nf.numero'), t('nf.serie'), 'Pedido', t('pedidos.cliente'), t('nf.status_titulo'), 'Chave', t('nf.valor'), t('nf.emitida_em')],
      lista.map((n) => [n.numero ?? '', n.serie ?? '', 'PE-' + String(n.pedidoNumero).padStart(6, '0'), n.clienteNome ?? '', t('nf.status_' + n.status), n.chave ?? '', n.valor, dataBR(n.criadoEm)]));
  }

  return (
    <div>
      <div className="crumb">{t('menu.financeiro')} / {t('menu.notas_fiscais')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('nf.tela_titulo')}</h1><div className="muted page-sub">{t('nf.tela_sub')}</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={exportarCsv}><Ic name="i-download" className="sm" /> CSV</button>
          <button className="btn-primary" disabled={baixandoZip} onClick={baixarXmls}><Ic name="i-download" className="sm" /> {baixandoZip ? t('nf.baixando') : t('nf.baixar_xmls')}</button>
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="dash-row c4" style={{ marginBottom: 14 }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('nf.kpi_autorizadas')}</div><div className="kpi-val">{kpis.autorizadas}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('nf.kpi_valor')}</div><div className="kpi-val">{moeda(kpis.valor)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-x" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('nf.kpi_canceladas')}</div><div className="kpi-val">{kpis.canceladas}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-alert" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('nf.kpi_erro')}</div><div className="kpi-val">{kpis.erro}</div></div></div>
      </div>

      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        {FILTROS.map((f) => <span key={f.k} className={'chip-f' + (status === f.k ? ' on' : '')} onClick={() => setStatus(f.k)}>{t(f.r)}</span>)}
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_ini')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 160 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_fim')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 160 }} /></label>
        <div className="busca-box-tb" style={{ marginLeft: 'auto' }}><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('nf.buscar')} /></div>
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr>
          <th>{t('nf.numero')}/{t('nf.serie')}</th><th>{t('nf.pedido')}</th><th>{t('pedidos.cliente')}</th>
          <th>{t('nf.status_titulo')}</th><th style={{ textAlign: 'right' }}>{t('nf.valor')}</th>
          <th>{t('nf.emitida_em')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th>
        </tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
          {lista.map((n) => (
            <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => nav('/comercial/pedidos/' + n.pedidoId)}>
              <td>{n.numero ? `${n.numero} / ${n.serie ?? '1'}` : '—'}</td>
              <td className="muted">PE-{String(n.pedidoNumero).padStart(6, '0')}</td>
              <td>{n.clienteNome ?? '—'}</td>
              <td><span className={'pill ' + pillStatus(n.status)}>{t('nf.status_' + n.status)}</span></td>
              <td style={{ textAlign: 'right' }}>{moeda(n.valor)}</td>
              <td className="muted">{dataBR(n.criadoEm)}</td>
              <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                <span className="acoes-ic">
                  {n.status === 'autorizado' && <>
                    <button className="acao-ic" title={t('nf.danfe')} onClick={() => baixar(n, 'danfe')}><Ic name="i-download" className="sm" /></button>
                    <button className="acao-ic" title={t('nf.xml')} onClick={() => baixar(n, 'xml')}><Ic name="i-receipt" className="sm" /></button>
                  </>}
                  <button className="acao-ic" title={t('nf.ver_pedido')} onClick={() => nav('/comercial/pedidos/' + n.pedidoId)}><Ic name="i-eye" className="sm" /></button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
