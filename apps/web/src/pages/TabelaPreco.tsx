import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { ModalNovaPessoa } from '../components/SeletorPessoa.js';

interface PrecoProduto { produtoId: string; produtoNome: string; unidade: string; ativo: boolean; preco: number; campanhasCount: number; precoVigente: number | null; precoVigenteMotivo: string | null; }
interface Cliente { id: string; nome: string; }
type TipoCli = 'fixo' | 'periodo';
interface LinhaCli { produtoId: string; produtoNome: string; precoBase: number; precoCliente: number | null; tipo: TipoCli; de: string | null; ate: string | null; }
interface MetaCli { tipo: TipoCli; de: string; ate: string; }

export function TabelaPreco() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('comercial.preco.gerenciar');
  const [modo, setModo] = useState<'base' | 'cliente'>('base');
  const [busca, setBusca] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [novoCli, setNovoCli] = useState(false);
  const recarregarClientes = (nomeSel?: string) =>
    api.get<Cliente[]>('/clientes', token!).then((l) => {
      setClientes(l);
      if (nomeSel) { const c = l.find((x) => x.nome === nomeSel); if (c) carregarCliente(c.id); }
    }).catch(() => {});
  const [base, setBase] = useState<PrecoProduto[]>([]);
  const [cli, setCli] = useState<LinhaCli[]>([]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [cliMeta, setCliMeta] = useState<Record<string, MetaCli>>({});
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [campProduto, setCampProduto] = useState<PrecoProduto | null>(null);
  const [histAberto, setHistAberto] = useState(false);

  async function carregarBase() {
    const l = await api.get<PrecoProduto[]>('/precos', token!);
    setBase(l);
    if (modo === 'base') setValores(Object.fromEntries(l.map((p) => [p.produtoId, String(p.preco)])));
  }
  useEffect(() => {
    carregarBase().catch((e) => setErro((e as ErroApi).chaveI18n));
    if (temCapability('cadastros.cliente.listar')) api.get<Cliente[]>('/clientes', token!).then(setClientes).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function carregarCliente(id: string) {
    setClienteId(id); if (!id) { setCli([]); return; }
    try {
      const l = await api.get<LinhaCli[]>('/precos/cliente/' + id, token!); setCli(l);
      setValores(Object.fromEntries(l.map((x) => [x.produtoId, x.precoCliente != null ? String(x.precoCliente) : ''])));
      setCliMeta(Object.fromEntries(l.map((x) => [x.produtoId, { tipo: x.tipo, de: x.de ?? '', ate: x.ate ?? '' }])));
    }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  function setMeta(pid: string, patch: Partial<MetaCli>) {
    setCliMeta((m) => ({ ...m, [pid]: { ...(m[pid] ?? { tipo: 'fixo', de: '', ate: '' }), ...patch } }));
  }

  // Salva, de uma vez, só as linhas que mudaram (padrão "Salvar tabela" do mockup).
  async function salvarTabela() {
    setErro(null); setSalvo(false); setSalvando(true);
    try {
      if (modo === 'base') {
        for (const p of base) {
          const v = valores[p.produtoId] ?? '';
          if (v !== String(p.preco)) await api.put('/precos/' + p.produtoId, { preco: Number(v) }, token!);
        }
        await carregarBase();
      } else if (clienteId) {
        for (const p of cli) {
          const v = valores[p.produtoId] ?? '';
          const m = cliMeta[p.produtoId] ?? { tipo: 'fixo' as TipoCli, de: '', ate: '' };
          const origPreco = p.precoCliente != null ? String(p.precoCliente) : '';
          const mudou = v !== origPreco || m.tipo !== p.tipo || m.de !== (p.de ?? '') || m.ate !== (p.ate ?? '');
          if (mudou) await api.put('/precos/cliente/' + clienteId + '/' + p.produtoId,
            { preco: Number(v || 0), tipo: m.tipo, de: m.de || null, ate: m.ate || null }, token!);
        }
        await carregarCliente(clienteId);
      }
      setSalvo(true); setTimeout(() => setSalvo(false), 2500);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  function trocarModo(m: 'base' | 'cliente') {
    setModo(m); setSalvo(false);
    if (m === 'base') setValores(Object.fromEntries(base.map((p) => [p.produtoId, String(p.preco)])));
    else { setCli([]); setClienteId(''); setValores({}); setCliMeta({}); }
  }

  const q = busca.trim().toLowerCase();
  const baseFiltrada = q ? base.filter((p) => p.produtoNome.toLowerCase().includes(q)) : base;
  const cliFiltrada = q ? cli.filter((p) => p.produtoNome.toLowerCase().includes(q)) : cli;

  return (
    <div>
      <div className="crumb">{t('precos.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('precos.titulo')}</h1><div className="muted page-sub">{t('precos.sub_full')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {salvo && <div className="alerta-ok">{t('precos.salvo_tabela')}</div>}

      <div className="card pad0">
        <div className="tab-head">
          <h3>{t('precos.tabela')}</h3>
          <div className="tab-head-acoes">
            <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('precos.buscar')} /></div>
            <select value={modo} onChange={(e) => trocarModo(e.target.value as 'base' | 'cliente')}>
              <option value="base">{t('precos.modo_base')}</option><option value="cliente">{t('precos.modo_cliente')}</option>
            </select>
            {modo === 'cliente' && (<>
              <select value={clienteId} onChange={(e) => carregarCliente(e.target.value)}><option value="">{t('precos.escolha_cliente')}</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
              {temCapability('cadastros.cliente.gerenciar') && <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={() => setNovoCli(true)}>+ {t('fin.cadastrar_novo')}</button>}
              {clienteId && <button type="button" className="btn-ghost" onClick={() => setHistAberto(true)}><Ic name="i-clock" className="sm" /> {t('precohist.botao')}</button>}
            </>)}
            {novoCli && <ModalNovaPessoa tipo="cliente" onFechar={() => setNovoCli(false)} onCriado={(nome) => { setNovoCli(false); recarregarClientes(nome); }} />}
            {pode && <button className="btn-primary" disabled={salvando} onClick={salvarTabela}><Ic name="i-check" className="sm" /> {t('precos.salvar_tabela')}</button>}
          </div>
        </div>

        {modo === 'base' ? (
          <table className="tabela">
            <thead><tr><th>{t('precos.produto')}</th><th style={{ width: 180 }}>{t('precos.preco_fixo')}</th><th>{t('precos.camp_vigente')}</th><th style={{ textAlign: 'right' }}>{t('camp.titulo')}</th></tr></thead>
            <tbody>
              {baseFiltrada.length === 0 && <tr><td colSpan={4} className="vazio">{t('precos.sem_produtos')}</td></tr>}
              {baseFiltrada.map((p) => (
                <tr key={p.produtoId} className={p.ativo ? '' : 'linha-inativa'}>
                  <td>{p.produtoNome}</td>
                  <td>{pode ? <MoedaInput className="preco-inp" value={valores[p.produtoId] ?? ''} onChange={(n) => setValores({ ...valores, [p.produtoId]: String(n) })} /> : moeda(p.preco)}</td>
                  <td>{p.precoVigente != null ? <span className="pill st-verde">{p.precoVigenteMotivo ? p.precoVigenteMotivo + ' · ' : ''}{moeda(p.precoVigente)}</span> : <span className="muted">{t('precos.usa_fixo')}</span>}</td>
                  <td style={{ textAlign: 'right' }}><button className="camp-btn" onClick={() => setCampProduto(p)}><Ic name="i-clock" className="sm" />{t('camp.titulo')} ({p.campanhasCount})</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !clienteId ? <div className="vazio" style={{ padding: 24 }}>{t('precos.escolha_cliente')}</div> :
          <table className="tabela">
            <thead><tr><th>{t('precos.produto')}</th><th>{t('precos.preco_base')}</th><th style={{ width: 160 }}>{t('precos.preco_cliente')}</th><th style={{ width: 300 }}>{t('precos.vigencia')}</th></tr></thead>
            <tbody>
              {cliFiltrada.length === 0 && <tr><td colSpan={4} className="vazio">{t('precos.sem_produtos')}</td></tr>}
              {cliFiltrada.map((p) => {
                const meta = cliMeta[p.produtoId] ?? { tipo: 'fixo' as TipoCli, de: '', ate: '' };
                const periodo = meta.tipo === 'periodo';
                return (
                  <tr key={p.produtoId}>
                    <td>{p.produtoNome}</td><td className="muted">{moeda(p.precoBase)}</td>
                    <td>{pode ? <MoedaInput className="preco-inp" placeholder={t('precos.usa_base')} value={valores[p.produtoId] ?? ''} onChange={(n) => setValores({ ...valores, [p.produtoId]: String(n) })} /> : (p.precoCliente != null ? moeda(p.precoCliente) : '—')}</td>
                    <td>
                      {pode ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <select value={meta.tipo} onChange={(e) => setMeta(p.produtoId, { tipo: e.target.value as TipoCli })} style={{ maxWidth: 110 }}>
                            <option value="fixo">{t('precos.tipo_fixo')}</option><option value="periodo">{t('precos.tipo_periodo')}</option>
                          </select>
                          <input type="date" value={meta.de} disabled={!periodo} onChange={(e) => setMeta(p.produtoId, { de: e.target.value })} style={{ maxWidth: 140, opacity: periodo ? 1 : 0.5 }} />
                          <input type="date" value={meta.ate} disabled={!periodo} onChange={(e) => setMeta(p.produtoId, { ate: e.target.value })} style={{ maxWidth: 140, opacity: periodo ? 1 : 0.5 }} />
                        </div>
                      ) : (periodo ? (p.de + ' – ' + p.ate) : t('precos.tipo_fixo'))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="nota-info" style={{ margin: 14 }}><Ic name="i-help" className="sm" /> <span>{t('precos.nota')}</span></div>
      </div>
      {campProduto && <ModalCampanhas produto={campProduto} pode={pode} onFechar={() => { setCampProduto(null); carregarBase().catch(() => {}); }} />}
      {histAberto && clienteId && <ModalHistoricoCliente clienteId={clienteId} onFechar={() => setHistAberto(false)} />}
    </div>
  );
}

interface HistLinha { produtoNome: string; preco: number; tipo: string; de: string | null; ate: string | null; usuarioNome: string | null; criadoEm: string; }
function ModalHistoricoCliente({ clienteId, onFechar }: { clienteId: string; onFechar: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [linhas, setLinhas] = useState<HistLinha[]>([]);
  useEffect(() => { api.get<HistLinha[]>('/precos/cliente/' + clienteId + '/historico', token!).then(setLinhas).catch(() => {}); /* eslint-disable-next-line */ }, []);
  const fmt = (s: string) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  const fmtD = (s: string | null) => (s ? new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR') : t('precohist.fixo'));
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
      <h2><Ic name="i-clock" className="sm" /> {t('precohist.titulo')}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{t('precohist.sub')}</p>
      <table className="tabela">
        <thead><tr><th>{t('precohist.produto')}</th><th style={{ textAlign: 'right' }}>{t('precohist.preco')}</th><th>{t('precohist.vigencia')}</th><th>{t('precohist.usuario')}</th><th>{t('precohist.quando')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={5} className="vazio">{t('precohist.vazio')}</td></tr>}
          {linhas.map((l, i) => (
            <tr key={i}>
              <td>{l.produtoNome}</td><td style={{ textAlign: 'right' }}>{moeda(l.preco)}</td>
              <td>{l.tipo === 'periodo' ? `${fmtD(l.de)} – ${fmtD(l.ate)}` : t('precohist.fixo')}</td>
              <td>{l.usuarioNome ?? '—'}</td><td style={{ color: 'var(--muted)' }}>{fmt(l.criadoEm)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}

interface Campanha { id: string; preco: number; motivo: string | null; de: string; ate: string; vigente: boolean; }
function ModalCampanhas({ produto, pode, onFechar }: { produto: PrecoProduto; pode: boolean; onFechar: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [itens, setItens] = useState<Campanha[]>([]);
  const [preco, setPreco] = useState(''); const [motivo, setMotivo] = useState(''); const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  async function carregar() { try { setItens(await api.get('/precos/campanhas/' + produto.produtoId, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  function limpar() { setPreco(''); setMotivo(''); setDe(''); setAte(''); setEditId(null); }
  function editar(c: Campanha) { setEditId(c.id); setPreco(String(c.preco)); setMotivo(c.motivo ?? ''); setDe(c.de); setAte(c.ate); setErro(null); }
  async function salvar() {
    setErro(null);
    const corpo = { preco: Number(preco), motivo, de, ate };
    try {
      if (editId) await api.put('/precos/campanhas/item/' + editId, corpo, token!);
      else await api.post('/precos/campanhas/' + produto.produtoId, corpo, token!);
      limpar(); carregar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function rem(id: string) { try { await api.del('/precos/campanhas/item/' + id, token!); if (editId === id) limpar(); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('camp.titulo')} — {produto.produtoNome}</h2>
      <table className="tabela" style={{ marginBottom: 14 }}>
        <thead><tr><th>{t('rel.total')}</th><th>{t('camp.motivo')}</th><th>{t('camp.periodo')}</th><th>{t('fin.situacao')}</th><th></th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={5} className="vazio">{t('camp.vazia')}</td></tr>}
          {itens.map((c) => (<tr key={c.id}>
            <td>{moeda(c.preco)}</td><td>{c.motivo ?? '—'}</td><td>{fmt(c.de)} – {fmt(c.ate)}</td>
            <td>{c.vigente ? <span className="pill st-verde">{t('camp.vigente')}</span> : <span className="pill st-cinza">{t('camp.encerrada')}</span>}</td>
            <td className="acoes">{pode && <span style={{ display: 'inline-flex', gap: 12 }}>
              <button className="btn-link" onClick={() => editar(c)}>{t('camp.editar')}</button>
              <button className="btn-link" onClick={() => rem(c.id)}>{t('clientes.remover')}</button>
            </span>}</td>
          </tr>))}
        </tbody>
      </table>
      {pode && <>
        <div className="perm-titulo">{editId ? t('camp.editando') : t('camp.nova')}</div>
        <div className="cores-grid">
          <label className="campo">{t('rel.total')}<MoedaInput value={preco} onChange={(n) => setPreco(String(n))} /></label>
          <label className="campo">{t('camp.motivo')}<input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: Black Friday" /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </div>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          {editId
            ? <button className="btn-ghost" onClick={limpar}>{t('camp.cancelar_edicao')}</button>
            : <button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button>}
          <button className="btn-primary" disabled={!preco || !de || !ate} onClick={salvar}>{editId ? t('camp.salvar') : t('camp.add')}</button>
        </div>
      </>}
    </div></div>
  );
}
