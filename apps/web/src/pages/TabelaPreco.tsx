import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface PrecoProduto { produtoId: string; produtoNome: string; categoriaNome: string | null; unidade: string; ativo: boolean; preco: number; }
interface Cliente { id: string; nome: string; }
interface LinhaCli { produtoId: string; produtoNome: string; precoBase: number; precoCliente: number | null; }

export function TabelaPreco() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('comercial.preco.gerenciar');
  const [modo, setModo] = useState<'base' | 'cliente'>('base');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [base, setBase] = useState<PrecoProduto[]>([]);
  const [cli, setCli] = useState<LinhaCli[]>([]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [campProduto, setCampProduto] = useState<PrecoProduto | null>(null);

  useEffect(() => {
    api.get<PrecoProduto[]>('/precos', token!).then((l) => { setBase(l); if (modo === 'base') setValores(Object.fromEntries(l.map((p) => [p.produtoId, String(p.preco)]))); }).catch((e) => setErro((e as ErroApi).chaveI18n));
    if (temCapability('cadastros.cliente.listar')) api.get<Cliente[]>('/clientes', token!).then(setClientes).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function carregarCliente(id: string) {
    setClienteId(id); if (!id) { setCli([]); return; }
    try { const l = await api.get<LinhaCli[]>('/precos/cliente/' + id, token!); setCli(l); setValores(Object.fromEntries(l.map((x) => [x.produtoId, x.precoCliente != null ? String(x.precoCliente) : '']))); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  async function salvarBase(id: string) {
    setErro(null); setSalvo(null);
    try { await api.put('/precos/' + id, { preco: Number(valores[id]) }, token!); flash(id); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function salvarCliente(id: string) {
    setErro(null); setSalvo(null);
    try { await api.put('/precos/cliente/' + clienteId + '/' + id, { preco: Number(valores[id] || 0) }, token!); flash(id); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  function flash(id: string) { setSalvo(id); setTimeout(() => setSalvo((x) => (x === id ? null : x)), 1500); }

  return (
    <div>
      <div className="crumb">{t('precos.crumb')}</div><h1 className="page-titulo">{t('precos.titulo')}</h1>
      <div className="rel-filtro">
        <label className="campo">{t('precos.modo')}
          <select value={modo} onChange={(e) => { const m = e.target.value as any; setModo(m); if (m === 'base') setValores(Object.fromEntries(base.map((p) => [p.produtoId, String(p.preco)]))); else { setCli([]); setClienteId(''); } }}>
            <option value="base">{t('precos.modo_base')}</option><option value="cliente">{t('precos.modo_cliente')}</option>
          </select>
        </label>
        {modo === 'cliente' && <label className="campo">{t('pedidos.cliente')}
          <select value={clienteId} onChange={(e) => carregarCliente(e.target.value)}><option value="">—</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
        </label>}
      </div>
      <p className="muted" style={{ marginTop: -8 }}>{modo === 'base' ? t('precos.sub') : t('precos.sub_cliente')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {modo === 'base' ? (
        <div className="card pad0"><table className="tabela">
          <thead><tr><th>{t('precos.produto')}</th><th>{t('produtos.categoria')}</th><th style={{ width: 220 }}>{t('precos.preco_base')}</th><th>{t('camp.titulo')}</th></tr></thead>
          <tbody>
            {base.length === 0 && <tr><td colSpan={4} className="vazio">{t('precos.sem_produtos')}</td></tr>}
            {base.map((p) => (
              <tr key={p.produtoId} className={p.ativo ? '' : 'linha-inativa'}>
                <td>{p.produtoNome}</td><td>{p.categoriaNome ?? '—'}</td>
                <td>{pode ? <div className="preco-edit"><input type="number" step="0.01" min="0" value={valores[p.produtoId] ?? ''} onChange={(e) => setValores({ ...valores, [p.produtoId]: e.target.value })} /><button className="btn-ghost btn-mini" onClick={() => salvarBase(p.produtoId)}>{t('common.salvar')}</button>{salvo === p.produtoId && <span className="salvo-ok">✓</span>}</div> : moeda(p.preco)}</td>
                <td><button className="btn-link" onClick={() => setCampProduto(p)}>{t('camp.gerenciar')}</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      ) : (
        !clienteId ? <div className="muted">{t('precos.escolha_cliente')}</div> :
        <div className="card pad0"><table className="tabela">
          <thead><tr><th>{t('precos.produto')}</th><th>{t('precos.preco_base')}</th><th style={{ width: 240 }}>{t('precos.preco_cliente')}</th></tr></thead>
          <tbody>
            {cli.map((p) => (
              <tr key={p.produtoId}>
                <td>{p.produtoNome}</td><td className="muted">{moeda(p.precoBase)}</td>
                <td>{pode ? <div className="preco-edit"><input type="number" step="0.01" min="0" placeholder={t('precos.usa_base')} value={valores[p.produtoId] ?? ''} onChange={(e) => setValores({ ...valores, [p.produtoId]: e.target.value })} /><button className="btn-ghost btn-mini" onClick={() => salvarCliente(p.produtoId)}>{t('common.salvar')}</button>{salvo === p.produtoId && <span className="salvo-ok">✓</span>}</div> : (p.precoCliente != null ? moeda(p.precoCliente) : '—')}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      {campProduto && <ModalCampanhas produto={campProduto} pode={pode} onFechar={() => setCampProduto(null)} />}
    </div>
  );
}

interface Campanha { id: string; preco: number; motivo: string | null; de: string; ate: string; vigente: boolean; }
function ModalCampanhas({ produto, pode, onFechar }: { produto: PrecoProduto; pode: boolean; onFechar: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [itens, setItens] = useState<Campanha[]>([]);
  const [preco, setPreco] = useState(''); const [motivo, setMotivo] = useState(''); const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  async function carregar() { try { setItens(await api.get('/precos/campanhas/' + produto.produtoId, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function add() { setErro(null); try { await api.post('/precos/campanhas/' + produto.produtoId, { preco: Number(preco), motivo, de, ate }, token!); setPreco(''); setMotivo(''); setDe(''); setAte(''); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  async function rem(id: string) { try { await api.del('/precos/campanhas/item/' + id, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('camp.titulo')} — {produto.produtoNome}</h2>
      <table className="tabela" style={{ marginBottom: 14 }}>
        <thead><tr><th>{t('rel.total')}</th><th>{t('camp.motivo')}</th><th>{t('camp.periodo')}</th><th>{t('fin.situacao')}</th><th></th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={5} className="vazio">{t('camp.vazia')}</td></tr>}
          {itens.map((c) => (<tr key={c.id}>
            <td>{moeda(c.preco)}</td><td>{c.motivo ?? '—'}</td><td>{fmt(c.de)} – {fmt(c.ate)}</td>
            <td>{c.vigente ? <span className="pill st-verde">{t('camp.vigente')}</span> : <span className="pill st-cinza">{t('camp.encerrada')}</span>}</td>
            <td className="acoes">{pode && <button className="btn-link" onClick={() => rem(c.id)}>{t('clientes.remover')}</button>}</td>
          </tr>))}
        </tbody>
      </table>
      {pode && <>
        <div className="perm-titulo">{t('camp.nova')}</div>
        <div className="cores-grid">
          <label className="campo">{t('rel.total')}<input type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} /></label>
          <label className="campo">{t('camp.motivo')}<input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: Black Friday" /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </div>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button><button className="btn-primary" disabled={!preco || !de || !ate} onClick={add}>{t('camp.add')}</button></div>
      </>}
    </div></div>
  );
}
