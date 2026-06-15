import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';
import { FORMAS_BAIXA } from '../lib/pagamento.js';

interface Titulo {
  id: string; numero: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string;
  status: 'aberto' | 'pago'; pagoEm: string | null; favorecidoId: string | null; favorecidoNome: string | null;
}
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string | null) => (s ? new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR') : '—');

export function RelFavorecidos() {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('financeiro.pagar.gerenciar');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [itens, setItens] = useState<Titulo[]>([]); const [erro, setErro] = useState<string | null>(null);
  const [baixar, setBaixar] = useState<Titulo | null>(null);

  function carregar() { api.get<Titulo[]>('/financeiro/pagar', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  // Reembolsos = títulos a pagar vinculados a um favorecido, filtrados por vencimento.
  const filtrados = useMemo(() => itens.filter((x) => {
    if (!x.favorecidoId) return false;
    const v = x.vencimento.slice(0, 10);
    if (de && v < de) return false;
    if (ate && v > ate) return false;
    return true;
  }), [itens, de, ate]);

  const aReembolsar = filtrados.filter((x) => x.status === 'aberto').reduce((a, x) => a + x.valor, 0);
  const reembolsado = filtrados.filter((x) => x.status === 'pago').reduce((a, x) => a + x.valor, 0);

  // Agrupa por favorecido.
  const grupos = useMemo(() => {
    const m = new Map<string, { nome: string; itens: Titulo[]; aberto: number }>();
    for (const x of filtrados) {
      const nome = x.favorecidoNome ?? '—';
      const g = m.get(nome) ?? { nome, itens: [], aberto: 0 };
      g.itens.push(x); if (x.status === 'aberto') g.aberto += x.valor;
      m.set(nome, g);
    }
    return Array.from(m.values()).sort((a, b) => b.aberto - a.aberto);
  }, [filtrados]);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('relfav.favorecido'), t('fin.numero'), t('fin.descricao'), t('fin.valor'), t('fin.vencimento'), t('fin.situacao'), t('relfav.pago_em')];
    const dados = filtrados.map((x) => [x.favorecidoNome ?? '', x.numero, x.descricao, x.valor, fmtData(x.vencimento), t('fin.' + x.status), fmtData(x.pagoEm)]);
    if (fmt === 'xlsx') baixarExcel('reembolsos_' + de + '_' + ate, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('reembolsos_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <CabecalhoRelatorio titulo={t('relfav.titulo')} />
      <div className="crumb">{t('relfav.crumb')}</div><h1 className="page-titulo">{t('relfav.titulo')}</h1><p className="muted page-sub">{t('relfav.sub')}</p>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        {filtrados.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relfav.a_reembolsar')}</div><div className="kpi-val" style={{ color: '#b91c1c' }}>{moeda(aReembolsar)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-check" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relfav.reembolsado')}</div><div className="kpi-val" style={{ color: '#166534' }}>{moeda(reembolsado)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-users" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relfav.terceiros')}</div><div className="kpi-val">{grupos.length}</div></div></div>
      </div>

      {grupos.length === 0 && <div className="card"><div className="vazio">{t('rel.vazio')}</div></div>}
      {grupos.map((g) => (
        <div key={g.nome} className="card pad0" style={{ marginBottom: 12 }}>
          <div className="card-head" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b>{g.nome}</b>
            <span className="muted" style={{ fontSize: 13 }}>{t('relfav.a_reembolsar')}: <b style={{ color: '#b91c1c' }}>{moeda(g.aberto)}</b></span>
          </div>
          <table className="tabela">
            <thead><tr><th>{t('fin.numero')}</th><th>{t('fin.descricao')}</th><th>{t('fin.vencimento')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'center' }}>{t('fin.situacao')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th></tr></thead>
            <tbody>
              {g.itens.map((x) => (
                <tr key={x.id}>
                  <td style={{ fontWeight: 700 }}>{x.numero}</td><td>{x.descricao}</td><td>{fmtData(x.vencimento)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(x.valor)}</td>
                  <td style={{ textAlign: 'center' }}><span className={'pill ' + (x.status === 'pago' ? 'st-verde' : 'st-vermelho')}>{t(x.status === 'pago' ? 'relfav.reembolsado_st' : 'relfav.a_reembolsar_st')}</span></td>
                  <td style={{ textAlign: 'right' }}>{x.status === 'aberto' && pode
                    ? <button className="btn-acao verde btn-mini" onClick={() => setBaixar(x)}><Ic name="i-check" className="sm" /> {t('relfav.reembolsar')}</button>
                    : <span className="muted" style={{ fontSize: 12 }}>{x.status === 'pago' ? fmtData(x.pagoEm) : '—'}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {baixar && <ModalReembolsar titulo={baixar} onFechar={() => setBaixar(null)} onSalvo={() => { setBaixar(null); carregar(); toast(t('relfav.toast_reembolsado')); }} />}
    </div>
  );
}

// Baixa do reembolso ao favorecido: escolhe banco + data + forma. Impacta o fluxo de caixa
// e baixa o mesmo título do Contas a pagar.
function ModalReembolsar({ titulo, onFechar, onSalvo }: { titulo: Titulo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [forma, setForma] = useState('Pix'); const [contaId, setContaId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [contas, setContas] = useState<{ id: string; nome: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  useEffect(() => { if (temCapability('cadastros.conta.listar')) api.get<{ id: string; nome: string }[]>('/contas-correntes', token!).then(setContas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.patch('/financeiro/pagar/' + titulo.id + '/baixar', { formaPagamento: forma, contaCorrenteId: contaId || null, dataBaixa: data }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
      <h2>{t('relfav.reembolsar')} — {titulo.favorecidoNome ?? ''}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{titulo.numero} · {titulo.descricao} · <b>{moeda(titulo.valor)}</b></p>
      <label className="campo">{t('relfav.banco_conta')}
        <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
          <option value="">{t('relfav.sem_conta')}</option>{contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('fin.data_baixa')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
        <label className="campo">{t('pedidos.forma_pgto')}<select value={forma} onChange={(e) => setForma(e.target.value)}>{FORMAS_BAIXA.map((f) => <option key={f}>{f}</option>)}</select></label>
      </div>
      <div className="nota-info">{t('relfav.reembolsar_nota')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('relfav.confirmar_reembolso')}</button></div>
    </div></div>
  );
}
