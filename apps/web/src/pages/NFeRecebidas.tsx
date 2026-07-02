import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';

interface ItemNota { codigo: string; descricao: string; quantidade: number; valorUnitario: number; valorTotal: number; sugestaoProdutoId: string | null; }
interface Nota { chave: string; emitenteCnpj: string | null; emitenteNome: string | null; numero: string | null; serie: string | null; emissao: string | null; valor: number; status: string; tituloId: string | null; itens: ItemNota[]; }
interface ProdutoOpt { id: string; nome: string; }
interface CatFin { id: string; nome: string; grupo?: string; tipo?: string; }

const dataBR = (v: string | null) => v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

export function NFeRecebidas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const podeImportar = temCapability('fiscal.recebida.importar');
  const [notas, setNotas] = useState<Nota[]>([]);
  const [produtos, setProdutos] = useState<ProdutoOpt[]>([]);
  const [cats, setCats] = useState<CatFin[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [fStatus, setFStatus] = useState('');
  const [importar, setImportar] = useState<Nota | null>(null);

  async function carregar() {
    try {
      setNotas(await api.get<Nota[]>('/fiscal/nfe-recebidas' + (fStatus ? '?status=' + fStatus : ''), token!));
      setProdutos(await api.get<ProdutoOpt[]>('/produtos', token!).catch(() => []));
      setCats(await api.get<CatFin[]>('/categorias-financeiras', token!).catch(() => []));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [fStatus]);

  async function buscarNovas() {
    setBuscando(true); setErro(null);
    try { const r = await api.post<{ recebidas: number }>('/fiscal/nfe-recebidas/buscar', {}, token!); toast(t('nfrec.buscou') + ' ' + r.recebidas); await carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setBuscando(false); }
  }

  const chip = (v: string, lbl: string) => <button className={'chip-f' + (fStatus === v ? ' on' : '')} onClick={() => setFStatus(v)}>{lbl}</button>;

  return (
    <div>
      <div className="crumb">{t('nfrec.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('nfrec.titulo')}</h1><div className="muted page-sub">{t('nfrec.sub')}</div></div>
        <button className="btn-primary" disabled={buscando} onClick={buscarNovas}><Ic name="i-refresh" className="sm" /> {buscando ? t('nfrec.buscando') : t('nfrec.buscar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="chips-f">{chip('', t('nfrec.f_todas'))}{chip('pendente', t('nfrec.pendente'))}{chip('importada', t('nfrec.importada'))}</div>
      </div>
      <div className="card pad0"><table className="tabela tabela-cards">
        <thead><tr><th>{t('nfrec.fornecedor')}</th><th>{t('nfrec.nf')}</th><th>{t('nfrec.emissao')}</th><th style={{ textAlign: 'right' }}>{t('nfrec.valor')}</th><th>{t('nfrec.situacao')}</th><th></th></tr></thead>
        <tbody>
          {notas.length === 0 && <tr><td colSpan={6} className="vazio">{t('nfrec.nenhuma')}</td></tr>}
          {notas.map((n) => (
            <tr key={n.chave}>
              <td data-label={t('nfrec.fornecedor')}><div>{n.emitenteNome ?? '—'}</div><div className="muted" style={{ fontSize: 12 }}>{n.emitenteCnpj ?? ''}</div></td>
              <td data-label={t('nfrec.nf')}>{n.numero ?? '—'}{n.serie ? ' / ' + n.serie : ''}</td>
              <td data-label={t('nfrec.emissao')}>{dataBR(n.emissao)}</td>
              <td data-label={t('nfrec.valor')} style={{ textAlign: 'right' }}>{moeda(n.valor)}</td>
              <td data-label={t('nfrec.situacao')}><span className={'pill ' + (n.status === 'importada' ? 'pill-ok' : 'st-laranja')}>{t('nfrec.' + n.status)}</span></td>
              <td style={{ textAlign: 'right' }}>
                {n.status !== 'importada' && podeImportar && <button className="btn-primary btn-mini" onClick={() => setImportar(n)}>{t('nfrec.importar')}</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {importar && <ModalImportar nota={importar} produtos={produtos} cats={cats} onFechar={() => setImportar(null)} onOk={() => { setImportar(null); toast(t('nfrec.importada_ok')); carregar(); }} />}
    </div>
  );
}

function ModalImportar({ nota, produtos, cats, onFechar, onOk }: { nota: Nota; produtos: ProdutoOpt[]; cats: CatFin[]; onFechar: () => void; onOk: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [gerarTitulo, setGerarTitulo] = useState(true);
  const [vencimento, setVencimento] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [categoriaId, setCategoriaId] = useState('');
  const [entrada, setEntrada] = useState(true);
  const [itens, setItens] = useState(nota.itens.map((i) => ({ codigo: i.codigo, entra: !!i.sugestaoProdutoId, produtoId: i.sugestaoProdutoId ?? '' })));
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const catsDespesa = cats.filter((c) => c.tipo !== 'receita' && c.grupo !== 'receita');
  const setItem = (codigo: string, patch: Partial<{ entra: boolean; produtoId: string }>) => setItens((xs) => xs.map((x) => x.codigo === codigo ? { ...x, ...patch } : x));

  async function importar() {
    setErro(null); setSalv(true);
    const corpo = { gerarTitulo, vencimento, categoriaFinanceiraId: categoriaId || null, itens: entrada ? itens : [] };
    try { await api.post('/fiscal/nfe-recebidas/' + encodeURIComponent(nota.chave) + '/importar', corpo, token!); onOk(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo">
      <div className="modal modal-lg">
        <h3>{t('nfrec.importar')} — NF {nota.numero ?? ''}{nota.serie ? ' / ' + nota.serie : ''}</h3>
        <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{nota.emitenteNome ?? '—'} · {nota.emitenteCnpj ?? ''} · {moeda(nota.valor)}</div>
        {erro && <div className="alerta-erro">{t(erro)}</div>}

        <label className="check-linha"><input type="checkbox" checked={gerarTitulo} onChange={(e) => setGerarTitulo(e.target.checked)} /> {t('nfrec.gerar_titulo')}</label>
        <div className="muted" style={{ fontSize: 12, margin: '2px 0 10px 24px' }}>{t('nfrec.gerar_titulo_hint')}</div>
        {gerarTitulo && (
          <div className="cores-grid" style={{ marginLeft: 24 }}>
            <label className="campo">{t('nfrec.vencimento')}<input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></label>
            <label className="campo">{t('nfrec.categoria')}
              <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">{t('nfrec.sem_categoria')}</option>
                {catsDespesa.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
          </div>
        )}

        <label className="check-linha" style={{ marginTop: 14 }}><input type="checkbox" checked={entrada} onChange={(e) => setEntrada(e.target.checked)} /> {t('nfrec.entrada_estoque')}</label>
        <div className="muted" style={{ fontSize: 12, margin: '2px 0 8px 24px' }}>{t('nfrec.entrada_hint')}</div>
        {entrada && (
          <div className="card pad0"><table className="tabela">
            <thead><tr><th>{t('nfrec.entra')}</th><th>{t('nfrec.item')}</th><th style={{ textAlign: 'right' }}>{t('nfrec.qtd')}</th><th>{t('nfrec.produto')}</th></tr></thead>
            <tbody>
              {nota.itens.map((i) => { const it = itens.find((x) => x.codigo === i.codigo)!; return (
                <tr key={i.codigo}>
                  <td><input type="checkbox" checked={it.entra} onChange={(e) => setItem(i.codigo, { entra: e.target.checked })} /></td>
                  <td>{i.descricao}<div className="muted" style={{ fontSize: 11 }}>{i.codigo}</div></td>
                  <td style={{ textAlign: 'right' }}>{i.quantidade.toLocaleString('pt-BR')}</td>
                  <td><select value={it.produtoId} disabled={!it.entra} onChange={(e) => setItem(i.codigo, { produtoId: e.target.value })}>
                    <option value="">{t('nfrec.escolha_produto')}</option>
                    {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select></td>
                </tr>
              ); })}
            </tbody>
          </table></div>
        )}

        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={importar}>{t('nfrec.importar')}</button>
        </div>
      </div>
    </div>
  );
}
