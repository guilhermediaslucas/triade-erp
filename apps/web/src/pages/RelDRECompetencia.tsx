import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { baixarCsv } from '../lib/csv.js';

interface Linha { categoria: string; contaCodigo: string | null; contaDescricao: string | null; total: number; }
interface Dre { receitas: Linha[]; despesas: Linha[]; totalReceitas: number; totalDespesas: number; resultado: number; }

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const hoje = () => new Date().toISOString().slice(0, 10);
const primeiroDoMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };

export function RelDRECompetencia() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [de, setDe] = useState(primeiroDoMes());
  const [ate, setAte] = useState(hoje());
  const [dre, setDre] = useState<Dre | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setErro(null);
    const qs = new URLSearchParams();
    if (de) qs.set('de', de); if (ate) qs.set('ate', ate);
    try { setDre(await api.get<Dre>('/financeiro/dre-competencia?' + qs.toString(), token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const margem = dre && dre.totalReceitas > 0 ? (dre.resultado / dre.totalReceitas) * 100 : 0;
  const conta = (l: Linha) => (l.contaCodigo ? `${l.contaCodigo}${l.contaDescricao ? ' · ' + l.contaDescricao : ''}` : '—');

  function exportar() {
    if (!dre) return;
    const linhas: (string | number)[][] = [];
    for (const r of dre.receitas) linhas.push([t('dre.receita'), r.categoria, conta(r), r.total]);
    for (const d of dre.despesas) linhas.push([t('dre.despesa'), d.categoria, conta(d), d.total]);
    baixarCsv('dre-competencia', [t('dre.grupo'), t('catfin.nome'), t('catfin.conta_contabil'), t('pedidos.valor')], linhas);
  }

  function tabela(titulo: string, linhas: Linha[], total: number, cor: string) {
    return (
      <div className="card pad0" style={{ marginBottom: 16 }}>
        <div className="card-head" style={{ padding: '14px 16px 4px' }}><h3>{titulo}</h3></div>
        <table className="tabela">
          <thead><tr><th>{t('catfin.nome')}</th><th>{t('catfin.conta_contabil')}</th><th style={{ textAlign: 'right' }}>{t('pedidos.valor')}</th></tr></thead>
          <tbody>
            {linhas.length === 0 && <tr><td colSpan={3} className="vazio">{t('common.nenhum')}</td></tr>}
            {linhas.map((l, i) => (
              <tr key={i}><td>{l.categoria}</td><td className="muted">{conta(l)}</td><td style={{ textAlign: 'right' }}>{moeda(l.total)}</td></tr>
            ))}
            {linhas.length > 0 && <tr><td colSpan={2}><b>{t('dre.total')}</b></td><td style={{ textAlign: 'right' }}><b style={{ color: cor }}>{moeda(total)}</b></td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="crumb">{t('menu.financeiro')} / {t('menu.dre')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('dre.titulo')}</h1><div className="muted page-sub">{t('dre.sub')}</div></div>
        {dre && <button className="btn-ghost" onClick={exportar}><Ic name="i-download" className="sm" /> CSV</button>}
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
          <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.receitas')}</div><div className="kpi-val" style={{ color: '#16a34a' }}>{moeda(dre.totalReceitas)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.despesas')}</div><div className="kpi-val" style={{ color: '#e1483b' }}>{moeda(dre.totalDespesas)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-check" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.resultado')}</div><div className="kpi-val" style={{ color: dre.resultado >= 0 ? '#16a34a' : '#e1483b' }}>{moeda(dre.resultado)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-chart" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('dre.margem')}</div><div className="kpi-val">{margem.toFixed(1)}%</div></div></div>
        </div>
      )}

      {dre && tabela(t('dre.receitas'), dre.receitas, dre.totalReceitas, '#16a34a')}
      {dre && tabela(t('dre.despesas'), dre.despesas, dre.totalDespesas, '#e1483b')}
    </div>
  );
}
