import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

type Faixa = 'a_vencer' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_mais';
interface Linha { id: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string; diasAtraso: number; faixa: Faixa; }
interface Aging { linhas: Linha[]; totais: Record<Faixa, number>; totalAberto: number; }

const FAIXAS: Faixa[] = ['a_vencer', 'd1_30', 'd31_60', 'd61_90', 'd90_mais'];
const estilo: Record<Faixa, any> = {
  a_vencer: { background: '#dcfce7', color: '#166534' },
  d1_30: { background: '#fef9c3', color: '#854d0e' },
  d31_60: { background: '#ffedd5', color: '#c2410c' },
  d61_90: { background: '#fee2e2', color: '#b91c1c' },
  d90_mais: { background: '#fecaca', color: '#7f1d1d' },
};

export function AgingReceber() {
  const { token } = useAuth(); const { t } = useI18n();
  const [data, setData] = useState<Aging | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setData(await api.get<Aging>('/financeiro/aging-receber', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <div>
      <h1 className="page-titulo">{t('aging.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('aging.sub')}</p>
      <div className="rel-filtro">
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {data && data.linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('aging_receber_' + new Date().toISOString().slice(0, 10),
            [t('fin.descricao'), t('fin.pessoa'), t('fin.vencimento'), t('aging.dias_atraso'), t('aging.faixa'), t('fin.valor')],
            data.linhas.map((l) => [l.descricao, l.pessoaNome ?? '', l.vencimento, l.diasAtraso, t('aging.' + l.faixa), l.valor]))}>{t('rel.exportar_csv')}</button> <button className="btn-ghost" onClick={() => baixarExcel('aging_receber_' + new Date().toISOString().slice(0, 10),
            [t('fin.descricao'), t('fin.pessoa'), t('fin.vencimento'), t('aging.dias_atraso'), t('aging.faixa'), t('fin.valor')],
            data.linhas.map((l) => [l.descricao, l.pessoaNome ?? '', l.vencimento, l.diasAtraso, t('aging.' + l.faixa), l.valor]))}>{t('rel.exportar_xlsx')}</button></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {data && (
        <>
          <div className="kpis">
            {FAIXAS.map((f) => (
              <div className="kpi-card" key={f}><div className="kpi-l">{t('aging.' + f)}</div><div className="kpi-v" style={{ fontSize: 18 }}>{moeda(data.totais[f])}</div></div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: -4 }}>{t('aging.total_aberto')}: <b>{moeda(data.totalAberto)}</b></p>
          <div className="card pad0"><table className="tabela">
            <thead><tr><th>{t('fin.descricao')}</th><th>{t('fin.pessoa')}</th><th>{t('fin.vencimento')}</th><th>{t('aging.dias_atraso')}</th><th>{t('aging.faixa')}</th><th>{t('fin.valor')}</th></tr></thead>
            <tbody>
              {data.linhas.length === 0 && <tr><td colSpan={6} className="vazio">{t('aging.vazio')}</td></tr>}
              {data.linhas.map((l) => (
                <tr key={l.id}>
                  <td>{l.descricao}</td><td>{l.pessoaNome ?? '—'}</td><td>{fmt(l.vencimento)}</td>
                  <td>{l.diasAtraso <= 0 ? '—' : <b>{l.diasAtraso} {t('parado.dias')}</b>}</td>
                  <td><span className="pill" style={estilo[l.faixa]}>{t('aging.' + l.faixa)}</span></td>
                  <td>{moeda(l.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </div>
  );
}
