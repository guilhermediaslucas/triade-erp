import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from './Toast.js';
import { Ic } from './Icones.js';

interface Grupo { chave: string; icone: string; qtd: number; to: string; }

const hoje0 = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00').getTime();
function diasAteValidade(v: string | null): number | null {
  if (!v) return null;
  return Math.round((new Date(v.slice(0, 10) + 'T00:00:00').getTime() - hoje0()) / 86400000);
}

export function Sino() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [aberto, setAberto] = useState(false);
  // Última contagem de "aguardando separação" — para disparar toast quando aumenta.
  const prevSepRef = useRef<number | null>(null);

  async function carregar() {
    if (!token) return;
    const out: Grupo[] = [];
    try {
      // Pedidos aguardando separação (status aprovado) — para quem tem acesso à Expedição.
      if (temCapability('comercial.pedido.gerenciar')) {
        const peds = await api.get<{ status: string }[]>('/pedidos', token).catch(() => null);
        if (peds) {
          const sep = peds.filter((p) => p.status === 'aprovado').length;
          if (sep > 0) out.push({ chave: 'sino.aguardando_separacao', icone: 'i-box', qtd: sep, to: '/estoque/expedicao' });
          // Toast só quando AUMENTA (chegou pedido novo) e não na primeira carga.
          if (prevSepRef.current !== null && sep > prevSepRef.current) toast(t('sino.toast_nova_separacao'));
          prevSepRef.current = sep;
        }
      }
      if (temCapability('financeiro.receber.listar')) {
        const ag = await api.get<{ linhas: { diasAtraso: number }[] }>('/financeiro/aging-receber', token).catch(() => null);
        const venc = ag ? ag.linhas.filter((l) => l.diasAtraso > 0).length : 0;
        if (venc > 0) out.push({ chave: 'sino.titulos_vencidos', icone: 'i-dollar', qtd: venc, to: '/financeiro/receber' });
      }
      if (temCapability('financeiro.receber.listar')) {
        const rec = await api.get<{ origem: string; status: string }[]>('/financeiro/receber', token).catch(() => null);
        const pend = rec ? rec.filter((x) => x.origem === 'pedido' && x.status === 'aberto').length : 0;
        if (pend > 0) out.push({ chave: 'sino.pendencia_baixa', icone: 'i-receipt', qtd: pend, to: '/financeiro/receber' });
      }
      if (temCapability('relatorios.validade.ver')) {
        const lotes = await api.get<{ validade: string | null }[]>('/relatorios/validade-lotes', token).catch(() => null);
        const vencendo = lotes ? lotes.filter((l) => { const d = diasAteValidade(l.validade); return d !== null && d <= 30; }).length : 0;
        if (vencendo > 0) out.push({ chave: 'sino.lotes_vencendo', icone: 'i-clock', qtd: vencendo, to: '/relatorios/validade' });
      }
      if (temCapability('estoque.saldo.ver')) {
        const pos = await api.get<{ abaixoMinimo: boolean }[]>('/estoque', token).catch(() => null);
        const baixo = pos ? pos.filter((p) => p.abaixoMinimo).length : 0;
        if (baixo > 0) out.push({ chave: 'sino.estoque_baixo', icone: 'i-box', qtd: baixo, to: '/estoque/posicao' });
      }
      if (temCapability('estoque.entrada.criar')) {
        const recs = await api.get<unknown[]>('/estoque/recebimentos', token).catch(() => null);
        const qtd = Array.isArray(recs) ? recs.length : 0;
        if (qtd > 0) out.push({ chave: 'sino.recebimentos', icone: 'i-receipt', qtd, to: '/estoque/recebimento' });
      }
    } catch { /* silencioso */ }
    setGrupos(out);
  }
  useEffect(() => {
    prevSepRef.current = null;          // zera o baseline ao trocar de sessão/empresa
    carregar();
    const id = setInterval(carregar, 60000);   // atualização automática (ao vivo)
    return () => clearInterval(id);
    /* eslint-disable-next-line */
  }, [token]);

  const total = grupos.reduce((a, g) => a + g.qtd, 0);
  function ir(to: string) { setAberto(false); nav(to); }

  return (
    <div className="sino-wrap">
      <button className="sino-btn" onClick={() => setAberto((v) => !v)} title={t('sino.titulo')}>
        <Ic name="i-bell" />{total > 0 && <span className="sino-badge">{total > 99 ? '99+' : total}</span>}
      </button>
      {aberto && (
        <>
          <div className="sino-overlay" onClick={() => setAberto(false)} />
          <div className="sino-painel">
            <div className="sino-cab">{t('sino.titulo')}</div>
            {grupos.length === 0 && <div className="sino-vazio">{t('sino.vazio')}</div>}
            {grupos.map((g) => (
              <button key={g.chave} className="sino-item" onClick={() => ir(g.to)}>
                <span className="sino-ic"><Ic name={g.icone} className="sm" /></span>
                <span className="sino-lbl">{t(g.chave)}</span>
                <span className="sino-qtd">{g.qtd}</span>
              </button>
            ))}
            <button className="sino-item sino-todas" onClick={() => ir('/notificacoes')}>{t('sino.ver_todas')} →</button>
          </div>
        </>
      )}
    </div>
  );
}
