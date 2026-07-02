import { useEffect, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido, PROXIMOS, type StatusPedido } from '../lib/pedido.js';
import { ModalDataEntrega, ModalFormaEnvio } from '../components/ExpedicaoModais.js';
import { Ic } from '../components/Icones.js';

interface PedidoResumo { id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido; total: number; criadoEm: string; formaPagamento: string | null; formaEntrega: string; }
interface MotoboyItem { id: string; nome: string; ativo: boolean; }

// Colunas do pipeline (cores/ícones/labels espelham o mockup de Expedição).
const COLUNAS: { s: StatusPedido; cor: string; ic: string; label: string }[] = [
  { s: 'orcamento', cor: '#94a3b8', ic: 'i-edit', label: 'status.orcamento' },
  { s: 'aguardando_pagamento', cor: '#f59e0b', ic: 'i-clock', label: 'status.aguardando_pagamento' },
  { s: 'aprovado', cor: '#0891b2', ic: 'i-check', label: 'expedicao.col_aguard_sep' },
  { s: 'separacao', cor: '#7c3aed', ic: 'i-box', label: 'status.separacao' },
  { s: 'expedido', cor: '#0ea5e9', ic: 'i-truck', label: 'status.expedido' },
  { s: 'entregue', cor: '#16a34a', ic: 'i-check', label: 'status.entregue' },
];

function pillForma(f: string | null): string {
  const k = (f ?? '').toLowerCase();
  if (k.includes('pix')) return 'pk-pill pix';
  if (k.includes('link')) return 'pk-pill pix';
  if (k.includes('bole')) return 'pk-pill boleto';
  if (k.includes('cart')) return 'pk-pill cartao';
  return 'pk-pill';
}

export function KanbanExpedicao() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<PedidoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<StatusPedido | null>(null);
  const [motoboys, setMotoboys] = useState<MotoboyItem[]>([]);
  const [pend, setPend] = useState<{ tipo: 'envio' | 'entrega'; id: string; numero: number } | null>(null);
  const filtroSalvo = (() => { try { return JSON.parse(localStorage.getItem('triade_exp_filtro') || '{}') as { de?: string; ate?: string }; } catch { return {}; } })();
  const [de, setDe] = useState(filtroSalvo.de || ''); const [ate, setAte] = useState(filtroSalvo.ate || '');
  const [filtro, setFiltro] = useState<{ de: string; ate: string }>({ de: filtroSalvo.de || '', ate: filtroSalvo.ate || '' });
  useEffect(() => { try { localStorage.setItem('triade_exp_filtro', JSON.stringify(filtro)); } catch { /* ignora */ } }, [filtro]);
  const noPeriodo = (p: PedidoResumo) => { const d = p.criadoEm.slice(0, 10); if (filtro.de && d < filtro.de) return false; if (filtro.ate && d > filtro.ate) return false; return true; };

  async function carregar() { try { setItens(await api.get('/pedidos', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => {
    carregar();
    if (temCapability('cadastros.motoboy.listar')) api.get<MotoboyItem[]>('/motoboys', token!).then((l) => setMotoboys(l.filter((m) => m.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  function patch(id: string, col: StatusPedido, extra?: Record<string, string>) {
    setErro(null);
    api.patch('/pedidos/' + id + '/status', { status: col, ...extra }, token!).then(carregar).catch((e) => { setErro((e as ErroApi).chaveI18n); carregar(); });
  }
  function onDrop(col: StatusPedido) {
    setSobre(null);
    const id = arrastando; setArrastando(null);
    if (!id) return;
    const ped = itens.find((p) => p.id === id);
    if (!ped || ped.status === col) return;
    if (!PROXIMOS[ped.status].includes(col)) { setErro('pedido.transicao_invalida'); return; }
    // Expedido/Entregue pedem dados antes de confirmar (mockup): forma de envio / data de entrega.
    if (col === 'expedido') { setPend({ tipo: 'envio', id, numero: ped.numero }); return; }
    if (col === 'entregue') { setPend({ tipo: 'entrega', id, numero: ped.numero }); return; }
    patch(id, col);
  }

  return (
    <div>
      <div className="crumb">{t('expedicao.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('expedicao.titulo')}</h1><div className="muted page-sub">{t('expedicao.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar" style={{ alignItems: 'flex-end' }}>
        <label className="campo" style={{ margin: 0 }}>{t('pedidos.data_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('pedidos.data_ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <button className="btn-primary" onClick={() => setFiltro({ de, ate })}><Ic name="i-search" className="sm" /> {t('pedidos.filtrar')}</button>
        <button className="btn-ghost btn-hoje" onClick={() => { const h = new Date().toISOString().slice(0, 10); setDe(h); setAte(h); setFiltro({ de: h, ate: h }); }}>{t('pedidos.hoje')}</button>
        <button className="btn-ghost" onClick={() => { setDe(''); setAte(''); setFiltro({ de: '', ate: '' }); }}>{t('fin.f_limpar')}</button>
        <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{t('pedidos.filtro_dica')}</span>
      </div>
      <div className="pk-board">
        {COLUNAS.map((col) => {
          const cards = itens.filter((p) => p.status === col.s && noPeriodo(p));
          return (
            <div key={col.s} className="pk-col" style={{ borderTopColor: col.cor, outline: sobre === col.s ? '2px solid ' + col.cor : 'none' }}
              onDragOver={(e: DragEvent) => { e.preventDefault(); setSobre(col.s); }}
              onDragLeave={() => setSobre((x) => (x === col.s ? null : x))}
              onDrop={() => onDrop(col.s)}>
              <div className="pk-h">
                <span className="pk-nm" style={{ color: col.cor }}><Ic name={col.ic} className="sm" />{t(col.label)}</span>
                <span className="pk-ct">{cards.length}</span>
              </div>
              <div className="pk-body">
                {cards.map((p) => (
                  <div key={p.id} className="pk-card" draggable
                    onDragStart={() => setArrastando(p.id)} onDragEnd={() => setArrastando(null)}
                    onClick={() => nav('/comercial/pedidos/' + p.id + '?exp=1')}>
                    <div className="pk-card-top"><b className="pk-num">{numeroPedido(p.numero)}</b><span className="pk-data">{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span></div>
                    <div className="pk-cli">{p.clienteNome ?? '—'}</div>
                    <div className="pk-meta"><span className={pillForma(p.formaPagamento)}>{p.formaPagamento ?? '—'}</span><span className="pk-tot">{moeda(p.total)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {pend?.tipo === 'envio' && (() => {
        const ped = itens.find((p) => p.id === pend.id);
        return <ModalFormaEnvio numero={pend.numero} formaEntrega={ped?.formaEntrega ?? 'retirada'} motoboys={motoboys} onFechar={() => setPend(null)}
          onConfirmar={(forma, det, motoboyId) => { const x = pend; setPend(null); patch(x.id, 'expedido', { formaEnvio: forma, formaEnvioDetalhe: det, ...(motoboyId ? { motoboyId } : {}) }); }} />;
      })()}
      {pend?.tipo === 'entrega' && <ModalDataEntrega numero={pend.numero} onFechar={() => setPend(null)}
        onConfirmar={(data, recebido) => { const x = pend; setPend(null); patch(x.id, 'entregue', { entregueEm: data, ...(recebido ? { recebidoPor: recebido } : {}) }); }} />}
    </div>
  );
}
