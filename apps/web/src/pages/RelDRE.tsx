import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Linha { origem: string; total: number; }
interface Resumo { totalReceitas: number; totalDespesas: number; resultado: number; }
interface Dre { por: 'origem' | 'categoria'; receitas: Linha[]; despesas: Linha[]; totalReceitas: number; totalDespesas: number; resultado: number; anterior: Resumo | null; }
interface TituloDet { numero: string; descricao: string; pessoaNome: string | null; pagoEm: string | null; valor: number; }

const mesAtual = () => new Date().toISOString().slice(0, 7);
const primeiroDiaDe = (m: string) => m + '-01';
const ultimoDiaDe = (m: string) => { const [y, mo] = m.split('-').map(Number); return new Date(y!, mo!, 0).toISOString().slice(0, 10); };
const fmtData = (d: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—');
const pct = (v: number, tot: number) => (tot > 0 ? Math.round((v / tot) * 100) : 0);

export function RelDRE() {
  const { token } = useAuth(); const { t } = useI18n();
  const [comp, setComp] = useState(mesAtual());
  const [personalizado, setPersonalizado] = useState(false);
  const [de, setDe] = useState(primeiroDiaDe(mesAtual())); const [ate, setAte] = useState(ultimoDiaDe(mesAtual()));
  const [por, setPor] = useState<'origem' | 'categoria'>('categoria');
  const [d, setD] = useState<Dre | null>(null); const [erro, setErro] = useState<string | null>(null);
  const [drill, setDrill] = useState<{ tipo: 'receber' | 'pagar'; chave: string; rotulo: string } | null>(null);

  async function gerar(dd = de, aa = ate, pp = por) {
    setErro(null);
    try { setD(await api.get<Dre>(`/financeiro/dre?de=${dd}&ate=${aa}&por=${pp}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  function escolherCompetencia(m: string) {
    setComp(m); if (!m) return;
    const dd = primeiroDiaDe(m), aa = ultimoDiaDe(m); setDe(dd); setAte(aa); gerar(dd, aa);
  }
  function trocarPor(p: 'origem' | 'categoria') { setPor(p); gerar(de, ate, p); }

  // Quando agrupado por origem, traduz a chave; por categoria, mostra o nome como está.
  const rotulo = (chave: string) => (d?.por === 'categoria' ? chave : (t('origem.' + chave) === 'origem.' + chave ? chave : t('origem.' + chave)));

  function exportar(fmt: 'csv' | 'xlsx' = 'csv') {
    if (!d) return;
    const linhas: (string | number)[][] = [
      ...d.receitas.map((l) => [t('dre.receitas'), rotulo(l.origem), l.total]),
      ...d.despesas.map((l) => [t('dre.despesas'), rotulo(l.origem), -l.total]),
    ];
    const cab = [t('dre.grupo'), d.por === 'categoria' ? t('catfin.titulo_s') : t('dre.origem'), t('fin.valor')];
    if (fmt === 'xlsx') baixarExcel('dre_' + por + '_' + de + '_' + ate, cab, linhas, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('dre_' + por + '_' + de + '_' + ate, cab, linhas);
  }

  const margem = d && d.totalReceitas > 0 ? Math.round((d.resultado / d.totalReceitas) * 100) : null;
  const deltaResultado = d && d.anterior ? d.resultado - d.anterior.resultado : null;

  function LinhaDre({ l, tipo, cor }: { l: Linha; tipo: 'receber' | 'pagar'; cor: string }) {
    const tot = tipo === 'receber' ? d!.totalReceitas : d!.totalDespesas;
    const p = pct(l.total, tot);
    return (
      <div className="dre-linha" onClick={() => setDrill({ tipo, chave: l.origem, rotulo: rotulo(l.origem) })} title={t('dre.clique_linha')}>
        <span className="dre-nome">{rotulo(l.origem)}</span>
        <span className="dre-bar"><span style={{ width: p + '%', background: cor }} /></span>
        <span className="dre-pct">{p}%</span>
        <span className="dre-val">{moeda(l.total)}</span>
      </div>
    );
  }

  return (
    <div>
      <CabecalhoRelatorio titulo={t('dre.titulo')} />
      <div className="crumb">{t('rel.crumb_dre')}</div><h1 className="page-titulo">{t('dre.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('dre.sub')}</p>

      <div className="rel-filtro" style={{ alignItems: 'flex-end' }}>
        {!personalizado ? (
          <label className="campo">{t('dre.competencia')}<input type="month" value={comp} onChange={(e) => escolherCompetencia(e.target.value)} /></label>
        ) : (
          <>
            <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
            <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
            <button className="btn-primary" onClick={() => gerar()}>{t('rel.gerar')}</button>
          </>
        )}
        <label className="campo">{t('dre.agrupar')}
          <select value={por} onChange={(e) => trocarPor(e.target.value as 'origem' | 'categoria')}>
            <option value="categoria">{t('dre.por_categoria')}</option>
            <option value="origem">{t('dre.por_origem')}</option>
          </select>
        </label>
        <button className="btn-link" onClick={() => setPersonalizado((v) => !v)}>{personalizado ? t('dre.usar_competencia') : t('dre.periodo_personalizado')}</button>
        {d && <span style={{ marginLeft: 'auto' }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {d && (
        <>
          <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div><div className="kpi-l">{t('dre.receitas')}</div><div className="kpi-v" style={{ color: '#166534' }}>{moeda(d.totalReceitas)}</div></div></div>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-receipt" className="sm" /></div><div><div className="kpi-l">{t('dre.despesas')}</div><div className="kpi-v" style={{ color: '#b91c1c' }}>{moeda(d.totalDespesas)}</div></div></div>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-check" className="sm" /></div><div><div className="kpi-l">{t('dre.resultado')}</div><div className="kpi-v" style={{ color: d.resultado >= 0 ? '#166534' : '#b91c1c' }}>{moeda(d.resultado)}</div></div></div>
            <div className="kpi-card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-chart" className="sm" /></div><div><div className="kpi-l">{t('dre.margem')}</div><div className="kpi-v">{margem != null ? margem + '%' : '—'}</div></div></div>
          </div>

          <div className="card" style={{ maxWidth: 'none' }}>
            <div className="perm-titulo" style={{ color: '#16a34a' }}>{t('dre.receitas')}</div>
            {d.receitas.length === 0 ? <div className="muted" style={{ fontSize: 13, padding: '4px 0' }}>{t('rel.vazio')}</div>
              : d.receitas.map((l) => <LinhaDre key={l.origem} l={l} tipo="receber" cor="#16a34a" />)}
            <div className="dre-total"><span>= {t('dre.total_receitas')}</span><span>{moeda(d.totalReceitas)}</span></div>

            <div className="perm-titulo" style={{ color: '#e1483b', marginTop: 16 }}>{t('dre.despesas')}</div>
            {d.despesas.length === 0 ? <div className="muted" style={{ fontSize: 13, padding: '4px 0' }}>{t('rel.vazio')}</div>
              : d.despesas.map((l) => <LinhaDre key={l.origem} l={l} tipo="pagar" cor="#e1483b" />)}
            <div className="dre-total"><span>= {t('dre.total_despesas')}</span><span>{moeda(d.totalDespesas)}</span></div>

            <div className="dre-resultado">
              <span style={{ fontWeight: 600, fontSize: 15 }}>= {t('dre.resultado_periodo')}</span>
              <span style={{ fontWeight: 600, fontSize: 18, color: d.resultado >= 0 ? '#0f6e56' : '#b91c1c' }}>
                {moeda(d.resultado)}
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
                  {margem != null && `· ${t('dre.margem').toLowerCase()} ${margem}%`}
                  {deltaResultado != null && ` · ${deltaResultado >= 0 ? '+' : ''}${moeda(deltaResultado)} ${t('dre.vs_anterior')}`}
                </span>
              </span>
            </div>
            <div className="muted" style={{ fontSize: 12, textAlign: 'right', marginTop: 8 }}>{t('dre.clique_linha')}</div>
          </div>
        </>
      )}

      {drill && <DrillTitulos de={de} ate={ate} por={por} alvo={drill} onFechar={() => setDrill(null)} />}
    </div>
  );
}

// Modal: títulos pagos que compõem uma linha da DRE.
function DrillTitulos({ de, ate, por, alvo, onFechar }: { de: string; ate: string; por: string; alvo: { tipo: 'receber' | 'pagar'; chave: string; rotulo: string }; onFechar: () => void }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [its, setIts] = useState<TituloDet[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    api.get<TituloDet[]>(`/financeiro/dre/detalhe?de=${de}&ate=${ate}&por=${por}&tipo=${alvo.tipo}&chave=${encodeURIComponent(alvo.chave)}`, token!)
      .then(setIts).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, [alvo]);
  const total = its ? its.reduce((a, x) => a + x.valor, 0) : 0;
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <div className="card-head" style={{ marginBottom: 8 }}><h2 style={{ margin: 0 }}>{t('dre.detalhe_titulo')} · {alvo.rotulo}</h2></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {!its && !erro && <div className="muted">{t('common.carregando')}</div>}
      {its && (
        <div className="card pad0">
          <table className="tabela">
            <thead><tr><th>{t('fin.numero')}</th><th>{t('fin.descricao')}</th><th>{t('fluxo.cli_forn')}</th><th>{t('relfav.pago_em')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th></tr></thead>
            <tbody>
              {its.length === 0 && <tr><td colSpan={5} className="vazio">{t('rel.vazio')}</td></tr>}
              {its.map((x) => (
                <tr key={x.numero}><td style={{ fontWeight: 700 }}>{x.numero}</td><td>{x.descricao}</td><td>{x.pessoaNome ?? '—'}</td><td>{fmtData(x.pagoEm)}</td><td style={{ textAlign: 'right' }}>{moeda(x.valor)}</td></tr>
              ))}
            </tbody>
            {its.length > 0 && <tfoot><tr><td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>{t('rel.total')}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{moeda(total)}</td></tr></tfoot>}
          </table>
        </div>
      )}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}
