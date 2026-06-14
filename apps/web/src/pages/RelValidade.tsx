import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Lote { produtoId: string; produto: string; lote: string | null; validade: string | null; saldo: number; custoUnitario: number; valor: number; }
type Situacao = 'vencido' | 'critico' | 'atencao' | 'ok' | 'sem';

const hojeISO = () => new Date().toISOString().slice(0, 10);
function diasPara(validade: string | null): number | null {
  if (!validade) return null;
  const ms = new Date(validade + 'T00:00:00').getTime() - new Date(hojeISO() + 'T00:00:00').getTime();
  return Math.round(ms / 86400000);
}
function situacaoDe(d: number | null): Situacao {
  if (d === null) return 'sem';
  if (d < 0) return 'vencido';
  if (d <= 30) return 'critico';
  if (d <= 90) return 'atencao';
  return 'ok';
}
const estilo: Record<Situacao, { cls: string; st?: any }> = {
  vencido: { cls: 'pill', st: { background: '#fee2e2', color: '#b91c1c' } },
  critico: { cls: 'pill', st: { background: '#ffedd5', color: '#c2410c' } },
  atencao: { cls: 'pill st-laranja' },
  ok: { cls: 'pill st-verde' },
  sem: { cls: 'pill' },
};

export function RelValidade() {
  const { token } = useAuth(); const { t } = useI18n();
  const [todas, setTodas] = useState<Lote[]>([]);
  const [soVencer, setSoVencer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setTodas(await api.get<Lote[]>('/relatorios/validade-lotes', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  const linhas = useMemo(() => {
    const com = todas.map((l) => { const d = diasPara(l.validade); return { ...l, dias: d, sit: situacaoDe(d) }; });
    return soVencer ? com.filter((l) => l.sit === 'vencido' || l.sit === 'critico' || l.sit === 'atencao') : com;
  }, [todas, soVencer]);

  const kpiVencidos = useMemo(() => {
    const v = todas.map((l) => ({ l, s: situacaoDe(diasPara(l.validade)) })).filter((x) => x.s === 'vencido');
    return { qtd: v.length, valor: v.reduce((a, x) => a + x.l.valor, 0) };
  }, [todas]);
  const kpiCriticos = useMemo(() => todas.filter((l) => situacaoDe(diasPara(l.validade)) === 'critico').length, [todas]);

  return (
    <div>
      <CabecalhoRelatorio titulo={t('rel.validade')} />
      <div className="crumb">{t('rel.crumb_validade')}</div><h1 className="page-titulo">{t('rel.validade')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('rel.validade_sub')}</p>
      <div className="rel-filtro">
        <label className="campo" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={soVencer} onChange={(e) => setSoVencer(e.target.checked)} /> {t('validade.so_vencer')}
        </label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('validade_lotes_' + hojeISO(),
            [t('precos.produto'), t('estoque.lote'), t('estoque.validade'), t('validade.dias'), t('rel.saldo'), t('rel.valor'), t('validade.situacao')],
            linhas.map((l) => [l.produto, l.lote ?? '', l.validade ?? '', l.dias ?? '', l.saldo, l.valor, t('validade.' + l.sit)]))}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => baixarExcel('validade_lotes_' + hojeISO(),
            [t('precos.produto'), t('estoque.lote'), t('estoque.validade'), t('validade.dias'), t('rel.saldo'), t('rel.valor'), t('validade.situacao')],
            linhas.map((l) => [l.produto, l.lote ?? '', l.validade ?? '', l.dias ?? '', l.saldo, l.valor, t('validade.' + l.sit)]))} /></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-clock" className="sm" /></div><div><div className="kpi-l">{t('validade.kpi_vencidos')}</div><div className="kpi-v">{kpiVencidos.qtd}</div><div className="kpi-sub">{moeda(kpiVencidos.valor)}</div></div></div>
        <div className="kpi-card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-alert" className="sm" /></div><div><div className="kpi-l">{t('validade.kpi_criticos')}</div><div className="kpi-v">{kpiCriticos}</div></div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('estoque.lote')}</th><th>{t('estoque.validade')}</th><th>{t('validade.dias')}</th><th>{t('rel.saldo')}</th><th>{t('rel.valor')}</th><th>{t('validade.situacao')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={7} className="vazio">{t('rel.vazio')}</td></tr>}
          {linhas.map((l, i) => (
            <tr key={l.produtoId + '_' + (l.lote ?? '') + '_' + i}>
              <td>{l.produto}</td><td>{l.lote ?? '—'}</td>
              <td>{l.validade ? new Date(l.validade + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
              <td>{l.dias === null ? '—' : (l.dias < 0 ? t('validade.ha_dias').replace('{n}', String(-l.dias)) : l.dias)}</td>
              <td><b>{l.saldo}</b></td><td>{moeda(l.valor)}</td>
              <td><span className={estilo[l.sit].cls} style={estilo[l.sit].st}>{t('validade.' + l.sit)}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
