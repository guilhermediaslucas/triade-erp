import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

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
  const [verT, setVerT] = useState<Titulo | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [baixaMassa, setBaixaMassa] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [fSit, setFSit] = useState<'todos' | 'aberto' | 'vencido' | 'pago'>('todos');
  const [fQ, setFQ] = useState(''); const [fCat, setFCat] = useState('');
  const [fVde, setFVde] = useState(''); const [fVate, setFVate] = useState('');
  const [fMin, setFMin] = useState(''); const [fMax, setFMax] = useState('');

  async function carregar() { try { setItens(await api.get('/financeiro/' + tipo, token!)); setSel(new Set()); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [tipo]);

  const categorias = useMemo(() => Array.from(new Set(itens.map((x) => x.categoriaFinanceiraNome).filter(Boolean))) as string[], [itens]);
  const filtrados = useMemo(() => itens.filter((x) => {
    if (fSit !== 'todos' && situacao(x) !== fSit) return false;
    if (fCat && (x.categoriaFinanceiraNome ?? '') !== fCat) return false;
    if (fVde && x.vencimento < fVde) return false;
    if (fVate && x.vencimento > fVate) return false;
    if (fMin && x.valor < Number(fMin)) return false;
    if (fMax && x.valor > Number(fMax)) return false;
    if (fQ) { const q = fQ.toLowerCase(); if (!((x.descricao || '').toLowerCase().includes(q) || (x.pessoaNome || '').toLowerCase().includes(q))) return false; }
    return true;
  }), [itens, fSit, fCat, fVde, fVate, fMin, fMax, fQ]);
  const temFiltro = fSit !== 'todos' || !!fQ || !!fCat || !!fVde || !!fVate || !!fMin || !!fMax;
  function limparFiltros() { setFSit('todos'); setFQ(''); setFCat(''); setFVde(''); setFVate(''); setFMin(''); setFMax(''); }

  const HIDEABLE = ['pessoa', 'cat', 'venc', 'valor', 'sit'] as const;
  const [colsAberto, setColsAberto] = useState(false);
  const [colsOcultas, setColsOcultas] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('contas-cols-' + tipo) || '[]')); } catch { return new Set(); }
  });
  const oc = (k: string) => colsOcultas.has(k);
  function toggleCol(k: string) {
    setColsOcultas((cur) => { const n = new Set(cur); n.has(k) ? n.delete(k) : n.add(k); try { localStorage.setItem('contas-cols-' + tipo, JSON.stringify([...n])); } catch { /* ignora */ } return n; });
  }
  const colLabel = (k: string) => k === 'pessoa' ? (tipo === 'receber' ? 'fin.cliente' : 'fin.fornecedor') : k === 'cat' ? 'catfin.titulo_s' : k === 'venc' ? 'fin.vencimento' : k === 'valor' ? 'fin.valor' : 'fin.situacao';

  const kpis = useMemo(() => {
    const h = hojeISO();
    const d7 = new Date(); d7.setDate(d7.getDate() + 7); const ate7 = d7.toISOString().slice(0, 10);
    const abertos = filtrados.filter((x) => x.status === 'aberto');
    const total = abertos.reduce((a, x) => a + x.valor, 0);
    const vencidos = abertos.filter((x) => x.vencimento < h);
    const totalVenc = vencidos.reduce((a, x) => a + x.valor, 0);
    const v7 = abertos.filter((x) => x.vencimento >= h && x.vencimento <= ate7);
    const totalVence7 = v7.reduce((a, x) => a + x.valor, 0);
    return { total, qtd: abertos.length, totalVenc, qtdVenc: vencidos.length, totalVence7, qtdVence7: v7.length };
  }, [filtrados]);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('fin.descricao'), tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor'), t('catfin.titulo_s'), t('fin.vencimento'), t('fin.valor'), t('fin.situacao')];
    const linhas = filtrados.map((x) => [x.descricao, x.pessoaNome ?? '', x.categoriaFinanceiraNome ?? '', x.vencimento, x.valor, t('fin.' + situacao(x))]);
    (fmt === 'xlsx' ? baixarExcel : baixarCsv)((tipo === 'receber' ? 'contas_receber' : 'contas_pagar'), cab, linhas);
  }

  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleTodos() { setSel((s) => (s.size === filtrados.length ? new Set() : new Set(filtrados.map((x) => x.id)))); }
  const selecionados = itens.filter((x) => sel.has(x.id));
  const abertosSel = selecionados.filter((x) => x.status === 'aberto');

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
      <div className="crumb">{t(tipo === 'receber' ? 'fin.crumb_receber' : 'fin.crumb_pagar')}</div>
      <div className="page-head"><h1 className="page-titulo">{t(tipo === 'receber' ? 'fin.receber' : 'fin.pagar')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => setFiltroAberto((v) => !v)}>{t('fin.filtros')}{temFiltro ? ' •' : ''}</button>
          <button className="btn-ghost" onClick={() => setColsAberto((v) => !v)}>{t('fin.colunas')}</button>
          {filtrados.length > 0 && <button className="btn-ghost" onClick={() => exportar('xlsx')}>{t('rel.exportar_xlsx')}</button>}
          {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('fin.novo')}</button>}
        </div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr">{tipo === 'receber' ? '💰' : '💸'}</div><div className="kpi-body"><div className="kpi-lbl">{t(tipo === 'receber' ? 'fin.aberto_receber' : 'fin.aberto_pagar')}</div><div className="kpi-val">{moeda(kpis.total)}</div><div className="kpi-delta">{kpis.qtd} {t('fin.titulos')}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-or">⏳</div><div className="kpi-body"><div className="kpi-lbl">{t('fin.vence7')}</div><div className="kpi-val">{moeda(kpis.totalVence7)}</div><div className="kpi-delta">{kpis.qtdVence7} {t('fin.titulos')}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd">⚠️</div><div className="kpi-body"><div className="kpi-lbl">{t('fin.vencidos')}</div><div className="kpi-val">{moeda(kpis.totalVenc)}</div><div className="kpi-delta alerta">{kpis.qtdVenc} {t('fin.titulos')}</div></div></div>
      </div>

      {filtroAberto && (
        <div className="card" style={{ maxWidth: '100%', marginBottom: 12 }}>
          <div className="filtros-grid">
            <label className="campo">{t('fin.f_busca')}<input value={fQ} onChange={(e) => setFQ(e.target.value)} placeholder={t('fin.f_busca_ph')} /></label>
            <label className="campo">{t('fin.f_situacao')}
              <select value={fSit} onChange={(e) => setFSit(e.target.value as 'todos' | 'aberto' | 'vencido' | 'pago')}>
                <option value="todos">{t('fin.f_todos')}</option><option value="aberto">{t('fin.aberto')}</option><option value="vencido">{t('fin.vencido')}</option><option value="pago">{t('fin.pago')}</option>
              </select>
            </label>
            {categorias.length > 0 && <label className="campo">{t('catfin.titulo_s')}
              <select value={fCat} onChange={(e) => setFCat(e.target.value)}>
                <option value="">{t('fin.f_todos')}</option>{categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>}
            <label className="campo">{t('fin.f_venc_de')}<input type="date" value={fVde} onChange={(e) => setFVde(e.target.value)} /></label>
            <label className="campo">{t('fin.f_venc_ate')}<input type="date" value={fVate} onChange={(e) => setFVate(e.target.value)} /></label>
            <label className="campo">{t('fin.f_min')}<input type="number" value={fMin} onChange={(e) => setFMin(e.target.value)} /></label>
            <label className="campo">{t('fin.f_max')}<input type="number" value={fMax} onChange={(e) => setFMax(e.target.value)} /></label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span className="muted">{filtrados.length} {t('fin.titulos')}</span>
            <button className="btn-link" onClick={limparFiltros}>{t('fin.f_limpar')}</button>
          </div>
        </div>
      )}

      {colsAberto && (
        <div className="card" style={{ maxWidth: 420, marginBottom: 12 }}>
          <b style={{ fontSize: 13 }}>{t('fin.colunas')}</b>
          <div className="cols-chooser">
            {HIDEABLE.map((k) => (
              <label key={k} className="col-check"><input type="checkbox" checked={!oc(k)} onChange={() => toggleCol(k)} /> {t(colLabel(k))}</label>
            ))}
          </div>
        </div>
      )}

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
          {pode && <th style={{ width: 34 }}><input type="checkbox" checked={filtrados.length > 0 && sel.size === filtrados.length} onChange={toggleTodos} /></th>}
          <th>{t('fin.descricao')}</th>{!oc('pessoa') && <th>{tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}</th>}{!oc('cat') && <th>{t('catfin.titulo_s')}</th>}{!oc('venc') && <th>{t('fin.vencimento')}</th>}{!oc('valor') && <th>{t('fin.valor')}</th>}{!oc('sit') && <th>{t('fin.situacao')}</th>}<th>{t('usuarios.acoes')}</th>
        </tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={(pode ? 1 : 0) + 2 + HIDEABLE.filter((k) => !oc(k)).length} className="vazio">{t('common.nenhum')}</td></tr>}
          {filtrados.map((tt) => { const sit = situacao(tt); return (
            <tr key={tt.id} className={sel.has(tt.id) ? 'linha-sel' : ''} style={{ cursor: 'pointer' }} onDoubleClick={() => setVerT(tt)} title={t('fin.ver_detalhe')}>
              {pode && <td><input type="checkbox" checked={sel.has(tt.id)} onChange={() => toggle(tt.id)} /></td>}
              <td>{tt.descricao}{tt.origem === 'pedido' && <span className="tag-origem">{t('fin.do_pedido')}</span>}</td>
              {!oc('pessoa') && <td>{tt.pessoaNome ?? '—'}</td>}
              {!oc('cat') && <td>{tt.categoriaFinanceiraNome ?? '—'}</td>}
              {!oc('venc') && <td>{new Date(tt.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>}
              {!oc('valor') && <td>{moeda(tt.valor)}</td>}
              {!oc('sit') && <td><span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span></td>}
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
      {verT && <ModalVerTitulo tipo={tipo} titulo={verT} onFechar={() => setVerT(null)} />}
    </div>
  );
}

// Janela de detalhe do título (duplo-clique na linha), somente leitura.
function ModalVerTitulo({ tipo, titulo, onFechar }: { tipo: Tipo; titulo: Titulo; onFechar: () => void; }) {
  const { t } = useI18n();
  const sit = situacao(titulo);
  const fmtData = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  const linha = (rotulo: string, valor: ReactNode) => (
    <div className="det-linha"><span className="det-rot">{rotulo}</span><span className="det-val">{valor}</span></div>
  );
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('fin.detalhe')}</h2>
      {linha(t('fin.descricao'), titulo.descricao)}
      {linha(tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor'), titulo.pessoaNome ?? '—')}
      {linha(t('catfin.titulo_s'), titulo.categoriaFinanceiraNome ?? '—')}
      {linha(t('fin.valor'), <b>{moeda(titulo.valor)}</b>)}
      {linha(t('fin.vencimento'), fmtData(titulo.vencimento))}
      {linha(t('fin.situacao'), <span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span>)}
      {titulo.status === 'pago' && linha(t('pedidos.forma_pgto'), titulo.formaPagamento ?? '—')}
      {linha(t('fin.origem'), titulo.origem === 'pedido' ? t('fin.do_pedido') : titulo.origem)}
      <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
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
