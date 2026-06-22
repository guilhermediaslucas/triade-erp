import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda, abrevMoeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { ModalNovaPessoa } from '../components/SeletorPessoa.js';
import { Ic } from '../components/Icones.js';
import { AnexosTitulo } from '../components/AnexosTitulo.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { FORMAS_BAIXA } from '../lib/pagamento.js';
import { notificarLiberadoSeparacao } from '../lib/notificarSeparacao.js';

type Tipo = 'receber' | 'pagar';
interface Titulo { id: string; numero: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; status: 'aberto' | 'pago'; formaPagamento: string | null; pedidoFormaPagamento: string | null; pedidoFrete: number | null; pedidoFreteTipo: string | null; anexosCount: number; origem: string; categoriaFinanceiraId: string | null; categoriaFinanceiraNome: string | null; contaCorrenteNome: string | null; vendedorNome: string | null; favorecidoId: string | null; favorecidoNome: string | null; favorecidoForma: string | null; favorecidoPagoEm: string | null; previsto: boolean; tipoDocumento: string | null; numeroDocumento: string | null; emissao: string | null; criadoEm: string; pagoEm: string | null; desconto: number; multa: number; juros: number; taxaCartao: number; }
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
  const [params, setParams] = useSearchParams();
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [itens, setItens] = useState<Titulo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);
  const [editar, setEditar] = useState<Titulo | null>(null);
  const [parcelarT, setParcelarT] = useState<Titulo | null>(null);
  const [parcelarModo, setParcelarModo] = useState<'dividir' | 'replicar'>('dividir');
  const [multiplicarT, setMultiplicarT] = useState<Titulo | null>(null);
  const [baixar, setBaixar] = useState<Titulo | null>(null);
  const [cancelarT, setCancelarT] = useState<Titulo | null>(null);
  const [reembolsoT, setReembolsoT] = useState<Titulo | null>(null);
  const [verT, setVerT] = useState<Titulo | null>(null);
  const [anexoT, setAnexoT] = useState<Titulo | null>(null);
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
  // Ordem padrão das colunas reordenáveis (forma/frete só existem em "receber").
  const ORDEM_PADRAO = ['numero', 'descricao', 'cat', 'pessoa', 'forma', 'frete', 'doc', 'emissao', 'venc', 'baixa', 'valor', 'vendedor', 'sit'];
  const colLabel = (k: string) => k === 'pessoa' ? (tipo === 'receber' ? 'fin.cliente' : 'fin.fornecedor') : k === 'cat' ? 'catfin.titulo_s' : k === 'doc' ? 'fin.documento' : k === 'emissao' ? 'fin.emissao' : k === 'venc' ? 'fin.vencimento' : k === 'baixa' ? 'fin.baixa' : k === 'valor' ? 'fin.valor' : k === 'vendedor' ? 'fin.vendedor' : 'fin.situacao';

  // Layout das colunas (ordem + ocultas + larguras) salvo NA CONTA do usuário (backend),
  // por tipo (contas-receber / contas-pagar). Migrado do localStorage para /preferencias.
  const PREF_CHAVE = 'contas-' + tipo;
  const [colsAberto, setColsAberto] = useState(false);
  const [ordem, setOrdem] = useState<string[]>(ORDEM_PADRAO);
  const [colsOcultas, setColsOcultas] = useState<Set<string>>(new Set());
  const [larguras, setLarguras] = useState<Record<string, number>>({});
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvoCol, setAlvoCol] = useState<string | null>(null);
  const carregadoRef = useRef(false);   // só persiste depois do carregamento inicial
  const redimRef = useRef(false);       // guard síncrono: não inicia drag ao redimensionar
  const oc = (k: string) => colsOcultas.has(k);

  // Garante que toda coluna conhecida apareça (novas vão ao fim) e descarta chaves obsoletas.
  function normalizarOrdem(ord: string[]): string[] {
    const out = ord.filter((k) => ORDEM_PADRAO.includes(k));
    for (const k of ORDEM_PADRAO) if (!out.includes(k)) out.push(k);
    return out;
  }

  useEffect(() => {
    carregadoRef.current = false;
    setOrdem(ORDEM_PADRAO); setColsOcultas(new Set()); setLarguras({});
    api.get<{ valor: { ordem?: string[]; ocultas?: string[]; larguras?: Record<string, number> } | null }>('/preferencias/' + PREF_CHAVE, token!)
      .then((r) => {
        const v = r?.valor;
        if (v && typeof v === 'object') {
          if (Array.isArray(v.ordem)) setOrdem(normalizarOrdem(v.ordem));
          if (Array.isArray(v.ocultas)) setColsOcultas(new Set(v.ocultas));
          if (v.larguras && typeof v.larguras === 'object') setLarguras(v.larguras);
        }
      })
      .catch(() => { /* sem preferência salva — usa o padrão */ })
      .finally(() => { carregadoRef.current = true; });
    /* eslint-disable-next-line */
  }, [tipo]);

  // Persiste o layout completo (best-effort). Não grava antes do carregamento inicial.
  function persistirLayout(ord: string[], ocultas: Set<string>, larg: Record<string, number>) {
    if (!carregadoRef.current) return;
    api.put('/preferencias/' + PREF_CHAVE, { valor: { ordem: ord, ocultas: [...ocultas], larguras: larg } }, token!).catch(() => {});
  }

  function toggleCol(k: string) {
    setColsOcultas((cur) => { const n = new Set(cur); n.has(k) ? n.delete(k) : n.add(k); persistirLayout(ordem, n, larguras); return n; });
  }

  function moverColuna(origem: string, alvo: string) {
    if (!origem || origem === alvo) return;
    setOrdem((cur) => {
      const arr = cur.filter((k) => k !== origem);
      const idx = arr.indexOf(alvo);
      arr.splice(idx < 0 ? arr.length : idx, 0, origem);
      persistirLayout(arr, colsOcultas, larguras);
      return arr;
    });
  }

  // Redimensionar coluna por arraste da alça. O guard redimRef impede que o navegador
  // inicie o drag de reordenação do <th> durante o redimensionamento.
  function iniciarResize(col: string, startX: number, handle: HTMLElement) {
    redimRef.current = true;
    const th = handle.parentElement as HTMLElement;
    const startW = th.getBoundingClientRect().width;
    function mover(e: MouseEvent) { setLarguras((cur) => ({ ...cur, [col]: Math.max(60, Math.round(startW + (e.clientX - startX))) })); }
    function soltar() {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
      redimRef.current = false;
      setLarguras((cur) => { persistirLayout(ordem, colsOcultas, cur); return cur; });
    }
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
  }

  // Formatação de datas das células (— quando vazio) e da exportação (vazio quando vazio).
  const fmtData = (iso: string | null | undefined) => iso ? new Date(iso.length > 10 ? iso : iso + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const fmtDataExp = (iso: string | null | undefined) => iso ? new Date(iso.length > 10 ? iso : iso + 'T00:00:00').toLocaleDateString('pt-BR') : '';

  // Descritores das colunas reordenáveis (rótulo, célula e valor de exportação).
  interface ColDef { chave: string; label: string; hideable: boolean; soReceber?: boolean; cell: (x: Titulo) => ReactNode; exp: (x: Titulo) => string | number; }
  const COLS: ColDef[] = [
    { chave: 'numero', label: t('fin.numero'), hideable: false, cell: (x) => <span style={{ fontWeight: 700 }}>{x.numero}</span>, exp: (x) => x.numero },
    { chave: 'descricao', label: t('fin.descricao'), hideable: false, cell: (x) => x.descricao, exp: (x) => x.descricao },
    { chave: 'cat', label: t('catfin.titulo_s'), hideable: true, cell: (x) => x.categoriaFinanceiraNome ?? '—', exp: (x) => x.categoriaFinanceiraNome ?? '' },
    { chave: 'pessoa', label: tipo === 'receber' ? t('fin.cliente') : t('fin.fornecedor'), hideable: true, cell: (x) => x.pessoaNome ?? '—', exp: (x) => x.pessoaNome ?? '' },
    { chave: 'forma', label: t('fin.forma'), hideable: false, soReceber: true, cell: (x) => x.pedidoFormaPagamento ?? '—', exp: (x) => x.pedidoFormaPagamento ?? '' },
    { chave: 'frete', label: t('relvc.frete_cobrado'), hideable: false, soReceber: true, cell: (x) => x.pedidoFrete != null && x.pedidoFrete > 0 ? moeda(x.pedidoFrete) : '—', exp: (x) => x.pedidoFrete != null ? x.pedidoFrete : '' },
    { chave: 'doc', label: t('fin.documento'), hideable: true, cell: (x) => x.tipoDocumento ?? '—', exp: (x) => x.tipoDocumento ?? '' },
    { chave: 'emissao', label: t('fin.emissao'), hideable: true, cell: (x) => fmtData(x.emissao || x.criadoEm), exp: (x) => fmtDataExp(x.emissao || x.criadoEm) },
    { chave: 'venc', label: t('fin.vencimento'), hideable: true, cell: (x) => fmtData(x.vencimento), exp: (x) => fmtDataExp(x.vencimento) },
    { chave: 'baixa', label: t('fin.baixa'), hideable: true, cell: (x) => fmtData(x.pagoEm), exp: (x) => fmtDataExp(x.pagoEm) },
    { chave: 'valor', label: t('fin.valor'), hideable: true, cell: (x) => moeda(x.valor), exp: (x) => x.valor },
    { chave: 'vendedor', label: t('fin.vendedor'), hideable: true, cell: (x) => x.vendedorNome ?? '—', exp: (x) => x.vendedorNome ?? '' },
    { chave: 'sit', label: t('fin.situacao'), hideable: true, cell: (x) => { const s = situacao(x); return <span className={'pill ' + (s === 'pago' ? 'st-verde' : s === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fin.' + s)}</span>; }, exp: (x) => t('fin.' + situacao(x)) },
  ];
  const colByKey: Record<string, ColDef> = {};
  for (const c of COLS) colByKey[c.chave] = c;
  // Colunas efetivamente visíveis, na ordem do usuário, sem as ocultas e sem forma/frete fora de "receber".
  const colsVisiveis = ordem.map((k) => colByKey[k]).filter((c): c is ColDef => !!c && (!c.soReceber || tipo === 'receber') && !(c.hideable && oc(c.chave)));

  // Ordenação ao clicar no cabeçalho da coluna (alterna asc/desc).
  function toggleSort(c: string) {
    if (sortCol === c) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortCol(c); setSortDir(1); }
  }
  const ordenados = useMemo(() => {
    if (!sortCol) return filtrados;
    const col = colByKey[sortCol];
    if (!col) return filtrados;
    const arr = [...filtrados];
    arr.sort((a, b) => {
      const va = col.exp(a), vb = col.exp(b);
      const r = (typeof va === 'number' && typeof vb === 'number')
        ? va - vb
        : String(va).localeCompare(String(vb), 'pt-BR', { numeric: true });
      return r * sortDir;
    });
    return arr;
  }, [filtrados, sortCol, sortDir]);

  // Abrir um título específico vindo do pedido (?titulo=<id>&baixar=1): abre direto na baixa.
  const abriuParamRef = useRef(false);
  useEffect(() => {
    const tituloParam = params.get('titulo');
    if (abriuParamRef.current || !tituloParam || itens.length === 0) return;
    const tit = itens.find((x) => x.id === tituloParam);
    if (!tit) return;
    abriuParamRef.current = true;
    if (params.get('baixar') === '1' && tit.status === 'aberto' && pode && !tit.previsto) setBaixar(tit);
    else setVerT(tit);
    setParams({}, { replace: true });
    /* eslint-disable-next-line */
  }, [itens, params]);

  async function excluirUm(tt: Titulo) {
    if (!window.confirm(t('bulk.confirma_excluir').replace('{n}', '1'))) return;
    try { await api.del('/financeiro/' + tipo + '/' + tt.id, token!); await carregar(); toast(t('bulk.excluidos').replace('{n}', '1')); }
    catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  // Cabeçalho de coluna reordenável: arrasta para mudar de lugar + alça para redimensionar.
  function thCol(c: ColDef) {
    return (
      <th
        key={c.chave}
        draggable
        onDragStart={(e) => { if (redimRef.current) { e.preventDefault(); return; } setArrastando(c.chave); e.dataTransfer.effectAllowed = 'move'; }}
        onDragEnd={() => { setArrastando(null); setAlvoCol(null); }}
        onDragOver={(e) => { e.preventDefault(); if (arrastando && arrastando !== c.chave && alvoCol !== c.chave) setAlvoCol(c.chave); }}
        onDragLeave={() => { if (alvoCol === c.chave) setAlvoCol(null); }}
        onDrop={(e) => { e.preventDefault(); if (arrastando) moverColuna(arrastando, c.chave); setArrastando(null); setAlvoCol(null); }}
        className={'th-mov' + (arrastando === c.chave ? ' arrastando' : '') + (alvoCol === c.chave ? ' alvo' : '')}
        style={{ position: 'relative', cursor: 'grab', ...(larguras[c.chave] ? { width: larguras[c.chave] } : {}) }}
        title={t('fin.col_arraste')}
      >
        <span onClick={(e) => { e.stopPropagation(); toggleSort(c.chave); }} style={{ cursor: 'pointer' }}>{c.label}{sortCol === c.chave ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</span>
        <span className="col-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); iniciarResize(c.chave, e.clientX, e.currentTarget as HTMLElement); }} />
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
    // Exporta exatamente as colunas visíveis, na ordem escolhida pelo usuário (sem a coluna de ações).
    const cab = colsVisiveis.map((c) => c.label);
    const linhas = filtrados.map((x) => colsVisiveis.map((c) => c.exp(x)));
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

      <div className="card pad0"><table className="tabela tabela-1linha">
        <thead><tr>
          {pode && <th style={{ width: 34 }}><input type="checkbox" checked={filtrados.length > 0 && sel.size === filtrados.length} onChange={toggleTodos} /></th>}
          {colsVisiveis.map((c) => thCol(c))}<th style={{ textAlign: 'center' }}>{t('fin.previsto')}</th><th>{t('usuarios.acoes')}</th>
        </tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={(pode ? 1 : 0) + colsVisiveis.length + 2} className="vazio">{t('common.nenhum')}</td></tr>}
          {ordenados.map((tt) => { return (
            <tr key={tt.id} className={(sel.has(tt.id) ? 'linha-sel ' : '') + (tt.previsto ? 'linha-previsto' : '')} style={{ cursor: 'pointer' }} onDoubleClick={() => setVerT(tt)} title={t('fin.ver_detalhe')}>
              {pode && <td><input type="checkbox" checked={sel.has(tt.id)} onChange={() => toggle(tt.id)} /></td>}
              {colsVisiveis.map((c) => <td key={c.chave} data-label={c.label}>{c.cell(tt)}</td>)}
              <td data-label={t('fin.previsto')} style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                {tt.status === 'aberto'
                  ? <button className={'pe-badge ' + (tt.previsto ? 'pe-pv' : 'pe-ef')} disabled={!pode} onClick={() => alternarPrevisto(tt)} title={t('fin.previsto_hint')}>{tt.previsto ? t('fluxo.previsto') : t('fluxo.efetivo')}</button>
                  : <span className="muted">—</span>}
              </td>
              <td data-label={t('usuarios.acoes')}><span className="acoes-ic"><button className={'acao-ic' + (tt.anexosCount > 0 ? ' ok' : '')} title={t('anexo.titulo')} aria-label={t('anexo.titulo')} onClick={() => setAnexoT(tt)}><Ic name="i-clip" className="sm" />{tt.anexosCount > 0 ? ' ' + tt.anexosCount : ''}</button>{pode && (tt.status === 'aberto'
                ? <>
                    {tt.origem === 'manual' && <button className="acao-ic" title={t('common.editar')} aria-label={t('common.editar')} onClick={() => setEditar(tt)}><Ic name="i-edit" className="sm" /></button>}
                    {!tt.previsto && <button className="acao-ic ok" title={t('fin.baixar')} aria-label={t('fin.baixar')} onClick={() => setBaixar(tt)}><Ic name="i-check" className="sm" /></button>}
                    <button className="acao-ic" title={t('parcelar.acao')} aria-label={t('parcelar.acao')} onClick={() => abrirParcelar(tt, 'dividir')}><Ic name="i-clock" className="sm" /></button>
                    {tipo === 'pagar' && <button className={'acao-ic' + (tt.favorecidoId ? ' ok' : '')} title={t('fin.reembolso')} aria-label={t('fin.reembolso')} onClick={() => setReembolsoT(tt)}><Ic name="i-user" className="sm" /></button>}
                  </>
                : <button className="acao-ic danger" title={t('fin.cancelar_baixa')} aria-label={t('fin.cancelar_baixa')} onClick={() => setCancelarT(tt)}><Ic name="i-x" className="sm" /></button>)}</span></td>
            </tr>
          ); })}
        </tbody>
      </table></div>
      {reembolsoT && <ModalReembolso titulo={reembolsoT} onFechar={() => setReembolsoT(null)} onSalvo={() => { setReembolsoT(null); carregar(); toast(t('fin.toast_reembolso')); }} />}
      {novo && <ModalNovo tipo={tipo} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); toast(t('fin.toast_criado')); }} />}
      {editar && <ModalNovo tipo={tipo} editar={editar} onFechar={() => setEditar(null)} onSalvo={() => { setEditar(null); carregar(); toast(t('fin.toast_editado')); }} />}
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
      {verT && <ModalVerTitulo tipo={tipo} titulo={verT} pode={pode}
        onEditar={() => { const x = verT; setVerT(null); setEditar(x); }}
        onBaixar={() => { const x = verT; setVerT(null); setBaixar(x); }}
        onParcelar={() => { const x = verT; setVerT(null); abrirParcelar(x, 'dividir'); }}
        onMultiplicar={() => { const x = verT; setVerT(null); setMultiplicarT(x); }}
        onReembolso={() => { const x = verT; setVerT(null); setReembolsoT(x); }}
        onExcluir={() => { const x = verT; setVerT(null); excluirUm(x); }}
        onCancelarBaixa={() => { const x = verT; setVerT(null); setCancelarT(x); }}
        onFechar={() => setVerT(null)} />}
      {anexoT && <AnexosTitulo tituloId={anexoT.id} numero={anexoT.numero} podeGerenciar={pode} onFechar={() => setAnexoT(null)} />}
    </div>
  );
}

// Janela de detalhe do título (duplo-clique na linha): mostra os dados e oferece as
// ações (editar/baixar/parcelar/multiplicar/reembolso/excluir/cancelar baixa).
function ModalVerTitulo({ tipo, titulo, pode, onEditar, onBaixar, onParcelar, onMultiplicar, onReembolso, onExcluir, onCancelarBaixa, onFechar }: {
  tipo: Tipo; titulo: Titulo; pode: boolean;
  onEditar: () => void; onBaixar: () => void; onParcelar: () => void; onMultiplicar: () => void;
  onReembolso: () => void; onExcluir: () => void; onCancelarBaixa: () => void; onFechar: () => void;
}) {
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
      {titulo.status === 'pago' && titulo.taxaCartao > 0 && linha(t('fin.taxa_cartao'), moeda(titulo.taxaCartao))}
      {titulo.status === 'pago' && (titulo.desconto > 0 || titulo.multa > 0 || titulo.juros > 0) && linha(t('fin.total_baixar'), <b>{moeda(titulo.valor - titulo.desconto + titulo.multa + titulo.juros)}</b>)}
      {linha(t('fin.previsto'), titulo.previsto ? t('common.sim') : t('common.nao'))}
      {titulo.tipoDocumento && linha(t('tipodoc.titulo_s'), titulo.tipoDocumento)}
      {titulo.numeroDocumento && linha(t('fin.num_documento'), titulo.numeroDocumento)}
      {titulo.emissao && linha(t('fin.emissao'), fmtData(titulo.emissao))}
      {linha(t('fin.origem'), titulo.origem === 'pedido' ? t('fin.do_pedido') : titulo.origem)}
      {pode && (
        <div className="det-acoes" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {titulo.status === 'aberto' ? (<>
            {titulo.origem === 'manual' && <button className="btn-ghost" onClick={onEditar}><Ic name="i-edit" className="sm" /> {t('common.editar')}</button>}
            {!titulo.previsto && <button className="btn-primary" onClick={onBaixar}><Ic name="i-check" className="sm" /> {t('fin.baixar')}</button>}
            <button className="btn-ghost" onClick={onParcelar}><Ic name="i-rows" className="sm" /> {t('parcelar.acao')}</button>
            <button className="btn-ghost" onClick={onMultiplicar}><Ic name="i-plus" className="sm" /> {t('parcelar.multiplicar')}</button>
            {tipo === 'pagar' && <button className="btn-ghost" onClick={onReembolso}><Ic name="i-user" className="sm" /> {t('fin.reembolso')}</button>}
            <button className="btn-danger" onClick={onExcluir}><Ic name="i-trash" className="sm" /> {t('common.excluir')}</button>
          </>) : (
            <button className="btn-danger" onClick={onCancelarBaixa}><Ic name="i-x" className="sm" /> {t('fin.cancelar_baixa')}</button>
          )}
        </div>
      )}
      <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}

function ModalNovo({ tipo, editar, onFechar, onSalvo }: { tipo: Tipo; editar?: Titulo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const ed = editar ?? null;
  const [descricao, setDescricao] = useState(ed?.descricao ?? ''); const [pessoaNome, setPessoa] = useState(ed?.pessoaNome ?? '');
  const [valor, setValor] = useState(ed ? String(ed.valor) : ''); const [vencimento, setVenc] = useState(ed?.vencimento ?? '');
  const [emissao, setEmissao] = useState(ed?.emissao ?? hojeISO());
  const [numeroDoc, setNumeroDoc] = useState(ed?.numeroDocumento ?? '');
  const [categoriaFinanceiraId, setCatId] = useState(ed?.categoriaFinanceiraId ?? '');
  const [cats, setCats] = useState<CatFin[]>([]);
  const [cadNomes, setCadNomes] = useState<string[]>([]);
  const [novaPessoa, setNovaPessoa] = useState(false);
  const [previsto, setPrevisto] = useState(ed?.previsto ?? false);
  const [tipoDoc, setTipoDoc] = useState(ed?.tipoDocumento ?? '');
  const [tiposDoc, setTiposDoc] = useState<TipoDoc[]>([]);
  // Reembolso a terceiro (só a pagar): o título foi pago por um favorecido e a empresa o reembolsa.
  const [reembolso, setReembolso] = useState(false);
  const [favorecidoId, setFavorecidoId] = useState('');
  const [favorecidoForma, setFavForma] = useState('Cartão');
  const [favorecidoPagoEm, setFavPagoEm] = useState(hojeISO());
  const [favorecidos, setFavorecidos] = useState<{ id: string; nome: string }[]>([]);
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
    if (pagar && temCapability('cadastros.favorecido.listar')) api.get<{ id: string; nome: string; ativo?: boolean }[]>('/favorecidos', token!).then((l) => setFavorecidos(l.filter((x) => x.ativo !== false))).catch(() => {});
    carregarCad();
    /* eslint-disable-next-line */
  }, []);
  // Lançamento manual só é finalizado com todos os campos preenchidos.
  function faltando(): string | null {
    if (descricao.trim().length < 2) return 'financeiro.descricao_invalida';
    if (!tipoDoc) return 'financeiro.tipodoc_obrigatorio';
    if (!numeroDoc.trim()) return 'financeiro.numdoc_obrigatorio';
    if (!categoriaFinanceiraId) return 'financeiro.categoria_obrigatoria';
    if (!Number(valor) || Number(valor) <= 0) return 'financeiro.valor_invalido';
    if (!pessoaNome.trim()) return 'financeiro.pessoa_obrigatoria';
    if (!emissao) return 'financeiro.emissao_obrigatoria';
    if (!vencimento) return 'financeiro.vencimento_obrigatorio';
    return null;
  }
  async function salvar() {
    const f = faltando();
    if (f) { setErro(f); return; }
    setErro(null); setSalv(true);
    const corpo = {
      descricao, pessoaNome, valor: Number(valor), vencimento, emissao: emissao || null,
      categoriaFinanceiraId: categoriaFinanceiraId || null,
      favorecidoId: (pagar && reembolso) ? (favorecidoId || null) : null,
      favorecidoForma: (pagar && reembolso) ? favorecidoForma : null,
      favorecidoPagoEm: (pagar && reembolso) ? (favorecidoPagoEm || null) : null,
      previsto, tipoDocumento: tipoDoc || null, numeroDocumento: numeroDoc || null,
    };
    try {
      if (ed) await api.put('/financeiro/' + tipo + '/' + ed.id, corpo, token!);
      else await api.post('/financeiro/' + tipo, corpo, token!);
      onSalvo();
    }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{ed ? t('fin.editar_lancamento') : t('fin.novo_lancamento')}</h2>
      <label className="campo">{t('fin.descricao')}<b className="obrig"> *</b><input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t('fin.descricao_ph')} autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('tipodoc.titulo_s')}<b className="obrig"> *</b>
          <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
            <option value="">{t('tipodoc.sem')}</option>{tiposDoc.map((d) => <option key={d.id} value={d.nome}>{d.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('fin.num_documento')}<b className="obrig"> *</b><input value={numeroDoc} onChange={(e) => setNumeroDoc(e.target.value)} placeholder={t('fin.num_documento_ph')} /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('catfin.titulo_s')}<b className="obrig"> *</b>
          <select value={categoriaFinanceiraId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">{t('catfin.sem')}</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('fin.valor')}<b className="obrig"> *</b><MoedaInput value={valor} onChange={(n) => setValor(n ? String(n) : '')} placeholder="0,00" /></label>
      </div>
      <label className="campo">
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{pagar ? t('fin.fornecedor') : t('fin.cliente')}<b className="obrig"> *</b></span>
          <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={() => setNovaPessoa(true)}>+ {t('fin.cadastrar_novo')}</button>
        </span>
        <input list="dlCadLanc" value={pessoaNome} onChange={(e) => setPessoa(e.target.value)} placeholder={t('fin.pessoa_ph')} />
        <datalist id="dlCadLanc">{cadNomes.map((n) => <option key={n} value={n} />)}</datalist>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('fin.emissao')}<b className="obrig"> *</b><input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></label>
        <label className="campo">{(pagar && reembolso ? t('fin.data_reembolso') : t('fin.vencimento'))}<b className="obrig"> *</b><input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
      </div>
      <label className="login-lembrar" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={previsto} onChange={(e) => setPrevisto(e.target.checked)} /> {t('fin.previsto_label')}
      </label>
      {pagar && !ed && (
        <label className="login-lembrar" style={{ marginTop: 8, background: 'var(--accent-soft)', borderRadius: 8, padding: '8px 10px' }}>
          <input type="checkbox" checked={reembolso} onChange={(e) => setReembolso(e.target.checked)} /> <b>{t('fin.reembolso')}</b> <span className="muted">{t('fin.reembolso_hint')}</span>
        </label>
      )}
      {pagar && !ed && reembolso && (
        <div style={{ border: '1px dashed var(--accent)', borderRadius: 10, padding: 12, marginTop: 8 }}>
          <label className="campo">{t('fin.favorecido_reembolsar')}
            <select value={favorecidoId} onChange={(e) => setFavorecidoId(e.target.value)}>
              <option value="">{t('fin.favorecido_escolha')}</option>{favorecidos.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </label>
          <div className="cores-grid">
            <label className="campo">{t('fin.favorecido_forma')}
              <select value={favorecidoForma} onChange={(e) => setFavForma(e.target.value)}>{FORMAS_BAIXA.map((f) => <option key={f}>{f}</option>)}</select>
            </label>
            <label className="campo">{t('fin.favorecido_pago_em')}<input type="date" value={favorecidoPagoEm} onChange={(e) => setFavPagoEm(e.target.value)} /></label>
          </div>
          <div className="nota-info">{t('fin.reembolso_nota')}</div>
        </div>
      )}
      <div className="nota-info" style={{ marginTop: 12 }}>{t('fin.nota_conta')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('fin.salvar_lancamento')}</button></div>
      {novaPessoa && <ModalNovaPessoa tipo={pagar ? 'fornecedor' : 'cliente'} onFechar={() => setNovaPessoa(false)} onCriado={(nome) => { setNovaPessoa(false); setPessoa(nome); carregarCad(); }} />}
    </div></div>
  );
}

// Marca/desmarca um título a pagar EXISTENTE como reembolso a terceiro (a qualquer momento).
function ModalReembolso({ titulo, onFechar, onSalvo }: { titulo: Titulo; onFechar: () => void; onSalvo: () => void; }) {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const [reembolso, setReembolso] = useState(!!titulo.favorecidoId);
  const [favorecidoId, setFavorecidoId] = useState(titulo.favorecidoId ?? '');
  const [favorecidoForma, setFavForma] = useState(titulo.favorecidoForma ?? 'Cartão');
  const [favorecidoPagoEm, setFavPagoEm] = useState((titulo.favorecidoPagoEm ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [vencimento, setVenc] = useState((titulo.vencimento ?? '').slice(0, 10));
  const [favorecidos, setFavorecidos] = useState<{ id: string; nome: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  useEffect(() => { if (temCapability('cadastros.favorecido.listar')) api.get<{ id: string; nome: string; ativo?: boolean }[]>('/favorecidos', token!).then((l) => setFavorecidos(l.filter((x) => x.ativo !== false))).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      await api.patch('/financeiro/pagar/' + titulo.id + '/reembolso', reembolso
        ? { favorecidoId: favorecidoId || null, favorecidoForma, favorecidoPagoEm: favorecidoPagoEm || null, vencimento: vencimento || null }
        : { favorecidoId: null }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('fin.reembolso')}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{titulo.numero} · {titulo.descricao} · <b>{moeda(titulo.valor)}</b></p>
      <label className="login-lembrar" style={{ background: 'var(--accent-soft)', borderRadius: 8, padding: '8px 10px' }}>
        <input type="checkbox" checked={reembolso} onChange={(e) => setReembolso(e.target.checked)} /> <b>{t('fin.reembolso_marcar')}</b>
      </label>
      {reembolso && (
        <div style={{ marginTop: 10 }}>
          <label className="campo">{t('fin.favorecido_reembolsar')}
            <select value={favorecidoId} onChange={(e) => setFavorecidoId(e.target.value)}>
              <option value="">{t('fin.favorecido_escolha')}</option>{favorecidos.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </label>
          <div className="cores-grid">
            <label className="campo">{t('fin.favorecido_forma')}
              <select value={favorecidoForma} onChange={(e) => setFavForma(e.target.value)}>{FORMAS_BAIXA.map((f) => <option key={f}>{f}</option>)}</select>
            </label>
            <label className="campo">{t('fin.favorecido_pago_em')}<input type="date" value={favorecidoPagoEm} onChange={(e) => setFavPagoEm(e.target.value)} /></label>
          </div>
          <label className="campo">{t('fin.data_reembolso')}<input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
          <div className="nota-info">{t('fin.reembolso_nota')}</div>
        </div>
      )}
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
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
  const [taxaCartao, setTaxaCartao] = useState('0');
  const [contas, setContas] = useState<{ id: string; nome: string }[]>([]);
  const [taxas, setTaxas] = useState<{ forma: string; percentual: number; ativo: boolean }[]>([]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const totalSel = titulos.reduce((a, x) => a + x.valor, 0);
  const massa = titulos.length > 1;
  // Composição (só no título único): total a baixar = valor - desconto + multa + juros.
  const nD = Math.max(0, Number(desconto) || 0), nM = Math.max(0, Number(multa) || 0), nJ = Math.max(0, Number(juros) || 0);
  const nT = Math.max(0, Number(taxaCartao) || 0);
  const totalBaixar = Math.round((totalSel - nD + nM + nJ) * 100) / 100;
  const ehCartao = forma === 'Cartão';
  // Taxa cadastrada para a forma selecionada (auto-preenche o campo de taxa).
  const taxaForma = taxas.find((x) => x.ativo && x.forma.toLowerCase() === forma.toLowerCase());
  const temTaxa = !massa && (!!taxaForma || ehCartao);
  const liquidoCartao = Math.round((totalBaixar - nT) * 100) / 100; // líquido recebido após a taxa da operadora
  // Pix e Boleto entram numa conta bancária — selecionar o banco é obrigatório.
  const contaObrig = forma === 'Pix' || forma === 'Boleto';
  const contaFaltando = contaObrig && !contaId;
  useEffect(() => { if (temCapability('cadastros.conta.listar')) api.get<{ id: string; nome: string }[]>('/contas-correntes', token!).then(setContas).catch(() => {}); api.get<{ forma: string; percentual: number; ativo: boolean }[]>('/taxas-cartao', token!).then(setTaxas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  // Ao trocar a forma de pagamento, preenche a taxa automaticamente se houver uma cadastrada.
  useEffect(() => { if (taxaForma) setTaxaCartao(String(Math.round(totalBaixar * taxaForma.percentual) / 100)); /* eslint-disable-next-line */ }, [forma, taxas]);
  async function salvar() {
    setErro(null);
    if (contaFaltando) { setErro('fin.conta_obrigatoria'); return; }
    setSalv(true);
    let ok = 0;
    const liberados: { numero: number; cliente: string | null; valor: number }[] = [];
    for (const tt of titulos) {
      // Composição só se aplica a baixa individual; em massa vai sem ajustes.
      const corpo = massa
        ? { formaPagamento: forma, contaCorrenteId: contaId || null, dataBaixa }
        : { formaPagamento: forma, contaCorrenteId: contaId || null, dataBaixa, desconto: nD, multa: nM, juros: nJ, taxaCartao: temTaxa ? nT : 0 };
      try {
        const r = await api.patch<{ pedidoLiberado: number | null }>('/financeiro/' + tipo + '/' + tt.id + '/baixar', corpo, token!); ok++;
        if (r?.pedidoLiberado) liberados.push({ numero: r.pedidoLiberado, cliente: tt.pessoaNome, valor: tt.valor });
      }
      catch (e) { if (!massa) { setErro((e as ErroApi).chaveI18n); setSalv(false); return; } }
    }
    liberados.forEach((l) => notificarLiberadoSeparacao(l.numero, l.cliente, l.valor, t));
    onSalvo(ok);
  }
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.baixar')} — {massa ? `${titulos.length} ${t('fin.titulos')} · ` : ''}{moeda(totalSel)}</h2>
      <div className="cores-grid">
        <label className="campo">{t('fin.data_baixa')}<input type="date" value={dataBaixa} onChange={(e) => setDataBaixa(e.target.value)} /></label>
        <label className="campo">{t('pedidos.forma_pgto')}
          <select value={forma} onChange={(e) => setForma(e.target.value)}>{FORMAS_BAIXA.map((f) => <option key={f}>{f}</option>)}</select>
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
        {temTaxa && (<>
          <label className="campo" style={{ marginTop: 6 }}>{t('fin.taxa_cartao')}{taxaForma ? <span className="hint"> · {taxaForma.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</span> : null}<MoedaInput value={taxaCartao} onChange={(n) => setTaxaCartao(n ? String(n) : '')} /></label>
          <div className="tl-row"><span className="muted">{t('fin.liquido_cartao')}</span><b style={{ color: '#16a34a' }}>{moeda(liquidoCartao)}</b></div>
        </>)}
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
