import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';

interface Linha { produtoId: string; produto: string; saldo: number; valor: number; ultimaSaida: string | null; }

const hoje0 = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00').getTime();
function diasParado(ultimaSaida: string | null): number | null {
  if (!ultimaSaida) return null; // nunca teve saída
  return Math.round((hoje0() - new Date(ultimaSaida.slice(0, 10) + 'T00:00:00').getTime()) / 86400000);
}

export function RelEstoqueParado() {
  const { token } = useAuth(); const { t } = useI18n();
  const [todas, setTodas] = useState<Linha[]>([]);
  const [limite, setLimite] = useState(30); // dias sem vender
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    try { setTodas(await api.get<Linha[]>('/relatorios/estoque-parado', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);

  const linhas = useMemo(() => {
    return todas.map((l) => ({ ...l, dias: diasParado(l.ultimaSaida) }))
      .filter((l) => l.dias === null || l.dias >= limite);
  }, [todas, limite]);

  const valorParado = useMemo(() => linhas.reduce((a, l) => a + l.valor, 0), [linhas]);

  return (
    <div>
      <h1 className="page-titulo">{t('rel.parado')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('rel.parado_sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('parado.limite')}
          <select value={limite} onChange={(e) => setLimite(Number(e.target.value))}>
            <option value={0}>{t('parado.todos')}</option>
            <option value={30}>30 {t('parado.dias')}</option>
            <option value={60}>60 {t('parado.dias')}</option>
            <option value={90}>90 {t('parado.dias')}</option>
          </select>
        </label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
        {linhas.length > 0 && (
          <button className="btn-ghost" onClick={() => baixarCsv('estoque_parado_' + new Date().toISOString().slice(0, 10),
            [t('precos.produto'), t('rel.saldo'), t('rel.valor'), t('parado.ultima_saida'), t('parado.dias_parado')],
            linhas.map((l) => [l.produto, l.saldo, l.valor, l.ultimaSaida ? l.ultimaSaida.slice(0, 10) : t('parado.nunca'), l.dias ?? t('parado.nunca')]))}>{t('rel.exportar')}</button>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card"><div className="kpi-l">{t('parado.kpi_itens')}</div><div className="kpi-v">{linhas.length}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('parado.kpi_valor')}</div><div className="kpi-v">{moeda(valorParado)}</div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('rel.saldo')}</th><th>{t('rel.valor')}</th><th>{t('parado.ultima_saida')}</th><th>{t('parado.dias_parado')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={5} className="vazio">{t('rel.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.produtoId}>
              <td>{l.produto}</td><td><b>{l.saldo}</b></td><td>{moeda(l.valor)}</td>
              <td>{l.ultimaSaida ? new Date(l.ultimaSaida).toLocaleDateString('pt-BR') : <span className="pill" style={{ background: '#fee2e2', color: '#b91c1c' }}>{t('parado.nunca')}</span>}</td>
              <td>{l.dias === null ? '—' : <b>{l.dias} {t('parado.dias')}</b>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
