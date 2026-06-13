import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido } from '../lib/pedido.js';

// Painel de vendas em "Modo TV": tela cheia, sem menu, números grandes e
// atualização automática — feito para deixar rodando numa televisão.
interface Resumo {
  vendasDia: number; vendasSemana: number; vendasMes: number; vendasAno: number;
  receberAberto: number; saldoCaixa: number; estoqueBaixo: number;
  pedidosPorStatus: { status: string; quantidade: number }[];
  topProdutos: { nome: string; quantidade: number; valor: number }[];
  pedidosRecentes: { numero: number; cliente: string; valor: number; status: string; data: string }[];
}

const REFRESH_MS = 45000;

export function DashboardTV() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { branding } = useBranding();
  const nav = useNavigate();
  const [d, setD] = useState<Resumo | null>(null);
  const [hora, setHora] = useState(new Date());
  const [atualizado, setAtualizado] = useState<Date | null>(null);

  async function carregar() {
    try { setD(await api.get<Resumo>('/dashboard', token!)); setAtualizado(new Date()); } catch { /* mantém */ }
  }
  useEffect(() => {
    carregar();
    const r = setInterval(carregar, REFRESH_MS);
    const c = setInterval(() => setHora(new Date()), 1000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nav('/'); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(r); clearInterval(c); window.removeEventListener('keydown', onKey); };
    /* eslint-disable-next-line */
  }, []);

  const aguardSep = d?.pedidosPorStatus.find((p) => p.status === 'aprovado')?.quantidade ?? 0;
  const hhmmss = (x: Date) => x.toLocaleTimeString('pt-BR');

  return (
    <div className="tv">
      <div className="tv-top">
        <div className="tv-marca">
          {branding?.logo ? <img src={branding.logo} alt="" className="tv-logo" /> : null}
          <div>
            <div className="tv-titulo">{t('tv.titulo')}</div>
            <div className="tv-empresa">{branding?.fantasia ?? ''}</div>
          </div>
        </div>
        <div className="tv-top-dir">
          <div className="tv-relogio">{hhmmss(hora)}</div>
          <div className="tv-data">{hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
          {atualizado && <div className="tv-upd">{t('tv.atualizado')} {hhmmss(atualizado)}</div>}
          <button className="tv-sair" onClick={() => nav('/')}>{t('tv.sair')} (Esc)</button>
        </div>
      </div>

      {!d ? <div className="tv-load">{t('common.carregando')}</div> : (
        <>
          <div className="tv-kpis">
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.dia')}</div><div className="tv-kpi-val">{moeda(d.vendasDia)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.semana')}</div><div className="tv-kpi-val">{moeda(d.vendasSemana)}</div></div>
            <div className="tv-kpi tv-destaque"><div className="tv-kpi-lbl">{t('tv.mes')}</div><div className="tv-kpi-val">{moeda(d.vendasMes)}</div></div>
            <div className="tv-kpi"><div className="tv-kpi-lbl">{t('tv.ano')}</div><div className="tv-kpi-val">{moeda(d.vendasAno)}</div></div>
          </div>

          <div className="tv-mid">
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.receber')}</div><div className="tv-mini-val">{moeda(d.receberAberto)}</div></div>
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.caixa')}</div><div className="tv-mini-val">{moeda(d.saldoCaixa)}</div></div>
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.aguard_sep')}</div><div className="tv-mini-val">{aguardSep}</div></div>
            <div className="tv-card tv-mini"><div className="tv-mini-lbl">{t('tv.estoque_baixo')}</div><div className={'tv-mini-val' + (d.estoqueBaixo > 0 ? ' tv-alerta' : '')}>{d.estoqueBaixo}</div></div>
          </div>

          <div className="tv-cols">
            <div className="tv-card">
              <div className="tv-card-h">{t('tv.top_produtos')}</div>
              {(d.topProdutos ?? []).slice(0, 6).map((p, i) => (
                <div key={i} className="tv-lin"><span className="tv-rank">{i + 1}</span><span className="tv-lin-nm">{p.nome}</span><span className="tv-lin-q">{p.quantidade}</span><span className="tv-lin-v">{moeda(p.valor)}</span></div>
              ))}
              {(d.topProdutos ?? []).length === 0 && <div className="tv-vazio">—</div>}
            </div>
            <div className="tv-card">
              <div className="tv-card-h">{t('tv.recentes')}</div>
              {(d.pedidosRecentes ?? []).slice(0, 6).map((p, i) => (
                <div key={i} className="tv-lin"><span className="tv-lin-nm"><b>{numeroPedido(p.numero)}</b> · {p.cliente}</span><span className="tv-lin-st">{t('status.' + p.status)}</span><span className="tv-lin-v">{moeda(p.valor)}</span></div>
              ))}
              {(d.pedidosRecentes ?? []).length === 0 && <div className="tv-vazio">—</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
