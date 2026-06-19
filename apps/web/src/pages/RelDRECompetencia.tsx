// build: 2026-06-18b (força rebuild do Cloudflare — checkbox "Detalhar lançamentos")
import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcelDRE, rotuloPeriodo, type LinhaDRE } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

type GrupoDre = 'receita' | 'custo_mercadoria' | 'custo_operacional' | 'despesa';
interface Linha { categoria: string; contaCodigo: string | null; contaDescricao: string | null; total: number; }
interface Grupo { grupo: GrupoDre; total: number; linhas: Linha[]; }
interface Dre { grupos: Grupo[]; totalReceita: number; custoMercadoria: number; lucroBruto: number; custoOperacional: number; despesa: number; resultado: number; }
interface TituloDet { numero: string; descricao: string; pessoaNome: string | null; data: string | null; valor: number; }

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hoje = () => new Date().toISOString().slice(0, 10);
const primeiroDoMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const VERDE = '#16a34a', VERMELHO = '#e1483b';

export function RelDRECompetencia() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [de, setDe] = useState(primeiroDoMes());
  const [ate, setAte] = useState(hoje());
  const [dre, setDre] = useState<Dre | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gruposAbertos, setGruposAbertos] = useState<Set<GrupoDre>>(new Set(['receita', 'custo_mercadoria', 'custo_operacional', 'despesa']));
  const [drill, setDrill] = useState<string | null>(null);          // `${grupo}|${categoria}`
  const [titulos, setTitulos] = useState<Record<string, TituloDet[]>>({});
  const [detalhar, setDetalhar] = useState(false);

  async function carregar() {
    setErro(null); setDrill(null); setTitulos({});
    const qs = new URLSearchParams();
    if (de) qs.set('de', de); if (ate) qs.set('ate', ate);
    try { setDre(await api.get<Dre>('/financeiro/dre-competencia?' + qs.toString(), token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const margem = dre && dre.totalReceita > 0 ? (dre.resultado / dre.totalReceita) * 100 : 0;
  const conta = (l: Linha) => (l.contaCodigo ? `${l.contaCodigo}${l.contaDescricao ? ' · ' + l.contaDescricao : ''}` : '—');
  const rotuloGrupo = (g: GrupoDre) => t('dre.g_' + g);

  function alternarGrupo(g: GrupoDre) {
    setGruposAbertos((s) => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });
  }
  async function alternarDrill(g: GrupoDre, categoria: string) {
    const chave = g + '|' + categoria;
    if (drill === chave) { setDrill(null); return; }
    setDrill(chave);
    if (!titulos[chave]) {
      const qs = new URLSearchParams();
      if (de) qs.set('de', de); if (ate) qs.set('ate', ate);
      qs.set('grupo', g); qs.set('categoria', categoria);
      try {
        const ls = await api.get<TituloDet[]>('/financeiro/dre-competencia/titulos?' + qs.toString(), token!);
        setTitulos((m) => ({ ...m, [chave]: ls }));
      } catch { setTitulos((m) => ({ ...m, [chave]: [] })); }
    }
  }

  // Busca (e cacheia) os lançamentos de um grupo×conta para o drill/export.
  async function carregarTitulos(g: GrupoDre, categoria: string): Promise<TituloDet[]> {
    const chave = g + '|' + categoria;
    if (titulos[chave]) return titulos[chave]!;
    const qs = new URLSearchParams();
    if (de) qs.set('de', de); if (ate) qs.set('ate', ate);
    qs.set('grupo', g); qs.set('categoria', categoria);
    try { return await api.get<TituloDet[]>('/financeiro/dre-competencia/titulos?' + qs.toString(), token!); }
    catch { return []; }
  }

  function exportar(fmt: 'csv' | 'xlsx') {
    if (!dre) return;
    if (fmt === 'xlsx') { void exportarExcelDre(); return; }   // Excel = DRE em cascata
    if (detalhar) { void exportarCsvDetalhado(); return; }     // CSV mantém formato plano (dados crus)
    const linhas: (string | number)[][] = [];
    for (const gr of dre.grupos) for (const l of gr.linhas) linhas.push([rotuloGrupo(gr.grupo), l.categoria, conta(l), l.total]);
    baixarCsv('dre-competencia', [t('dre.grupo'), t('catfin.nome'), t('catfin.conta_contabil'), t('pedidos.valor')], linhas);
  }

  // CSV detalhado: uma linha por lançamento (tabela plana, p/ importar em outras ferramentas).
  async function exportarCsvDetalhado() {
    if (!dre) return;
    const linhas: (string | number)[][] = [];
    for (const gr of dre.grupos) for (const l of gr.linhas) {
      const ls = await carregarTitulos(gr.grupo, l.categoria);
      const contaTxt = l.categoria + (l.contaCodigo ? ' · ' + conta(l) : '');
      for (const tt of ls) linhas.push([rotuloGrupo(gr.grupo), contaTxt, tt.data ?? '', tt.numero, tt.descricao + (tt.pessoaNome ? ' · ' + tt.pessoaNome : ''), tt.valor]);
    }
    baixarCsv('dre-competencia-detalhada', [t('dre.grupo'), t('dre.conta'), t('dre.data'), t('dre.documento'), t('fin.descricao'), t('pedidos.valor')], linhas);
  }

  // Excel = demonstração em cascata: grupos + contas (subtotais) + lançamentos (se detalhar).
  async function exportarExcelDre() {
    if (!dre) return;
    const linhas: LinhaDRE[] = [];
    const addGrupo = async (g: GrupoDre, neg: boolean) => {
      const gr = dre.grupos.find((x) => x.grupo === g);
      if (!gr) return;
      linhas.push({ texto: (neg ? '(−) ' : '') + rotuloGrupo(g), valor: gr.total, estilo: neg ? 'grupo_neg' : 'grupo' });
      for (const l of gr.linhas) {
        linhas.push({ texto: l.categoria + (l.contaCodigo ? ' · ' + conta(l) : ''), valor: l.total, estilo: 'conta' });
        if (detalhar) {
          const ls = await carregarTitulos(g, l.categoria);
          for (const tt of ls) linhas.push({ texto: (tt.data ?? '—') + ' · ' + tt.numero + ' · ' + tt.descricao + (tt.pessoaNome ? ' · ' + tt.pessoaNome : ''), valor: tt.valor, estilo: 'lancamento' });
        }
      }
    };
    await addGrupo('receita', false);
    await addGrupo('custo_mercadoria', true);
    linhas.push({ texto: '= ' + t('dre.lucro_bruto'), valor: dre.lucroBruto, estilo: 'subtotal' });
    await addGrupo('custo_operacional', true);
    await addGrupo('despesa', true);
    linhas.push({ texto: '= ' + t('dre.resultado_periodo'), valor: dre.resultado, estilo: 'resultado' });
    linhas.push({ texto: t('dre.margem'), valorStr: margem.toFixed(1).replace('.', ',') + '%', estilo: 'nota' });
    baixarExcelDRE('dre-competencia', t('dre.excel_titulo'), linhas, { periodo: rotuloPeriodo(de, ate) });
  }

  const grupoDe = (g: GrupoDre) => dre?.grupos.find((x) => x.grupo === g);

  // Renderiza um grupo: cabeçalho clicável + (se aberto) suas contas + drill de lançamentos.
  function renderGrupo(g: GrupoDre) {
    const gr = grupoDe(g);
    if (!gr) return null;
    const aberto = gruposAbertos.has(g);
    const receita = g === 'receita';
    const prefixo = receita ? '' : '(−) ';
    return (
      <div key={g}>
        <div className="dre-grupo" onClick={() => alternarGrupo(g)}>
          <span><Ic name={aberto ? 'i-arrow-down' : 'i-chev'} className="sm" /> {prefixo}{rotuloGrupo(g)}</span>
          <b style={{ color: receita ? undefined : VERMELHO }}>{moeda(gr.total)}</b>
        </div>
        {aberto && gr.linhas.length === 0 && <div className="dre-conta muted">—</div>}
        {aberto && gr.linhas.map((l, i) => {
          const chave = g + '|' + l.categoria;
          const ativo = drill === chave;
          return (
            <div key={i}>
              <div className={'dre-conta' + (ativo ? ' on' : '')} onClick={() => alternarDrill(g, l.categoria)}>
                <span><Ic name={ativo ? 'i-arrow-down' : 'i-chev'} className="sm" /> {l.categoria}{l.contaCodigo ? <span className="muted"> · {conta(l)}</span> : null}</span>
                <span>{moeda(l.total)}</span>
              </div>
              {ativo && (
                <div className="dre-drill">
                  <div className="dre-drill-cab muted">{t('dre.lancamentos')} · {l.categoria}</div>
                  {(titulos[chave] ?? []).length === 0 && <div className="muted" style={{ padding: '4px 0' }}>{titulos[chave] ? t('dre.sem_lancamentos') : '…'}</div>}
                  {(titulos[chave] ?? []).map((tt, j) => (
                    <div key={j} className="dre-drill-linha">
                      <span><span className="muted">{tt.data ?? '—'}</span> &nbsp;{tt.numero} · {tt.descricao}{tt.pessoaNome ? ' · ' + tt.pessoaNome : ''}</span>
                      <span>{moeda(tt.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="crumb">{t('menu.financeiro')} / {t('menu.dre')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('dre.titulo')}</h1><div className="muted page-sub">{t('dre.sub')}</div></div>
        {dre && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }} title={t('dre.detalhar_hint')}>
            <input type="checkbox" checked={detalhar} onChange={(e) => setDetalhar(e.target.checked)} /> {t('dre.detalhar')}
          </label>
          <button className="btn-ghost" onClick={() => exportar('csv')}><Ic name="i-download" className="sm" /> CSV</button>
          <BotaoExcel onClick={() => exportar('xlsx')} />
        </span>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_ini')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_fim')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <button className="btn-primary" onClick={carregar}><Ic name="i-search" className="sm" /> {t('fluxo.filtrar')}</button>
        <span className="muted" style={{ fontSize: 12 }}>{t('dre.competencia_nota')}</span>
      </div>

      {dre && (
        <div className="dash-row c4" style={{ marginBottom: 14 }}>
          <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.g_receita')}</div><div className="kpi-val" style={{ color: VERDE }}>{moeda(dre.totalReceita)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.lucro_bruto')}</div><div className="kpi-val">{moeda(dre.lucroBruto)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-check" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.resultado')}</div><div className="kpi-val" style={{ color: dre.resultado >= 0 ? VERDE : VERMELHO }}>{moeda(dre.resultado)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-chart" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.margem')}</div><div className="kpi-val">{margem.toFixed(1)}%</div></div></div>
        </div>
      )}

      {dre && (
        <div className="card pad0 dre-demonstrativo">
          <div className="dre-cab muted"><span>{t('dre.conta')}</span><span>{t('pedidos.valor')}</span></div>
          {renderGrupo('receita')}
          {renderGrupo('custo_mercadoria')}
          <div className="dre-subtotal"><span>= {t('dre.lucro_bruto')}</span><b>{moeda(dre.lucroBruto)}</b></div>
          {renderGrupo('custo_operacional')}
          {renderGrupo('despesa')}
          <div className="dre-subtotal" style={{ fontSize: 15, borderTopWidth: 2 }}><span>= {t('dre.resultado_periodo')}</span><b style={{ color: dre.resultado >= 0 ? VERDE : VERMELHO }}>{moeda(dre.resultado)}</b></div>
        </div>
      )}
    </div>
  );
}
