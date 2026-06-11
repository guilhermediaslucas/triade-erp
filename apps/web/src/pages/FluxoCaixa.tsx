import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Mov { data: string; tipo: 'entrada' | 'saida'; descricao: string; pessoaNome: string | null; valor: number; formaPagamento: string | null; }

export function FluxoCaixa() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [movs, setMovs] = useState<Mov[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Mov[]>('/financeiro/fluxo', token!).then(setMovs).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  const { entradas, saidas, saldo } = useMemo(() => {
    const e = movs.filter((m) => m.tipo === 'entrada').reduce((a, m) => a + m.valor, 0);
    const s = movs.filter((m) => m.tipo === 'saida').reduce((a, m) => a + m.valor, 0);
    return { entradas: e, saidas: s, saldo: e - s };
  }, [movs]);

  return (
    <div>
      <div className="crumb">{t('fluxo.crumb')}</div><h1 className="page-titulo">{t('fluxo.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('fluxo.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kpis">
        <div className="kpi-card"><div className="kpi-l">{t('fluxo.entradas')}</div><div className="kpi-v" style={{ color: '#15803d' }}>{moeda(entradas)}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('fluxo.saidas')}</div><div className="kpi-v" style={{ color: '#b91c1c' }}>{moeda(saidas)}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('fluxo.saldo')}</div><div className="kpi-v" style={{ color: saldo >= 0 ? '#15803d' : '#b91c1c' }}>{moeda(saldo)}</div></div>
      </div>
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('fin.vencimento')}</th><th>{t('fin.descricao')}</th><th>{t('pedidos.forma_pgto')}</th><th>{t('fluxo.entrada')}</th><th>{t('fluxo.saida')}</th></tr></thead>
        <tbody>
          {movs.length === 0 && <tr><td colSpan={5} className="vazio">{t('fluxo.vazio')}</td></tr>}
          {movs.map((m, i) => (
            <tr key={i}>
              <td>{new Date(m.data).toLocaleDateString('pt-BR')}</td>
              <td>{m.descricao}{m.pessoaNome ? <span className="muted"> · {m.pessoaNome}</span> : null}</td>
              <td>{m.formaPagamento ?? '—'}</td>
              <td style={{ color: '#15803d' }}>{m.tipo === 'entrada' ? moeda(m.valor) : ''}</td>
              <td style={{ color: '#b91c1c' }}>{m.tipo === 'saida' ? moeda(m.valor) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
