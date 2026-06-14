import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda, abrevMoeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { ModalNovaPessoa } from '../components/SeletorPessoa.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';

type Tipo = 'receber' | 'pagar';
interface Titulo { id: string; numero: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; status: 'aberto' | 'pago'; formaPagamento: string | null; origem: string; categoriaFinanceiraNome: string | null; contaCorrenteNome: string | null; vendedorNome: string | null; previsto: boolean; tipoDocumento: string | null; numeroDocumento: string | null; emissao: string | null; criadoEm: string; pagoEm: string | null; desconto: number; multa: number; juros: number; }
interface TipoDoc { id: string; nome: string; ativo: boolean; }
interface CatFin { id: string; nome: string; tipo: 'receita' | 'despesa'; ativo: boolean; }

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
  const [parcelarModo, setParcelarModo] = useState<'dividir' | 'replicar'>('dividir');
  const [multiplicarT, setMultiplicarT] = useState<Titulo | null>(null);
  const [baixar, setBaixar] = useState<Titulo | null>(null);
  const [cancelarT, setCancelarT] = useState<Titulo | null>(null);
  const [verT, setVerT] = useState<Titulo | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [baixaMassa, setBaixaMassa] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [fSit, setFSit] = useState<'todos' | 'aberto' | 'vencido' | 'pago'>('todos');
  const [fQ, setFQ] = useState(''); const [fCat, setFCat] = useState('');
  const [fPessoa, setFPessoa] = useState('');
  const [fConta, setFConta] = useState(''); const [fDoc, setFDoc] = useState(''); const [fTitulo, setFTitulo] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fEmiDe, setFEmiDe] = useState(''); const [fEmiAte, setFEmiAte] = useState('');
  const [fBxDe, setFBxDe] = useState(''); const [fBxAte, setFBxAte] = useState('');
  // Filtro vindo dos KPIs (clicar no card filtra a lista pelos lançamentos que o compõem).
  const [fKpi, setFKpi] = useState<'' | 'aberto' | 'vence7' | 'vencido' | 'boletos'>('');
  const [fVde, setFVde] = useState(''); const [fVate, setFVate] = useState('');
  const [fMin, setFMin] = useState(''); const [fMax, setFMax] = useState('');

  async function carregar() { try { setItens(await api.get('/financeiro/' + tipo, token!)); setSel(new Set()); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [tipo]);

  const categorias = useMemo(() => Array.from(new Set(itens.map((x) => x.categoriaFinanceiraNome).filter(Boolean))) as string[], [itens]);
  const pessoas = useMemo(() => Array.from(new Set(itens.map((x) => x.pessoaNome).filter(Boolean))) as string[], [itens]);
  const contas = useMemo(() => Array.from(new Set(itens.map((x) => x.contaCorrenteNome).filter(Boolean))) as string[], [itens]);
  const documentos = useMemo(() => Array.from(new Set(itens.map((x) => x.tipoDocumento).filter(Boolean))) as string[], [itens]);
  // "A vencer" do chip = aberto (situacao). 'aberto' interno é o em aberto não vencido.
  // kpiBase = lista filtrada SEM o filtro de KPI (os KPIs são calculados sobre ela e não se autocolapsam).
  const kpiBase = useMemo(() => itens.filter((x) => {
    if (fSit !== 'todos' && situacao(x) !== fSit) return false;
    if (fCat && (x.categoriaFinanceiraNome ?? '') !== fCat) return false;
    if (fConta && (x.contaCorrenteNome ?? '') !== fConta) return false;
    if (fDoc && (x.tipoDocumento ?? '') !== fDoc) return false;
    if (fPessoa && !(x.pessoaNome ?? '').toLowerCase().includes(fPessoa.toLowerCase())) return false;
    if (fTitulo && !(x.numero ?? '').toLowerCase().includes(fTitulo.toLowerCase())) return false;
    if (fDesc && !(x.descricao ?? '').toLowerCase().includes(fDesc.toLowerCase())) return false;
    if (fVde && x.vencimento < fVde) return false;
    if (fVate && x.vencimento > fVate) return false;
    const emi = (x.emissao || (x.criadoEm ? x.criadoEm.slice(0, 10) : '')) || '';
    if (fEmiDe && emi < fEmiDe) return false;
    if (fEmiAte && emi > fEmiAte) return false;
    const bx = x.pagoEm ? x.pagoEm.slice(0, 10) : '';
    if (fBxDe && (!bx || bx < fBxDe)) return false;
    if (fBxAte && (!bx || bx > fBxAte)) return false;
    if (fMin && x.valor < Number(fMin)) return false;
    if (fMax && x.valor > Number(fMax)) return false;
    if (fQ) { const q = fQ.toLowerCase(); if (!((x.descricao || '').toLowerCase().includes(q) || (x.pessoaNome || '').toLowerCase().includes(q) || (x.numero || '').toLowerCase().includes(q))) return false; }
    return true;
  }), [itens, fSit, fCat, fConta, fDoc, fPessoa, fTitulo, fDesc, fVde, fVate, fEmiDe, fEmiAte, fBxDe, fBxAte, fMin, fMax, fQ]);
  const ate7ISO = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); }, []);
  const filtrados = useMemo(() => kpiBase.filter((x) => {
    if (!fKpi) return true;
    const h = hojeISO();
    if (fKpi === 'aberto') return x.status === 'aberto';
    if (fKpi === 'vence7') return x.status === 'aberto' && x.vencimento >= h && x.vencimento <= ate7ISO;
    if (fKpi === 'vencido') return x.status === 'aberto' && x.vencimento < h;
    if (fKpi === 'boletos') return x.status === 'aberto' && (x.tipoDocumento ?? '').toLowerCase().includes('bole');
    return true;
  }), [kpiBase, fKpi, ate7ISO]);
  const flags = [fSit !== 'todos', !!fCat, !!fConta, !!fDoc, !!fPessoa, !!fTitulo, !!fDesc, !!fVde, !!fVate, !!fEmiDe, !!fEmiAte, !!fBxDe, !!fBxAte, !!fMin, !!fMax, !!fQ];
  const temFiltro = flags.some(Boolean);
  const qtdFiltros = flags.filter(Boolean).length;
  function limparFiltros() {
    setFSit('todos'); setFQ(''); setFCat(''); setFConta(''); setFDoc(''); setFPessoa(''); setFTitulo(''); setFDesc('');
    setFVde(''); setFVate(''); setFEmiDe(''); setFEmiAte(''); setFBxDe(''); setFBxAte(''); setFMin(''); setFMax('');
  }
  const toggleKpi = (k: 'aberto' | 'vence7' | 'vencido' | 'boletos') => setFKpi((cur) => (cur === k ? '' : k));

  const HIDEABLE = ['pessoa', 'cat', 'doc', 'emissao', 'venc', 'baixa', 'valor', 'vendedor', 'sit'] as const;
  const [colsAberto, setColsAberto] = useState(false);
  const [colsOcultas, setColsOcultas] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('contas-cols-' + tipo) || '[]')); } catch { return new Set(); }
  });
  const oc = (k: string) => colsOcultas.has(k);
  function toggleCol(k: string) {
    setColsOcultas((cur) => { const n = new Set(cur); n.has(k) ? n.delete(k) : n.add(k); try { localStorage.setItem('contas-cols-' + tipo, JSON.stringify([...n])); } catch { /* ignora */ } return n; });
  }
  const colLabel = (k: string) => k === 'pessoa' ? (tipo === 'receber' ? 'fin.cliente' : 'fin.fornecedor') : k === 'cat' ? 'catfin.titulo_s' : k === 'doc' ? 'fin.documento' : k === 'emissao' ? 'fin.emissao' : k === 'venc' ? 'fin.vencimento' : k === 'baixa' ? 'fin.baixa' : k === 'valor' ? 'fin.valor' : k === 'vendedor' ? 'fin.vendedor' : 'fin.situacao';

  // Redimensionar colunas por arraste (largura persistida por tipo em localStorage).
  const [larguras, setLarguras] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('contas-larg-' + tipo) || '{}'); } catch { return {}; }
  });
  function iniciarResize(col: string, startX: number, handle: HTMLElement) {
    const th = handle.parentElement as HTMLElement;
    const startW = th.getBoundingClientRect().width;
    function mover(e: MouseEvent) { setLarguras((cur) => ({ ...cur, [col]: Math.max(60, Math.round(startW + (e.clientX - startX))) })); }
    function soltar() {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
      setLarguras((cur) => { try { localStorage.setItem('contas-larg-' + tipo, JSON.stringify(cur)); } catch { /* ignora */ } return cur; });
    }
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
  }
  function thR(col: string, conteudo: ReactNode) {
    return (
      <th style={larguras[col] ? { position: 'relative', width: larguras[col] } : { position: 'relative' }}>
        {conteudo}
        <span className="col-resize" onMouseDown={(e) => { e.preventDefault(); iniciarResize(col, e.clientX, e.currentTarget as HTMLElement); }} />
      </th>
    );
  }

  const kpis = useMemo(() => {
    const h = hojeISO();
    const abertos = kpiBase.filter((x) => x.status === 'aberto');
    const total = abertos.reduce((a, x) => a + x.valor, 0);
    const vencidos = abertos.filter((x) => x.vencimento < h);
    const totalVenc = vencidos.reduce((a, x) => a + x.valor, 0);
    const v7 = abertos.filter((x) => x.vencimento >= h && x.vencimento <= ate7ISO);
    const totalVence7 = v7.reduce((a, x) => a + x.valor, 0);
    const boletos = abertos.filter((x) => (x.tipoDocumento ?? '').toLowerCase().includes('bole')).length;
    return { total, qtd: abertos.length, totalVenc, qtdVenc: vencidos.length, totalVence7, qtdVence7: v7.length, boletos };
  }, [kpiBase, ate7ISO]);

  function exportar(fmt: 'csv' | 'xlsx') {
    // Exporta exatamente as colunas visíveis (respeita o seletor de colunas), sem a coluna de ações.
    const cols = ['numero', 'descricao', ...HIDEABLE.filter((k) => !oc(k))];
    const cab = cols.map((k) => k === 'numero' ? t('fin.numero') : k === 'descricao' ? t('fin.descricao') : t(colLabel(k)));
    const fdata = (iso: string | null | undefined) => iso ? new Date(iso.length > 10 ? iso : iso + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const valOf = (x: Titulo, k: string): string | number => {
      switch (k) {
        case 'numero': return x.numero;
        case 'descricao': return x.descricao;
        case 'pessoa': return x.pessoaNome ?? '';
        case 'cat': return x.categoriaFinanceiraNome ?? '';
        case 'doc': return x.tipoDocumento ?? '';
        case 'emissao': return fdata(x.emissao || x.criadoEm);
        case 'venc': return fdata(x.vencimento);
        case 'baixa': return fdata(x.pagoEm);
        case 'valor': return x.valor;
        case 'vendedor': return x.vendedorNome ?? '';
        case 'sit': return t('fin.' + situacao(x));
        default: return '';
      }
    };
    const linhas = filtrados.map((x) => cols.map((k) => valOf(x, k)));
    const nome = tipo === 'receber' ? 'contas_receber' : 'contas_pagar';
    if (fmt === 'xlsx') baixarExcel(nome, cab, linhas, { periodo: rotuloPeriodo(fVde, fVate) });
    else baixarCsv(nome, cab, linhas);
  }

  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleTodos() { setSel((s) => (s.size === filtrados.length ? new Set() : new Set(filtrados.map((x) => x.id)))); }
  const selecionados = itens.filter((x) => sel.has(x.id));
  // Títulos previstos (provisão) não podem ser baixados — ficam fora da baixa em massa.
  const abertosSel = selecionados.filter((x) => x.status === 'aberto' && !x.previsto);
  // Multiplicar/Parcelar agem sobre 1 título em aberto selecionado.
  // Previstos PODEM ser multiplicados/parcelados (só não podem ser baixados), por isso não filtra previsto aqui.
  const abertosTodos = selecionados.filter((x) => x.status === 'aberto');
  const umAberto = abertosTodos.length === 1 ? abertosTodos[0] : null;
  function abrirParcelar(tt: Titulo, modo: 'dividir' | 'replicar') { setParcelarModo(modo); setParcelarT(tt); }

  async function cancelar(tt: Titulo) {
    try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/cancelar', {}, token!); carregar(); toast(t('fin.toast_cancelado')); }
    catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  async function alternarPrevisto(tt: Titulo) {
    try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/previsto', { previsto: !tt.previsto }, token!); carregar(); toast(t(tt.previsto ? 'fin.toast_efetivo' : 'fin.toast_previsto')); }
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
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t(tipo === 'receber' ? 'fin.receber' : 'fin.pagar')}</h1><div className="muted page-sub">{t('fin.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className={'card kpi-mock clicavel' + (fKpi === 'aberto' ? ' kpi-ativo' : '')} role="button" tabIndex={0} onClick={() => toggleKpi('aberto')} onKeyDown={(e) => e.key === 'Enter' && toggleKpi('aberto')}><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t(tipo === 'receber' ? 'fin.aberto_receber' : 'fin.aberto_pagar')}</div><div className="kpi-val">{abrevMoeda(kpis.total)}</div><div className="kpi-delta">{kpis.qtd} {t('fin.titulos')}</div></div></div>
        <div className={'card kpi-mock clicavel' + (fKpi === 'vence7' ? ' kpi-ativo' : '')} role="button" tabIndex={0} onClick={() => toggleKpi('vence7')} onKeyDown={(e) => e.key === 'Enter' && toggleKpi('vence7')}><div className="kpi-ic tint-or"><Ic name="i-clock" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('fin.vence7')}</div><div className="kpi-val">{abrevMoeda(kpis.totalVence7)}</div><div className="kpi-delta">{kpis.qtdVence7} {t('fin.titulos')}</div></div></div>
        <div className={'card kpi-mock clicavel' + (fKpi === 'vencido' ? ' kpi-ativo' : '')} role="button" tabIndex={0} onClick={() => toggleKpi('vencido')} onKeyDown={(e) => e.key === 'Enter' && toggleKpi('vencido')}><div className="kpi-ic tint-rd"><Ic name="i-alert" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('fin.vencidos')}</div><div className="kpi-val">{abrevMoeda(kpis.totalVenc)}</div><div className="kpi-delta alerta">{kpis.qtdVenc} {t('fin.titulos')}</div></div></div>
        <div className={'card kpi-mock clicavel' + (fKpi === 'boletos' ? ' kpi-ativo' : '')} role="button" tabIndex={0} onClick={() => toggleKpi('boletos')} onKeyDown={(e) => e.key === 'Enter' && toggleKpi('boletos')}><div className="kpi-ic tint-bl"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('fin.boletos_abertos')}</div><div className="kpi-val">{kpis.boletos}</div><div className="kpi-delta">{t('fin.titulos')}</div></div></div>
      </div>

      <div className="contas-toolbar">
        <span className="busca-box-tb"><span className="lupa"><Ic name="i-search" className="sm" /></span><input value={fQ} onChange={(e) => setFQ(e.target.value)} placeholder={t('fin.f_busca')} /></span>
        <span className="muted" style={{ fontSize: 12 }}>{t('fin.status')}:</span>
        {(['todos', 'aberto', 'vencido', 'pago'] as const).map((s) => (
          <button key={s} className={'chip-f' + (fSit === s ? ' ativo' : '')} onClick={() => setFSit(s)}>{t(s === 'todos' ? 'fin.f_todos' : s === 'aberto' ? 'fin.a_vencer' : 'fin.' + s)}</button>
        ))}
        <select className="chip-sel" value={fPessoa} onChange={(e) => setFPessoa(e.target.value)}>
          <option value="">{tipo === 'receber' ? t('fin.todos_clientes') : t('fin.todos_fornecedores')}</option>
          {pessoas.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn-ghost" onClick={() => setFiltroAberto(true)}><Ic name="i-gear" className="sm" /> {t('fin.filtros')}{qtdFiltros > 0 && <span className="flt-badge">{qtdFiltros}</span>}</button>
        <button className="btn-ghost" onClick={() => setColsAberto((v) => !v)}><Ic name="i-grid" className="sm" /> {t('fin.colunas')}</button>
      </div>

      <div className="contas-acoes">
        {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('fin.novo_lanc_btn')}</button>}
        {pode && <button className="btn-acao verde" disabled={abertosSel.length === 0} onClick={() => setBaixaMassa(true)}><Ic name="i-check" className="sm" /> {t('fin.baixar_sel')}{abertosSel.length > 0 ? ` (${abertosSel.length})` : ''}</button>}
        {pode && <button className="btn-acao vermelho" disabled={sel.size === 0} onClick={excluirMassa}><Ic name="i-trash" className="sm" /> {t('fin.excluir_sel')}</button>}
        {pode && <button className="btn-ghost" disabled={!umAberto} onClick={() => umAberto && setMultiplicarT(umAberto)}><Ic name="i-plus" className="sm" /> {t('parcelar.multiplicar')}</button>}
        {pode && <button className="btn-ghost" disabled={!umAberto} onClick={() => umAberto && abrirParcelar(umAberto, 'dividir')}><Ic name="i-rows" className="sm" /> {t('parcelar.acao')}</button>}
        {filtrados.length > 0 && <button className="btn-acao verde" onClick={() => exportar('xlsx')}><Ic name="i-download" className="sm" /> {t('rel.exportar_xlsx')}</button>}
      </div>

      {filtroAberto && (
        <div className="modal-fundo">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <h2>{t('fin.filtros')} — {t(tipo === 'receber' ? 'fin.receber' : 'fin.pagar')}</h2>
            <div className="filtros-grid">
              <label className="campo">{t('catfin.titulo_s')}
                <select value={fCat} onChange={(e) => setFCat(e.target.value)}>
                  <option value="">{t('fin.f_todos')}</option>{categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="campo">{t('fin.f_conta')}
                <select value={fConta} onChange={(e) => setFConta(e.target.value)}>
                  <option value="">{t('fin.f_todos')}</option>{contas.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="campo">{t(tipo === 'receber' ? 'fin.cliente' : 'fin.fornecedor')}
                <input list="dlFltPessoa" value={fPessoa} onChange={(e) => setFPessoa(e.target.value)} placeholder={t('fin.f_pessoa_ph')} />
                <datalist id="dlFltPessoa">{pessoas.map((p) => <option key={p} value={p} />)}</datalist>
              </label>
              <label className="campo">{t('fin.documento')}
                <select value={fDoc} onChange={(e) => setFDoc(e.target.value)}>
                  <option value="">{t('fin.f_todos')}</option>{documentos.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="campo">{t('fin.numero')}<input value={fTitulo} onChange={(e) => setFTitulo(e.target.value)} placeholder={tipo === 'receber' ? 'Ex: REC-000001' : 'Ex: PAG-000001'} /></label>
              <label className="campo">{t('fin.f_situacao')}
                <select value={fSit} onChange={(e) => setFSit(e.target.value as 'todos' | 'aberto' | 'vencido' | 'pago')}>
                  <option value="todos">{t('fin.f_todos')}</option><option value="aberto">{t('fin.aberto')}</option><option value="vencido">{t('fin.vencido')}</option><option value="pago">{t('fin.pago')}</option>
                </select>
              </label>
              <label className="campo" style={{ gridColumn: '1 / -1' }}>{t('fin.descricao')}<input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder={t('fin.f_desc_ph')} /></label>
              <label className="campo">{t('fin.f_min')}<MoedaInput value={fMin} onChange={(n) => setFMin(n ? String(n) : '')} placeholder="0,00" /></label>
              <label className="campo">{t('fin.f_max')}<MoedaInput value={fMax} onChange={(n) => setFMax(n ? String(n) : '')} placeholder="0,00" /></label>
              <label className="campo">{t('fin.emissao')} ({t('fin.de')})<input type="date" value={fEmiDe} onChange={(e) => setFEmiDe(e.target.value)} /></label>
              <label className="campo">{t('fin.emissao')} ({t('fin.ate')})<input type="date" value={fEmiAte} onChange={(e) => setFEmiAte(e.target.value)} /></label>
              <label className="campo">{t('fin.vencimento')} ({t('fin.de')})<input type="date" value={fVde} onChange={(e) => setFVde(e.target.value)} /></label>
              <label className="campo">{t('fin.vencimento')} ({t('fin.ate')})<input type="date" value={fVate} onChange={(e) => setFVate(e.target.value)} /></label>
              <label className="campo">{t('fin.baixa')} ({t('fin.de')})<input type="date" value={fBxDe} onChange={(e) => setFBxDe(e.target.value)} /></label>
              <label className="campo">{t('fin.baixa')} ({t('fin.ate')})<input type="date" value={fBxAte} onChange={(e) => setFBxAte(e.target.value)} /></label>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>{filtrados.length} {t('fin.titulos')}</p>
            <div className="modal-acoes">
              <button className="btn-ghost" style={{ marginRight: 'auto' }} onClick={limparFiltros}>{t('flt.limpar')}</button>
              <button className="btn-ghost" onClick={() => setFiltroAberto(false)}>{t('common.cancelar')}</button>
              <button className="btn-primary" onClick={() => setFiltroAberto(false)}>{t('flt.aplicar')}</button>
            </div>
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

      {pode && sel.size > 0 && <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t('bulk.selecionados').replace('{n}', String(sel.size))} · <button className="btn-link" onClick={() => setSel(new Set())}>{t('bulk.limpar')}</button></div>}

      <div className="card pad0"><table className="tabela">
        <thead><tr>
          {pode && <th style={{ width: 34 }}><input type="checkbox" checked={filtrados.length > 0 && sel.size === filtrados.length} onChange={toggleTodos} /></th>}
          {thR('numero', t('fin.numero'))}{thR('descricao', t('fin.descricao'))}{!oc('cat') && thR('cat', t('catfin.titulo_s'))}{!oc('pessoa') && thR('pessoa', tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor'))}{!oc('doc') && thR('doc', t('fin.documento'))}{!oc('emissao') && thR('emissao', t('fin.emissao'))}{!oc('venc') && thR('venc', t('fin.vencimento'))}{!oc('baixa') && thR('baixa', t('fin.baixa'))}{!oc('valor') && thR('valor', t('fin.valor'))}{!oc('vendedor') && thR('vendedor', t('fin.vendedor'))}{!oc('sit') && thR('sit', t('fin.situacao'))}<th style={{ textAlign: 'center' }}>{t('fin.previsto')}</th><th>{t('usuarios.acoes')}</th>
        </tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={(pode ? 1 : 0) + 4 + HIDEABLE.filter((k) => !oc(k)).length} className="vazio">{t('common.nenhum')}</td></tr>}
          {filtrados.map((tt) => { const sit = situacao(tt); return (
            <tr key={tt.id} className={(sel.has(tt.id) ? 'linha-sel ' : '') + (tt.previsto ? 'linha-previsto' : '')} style={{ cursor: 'pointer' }} onDoubleClick={() => setVerT(tt)} title={t('fin.ver_detalhe')}>
              {pode && <td><input type="checkbox" checked={sel.has(tt.id)} onChange={() => toggle(tt.id)} /></td>}
              <td data-label={t('fin.numero')} style={{ fontWeight: 700 }}>{tt.numero}</td>
              <td data-label={t('fin.descricao')}>{tt.descricao}{tt.origem === 'pedido' && <span className="tag-origem">{t('fin.do_pedido')}</span>}</td>
              {!oc('cat') && <td data-label={t('catfin.titulo_s')}>{tt.categoriaFinanceiraNome ?? '—'}</td>}
              {!oc('pessoa') && <td data-label={tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor')}>{tt.pessoaNome ?? '—'}</td>}
              {!oc('doc') && <td data-label={t('fin.documento')}>{tt.tipoDocumento ?? '—'}</td>}
              {!oc('emissao') && <td data-label={t('fin.emissao')}>{(tt.emissao || tt.criadoEm) ? new Date((tt.emissao ? tt.emissao + 'T00:00:00' : tt.criadoEm)).toLocaleDateString('pt-BR') : '—'}</td>}
              {!oc('venc') && <td data-label={t('fin.vencimento')}>{new Date(tt.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>}
              {!oc('baixa') && <td data-label={t('fin.baixa')}>{tt.pagoEm ? new Date(tt.pagoEm).toLocaleDateString('pt-BR') : '—'}</td>}
              {!oc('valor') && <td data-label={t('fin.valor')}>{moeda(tt.valor)}</td>}
              {!oc('vendedor') && <td data-label={t('fin.vendedor')}>{tt.vendedorNome ?? '—'}</td>}
              {!oc('sit') && <td data-label={t('fin.situacao')}><span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span></td>}
              <td data-label={t('fin.previsto')} style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                {tt.status === 'aberto'
                  ? <button className={'pe-badge ' + (tt.previsto ? 'pe-pv' : 'pe-ef')} disabled={!pode} onClick={() => alternarPrevisto(tt)} title={t('fin.previsto_hint')}>{tt.previsto ? t('fluxo.previsto') : t('fluxo.efetivo')}</button>
                  : <span className="muted">—</span>}
              </td>
              <td data-label={t('usuarios.acoes')}><span className="acoes-ic">{pode && (tt.status === 'aberto'
                ? <>
                    {!tt.previsto && <button className="acao-ic ok" title={t('fin.baixar')} aria-label={t('fin.baixar')} onClick={() => setBaixar(tt)}><Ic name="i-check" className="sm" /></button>}
                    <button className="acao-ic" title={t('parcelar.acao')} aria-label={t('parcelar.acao')} onClick={() => abrirParcelar(tt, 'dividir')}><Ic name="i-clock" className="sm" /></button>
                  </>
                : <button className="acao-ic danger" title={t('fin.cancelar_baixa')} aria-label={t('fin.cancelar_baixa')} onClick={() => setCancelarT(tt)}><Ic name="i-x" className="sm" /></button>)}</span></td>
            </tr>
          ); })}
        </tbody>
      </table></div>
      {novo && <ModalNovo tipo={tipo} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); toast(t('fin.toast_criado')); }} />}
      {parcelarT && <ModalParcelar tipo={tipo} titulo={parcelarT} modoInicial={parcelarModo} onFechar={() => setParcelarT(null)} onSalvo={(n) => { setParcelarT(null); carregar(); toast(t('parcelar.toast').replace('{n}', String(n))); }} />}
      {multiplicarT && <ModalMultiplicar tipo={tipo} titulo={multiplicarT} onFechar={() => setMultiplicarT(null)} onSalvo={(n) => { setMultiplicarT(null); carregar(); toast(t('parcelar.toast').replace('{n}', String(n))); }} />}
      {cancelarT && (
        <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <h2>{t('fin.cancelar_baixa_titulo')}</h2>
          <p className="muted" style={{ marginTop: -4, lineHeight: 1.6 }}>
            {t('fin.cancelar_baixa_aviso').replace('{n}', cancelarT.numero).replace('{v}', moeda(cancelarT.valor))}
          </p>
          <div className="modal-acoes">
            <button className="btn-ghost" onClick={() => setCancelarT(null)}>{t('common.voltar')}</button>
            <button className="btn-danger" onClick={() => { const tt = cancelarT; setCancelarT(null); cancelar(tt); }}>{t('fin.cancelar_baixa')}</button>
          </div>
        </div></div>
      )}
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
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('fin.detalhe')}</h2>
      {linha(t('fin.descricao'), titulo.descricao)}
      {linha(tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor'), titulo.pessoaNome ?? '—')}
      {linha(t('catfin.titulo_s'), titulo.categoriaFinanceiraNome ?? '—')}
      {linha(t('fin.valor'), <b>{moeda(titulo.valor)}</b>)}
      {linha(t('fin.vencimento'), fmtData(titulo.vencimento))}
      {linha(t('fin.situacao'), <span className={'pill ' + (sit === 'pago' ? 'st-verde' : sit === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + sit)}</span>)}
      {titulo.status === 'pago' && linha(t('pedidos.forma_pgto'), titulo.formaPagamento ?? '—')}
      {titulo.status === 'pago' && titulo.desconto > 0 && linha(t('fin.desconto'), moeda(titulo.desconto))}
      {titulo.status === 'pago' && titulo.multa > 0 && linha(t('fin.multa'), moeda(titulo.multa))}
      {titulo.status === 'pago' && titulo.juros > 0 && linha(t('fin.juros'), moeda(titulo.juros))}
      {titulo.status === 'pago' && (titulo.desconto > 0 || titulo.multa > 0 || titulo.juros > 0) && linha(t('fin.total_baixar'), <b>{moeda(titulo.valor - titulo.desconto + titulo.multa + titulo.juros)}</b>)}
      {linha(t('fin.previsto'), titulo.previsto ? t('common.sim') : t('common.nao'))}
      {titulo.tipoDocumento && linha(t('tipodoc.titulo_s'), titulo.tipoDocumento)}
      {titulo.numeroDocumento && linha(t('fin.num_documento'), titulo.numeroDocumento)}
      {titulo.emissao && linha(t('fin.emissao'), fmtData(titulo.emissao))}
      {linha(t('fin.origem'), titulo.origem === 'pedido' ? t('fin.do_pedido') : titulo.origem)}
      <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}

function ModalNovo({ tipo, onFechar, onSalvo }: { tipo: Tipo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [descricao, setDescricao] = useState(''); const [pessoaNome, setPessoa] = useState('');
  const [valor, setValor] = useState(''); const [vencimento, setVenc] = useState('');
  const [emissao, setEmissao] = useState(hojeISO());
  const [numeroDoc, setNumeroDoc] = useState('');
  const [categoriaFinanceiraId, setCatId] = useState('');
  const [cats, setCats] = useState<CatFin[]>([]);
  const [cadNomes, setCadNomes] = useState<string[]>([]);
  const [novaPessoa, setNovaPessoa] = useState(false);
  const [previsto, setPrevisto] = useState(false);
  const [tipoDoc, setTipoDoc] = useState('');
  const [tiposDoc, setTiposDoc] = useState<TipoDoc[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const tipoCat = tipo === 'receber' ? 'receita' : 'despesa';
  const pagar = tipo === 'pagar';
  // Lançamento a pagar puxa do cadastro de Fornecedores; a receber, de Clientes (não de Favorecidos).
  function carregarCad() {
    const ep = pagar ? '/fornecedores' : '/clientes';
    const cap = pagar ? 'cadastros.fornecedor.listar' : 'cadastros.cliente.listar';
    if (temCapability(cap)) api.get<{ nome: string; ativo?: boolean }[]>(ep, token!).then((l) => setCadNomes(l.filter((x) => x.ativo !== false).map((x) => x.nome))).catch(() => {});
  }
  useEffect(() => {
    if (temCapability('cadastros.catfin.listar')) api.get<CatFin[]>('/categorias-financeiras', token!).then((l) => setCats(l.filter((c) => c.ativo && c.tipo === tipoCat))).catch(() => {});
    if (temCapability('cadastros.tipodoc.listar')) api.get<TipoDoc[]>('/tipos-documento', token!).then((l) => setTiposDoc(l.filter((x) => x.ativo))).catch(() => {});
    carregarCad();
    /* eslint-disable-next-line */
  }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      await api.post('/financeiro/' + tipo, {
        descricao, pessoaNome, valor: Number(valor), vencimento, emissao: emissao || null,
        categoriaFinanceiraId: categoriaFinanceiraId || null, favorecidoId: null,
        previsto, tipoDocumento: tipoDoc || null, numeroDocumento: numeroDoc || null,
      }, token!);
      onSalvo();
    }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.novo_lancamento')}</h2>
      <label className="campo">{t('fin.descricao')}<input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t('fin.descricao_ph')} autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('tipodoc.titulo_s')}
          <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
            <option value="">{t('tipodoc.sem')}</option>{tiposDoc.map((d) => <option key={d.id} value={d.nome}>{d.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('fin.num_documento')}<input value={numeroDoc} onChange={(e) => setNumeroDoc(e.target.value)} placeholder={t('fin.num_documento_ph')} /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('catfin.titulo_s')}
          <select value={categoriaFinanceiraId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">{t('catfin.sem')}</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('fin.valor')}<MoedaInput value={valor} onChange={(n) => setValor(n ? String(n) : '')} placeholder="0,00" /></label>
      </div>
      <label className="campo">
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {pagar ? t('fin.fornecedor') : t('fin.cliente')}
          <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={() => setNovaPessoa(true)}>+ {t('fin.cadastrar_novo')}</button>
        </span>
        <input list="dlCadLanc" value={pessoaNome} onChange={(e) => setPessoa(e.target.value)} placeholder={t('fin.pessoa_ph')} />
        <datalist id="dlCadLanc">{cadNomes.map((n) => <option key={n} value={n} />)}</datalist>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('fin.emissao')}<input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></label>
        <label className="campo">{t('fin.vencimento')}<input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
      </div>
      <label className="login-lembrar" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={previsto} onChange={(e) => setPrevisto(e.target.checked)} /> {t('fin.previsto_label')}
      </label>
      <div className="nota-info" style={{ marginTop: 12 }}>{t('fin.nota_conta')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('fin.salvar_lancamento')}</button></div>
      {novaPessoa && <ModalNovaPessoa tipo={pagar ? 'fornecedor' : 'cliente'} onFechar={() => setNovaPessoa(false)} onCriado={(nome) => { setNovaPessoa(false); setPessoa(nome); carregarCad(); }} />}
    </div></div>
  );
}

// (ModalNovaPessoa extraído para components/SeletorPessoa.tsx — reuso compartilhado.)

// Baixa um ou vários títulos com a mesma forma/conta. Retorna quantos baixou.
function ModalBaixa({ tipo, titulos, onFechar, onSalvo }: { tipo: Tipo; titulos: Titulo[]; onFechar: () => void; onSalvo: (n: number) => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [forma, setForma] = useState('Pix'); const [contaId, setContaId] = useState('');
  const [dataBaixa, setDataBaixa] = useState(new Date().toISOString().slice(0, 10));
  const [desconto, setDesconto] = useState('0'); const [multa, setMulta] = useState('0'); const [juros, setJuros] = useState('0');
  const [contas, setContas] = useState<{ id: string; nome: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const totalSel = titulos.reduce((a, x) => a + x.valor, 0);
  const massa = titulos.length > 1;
  // Composição (só no título único): total a baixar = valor - desconto + multa + juros.
  const nD = Math.max(0, Number(desconto) || 0), nM = Math.max(0, Number(multa) || 0), nJ = Math.max(0, Number(juros) || 0);
  const totalBaixar = Math.round((totalSel - nD + nM + nJ) * 100) / 100;
  // Pix e Boleto entram numa conta bancária — selecionar o banco é obrigatório.
  const contaObrig = forma === 'Pix' || forma === 'Boleto';
  const contaFaltando = contaObrig && !contaId;
  useEffect(() => { if (temCapability('cadastros.conta.listar')) api.get<{ id: string; nome: string }[]>('/contas-correntes', token!).then(setContas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null);
    if (contaFaltando) { setErro('fin.conta_obrigatoria'); return; }
    setSalv(true);
    let ok = 0;
    for (const tt of titulos) {
      // Composição só se aplica a baixa individual; em massa vai sem ajustes.
      const corpo = massa
        ? { formaPagamento: forma, contaCorrenteId: contaId || null, dataBaixa }
        : { formaPagamento: forma, contaCorrenteId: contaId || null, dataBaixa, desconto: nD, multa: nM, juros: nJ };
      try { await api.patch('/financeiro/' + tipo + '/' + tt.id + '/baixar', corpo, token!); ok++; }
      catch (e) { if (!massa) { setErro((e as ErroApi).chaveI18n); setSalv(false); return; } }
    }
    onSalvo(ok);
  }
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.baixar')} — {massa ? `${titulos.length} ${t('fin.titulos')} · ` : ''}{moeda(totalSel)}</h2>
      <div className="cores-grid">
        <label className="campo">{t('fin.data_baixa')}<input type="date" value={dataBaixa} onChange={(e) => setDataBaixa(e.target.value)} /></label>
        <label className="campo">{t('pedidos.forma_pgto')}
          <select value={forma} onChange={(e) => setForma(e.target.value)}><option>Pix</option><option>Boleto</option><option>Cartão</option><option>Dinheiro</option><option>Transferência</option></select>
        </label>
      </div>
      {contas.length > 0 && <label className="campo">{t('cc.conta')}{contaObrig && <span className="hint"> · {t('fin.conta_obrig_hint')}</span>}
        <select value={contaId} onChange={(e) => setContaId(e.target.value)} style={contaFaltando ? { borderColor: '#e1483b' } : undefined}><option value="">{t('cc.nenhuma')}</option>{contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
      </label>}
      {contaObrig && contas.length === 0 && <div className="alerta-erro">{t('fin.conta_sem_cadastro')}</div>}
      {!massa && (<>
        <div className="perm-titulo" style={{ marginTop: 6 }}>{t('fin.composicao')}</div>
        <div className="cores-grid">
          <label className="campo">{t('fin.valor_original')}<input value={moeda(totalSel)} readOnly style={{ background: 'var(--bg)', fontWeight: 600 }} /></label>
          <label className="campo">{t('fin.desconto')}<MoedaInput value={desconto} onChange={(n) => setDesconto(n ? String(n) : '')} /></label>
          <label className="campo">{t('fin.multa')}<MoedaInput value={multa} onChange={(n) => setMulta(n ? String(n) : '')} /></label>
          <label className="campo">{t('fin.juros')}<MoedaInput value={juros} onChange={(n) => setJuros(n ? String(n) : '')} /></label>
        </div>
        <div className="tl-row tl-total" style={{ marginTop: 6 }}>
          <span className="muted">{t('fin.total_baixar')}</span>
          <b style={{ fontSize: 20, color: totalBaixar < 0 ? '#e1483b' : 'var(--accent)' }}>{moeda(totalBaixar)}</b>
        </div>
      </>)}
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv || (!massa && totalBaixar < 0) || contaFaltando} onClick={salvar}>{t('fin.confirmar_baixa')}</button></div>
    </div></div>
  );
}


function ModalParcelar({ tipo, titulo, modoInicial, onFechar, onSalvo }: { tipo: Tipo; titulo: Titulo; modoInicial?: 'dividir' | 'replicar'; onFechar: () => void; onSalvo: (n: number) => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [modo, setModo] = useState<'dividir' | 'replicar'>(modoInicial ?? 'dividir');
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
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
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

// Multiplicar título (modelo do mockup): cria N cópias somando o intervalo (vencimento e
// emissão) e aplicando a variação ao valor — em $ ou %. O título original é mantido.
function ModalMultiplicar({ tipo, titulo, onFechar, onSalvo }: { tipo: Tipo; titulo: Titulo; onFechar: () => void; onSalvo: (n: number) => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [vezes, setVezes] = useState('1');
  const [variacao, setVariacao] = useState('0');
  const [variacaoTipo, setVariacaoTipo] = useState<'valor' | 'pct'>('valor');
  const [intervaloVenc, setIntVenc] = useState('1');
  const [unidadeVenc, setUnVenc] = useState('mensal');
  const [intervaloEmis, setIntEmis] = useState('1');
  const [unidadeEmis, setUnEmis] = useState('mensal');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const unidades = ['dia', 'semanal', 'quinzenal', 'mensal', 'anual'];
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      const r = await api.post<{ criados: number }>('/financeiro/' + tipo + '/' + titulo.id + '/multiplicar', {
        vezes: Math.trunc(Number(vezes) || 0), variacao: Number(variacao) || 0, variacaoTipo,
        intervaloVenc: Number(intervaloVenc) || 1, unidadeVenc, intervaloEmis: Number(intervaloEmis) || 1, unidadeEmis,
      }, token!);
      onSalvo(r.criados);
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('mult.titulo')}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{titulo.descricao} · {moeda(titulo.valor)}</p>
      <label className="campo">{t('mult.vezes')}<input type="number" min="1" max="99" value={vezes} onChange={(e) => setVezes(e.target.value)} /></label>
      <label className="campo">{t('mult.variacao')}
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" step="0.01" value={variacao} onChange={(e) => setVariacao(e.target.value)} style={{ flex: 1 }} />
          <select value={variacaoTipo} onChange={(e) => setVariacaoTipo(e.target.value as 'valor' | 'pct')} style={{ width: 72 }}><option value="valor">$</option><option value="pct">%</option></select>
        </div>
      </label>
      <label className="campo">{t('mult.int_venc')}
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min="1" value={intervaloVenc} onChange={(e) => setIntVenc(e.target.value)} style={{ width: 72 }} />
          <select value={unidadeVenc} onChange={(e) => setUnVenc(e.target.value)} style={{ flex: 1 }}>{unidades.map((u) => <option key={u} value={u}>{t('mult.un.' + u)}</option>)}</select>
        </div>
      </label>
      <label className="campo">{t('mult.int_emis')}
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min="1" value={intervaloEmis} onChange={(e) => setIntEmis(e.target.value)} style={{ width: 72 }} />
          <select value={unidadeEmis} onChange={(e) => setUnEmis(e.target.value)} style={{ flex: 1 }}>{unidades.map((u) => <option key={u} value={u}>{t('mult.un.' + u)}</option>)}</select>
        </div>
      </label>
      <p className="muted">{t('mult.nota')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('mult.acao')}</button></div>
    </div></div>
  );
}
