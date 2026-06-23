import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Linha { data: string; formaEntrega: string; total: number; }
type Gran = 'dia' | 'semana' | 'mes';

const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

// Segunda-feira da semana de uma data ISO (para agrupar por semana).
function segundaDaSemana(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dow);
  return d.toISOString().slice(0, 10);
}

export function VolumeEntregas() {
  const { token } = useAuth(); const { t } = useI18n();
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [gran, setGran] = useState<Gran>('dia');
  const [linhas, setLinhas] = useState<Linha[]>([]); const [erro, setErro] = useState<string | null>(null);

  async function gerar(dd = de, aa = ate) {
    setErro(null);
    try { setLinhas(await api.get<Linha[]>(`/relatorios/volume-entregas?de=${dd}&ate=${aa}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  const qtd = linhas.length;
  const total = useMemo(() => linhas.reduce((a, l) => a + l.total, 0), [linhas]);
  const ticket = qtd > 0 ? total / qtd : 0;

  // Rótulo do balde conforme a granularidade.
  function balde(iso: string): { chave: string; rotulo: string } {
    if (gran === 'mes') {
      const chave = iso.slice(0, 7);
      const d = new Date(chave + '-01T00:00:00');
      return { chave, rotulo: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
    }
    if (gran === 'semana') {
      const seg = segundaDaSemana(iso);
      return { chave: seg, rotulo: t('volent.semana_de') + ' ' + fmtData(seg) };
    }
    return { chave: iso, rotulo: fmtData(iso) };
  }

  // Agrupado por período (dia/semana/mês), do mais recente para o mais antigo.
  const porPeriodo = useMemo(() => {
    const m = new Map<string, { rotulo: string; qtd: number; total: number }>();
    for (const l of linhas) { const b = balde(l.data); const e = (m.get(b.chave) ?? { rotulo: b.rotulo, qtd: 0, total: 0 }); e.qtd++; e.total += l.total; m.set(b.chave, e); }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([, v]) => v);
    /* eslint-disable-next-line */
  }, [linhas, gran]);

  // Separado por forma de entrega (modal).
  const porForma = useMemo(() => {
    const m = new Map<string, { qtd: number; total: number }>();
    for (const l of linhas) { const e = (m.get(l.formaEntrega) ?? { qtd: 0, total: 0 }); e.qtd++; e.total += l.total; m.set(l.formaEntrega, e); }
    return [...m.entries()].map(([forma, v]) => ({ forma, ...v })).sort((a, b) => b.total - a.total);
  }, [linhas]);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('volent.periodo'), t('volent.qtd'), t('volent.valor_total'), t('volent.ticket')];
    const dados = porPeriodo.map((p) => [p.rotulo, p.qtd, p.total, p.qtd > 0 ? p.total / p.qtd : 0]);
    const nome = 'volume_entregas_' + de + '_' + ate;
    if (fmt === 'xlsx') baixarExcel(nome, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv(nome, cab, dados);
  }

  const grans: { g: Gran; k: string }[] = [{ g: 'dia', k: 'volent.dia' }, { g: 'semana', k: 'volent.semana' }, { g: 'mes', k: 'volent.mes' }];

  return (
    <div>
      <CabecalhoRelatorio titulo={t('volent.titulo')} />
      <div className="crumb">{t('volent.crumb')}</div><h1 className="page-titulo">{t('volent.titulo')}</h1><p className="muted page-sub">{t('volent.sub')}</p>

      <div className="rel-filtro" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={() => gerar()}>{t('volent.filtrar')}</button>
        <div style={{ display: 'flex', gap: 6 }}>
          {grans.map((x) => <button key={x.g} className={'chip-f' + (gran === x.g ? ' ativo' : '')} onClick={() => setGran(x.g)}>{t(x.k)}</button>)}
        </div>
        {linhas.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>

      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-truck" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('volent.qtd')}</div><div className="kpi-val">{qtd}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('volent.valor_total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('volent.ticket')}</div><div className="kpi-val">{moeda(ticket)}</div></div></div>
      </div>

      <div className="card pad0" style={{ marginBottom: 16 }}><table className="tabela">
        <thead><tr><th>{t('volent.periodo')}</th><th>{t('volent.qtd')}</th><th>{t('volent.valor_total')}</th><th>{t('volent.ticket')}</th></tr></thead>
        <tbody>
          {porPeriodo.length === 0 && <tr><td colSpan={4} className="vazio">{t('rel.vazio')}</td></tr>}
          {porPeriodo.map((p, i) => (
            <tr key={i}><td><b style={{ textTransform: 'capitalize' }}>{p.rotulo}</b></td><td>{p.qtd}</td><td>{moeda(p.total)}</td><td>{moeda(p.qtd > 0 ? p.total / p.qtd : 0)}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h2 className="page-sub" style={{ fontWeight: 600, margin: '0 0 8px' }}>{t('volent.por_forma')}</h2>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('entrega.forma')}</th><th>{t('volent.qtd')}</th><th>{t('volent.valor_total')}</th><th>{t('volent.ticket')}</th></tr></thead>
        <tbody>
          {porForma.length === 0 && <tr><td colSpan={4} className="vazio">{t('rel.vazio')}</td></tr>}
          {porForma.map((p) => (
            <tr key={p.forma}><td>{t('entrega.' + p.forma)}</td><td>{p.qtd}</td><td>{moeda(p.total)}</td><td>{moeda(p.qtd > 0 ? p.total / p.qtd : 0)}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
