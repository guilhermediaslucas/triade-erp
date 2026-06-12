import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { corStatus, moeda, numeroPedido, PROXIMOS, type StatusPedido } from '../lib/pedido.js';
import { ModalDataEntrega, ModalFormaEnvio } from '../components/ExpedicaoModais.js';

interface ItemLote { lote: string; validade: string | null; }
interface Item { produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number; lotes?: ItemLote[]; }

function fmtValidade(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v + 'T00:00:00');
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
}
interface Pedido {
  id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido;
  formaPagamento: string | null; observacao: string | null; enderecoEntrega: string | null;
  formaEntrega: string; motoboyNome: string | null; distanciaKm: number | null;
  formaEnvio: string | null; formaEnvioDetalhe: string | null; entregueEm: string | null;
  subtotal: number; frete: number; total: number; criadoEm: string; itens: Item[];
}

export function PedidoDetalhe() {
  const { id } = useParams();
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [p, setP] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const podeGerenciar = temCapability('comercial.pedido.gerenciar');
  const [formas, setFormas] = useState<string[]>([]);
  const [modal, setModal] = useState<'envio' | 'entrega' | null>(null);

  // Separação por bipagem
  const [sepOpen, setSepOpen] = useState(false);
  const [scan, setScan] = useState('');
  const [codigos, setCodigos] = useState<string[]>([]);
  const [sepErro, setSepErro] = useState<string | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  async function carregar() { try { setP(await api.get('/pedidos/' + id, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => {
    carregar();
    if (temCapability('cadastros.forma_entrega.listar')) api.get<{ nome: string; ativo: boolean }[]>('/formas-entrega', token!).then((l) => setFormas(l.filter((f) => f.ativo).map((f) => f.nome))).catch(() => {});
    /* eslint-disable-next-line */
  }, [id]);

  async function patchStatus(status: StatusPedido, extra?: Record<string, string>) {
    setErro(null);
    try {
      await api.patch('/pedidos/' + id + '/status', { status, ...extra }, token!); carregar();
      const forma = (p?.formaPagamento ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      if (status === 'aguardando_pagamento' && forma === 'pix') toast(t('pedido.toast_pix_pendente'));
      else toast(t('pedido.toast_status') + ' ' + t('status.' + status));
    }
    catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }
  function mudar(status: StatusPedido) {
    // Expedir/Entregar pedem dados (forma de envio / data de entrega) antes de confirmar.
    if (status === 'expedido') { setModal('envio'); return; }
    if (status === 'entregue') { setModal('entrega'); return; }
    patchStatus(status);
  }

  function abrirSeparacao() { setCodigos([]); setScan(''); setSepErro(null); setSepOpen(true); setTimeout(() => scanRef.current?.focus(), 50); }
  function bipar(valor: string) {
    const cod = valor.trim().toUpperCase();
    if (!cod) return;
    setSepErro(null);
    if (codigos.includes(cod)) { setSepErro('etiqueta.duplicada_leitura'); setScan(''); return; }
    setCodigos((cs) => [...cs, cod]); setScan(''); scanRef.current?.focus();
  }
  const totalItens = p ? p.itens.reduce((a, i) => a + i.quantidade, 0) : 0;
  async function confirmarSeparacao() {
    setSepErro(null);
    try { await api.post('/pedidos/' + id + '/separar', { codigos }, token!); setSepOpen(false); carregar(); toast(t('sep.toast_ok')); }
    catch (e) { setSepErro((e as ErroApi).chaveI18n); }
  }

  if (!p) return <div className="muted">{erro ? t(erro) : t('common.carregando')}</div>;
  const proximos = PROXIMOS[p.status];
  const WF = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue'];
  const WF_IC = ['📝', '⏳', '✅', '📦', '🚚', '🏁'];
  const wfAtual = WF.indexOf(p.status);
  const entregaTexto = t('entrega.' + p.formaEntrega)
    + (p.formaEntrega === 'motoboy' && p.motoboyNome ? ' · ' + p.motoboyNome : '')
    + (p.distanciaKm != null ? ' · ' + p.distanciaKm + ' km' : '');

  return (
    <div>
      <div className="crumb">{t('pedidos.crumb')} / {numeroPedido(p.numero)}</div>
      <div className="page-head">
        <div>
          <h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('pedido.titulo')} {numeroPedido(p.numero)}</h1>
          <div className="muted page-sub">{[p.clienteNome, p.vendedorNome, new Date(p.criadoEm).toLocaleString('pt-BR')].filter(Boolean).join(' · ')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={'pill ' + corStatus(p.status)} style={{ fontSize: 13 }}>{t('status.' + p.status)}</span>
          <button className="btn-ghost" onClick={() => nav('/comercial/pedidos/' + p.id + '/romaneio')}>🖨️ {t('romaneio.titulo')}</button>
          <button className="btn-ghost" onClick={() => nav('/comercial/pedidos')}>← {t('pedidos.voltar')}</button>
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {p.status !== 'cancelado' && (
        <div className="card" style={{ maxWidth: 820, marginBottom: 16 }}>
          <div className="card-head"><h3>{t('pedido.workflow')}</h3></div>
          <div className="wf">
            {WF.map((st, i) => (
              <Fragment key={st}>
                {i > 0 && <div className={'wf-line' + (i <= wfAtual ? ' on' : '')} />}
                <div className="wf-step">
                  <div className={'kpi-ic ' + (i < wfAtual ? 'tint-gr' : i === wfAtual ? 'tint-pp wf-atual' : 'tint-bl wf-futuro')}>{WF_IC[i]}</div>
                  <div className={'wf-lbl' + (i === wfAtual ? ' on' : i > wfAtual ? ' off' : '')}>{t('status.' + st)}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: 820, marginBottom: 16 }}>
        <div className="det-grid">
          <div><span className="det-l">{t('pedidos.cliente')}</span><div>{p.clienteNome ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.vendedor')}</span><div>{p.vendedorNome ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.forma_pgto')}</span><div>{p.formaPagamento ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.data')}</span><div>{new Date(p.criadoEm).toLocaleString('pt-BR')}</div></div>
          <div><span className="det-l">{t('entrega.forma')}</span><div>{entregaTexto}</div></div>
          {p.formaEnvio && <div><span className="det-l">{t('pedido.forma_envio')}</span><div>{p.formaEnvio}{p.formaEnvioDetalhe ? ' · ' + p.formaEnvioDetalhe : ''}</div></div>}
          {p.entregueEm && <div><span className="det-l">{t('pedido.entregue_em')}</span><div>{new Date(p.entregueEm + 'T00:00:00').toLocaleDateString('pt-BR')}</div></div>}
          <div style={{ gridColumn: '1 / -1' }}><span className="det-l">{t('pedidos.endereco')}</span><div>{p.enderecoEntrega ?? '—'}</div></div>
          {p.observacao && <div style={{ gridColumn: '1 / -1' }}><span className="det-l">{t('pedidos.obs')}</span><div>{p.observacao}</div></div>}
        </div>
      </div>

      <div className="card pad0" style={{ maxWidth: 820, marginBottom: 16 }}><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('pedido.lote')}</th><th>{t('pedido.validade')}</th><th>{t('pedidos.qtd')}</th><th>{t('pedidos.preco_unit')}</th><th>{t('pedidos.subtotal')}</th></tr></thead>
        <tbody>
          {p.itens.map((it, i) => {
            const lotes = it.lotes ?? [];
            return (
              <tr key={i}>
                <td>{it.produtoNome}</td>
                <td>{lotes.length ? lotes.map((l) => l.lote).join(', ') : '—'}</td>
                <td>{lotes.length ? lotes.map((l) => fmtValidade(l.validade)).join(', ') : '—'}</td>
                <td>{it.quantidade}</td><td>{moeda(it.precoUnitario)}</td><td>{moeda(it.subtotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>

      <div className="card" style={{ maxWidth: 820 }}>
        <div className="totais">
          <div><span>{t('pedidos.subtotal')}</span><b>{moeda(p.subtotal)}</b></div>
          <div><span>{t('pedidos.frete')}</span><b>{moeda(p.frete)}</b></div>
          <div className="total-grande"><span>{t('pedidos.total')}</span><b>{moeda(p.total)}</b></div>
        </div>
        {podeGerenciar && proximos.length > 0 && (
          <div className="acoes-status">
            {proximos.map((s) => (
              s === 'separacao'
                ? <button key={s} className="btn-primary" onClick={abrirSeparacao}>🏷️ {t('sep.acao')}</button>
                : <button key={s} className={s === 'cancelado' ? 'btn-ghost' : 'btn-primary'} onClick={() => mudar(s)}>{t('pedidos.acao.' + s)}</button>
            ))}
          </div>
        )}
      </div>

      {sepOpen && (
        <div className="modal-fundo">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('sep.titulo')} · {numeroPedido(p.numero)}</h2>
            <div className="dash-s" style={{ marginBottom: 10 }}>{t('sep.sub')}</div>
            <div className="card pad0" style={{ marginBottom: 10 }}><table className="tabela">
              <thead><tr><th>{t('precos.produto')}</th><th>{t('pedidos.qtd')}</th></tr></thead>
              <tbody>{p.itens.map((it, i) => <tr key={i}><td>{it.produtoNome}</td><td>{it.quantidade}</td></tr>)}</tbody>
            </table></div>
            {sepErro && <div className="alerta-erro">{t(sepErro)}</div>}
            <label className="campo">
              {t('etq.bipe')} <span className="muted">· {codigos.length} / {totalItens} {t('etq.bipados')}</span>
              <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
                onChange={(e) => setScan(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bipar(scan); } }} />
            </label>
            {codigos.length > 0 && (
              <div className="chips">
                {codigos.map((c) => (
                  <span key={c} className="chip" style={{ fontFamily: 'monospace' }}>
                    {c}<button type="button" className="chip-x" onClick={() => setCodigos((cs) => cs.filter((x) => x !== c))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="modal-acoes">
              <button className="btn-ghost" onClick={() => setSepOpen(false)}>{t('common.cancelar')}</button>
              <button className="btn-primary" disabled={codigos.length === 0} onClick={confirmarSeparacao}>{t('sep.confirmar')}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'envio' && <ModalFormaEnvio numero={p.numero} formas={formas} inicial={{ forma: p.formaEnvio, detalhe: p.formaEnvioDetalhe }}
        onFechar={() => setModal(null)} onConfirmar={(forma, det) => { setModal(null); patchStatus('expedido', { formaEnvio: forma, formaEnvioDetalhe: det }); }} />}
      {modal === 'entrega' && <ModalDataEntrega numero={p.numero} inicial={p.entregueEm}
        onFechar={() => setModal(null)} onConfirmar={(data) => { setModal(null); patchStatus('entregue', { entregueEm: data }); }} />}
    </div>
  );
}
