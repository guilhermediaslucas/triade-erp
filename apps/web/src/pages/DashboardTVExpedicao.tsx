import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { numeroPedido } from '../lib/pedido.js';
import { TVAcoes } from '../components/TVAcoes.js';
import { SpriteIcones } from '../components/Icones.js';

// Painel de Expedição em "Modo TV": pedidos por etapa do fluxo, em tela cheia.
interface PedidoResumo { id: string; numero: number; clienteNome: string | null; status: string; }
interface Recebimento { id: string; fornecedorNome: string | null; produtoNome: string; status: string; }
const REFRESH_MS = 30000;

export function DashboardTVExpedicao() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { branding } = useBranding();
  const nav = useNavigate();
  const [peds, setPeds] = useState<PedidoResumo[]>([]);
  const [receb, setReceb] = useState<Recebimento[]>([]);
  const [hora, setHora] = useState(new Date());
  const [atualizado, setAtualizado] = useState<Date | null>(null);

  async function carregar() {
    try {
      const [p, r] = await Promise.all([
        api.get<PedidoResumo[]>('/pedidos', token!),
        api.get<Recebimento[]>('/estoque/recebimentos', token!).catch(() => [] as Recebimento[]),
      ]);
      setPeds(p); setReceb((r ?? []).filter((x) => x.status === 'pendente')); setAtualizado(new Date());
    } catch { /* mantém */ }
  }
  useEffect(() => {
    carregar();
    const a = setInterval(carregar, REFRESH_MS);
    const c = setInterval(() => setHora(new Date()), 1000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nav('/'); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(a); clearInterval(c); window.removeEventListener('keydown', onKey); };
    /* eslint-disable-next-line */
  }, []);

  const porStatus = (st: string) => peds.filter((p) => p.status === st);
  const hhmmss = (x: Date) => x.toLocaleTimeString('pt-BR');

  const colPedidos = (st: string) => {
    const lista = porStatus(st);
    return <>
      <div className="tve-ct">{lista.length}</div>
      <div className="tve-lst">
        {lista.slice(0, 10).map((p) => <div key={p.id} className="tve-lin"><b>{numeroPedido(p.numero)}</b><span>{p.clienteNome ?? '—'}</span></div>)}
        {lista.length === 0 && <div className="tv-vazio">—</div>}
      </div>
    </>;
  };

  return (
    <div className="tv">
      <SpriteIcones />
      <div className="tv-top">
        <div className="tv-marca">
          {branding?.logo ? <img src={branding.logo} alt="" className="tv-logo" /> : null}
          <div>
            <div className="tv-titulo"><span className="tv-wordmark">TR<span className="tv-rm-i">Í</span>ADE <span className="tv-rm-erp">ERP</span></span><span className="tv-sep"> · {t('tve.titulo')}</span></div>
            <div className="tv-empresa">{branding?.fantasia ?? ''}</div>
          </div>
        </div>
        <div className="tv-top-dir">
          <div className="tv-relogio">{hhmmss(hora)}</div>
          <div className="tv-data">{hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
          {atualizado && <div className="tv-upd">{t('tv.atualizado')} {hhmmss(atualizado)}</div>}
          <TVAcoes />
        </div>
      </div>

      <div className="tve-board">
        <div className="tv-card tve-col" style={{ borderTopColor: '#a855f7' }}>
          <div className="tve-h">{t('tve.entrar_nota')}</div>
          <div className="tve-ct">{receb.length}</div>
          <div className="tve-lst">
            {receb.slice(0, 10).map((r) => <div key={r.id} className="tve-lin"><b>{r.produtoNome}</b><span>{r.fornecedorNome ?? '—'}</span></div>)}
            {receb.length === 0 && <div className="tv-vazio">—</div>}
          </div>
        </div>
        <div className="tv-card tve-col" style={{ borderTopColor: '#0891b2' }}><div className="tve-h">{t('tve.aguard_sep')}</div>{colPedidos('aprovado')}</div>
        <div className="tv-card tve-col" style={{ borderTopColor: '#7c3aed' }}><div className="tve-h">{t('tve.aguard_exp')}</div>{colPedidos('separacao')}</div>
        <div className="tv-card tve-col" style={{ borderTopColor: '#0ea5e9' }}><div className="tve-h">{t('tve.aguard_ent')}</div>{colPedidos('expedido')}</div>
      </div>
    </div>
  );
}
