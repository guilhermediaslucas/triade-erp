import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { FiltrosModal } from '../components/FiltrosModal.js';

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
  if (k.includes('link')) return 'pk-pill pix';
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
  const [fCli, setFCli] = useState(''); const [fVend, setFVend] = useState(''); const [fForma, setFForma] = useState('');
  const [busca, setBusca] = useState('');
  async function buscarNumero(e?: FormEvent) {
    e?.preventDefault();
    const n = Number(busca.replace(/\D/g, ''));
    if (!n) return;
    setErro(null);
    const achado = itens.find((p) => p.numero === n);
    if (achado) { nav('/comercial/pedidos/' + achado.id); return; }
    try { const p = await api.get<{ id: string }>('/pedidos/numero/' + n, token!); nav('/comercial/pedidos/' + p.id); }
    catch (er) { setErro((er as ErroApi).chaveI18n); }
  }
  const passa = (p: PedidoResumo) => {
    const d = p.criadoEm.slice(0, 10);
    if (de && d < de) return false;
    if (ate && d > ate) return false;
    if (fCli && !(p.clienteNome ?? '').toLowerCase().includes(fCli.toLowerCase())) return false;
    if (fVend && !(p.vendedorNome ?? '').toLowerCase().includes(fVend.toLowerCase())) return false;
    if (fForma && (p.formaPagamento ?? '') !== fForma) return false;
    return true;
  };

  useEffect(() => {
    api.get<PedidoResumo[]>('/pedidos', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  const cancelados = itens.filter((p) => p.status === 'cancelado').length;
  const clientes = useMemo(() => Array.from(new Set(itens.map((p) => p.clienteNome).filter(Boolean))) as string[], [itens]);
  const vendedores = useMemo(() => Array.from(new Set(itens.map((p) => p.vendedorNome).filter(Boolean))) as string[], [itens]);
  const formas = useMemo(() => Array.from(new Set(itens.map((p) => p.formaPagamento).filter(Boolean))) as string[], [itens]);
  const flags = [!!de, !!ate, !!fCli, !!fVend, !!fForma];
  const qtdFiltros = flags.filter(Boolean).length;
  function limparFiltros() { setDe(''); setAte(''); setFCli(''); setFVend(''); setFForma(''); }

  return (
    <div>
      <div className="crumb">{t('pedidos.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('pedidos.titulo')}</h1><div className="muted page-sub">{t('pedidos.kanban_sub')}</div></div>
        {temCapability('comercial.pedido.criar') && <button className="btn-primary" onClick={() => nav('/comercial/pedidos/novo')}>+ {t('pedidos.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar" style={{ alignItems: 'center' }}>
        <form className="busca-num" onSubmit={buscarNumero}>
          <Ic name="i-search" className="sm" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('pedidos.busca_num_ph')} />
          <button type="submit" className="btn-primary btn-mini">{t('pedidos.busca_num_btn')}</button>
        </form>
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} titulo={t('pedidos.titulo')}>
          <label className="campo">{t('pedidos.data_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('pedidos.data_ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
          <label className="campo">{t('pedidos.cliente')}
            <input list="dlPedCli" value={fCli} onChange={(e) => setFCli(e.target.value)} placeholder={t('fin.f_pessoa_ph')} />
            <datalist id="dlPedCli">{clientes.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="campo">{t('pedidos.vendedor')}
            <input list="dlPedVend" value={fVend} onChange={(e) => setFVend(e.target.value)} placeholder={t('fin.f_pessoa_ph')} />
            <datalist id="dlPedVend">{vendedores.map((v) => <option key={v} value={v} />)}</datalist>
          </label>
          <label className="campo">{t('pedidos.forma_pgto')}
            <select value={fForma} onChange={(e) => setFForma(e.target.value)}>
              <option value="">{t('fin.f_todos')}</option>{formas.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </FiltrosModal>
        <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{t('pedidos.filtro_dica')}</span>
      </div>
      <div className="pk-board">
        {COLUNAS.map((col) => {
          const cards = itens.filter((p) => p.status === col.s && passa(p));
          return (
            <div key={col.s} className="pk-col" style={{ borderTopColor: col.cor }}>
              <div className="pk-h">
                <span className="pk-nm" style={{ color: col.cor }}><Ic name={col.ic} className="sm" />{col.label ? t(col.label) : t('status.' + col.s)}</span>
                <span className="pk-ct">{cards.length}</span>
              </div>
              <div className="pk-body">
                {cards.map((p) => (
                  <div key={p.id} className="pk-card" onClick={() => nav('/comercial/pedidos/' + p.id)}>
                    <div className="pk-card-top">
                      <b className="pk-num">{numeroPedido(p.numero)}</b>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="pk-data">{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span>
                        {p.status === 'orcamento' && temCapability('comercial.pedido.criar') && (
                          <button className="pk-edit" title={t('pedido.editar')} aria-label={t('pedido.editar')}
                            onClick={(e) => { e.stopPropagation(); nav('/comercial/pedidos/' + p.id + '/editar'); }}><Ic name="i-edit" className="sm" /></button>
                        )}
                      </span>
                    </div>
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
