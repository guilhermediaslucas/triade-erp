import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

type Tipo = 'receber' | 'pagar';
interface Titulo { id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; status: 'aberto' | 'pago'; formaPagamento: string | null; origem: string; }

const hojeISO = () => new Date().toISOString().slice(0, 10);
function situacao(t: Titulo): 'pago' | 'vencido' | 'aberto' {
  if (t.status === 'pago') return 'pago';
  return t.vencimento < hojeISO() ? 'vencido' : 'aberto';
}

export function Contas({ tipo }: { tipo: Tipo }) {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const capBase = tipo === 'receber' ? 'financeiro.receber' : 'financeiro.pagar';
  const pode = temCapability(capBase + '.gerenciar');
  const [itens, setItens] = useState<Titulo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);
  const [baixar, setBaixar] = useState<Titulo | null>(null);

  async function carregar() { try { setItens(await api.get('/financeiro/' + tipo, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [tipo]);

  const kpis = useMemo(() => {
    const abertos = itens.filter((x) => x.status === 'aberto');
    const total = abertos.reduce((a, x) => a + x.valor, 0);
    const vencidos = abertos.filter((x) => x.vencimento < hojeISO());
    const totalVenc = vencidos.reduce((a, x) => a + x.valor, 0);
    return { total, qtd: abertos.length, totalVenc, qtdVenc: vencidos.length };
  }, [itens]);

  async function cancelar(tt: Titulo) { try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/cancelar', {}, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t(tipo === 'receber' ? 'fin.receber' : 'fin.pagar')}</h1>
        {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('fin.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card"><div className="kpi-l">{t(tipo === 'receber' ? 'fin.aberto_receber' : 'fin.aberto_pagar')}</div><div className="kpi-v">{moeda(kpis.total)}</div><div className="kpi-s">{kpis.qtd} {t('fin.titulos')}</div></div>
        <div className="kpi-card kpi-vermelho"><div className="kpi-l">{t('fin.vencidos')}</div><div className="kpi-v">{moeda(kpis.totalVenc)}</div><div className="kpi-s">{kpis.qtdVenc} {t('fin.titulos')}</div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('fin.descricao')}</th><th>{tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}</th><th>{t('fin.vencimento')}</th><th>{t('fin.valor')}</th><th>{t('fin.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
          {itens.map((tt) => { const sit = situacao(tt); return (
            <tr key={tt.id}>
              <td>{tt.descricao}{tt.origem === 'pedido' && <span className="tag-origem">{t('fin.do_pedido')}</span>}</td>
              <td>{tt.pessoaNome ?? '—'}</td>
              <td>{new Date(tt.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
              <td>{moeda(tt.valor)}</td>
              <td><span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span></td>
              <td className="acoes">{pode && (tt.status === 'aberto'
                ? <button className="btn-link" onClick={() => setBaixar(tt)}>{t('fin.baixar')}</button>
                : <button className="btn-link" onClick={() => cancelar(tt)}>{t('fin.cancelar_baixa')}</button>)}</td>
            </tr>
          ); })}
        </tbody>
      </table></div>
      {novo && <ModalNovo tipo={tipo} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); }} />}
      {baixar && <ModalBaixa tipo={tipo} titulo={baixar} onFechar={() => setBaixar(null)} onSalvo={() => { setBaixar(null); carregar(); }} />}
    </div>
  );
}

function ModalNovo({ tipo, onFechar, onSalvo }: { tipo: Tipo; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [descricao, setDescricao] = useState(''); const [pessoaNome, setPessoa] = useState('');
  const [valor, setValor] = useState(''); const [vencimento, setVenc] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.post('/financeiro/' + tipo, { descricao, pessoaNome, valor: Number(valor), vencimento }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.novo')}</h2>
      <label className="campo">{t('fin.descricao')}<input value={descricao} onChange={(e) => setDescricao(e.target.value)} autoFocus /></label>
      <label className="campo">{tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}<input value={pessoaNome} onChange={(e) => setPessoa(e.target.value)} /></label>
      <div className="cores-grid">
        <label className="campo">{t('fin.valor')}<input type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} /></label>
        <label className="campo">{t('fin.vencimento')}<input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}

function ModalBaixa({ tipo, titulo, onFechar, onSalvo }: { tipo: Tipo; titulo: Titulo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [forma, setForma] = useState('Pix'); const [contaId, setContaId] = useState('');
  const [contas, setContas] = useState<{ id: string; nome: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  useEffect(() => { if (temCapability('cadastros.conta.listar')) api.get<{ id: string; nome: string }[]>('/contas-correntes', token!).then(setContas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.patch('/financeiro/' + tipo + '/' + titulo.id + '/baixar', { formaPagamento: forma, contaCorrenteId: contaId || null }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.baixar')} — {moeda(titulo.valor)}</h2>
      <label className="campo">{t('pedidos.forma_pgto')}
        <select value={forma} onChange={(e) => setForma(e.target.value)}><option>Pix</option><option>Boleto</option><option>Cartão</option><option>Dinheiro</option><option>Transferência</option></select>
      </label>
      {contas.length > 0 && <label className="campo">{t('cc.conta')}
        <select value={contaId} onChange={(e) => setContaId(e.target.value)}><option value="">{t('cc.nenhuma')}</option>{contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
      </label>}
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('fin.confirmar_baixa')}</button></div>
    </div></div>
  );
}
