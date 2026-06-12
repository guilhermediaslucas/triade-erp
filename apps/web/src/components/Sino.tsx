import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Grupo { chave: string; icone: string; qtd: number; to: string; }

const hoje0 = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00').getTime();
function diasAteValidade(v: string | null): number | null {
  if (!v) return null;
  return Math.round((new Date(v.slice(0, 10) + 'T00:00:00').getTime() - hoje0()) / 86400000);
}

export function Sino() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [aberto, setAberto] = useState(false);

  async function carregar() {
    if (!token) return;
    const out: Grupo[] = [];
    try {
      if (temCapability('financeiro.receber.listar')) {
        const ag = await api.get<{ linhas: { diasAtraso: number }[] }>('/financeiro/aging-receber', token).catch(() => null);
        const venc = ag ? ag.linhas.filter((l) => l.diasAtraso > 0).length : 0;
        if (venc > 0) out.push({ chave: 'sino.titulos_vencidos', icone: '💸', qtd: venc, to: '/financeiro/aging-receber' });
      }
      if (temCapability('financeiro.receber.listar')) {
        const rec = await api.get<{ origem: string; status: string }[]>('/financeiro/receber', token).catch(() => null);
        const pend = rec ? rec.filter((x) => x.origem === 'pedido' && x.status === 'aberto').length : 0;
        if (pend > 0) out.push({ chave: 'sino.pendencia_baixa', icone: '🧾', qtd: pend, to: '/financeiro/receber' });
      }
      if (temCapability('relatorios.ver')) {
        const lotes = await api.get<{ validade: string | null }[]>('/relatorios/validade-lotes', token).catch(() => null);
        const vencendo = lotes ? lotes.filter((l) => { const d = diasAteValidade(l.validade); return d !== null && d <= 30; }).length : 0;
        if (vencendo > 0) out.push({ chave: 'sino.lotes_vencendo', icone: '⏳', qtd: vencendo, to: '/relatorios/validade' });
      }
      if (temCapability('estoque.saldo.ver')) {
        const pos = await api.get<{ abaixoMinimo: boolean }[]>('/estoque', token).catch(() => null);
        const baixo = pos ? pos.filter((p) => p.abaixoMinimo).length : 0;
        if (baixo > 0) out.push({ chave: 'sino.estoque_baixo', icone: '📦', qtd: baixo, to: '/estoque/posicao' });
      }
    } catch { /* silencioso */ }
    setGrupos(out);
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [token]);

  const total = grupos.reduce((a, g) => a + g.qtd, 0);
  function ir(to: string) { setAberto(false); nav(to); }

  return (
    <div className="sino-wrap">
      <button className="sino-btn" onClick={() => setAberto((v) => !v)} title={t('sino.titulo')}>
        🔔{total > 0 && <span className="sino-badge">{total > 99 ? '99+' : total}</span>}
      </button>
      {aberto && (
        <>
          <div className="sino-overlay" onClick={() => setAberto(false)} />
          <div className="sino-painel">
            <div className="sino-cab">{t('sino.titulo')}</div>
            {grupos.length === 0 && <div className="sino-vazio">{t('sino.vazio')}</div>}
            {grupos.map((g) => (
              <button key={g.chave} className="sino-item" onClick={() => ir(g.to)}>
                <span className="sino-ic">{g.icone}</span>
                <span className="sino-lbl">{t(g.chave)}</span>
                <span className="sino-qtd">{g.qtd}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
