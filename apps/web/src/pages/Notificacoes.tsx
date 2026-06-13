import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Grupo { chave: string; icone: string; tint: string; qtd: number; to: string; }
const hoje0 = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00').getTime();
const diasAteValidade = (v: string | null): number | null => (v ? Math.round((new Date(v.slice(0, 10) + 'T00:00:00').getTime() - hoje0()) / 86400000) : null);

export function Notificacoes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const out: Grupo[] = [];
      try {
        if (temCapability('financeiro.receber.listar')) {
          const ag = await api.get<{ linhas: { diasAtraso: number }[] }>('/financeiro/aging-receber', token).catch(() => null);
          const venc = ag ? ag.linhas.filter((l) => l.diasAtraso > 0).length : 0;
          if (venc > 0) out.push({ chave: 'sino.titulos_vencidos', icone: 'i-dollar', tint: 'tint-rd', qtd: venc, to: '/financeiro/aging-receber' });
          const rec = await api.get<{ origem: string; status: string }[]>('/financeiro/receber', token).catch(() => null);
          const pend = rec ? rec.filter((x) => x.origem === 'pedido' && x.status === 'aberto').length : 0;
          if (pend > 0) out.push({ chave: 'sino.pendencia_baixa', icone: 'i-receipt', tint: 'tint-or', qtd: pend, to: '/financeiro/receber' });
        }
        if (temCapability('relatorios.validade.ver')) {
          const lotes = await api.get<{ validade: string | null }[]>('/relatorios/validade-lotes', token).catch(() => null);
          const vencendo = lotes ? lotes.filter((l) => { const d = diasAteValidade(l.validade); return d !== null && d <= 30; }).length : 0;
          if (vencendo > 0) out.push({ chave: 'sino.lotes_vencendo', icone: 'i-clock', tint: 'tint-or', qtd: vencendo, to: '/relatorios/validade' });
        }
        if (temCapability('estoque.saldo.ver')) {
          const pos = await api.get<{ abaixoMinimo: boolean }[]>('/estoque', token).catch(() => null);
          const baixo = pos ? pos.filter((p) => p.abaixoMinimo).length : 0;
          if (baixo > 0) out.push({ chave: 'sino.estoque_baixo', icone: 'i-box', tint: 'tint-bl', qtd: baixo, to: '/estoque/posicao' });
        }
      } catch { /* silencioso */ }
      setGrupos(out); setCarregando(false);
    })();
    /* eslint-disable-next-line */
  }, [token]);

  return (
    <div>
      <div className="crumb">{t('notif.crumb')}</div><h1 className="page-titulo">{t('notif.titulo')}</h1><p className="muted page-sub">{t('notif.sub')}</p>
      {carregando && <div className="muted">{t('common.carregando')}</div>}
      {!carregando && grupos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}><div style={{ color: '#16a34a' }}><Ic name="i-check" /></div><div className="muted" style={{ marginTop: 8 }}>{t('notif.vazio')}</div></div>
      )}
      <div className="dash-row d3">
        <div className="card">
          <div className="alerts">
            {grupos.map((g) => (
              <Link key={g.chave} to={g.to} className="alert">
                <div className="top"><div className={'kpi-ic sm ' + g.tint}><Ic name={g.icone} className="sm" /></div><div className="big">{g.qtd}</div></div>
                <div className="txt">{t(g.chave)}</div><span className="lnk">{t('dash.ver_todos')} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
