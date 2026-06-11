import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';

type Tipo = 'receber' | 'pagar';
interface Titulo { id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; status: 'aberto' | 'pago'; formaPagamento: string | null; origem: string; categoriaFinanceiraNome: string | null; }
interface CatFin { id: string; nome: string; tipo: 'receita' | 'despesa'; ativo: boolean; }
interface Fav { id: string; nome: string; ativo: boolean; }

const hojeISO = () => new Date().toISOString().slice(0, 10);
function situacao(t: Titulo): 'pago' | 'vencido' | 'aberto' {
  if (t.status === 'pago') return 'pago';
  return t.vencimento < hojeISO() ? 'vencido' : 'aberto';
}

export function Contas({ tipo }: { tipo: Tipo }) {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const capBase = tipo === 'receber' ? 'financeiro.receber' : 'financeiro.pagar';
  const pode = temCapability(capBase + '.gerenciar');
  const [itens, setItens] = useState<Titulo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);
  const [parcelarT, setParcelarT] = useState<Titulo | null>(null);
  const [baixar, setBaixar] = useState<Titulo | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [baixaMassa, setBaixaMassa] = useState(false);

  async function carregar() { try { setItens(await api.get('/financeiro/' + tipo, token!)); setSel(new Set()); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [tipo]);

  const kpis = useMemo(() => {
    const abertos = itens.filter((x) => x.status === 'aberto');
    const total = abertos.reduce((a, x) => a + x.valor, 0);
    const vencidos = abertos.filter((x) => x.vencimento < hojeISO());
    const totalVenc = vencidos.reduce((a, x) => a + x.valor, 0);
    return { total, qtd: abertos.length, totalVenc, qtdVenc: vencidos.length };
  }, [itens]);

  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleTodos() { setSel((s) => (s.size === itens.length ? new Set() : new Set(itens.map((x) => x.id)))); }
  const selecionados = itens.filter((x) => sel.has(x.id));
  const abertosSel = selecionados.filter((x) => x.status === 'aberto');
  const nCols = pode ? 8 : 7;

  async function cancelar(tt: Titulo) {
    try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/cancelar', {}, token!); carregar(); toast(t('fin.toast_cancelado')); }
    catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  async function excluirMassa() {
    if (selecionados.length === 0) return;
    if (!window.confirm(t('bulk.confirma_excluir').replace('{n}', String(selecionados.length)))) return;
    let ok = 0;
    for (const tt of selecionados) { try { await api.del('/financeiro/' + tipo + '/' + tt.id, token!); ok++; } catch { /* segue */ } }
    await carregar(); toast(t('bulk.excluidos').replace('{n}', String(ok)));
  }

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t(tipo === 'receber' ? 'fin.receber' : 'fin.pagar')}</h1>
        {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('fin.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card"><div className="kpi-l">{t(tipo === 'receber' ? 'fin.aberto_receber' : 'fin.aberto_pagar')}</div><div className="kpi-v">{moeda(kpis.total)}</div><div className="kpi-s">{kpis.qtd} {t('fin.titulos')}</div></div>
        <div className="kpi-card kpi-vermelho"><div className="kpi-l">{t('fin.vencidos')}</div><div className="kpi-v">{moeda(kpis.totalVenc)}</div><div className="kpi-s">{kpis.qtdVenc} {t('fin.titulos')}</div></div>
      </div>

      {pode && sel.size > 0 && (
        <div className="bulk-bar">
          <span>{t('bulk.selecionados').replace('{n}', String(sel.size))}</span>
          <div className="bulk-acoes">
            {abertosSel.length > 0 && <button className="btn-primary btn-mini" onClick={() => setBaixaMassa(true)}>{t('bulk.baixar')} ({abertosSel.length})</button>}
            <button className="btn-ghost btn-mini" onClick={excluirMassa}>{t('bulk.excluir')}</button>
            <button className="btn-link" onClick={() => setSel(new Set())}>{t('bulk.limpar')}</button>
          </div>
        </div>
      )}

      <div className="card pad0"><table className="tabela">
        <thead><tr>
          {pode && <th style={{ width: 34 }}><input type="checkbox" checked={itens.length > 0 && sel.size === itens.length} onChange={toggleTodos} /></th>}
          <th>{t('fin.descricao')}</th><th>{tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}</th><th>{t('catfin.titulo_s')}</th><th>{t('fin.vencimento')}</th><th>{t('fin.valor')}</th><th>{t('fin.situacao')}</th><th>{t('usuarios.acoes')}</th>
        </tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={nCols} className="vazio">{t('common.nenhum')}</td></tr>}
          {itens.map((tt) => { const sit = situacao(tt); return (
            <tr key={tt.id} className={sel.has(tt.id) ? 'linha-sel' : ''}>
              {pode && <td><input type="checkbox" checked={sel.has(tt.id)} onChange={() => toggle(tt.id)} /></td>}
              <td>{tt.descricao}{tt.origem === 'pedido' && <span className="tag-origem">{t('fin.do_pedido')}</span>}</td>
              <td>{tt.pessoaNome ?? '—'}</td>
              <td>{tt.categoriaFinanceiraNome ?? '—'}</td>
              <td>{new Date(tt.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
              <td>{moeda(tt.valor)}</td>
              <td><span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span></td>
              <td className="acoes">{pode && (tt.status === 'aberto'
                ? <><button className="btn-link" onClick={() => setBaixar(tt)}>{t('fin.baixar')}</button> <button className="btn-link" onClick={() => setParcelarT(tt)}>{t('parcelar.acao')}</button></>
                : <button className="btn-link" onClick={() => cancelar(tt)}>{t('fin.cancelar_baixa')}</button>)}</td>
            </tr>
          ); })}
        </tbody>
      </table></div>
      {novo && <ModalNovo tipo={tipo} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); toast(t('fin.toast_criado')); }} />}
      {parcelarT && <ModalParcelar tipo={tipo} titulo={parcelarT} onFechar={() => setParcelarT(null)} onSalvo={(n) => { setParcelarT(null); carregar(); toast(t('parcelar.toast').replace('{n}', String(n))); }} />}
      {baixar && <ModalBaixa tipo={tipo} titulos={[baixar]} onFechar={() => setBaixar(null)} onSalvo={() => { setBaixar(null); carregar(); toast(t('fin.toast_baixado')); }} />}
      {baixaMassa && <ModalBaixa tipo={tipo} titulos={abertosSel} onFechar={() => setBaixaMassa(false)} onSalvo={(n) => { setBaixaMassa(false); carregar(); toast(t('bulk.baixados').replace('{n}', String(n))); }} />}
    </div>
  );
}

function ModalNovo({ tipo, onFechar, onSalvo }: { tipo: Tipo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [descricao, setDescricao] = useState(''); const [pessoaNome, setPessoa] = useState('');
  const [valor, setValor] = useState(''); const [vencimento, setVenc] = useState('');
  const [categoriaFinanceiraId, setCatId] = useState('');
  const [cats, setCats] = useState<CatFin[]>([]);
  const [favorecidoId, setFavId] = useState('');
  const [favs, setFavs] = useState<Fav[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const tipoCat = tipo === 'receber' ? 'receita' : 'despesa';
  useEffect(() => {
    if (temCapability('cadastros.catfin.listar')) api.get<CatFin[]>('/categorias-financeiras', token!).then((l) => setCats(l.filter((c) => c.ativo && c.tipo === tipoCat))).catch(() => {});
    if (tipo === 'pagar' && temCapability('cadastros.favorecido.listar')) api.get<Fav[]>('/favorecidos', token!).then((l) => setFavs(l.filter((f) => f.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.post('/financeiro/' + tipo, { descricao, pessoaNome, valor: Number(valor), vencimento, categoriaFinanceiraId: categoriaFinanceiraId || null, favorecidoId: favorecidoId || null }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.novo')}</h2>
      <label className="campo">{t('fin.descricao')}<input value={descricao} onChange={(e) => setDescricao(e.target.value)} autoFocus /></label>
      <label className="campo">{tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}<input value={pessoaNome} onChange={(e) => setPessoa(e.target.value)} /></label>
      {favs.length > 0 && <label className="campo">{t('fin.favorecido')}
        <select value={favorecidoId} onChange={(e) => { const id = e.target.value; setFavId(id); const f = favs.find((x) => x.id === id); if (f && !pessoaNome.trim()) setPessoa(f.nome); }}>
          <option value="">{t('fin.sem_favorecido')}</option>{favs.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </label>}
      {cats.length > 0 && <label className="campo">{t('catfin.titulo_s')}
        <select value={categoriaFinanceiraId} onChange={(e) => setCatId(e.target.value)}>
          <option value="">{t('catfin.sem')}</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>}
      <div className="cores-grid">
        <label className="campo">{t('fin.valor')}<input type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} /></label>
        <label className="campo">{t('fin.vencimento')}<input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}

// Baixa um ou vários títulos com a mesma forma/conta. Retorna quantos baixou.
function ModalBaixa({ tipo, titulos, onFechar, onSalvo }: { tipo: Tipo; titulos: Titulo[]; onFechar: () => void; onSalvo: (n: number) => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [forma, setForma] = useState('Pix'); const [contaId, setContaId] = useState('');
  const [contas, setContas] = useState<{ id: string; nome: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const totalSel = titulos.reduce((a, x) => a + x.valor, 0);
  const massa = titulos.length > 1;
  useEffect(() => { if (temCapability('cadastros.conta.listar')) api.get<{ id: string; nome: string }[]>('/contas-correntes', token!).then(setContas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    let ok = 0;
    for (const tt of titulos) {
      try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/baixar', { formaPagamento: forma, contaCorrenteId: contaId || null }, token!); ok++; }
      catch (e) { if (!massa) { setErro((e as ErroApi).chaveI18n); setSalv(false); return; } }
    }
    onSalvo(ok);
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.baixar')} — {massa ? `${titulos.length} ${t('fin.titulos')} · ` : ''}{moeda(totalSel)}</h2>
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


function ModalParcelar({ tipo, titulo, onFechar, onSalvo }: { tipo: Tipo; titulo: Titulo; onFechar: () => void; onSalvo: (n: number) => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [modo, setModo] = useState<'dividir' | 'replicar'>('dividir');
  const [parcelas, setParcelas] = useState('2');
  const [intervalo, setIntervalo] = useState('30');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const n = Math.max(1, Math.trunc(Number(parcelas) || 0));
  const valorParcela = modo === 'dividir' && n > 0 ? titulo.valor / n : titulo.valor;
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      const r = await api.post<{ criados: number }>('/financeiro/' + tipo + '/' + titulo.id + '/parcelar', { modo, parcelas: n, intervaloDias: Number(intervalo) }, token!);
      onSalvo(r.criados);
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('parcelar.titulo')}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{titulo.descricao} · {moeda(titulo.valor)}</p>
      <label className="campo">{t('parcelar.modo')}
        <select value={modo} onChange={(e) => setModo(e.target.value as 'dividir' | 'replicar')}>
          <option value="dividir">{t('parcelar.dividir')}</option>
          <option value="replicar">{t('parcelar.replicar')}</option>
        </select>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('parcelar.parcelas')}<input type="number" min="2" max="99" value={parcelas} onChange={(e) => setParcelas(e.target.value)} /></label>
        <label className="campo">{t('parcelar.intervalo')}<input type="number" min="0" value={intervalo} onChange={(e) => setIntervalo(e.target.value)} /></label>
      </div>
      <p className="muted">{modo === 'dividir' ? t('parcelar.previa_dividir') : t('parcelar.previa_replicar')}{' '}<b>{n}× {moeda(valorParcela)}</b></p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
