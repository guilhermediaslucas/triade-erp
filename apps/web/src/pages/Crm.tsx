import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';

type Estagio = 'lead' | 'contato' | 'proposta' | 'negociacao' | 'ganho';
interface Oportunidade { id: string; clienteId: string | null; clienteNome: string; titulo: string | null; valor: number; vendedorId: string | null; vendedorNome: string | null; estagio: string; previsao: string | null; pedidoId: string | null; pedidoNumero: number | null; perdido: boolean; }
interface Resumo { clientesAtivos: number; clientesAtendidos: number; ticketMedio: number; interacoes: number; }
interface ClienteRef { id: string; nome: string; }
interface VendedorRef { id: string; nome: string; }
interface Evento { tipo: string; titulo: string; valor: number | null; status: string | null; data: string; icone: string; }
interface Recompra { clienteId: string; cliente: string; ultima: string; ciclo: number; proxima: string; diasParaProxima: number; sugestao: string[]; }
interface Inativo { clienteId: string; cliente: string; ultima: string; diasSemComprar: number; ciclo: number | null; }

const COLS: { s: Estagio; cor: string }[] = [
  { s: 'lead', cor: '#94a3b8' }, { s: 'contato', cor: '#3b82f6' }, { s: 'proposta', cor: '#ea9213' },
  { s: 'negociacao', cor: '#7c3aed' }, { s: 'ganho', cor: '#16a34a' },
];
const fmtData = (iso: string | null) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
const numPed = (n: number) => 'PE-' + String(n).padStart(6, '0');

export function Crm() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const pode = temCapability('comercial.crm.gerenciar');

  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [oports, setOports] = useState<Oportunidade[]>([]);
  const [clientes, setClientes] = useState<ClienteRef[]>([]);
  const [vendedores, setVendedores] = useState<VendedorRef[]>([]);
  const [recompra, setRecompra] = useState<Recompra[]>([]);
  const [inativos, setInativos] = useState<Inativo[]>([]);
  const [dias, setDias] = useState('60');
  const [erro, setErro] = useState<string | null>(null);

  // Histórico
  const [cliSel, setCliSel] = useState('');
  const [timeline, setTimeline] = useState<Evento[]>([]);

  // Modais
  const [modalOport, setModalOport] = useState(false);
  const [intCliente, setIntCliente] = useState<ClienteRef | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Estagio | null>(null);

  async function carregarOports() { try { setOports(await api.get('/crm/oportunidades', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  async function carregarResumo() { try { setResumo(await api.get('/crm/resumo', token!)); } catch { /* */ } }
  async function carregarRecompra() { try { setRecompra(await api.get('/crm/recompra', token!)); } catch { /* */ } }
  async function carregarInativos() { try { setInativos(await api.get('/crm/inativos?dias=' + (Number(dias) || 60), token!)); } catch { /* */ } }
  useEffect(() => {
    carregarResumo(); carregarOports(); carregarRecompra(); carregarInativos();
    api.get<any[]>('/clientes', token!).then((l) => setClientes(l.map((c) => ({ id: c.id, nome: c.nome })))).catch(() => {});
    api.get<any[]>('/vendedores', token!).then((l) => setVendedores(l.map((v) => ({ id: v.id, nome: v.nome })))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function carregarTimeline(clienteId: string) {
    if (!clienteId) { setTimeline([]); return; }
    try { setTimeline(await api.get('/crm/timeline?clienteId=' + clienteId, token!)); } catch { setTimeline([]); }
  }
  function escolherCliente(id: string) { setCliSel(id); carregarTimeline(id); }

  const visiveis = useMemo(() => oports.filter((o) => !o.perdido && o.estagio !== 'perdido'), [oports]);

  // Drag-and-drop do funil
  function onDrop(est: Estagio) {
    setSobre(null); const id = arrastando; setArrastando(null);
    if (!id) return;
    const o = oports.find((x) => x.id === id);
    if (!o || o.estagio === est) return;
    api.patch('/crm/oportunidades/' + id + '/estagio', { estagio: est }, token!).then(carregarOports).catch((e) => { setErro((e as ErroApi).chaveI18n); });
  }
  function perder(id: string) {
    if (!confirm(t('crm.confirmar_perder'))) return;
    api.patch('/crm/oportunidades/' + id + '/perder', {}, token!).then(carregarOports).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  function gerarOrcamento(o: Oportunidade) {
    if (!o.clienteId) { toast(t('crm.precisa_cadastro'), 'erro'); return; }
    nav('/comercial/pedidos/novo?cliente=' + o.clienteId + '&oport=' + o.id);
  }

  return (
    <div>
      <div className="crumb">{t('crm.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('crm.titulo')}</h1><div className="muted page-sub">{t('crm.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {/* KPIs */}
      <div className="dash-row c4">
        <div className="card"><div className="kpi"><div className="kpi-ic tint-pp"><Ic name="i-users" className="sm" /></div><div><div className="lbl">{t('crm.kpi_ativos')}</div><div className="val">{resumo?.clientesAtivos ?? 0}</div></div></div></div>
        <div className="card"><div className="kpi"><div className="kpi-ic tint-bl"><Ic name="i-cart" className="sm" /></div><div><div className="lbl">{t('crm.kpi_atendidos')}</div><div className="val">{resumo?.clientesAtendidos ?? 0}</div></div></div></div>
        <div className="card"><div className="kpi"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div><div className="lbl">{t('crm.kpi_ticket')}</div><div className="val">{moeda(resumo?.ticketMedio ?? 0)}</div></div></div></div>
        <div className="card"><div className="kpi"><div className="kpi-ic tint-or"><Ic name="i-clip" className="sm" /></div><div><div className="lbl">{t('crm.kpi_interacoes')}</div><div className="val">{resumo?.interacoes ?? 0}</div></div></div></div>
      </div>

      {/* Funil */}
      <div className="card pad0" style={{ maxWidth: 'none', marginTop: 16 }}>
        <div className="card-head" style={{ padding: '18px 20px 8px', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ marginRight: 'auto' }}>{t('crm.funil')}</h3>
          <span className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>{t('crm.arraste')}</span>
          {pode && <button className="btn-primary btn-mini" onClick={() => setModalOport(true)}><Ic name="i-plus" className="sm" /> {t('crm.nova_oport')}</button>}
        </div>
        <div className="pk-board" style={{ padding: '0 16px 8px' }}>
          {COLS.map((col) => {
            const cards = visiveis.filter((o) => (o.estagio || 'lead') === col.s);
            return (
              <div key={col.s} className="pk-col" style={{ borderTopColor: col.cor, outline: sobre === col.s ? '2px solid ' + col.cor : 'none' }}
                onDragOver={(e: DragEvent) => { e.preventDefault(); setSobre(col.s); }} onDragLeave={() => setSobre((x) => (x === col.s ? null : x))} onDrop={() => onDrop(col.s)}>
                <div className="pk-h"><span className="pk-nm" style={{ color: col.cor }}>{t('crm.est.' + col.s)}</span><span className="pk-ct">{cards.length}</span></div>
                <div className="pk-body">
                  {cards.map((o) => (
                    <div key={o.id} className="pk-card" draggable={pode} onDragStart={() => setArrastando(o.id)} onDragEnd={() => setArrastando(null)}>
                      <b className="pk-num">{o.clienteNome}</b>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{o.titulo ? o.titulo + ' · ' : ''}{moeda(o.valor)} · {o.vendedorNome ?? '—'}{o.previsao ? ' · ' + fmtData(o.previsao) : ''}</div>
                      {pode && <div style={{ marginTop: 6 }}><button className="btn-link" style={{ fontSize: 11, color: '#e1483b' }} onClick={() => perder(o.id)}>{t('crm.marcar_perdido')}</button></div>}
                      {o.estagio === 'ganho' && <div style={{ marginTop: 6 }}>
                        {o.pedidoNumero ? <span className="pill st-verde">{t('crm.orcamento')} {numPed(o.pedidoNumero)}</span>
                          : pode && <button className="btn-primary btn-mini" onClick={() => gerarOrcamento(o)}><Ic name="i-receipt" className="sm" /> {t('crm.gerar_orcamento')}</button>}
                      </div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="nota-info" style={{ margin: '0 20px 16px' }}><Ic name="i-shield" className="sm" /> {t('crm.nota_funil')}</div>
      </div>

      {/* Histórico do cliente */}
      <div className="card" style={{ maxWidth: 'none', marginTop: 16 }}>
        <div className="card-head" style={{ gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ marginRight: 'auto' }}>{t('crm.historico')}</h3>
          <select value={cliSel} onChange={(e) => escolherCliente(e.target.value)} style={{ minWidth: 260 }}>
            <option value="">{t('crm.busque_cliente')}</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {pode && <button className="btn-primary btn-mini" disabled={!cliSel} onClick={() => { const c = clientes.find((x) => x.id === cliSel); if (c) setIntCliente(c); }}><Ic name="i-plus" className="sm" /> {t('crm.registrar_interacao')}</button>}
        </div>
        <div style={{ marginTop: 8 }}>
          {!cliSel && <div className="muted" style={{ padding: '14px 0' }}>{t('crm.timeline_vazia_sel')}</div>}
          {cliSel && timeline.length === 0 && <div className="muted" style={{ padding: '14px 0' }}>{t('crm.timeline_vazia')}</div>}
          {timeline.map((e, i) => (
            <div key={i} className="tl-item">
              <div className={'kpi-ic ' + (e.tipo === 'pedido' ? 'tint-bl' : 'tint-pp')} style={{ width: 34, height: 34 }}><Ic name={e.icone} className="sm" /></div>
              <div><div className="tl-nm">{e.titulo}{e.valor != null ? ' · ' + moeda(e.valor) : ''}{e.status && e.tipo === 'pedido' ? ' · ' + t('status.' + e.status) : ''}</div><div className="muted" style={{ fontSize: 12 }}>{fmtData(e.data)}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Previsão de recompra */}
      <div className="card pad0" style={{ maxWidth: 'none', marginTop: 16 }}>
        <div className="card-head" style={{ padding: '18px 20px 0' }}><h3 style={{ marginRight: 'auto' }}>{t('crm.recompra')}</h3><span className="muted" style={{ fontSize: 12 }}>{t('crm.recompra_sub')}</span></div>
        <table className="tabela" style={{ marginTop: 10 }}>
          <thead><tr><th>{t('pedidos.cliente')}</th><th>{t('crm.ultima_compra')}</th><th>{t('crm.ciclo')}</th><th>{t('crm.proxima')}</th><th>{t('dash.col_status')}</th><th>{t('crm.sugestao')}</th></tr></thead>
          <tbody>
            {recompra.length === 0 && <tr><td colSpan={6} className="vazio">{t('crm.recompra_vazia')}</td></tr>}
            {recompra.map((r) => {
              const dp = r.diasParaProxima;
              const sit = dp < 0 ? <span className="pill st-vermelho">{t('crm.atrasada')} ({-dp}d)</span> : dp <= 7 ? <span className="pill st-laranja">{t('crm.esta_semana')}</span> : <span className="pill st-verde">{t('crm.em_dia')}</span>;
              return <tr key={r.clienteId}><td><b>{r.cliente}</b></td><td>{fmtData(r.ultima)}</td><td>{r.ciclo} {t('crm.dias')}</td><td>{fmtData(r.proxima)}</td><td>{sit}</td><td className="muted" style={{ fontSize: 12 }}>{r.sugestao.length ? r.sugestao.join(', ') : '—'}</td></tr>;
            })}
          </tbody>
        </table>
        <div className="nota-info" style={{ margin: '0 20px 16px' }}><Ic name="i-clock" className="sm" /> {t('crm.nota_recompra')}</div>
      </div>

      {/* Clientes inativos */}
      <div className="card pad0" style={{ maxWidth: 'none', marginTop: 16 }}>
        <div className="card-head" style={{ padding: '18px 20px 0', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ marginRight: 'auto' }}>{t('crm.inativos')}</h3>
          <span className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>{t('crm.sem_comprar')}</span>
          <input type="number" min="1" value={dias} onChange={(e) => setDias(e.target.value)} style={{ maxWidth: 90 }} />
          <span className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>{t('crm.dias')}</span>
          <button className="btn-ghost btn-mini" onClick={carregarInativos}><Ic name="i-search" className="sm" /> {t('rel.gerar')}</button>
        </div>
        <table className="tabela" style={{ marginTop: 10 }}>
          <thead><tr><th>{t('pedidos.cliente')}</th><th>{t('crm.ultima_compra')}</th><th>{t('crm.dias_sem')}</th><th>{t('crm.ciclo')}</th><th>{t('crm.acao')}</th></tr></thead>
          <tbody>
            {inativos.length === 0 && <tr><td colSpan={5} className="vazio">{t('crm.inativos_vazio')}</td></tr>}
            {inativos.map((x) => (
              <tr key={x.clienteId}>
                <td><b>{x.cliente}</b></td><td>{fmtData(x.ultima)}</td><td><span className="pill st-vermelho">{x.diasSemComprar} {t('crm.dias')}</span></td><td>{x.ciclo != null ? x.ciclo + ' ' + t('crm.dias') : '—'}</td>
                <td>{pode && <button className="btn-link" onClick={() => { escolherCliente(x.clienteId); const c = clientes.find((y) => y.id === x.clienteId) ?? { id: x.clienteId, nome: x.cliente }; setIntCliente(c); }}>{t('crm.registrar_contato')}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="nota-info" style={{ margin: '0 20px 16px' }}><Ic name="i-alert" className="sm" /> {t('crm.nota_inativos')}</div>
      </div>

      {modalOport && <ModalOportunidade clientes={clientes} vendedores={vendedores} onFechar={() => setModalOport(false)} onCriado={() => { setModalOport(false); carregarOports(); }} />}
      {intCliente && <ModalInteracao cliente={intCliente} onFechar={() => setIntCliente(null)} onCriado={() => { setIntCliente(null); carregarResumo(); if (cliSel) carregarTimeline(cliSel); }} />}
    </div>
  );
}

function ModalOportunidade({ clientes, vendedores, onFechar, onCriado }: { clientes: ClienteRef[]; vendedores: VendedorRef[]; onFechar: () => void; onCriado: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [cliente, setCliente] = useState(''); const [titulo, setTitulo] = useState(''); const [valor, setValor] = useState('0');
  const [vendedorId, setVendedorId] = useState(''); const [estagio, setEstagio] = useState<Estagio>('lead'); const [previsao, setPrevisao] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    const cli = clientes.find((c) => c.nome.toLowerCase() === cliente.trim().toLowerCase());
    try {
      await api.post('/crm/oportunidades', { clienteId: cli?.id ?? null, clienteNome: cliente.trim(), titulo, valor: Number(valor) || 0, vendedorId: vendedorId || null, estagio, previsao }, token!);
      onCriado();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('crm.nova_oport')}</h2>
      <label className="campo">{t('crm.cliente_prospect')}
        <input list="dlCrmCli" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder={t('crm.cliente_ph')} autoFocus />
        <datalist id="dlCrmCli">{clientes.map((c) => <option key={c.id} value={c.nome} />)}</datalist>
      </label>
      <label className="campo">{t('crm.titulo_oport')}<input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={t('crm.titulo_ph')} /></label>
      <div className="cores-grid">
        <label className="campo">{t('crm.valor')}<MoedaInput value={valor} onChange={(n) => setValor(n ? String(n) : '')} /></label>
        <label className="campo">{t('pedidos.vendedor')}<select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}><option value="">—</option>{vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}</select></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('crm.estagio')}<select value={estagio} onChange={(e) => setEstagio(e.target.value as Estagio)}>{COLS.map((c) => <option key={c.s} value={c.s}>{t('crm.est.' + c.s)}</option>)}</select></label>
        <label className="campo">{t('crm.previsao')}<input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv || cliente.trim().length < 2} onClick={salvar}>{t('crm.salvar_oport')}</button></div>
    </div></div>
  );
}

function ModalInteracao({ cliente, onFechar, onCriado }: { cliente: ClienteRef; onFechar: () => void; onCriado: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const hoje = new Date().toISOString().slice(0, 10);
  const TIPOS = ['Ligação', 'Visita', 'E-mail', 'WhatsApp', 'Reunião', 'Outro'];
  const [tipo, setTipo] = useState(TIPOS[0]!); const [data, setData] = useState(hoje); const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.post('/crm/interacoes', { clienteId: cliente.id, tipo, data, nota }, token!); onCriado(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('crm.registrar_interacao')}</h2>
      <div className="det-linha"><span className="det-rot">{t('pedidos.cliente')}</span><span className="det-val">{cliente.nome}</span></div>
      <div className="cores-grid">
        <label className="campo">{t('crm.tipo')}<select value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map((x) => <option key={x} value={x}>{x}</option>)}</select></label>
        <label className="campo">{t('crm.data')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
      </div>
      <label className="campo">{t('crm.anotacao')}<textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder={t('crm.anotacao_ph')} /></label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('crm.salvar_interacao')}</button></div>
    </div></div>
  );
}
