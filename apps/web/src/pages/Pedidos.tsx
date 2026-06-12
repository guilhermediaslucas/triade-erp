import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface PedidoResumo { id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido; total: number; criadoEm: string; formaPagamento: string | null; }

// Colunas do pipeline (cancelado não aparece no quadro). Cores/ícones espelham o mockup.
// "separacao" é exibido como "Aguardando retirada" (decisão do Gui).
const COLUNAS: { s: StatusPedido; cor: string; ic: string; label?: string }[] = [
  { s: 'orcamento', cor: '#94a3b8', ic: 'i-edit' },
  { s: 'aguardando_pagamento', cor: '#f59e0b', ic: 'i-clock' },
  { s: 'aprovado', cor: '#0891b2', ic: 'i-check' },
  { s: 'separacao', cor: '#14b8a6', ic: 'i-clock', label: 'pedidos.col_retirada' },
  { s: 'expedido', cor: '#0ea5e9', ic: 'i-truck' },
  { s: 'entregue', cor: '#16a34a', ic: 'i-check' },
];

function pillForma(f: string | null): string {
  const k = (f ?? '').toLowerCase();
  if (k.includes('pix')) return 'pk-pill pix';
  if (k.includes('bole')) return 'pk-pill boleto';
  if (k.includes('cart')) return 'pk-pill cartao';
  return 'pk-pill';
}

export function Pedidos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<PedidoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [filtro, setFiltro] = useState<{ de: string; ate: string }>({ de: '', ate: '' });
  const noPeriodo = (p: PedidoResumo) => { const d = p.criadoEm.slice(0, 10); if (filtro.de && d < filtro.de) return false; if (filtro.ate && d > filtro.ate) return false; return true; };

  useEffect(() => {
    api.get<PedidoResumo[]>('/pedidos', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  const cancelados = itens.filter((p) => p.status === 'cancelado').length;

  return (
    <div>
      <div className="crumb">{t('pedidos.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('pedidos.titulo')}</h1><div className="muted page-sub">{t('pedidos.kanban_sub')}</div></div>
        {temCapability('comercial.pedido.criar') && <button className="btn-primary" onClick={() => nav('/comercial/pedidos/novo')}>+ {t('pedidos.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar" style={{ alignItems: 'flex-end' }}>
        <label className="campo" style={{ margin: 0 }}>{t('pedidos.data_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('pedidos.data_ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <button className="btn-primary" onClick={() => setFiltro({ de, ate })}><Ic name="i-search" className="sm" /> {t('pedidos.filtrar')}</button>
        <button className="btn-ghost" onClick={() => { setDe(''); setAte(''); setFiltro({ de: '', ate: '' }); }}>{t('fin.f_limpar')}</button>
        <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{t('pedidos.filtro_dica')}</span>
      </div>
      <div className="pk-board">
        {COLUNAS.map((col) => {
          const cards = itens.filter((p) => p.status === col.s && noPeriodo(p));
          return (
            <div key={col.s} className="pk-col" style={{ borderTopColor: col.cor }}>
              <div className="pk-h">
                <span className="pk-nm" style={{ color: col.cor }}><Ic name={col.ic} className="sm" />{col.label ? t(col.label) : t('status.' + col.s)}</span>
                <span className="pk-ct">{cards.length}</span>
              </div>
              <div className="pk-body">
                {cards.map((p) => (
                  <div key={p.id} className="pk-card" onClick={() => nav('/comercial/pedidos/' + p.id)}>
                    <div className="pk-card-top"><b className="pk-num">{numeroPedido(p.numero)}</b><span className="pk-data">{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span></div>
                    <div className="pk-cli">{p.clienteNome ?? '—'}{p.vendedorNome ? ' · ' + p.vendedorNome : ''}</div>
                    <div className="pk-meta"><span className={pillForma(p.formaPagamento)}>{p.formaPagamento ?? '—'}</span><span className="pk-tot">{moeda(p.total)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {cancelados > 0 && <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>{cancelados} {t('pedidos.cancelados_ocultos')}</div>}
    </div>
  );
}
