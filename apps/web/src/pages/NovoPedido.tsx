import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Endereco { cep: string | null; logradouro: string | null; numero: string | null; bairro: string | null; cidade: string | null; uf: string | null; favorito: boolean; }
interface Cliente { id: string; nome: string; enderecos: Endereco[]; }
interface Vendedor { id: string; nome: string; }
interface Motoboy { id: string; nome: string; ativo: boolean; }
interface Condicao { id: string; nome: string; parcelas: number; }
interface PrecoProduto { produtoId: string; produtoNome: string; preco: number; ativo: boolean; }
interface ItemForm { produtoId: string; quantidade: string; }
interface FreteCalculo { frete: number; distanciaKm: number | null; memo: string | null; }

const FORMAS = ['retirada', 'motoboy', 'correios', 'transportadora'] as const;
type Forma = typeof FORMAS[number];

function endTexto(e: Endereco): string {
  const p1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const p2 = [e.bairro, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  return [p1, p2].filter(Boolean).join(' - ');
}

export function NovoPedido() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [condicoes, setCondicoes] = useState<Condicao[]>([]);
  const [condicaoId, setCondicaoId] = useState('');
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState<string | null>(null);
  const [formaEntrega, setFormaEntrega] = useState<Forma>('retirada');
  const [motoboyId, setMotoboyId] = useState('');
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [freteMemo, setFreteMemo] = useState<string | null>(null);
  const [frete, setFrete] = useState('0');
  const [obs, setObs] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([{ produtoId: '', quantidade: '1' }]);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Cliente[]>('/clientes', token!).catch(() => []),
      api.get<Vendedor[]>('/vendedores', token!).catch(() => []),
      api.get<PrecoProduto[]>('/precos', token!).catch(() => []),
      api.get<Condicao[]>('/condicoes', token!).catch(() => []),
      api.get<Motoboy[]>('/motoboys', token!).catch(() => []),
    ]).then(([c, v, p, cond, mb]) => {
      setClientes(c); setVendedores(v); setProdutos(p.filter((x) => x.ativo));
      setCondicoes((cond as Condicao[]).filter((x: any) => x.ativo !== false));
      setMotoboys((mb as Motoboy[]).filter((x) => x.ativo));
    });
    /* eslint-disable-next-line */
  }, []);

  function escolherCliente(id: string) {
    setClienteId(id);
    const c = clientes.find((x) => x.id === id);
    const fav = c?.enderecos.find((e) => e.favorito) ?? c?.enderecos[0];
    setEndereco(fav ? endTexto(fav) : '');
    setCep(fav?.cep ?? null);
  }

  // Recalcula o frete quando a forma de entrega ou o CEP mudam (retirada/motoboy são automáticos).
  useEffect(() => {
    let vivo = true;
    async function calc() {
      if (formaEntrega === 'retirada') { setFrete('0'); setDistanciaKm(null); setFreteMemo(null); setMotoboyId(''); return; }
      if (formaEntrega === 'motoboy') {
        try {
          const r = await api.post<FreteCalculo>('/frete/calcular', { formaEntrega: 'motoboy', cep }, token!);
          if (!vivo) return;
          setFrete(String(r.frete)); setDistanciaKm(r.distanciaKm); setFreteMemo(r.memo);
        } catch { /* mantém valor */ }
        return;
      }
      // correios/transportadora: valor manual
      setDistanciaKm(null); setFreteMemo(null);
    }
    calc();
    return () => { vivo = false; };
    /* eslint-disable-next-line */
  }, [formaEntrega, cep]);

  const precoDe = (pid: string) => produtos.find((p) => p.produtoId === pid)?.preco ?? 0;
  const subtotal = useMemo(() => itens.reduce((acc, it) => acc + precoDe(it.produtoId) * (Number(it.quantidade) || 0), 0), [itens, produtos]);
  const total = subtotal + (Number(frete) || 0);
  const freteAuto = formaEntrega === 'retirada' || formaEntrega === 'motoboy';

  function setItem(i: number, campo: keyof ItemForm, val: string) { setItens(itens.map((it, idx) => idx === i ? { ...it, [campo]: val } : it)); }
  function addItem() { setItens([...itens, { produtoId: '', quantidade: '1' }]); }
  function delItem(i: number) { setItens(itens.filter((_, idx) => idx !== i)); }

  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = {
      clienteId, vendedorId: vendedorId || null, condicaoId: condicaoId || null, formaPagamento, enderecoEntrega: endereco,
      observacao: obs, frete: Number(frete) || 0,
      formaEntrega, motoboyId: formaEntrega === 'motoboy' ? (motoboyId || null) : null, distanciaKm,
      itens: itens.filter((it) => it.produtoId).map((it) => ({ produtoId: it.produtoId, quantidade: Number(it.quantidade) })),
    };
    try { const r = await api.post<{ id: string }>('/pedidos', corpo, token!); nav('/comercial/pedidos/' + r.id); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  const motoboyFaltando = formaEntrega === 'motoboy' && !motoboyId;

  return (
    <div>
      <div className="crumb">{t('pedidos.crumb_novo')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('pedidos.novo')}</h1><div className="muted page-sub">{t('pedidos.sub_novo')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{t('pedidos.card_dados')}</h3></div>
        <div className="form-grid">
          <label className="campo full">{t('pedidos.cliente')}
            <select value={clienteId} onChange={(e) => escolherCliente(e.target.value)}>
              <option value="">{t('pedidos.escolha_cliente')}</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="campo">{t('pedidos.vendedor')}
            <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
              <option value="">—</option>{vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </label>
          <label className="campo">{t('pedidos.forma_pgto')}
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              <option>Pix</option><option>Boleto</option><option>Cartão</option><option>Dinheiro</option>
            </select>
          </label>
          <label className="campo">{t('cond.titulo_s')}
            <select value={condicaoId} onChange={(e) => setCondicaoId(e.target.value)}>
              <option value="">{t('cond.avista_pad')}</option>{condicoes.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.parcelas}x)</option>)}
            </select>
          </label>
          <label className="campo full">{t('pedidos.obs')}<textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t('pedidos.obs_ph')} /></label>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{t('pedidos.card_endereco')}</h3></div>
        <label className="campo">{t('pedidos.endereco')}<input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder={t('pedidos.endereco_ph')} /></label>
      </div>

      <div className="card pad0" style={{ maxWidth: 'none' }}>
        <div className="card-head" style={{ padding: '18px 20px 4px' }}>
          <h3>{t('pedidos.itens')}</h3>
          <button type="button" className="btn-primary btn-mini" onClick={addItem}>+ {t('pedidos.add_item')}</button>
        </div>
        <table className="tabela" style={{ marginTop: 6 }}>
          <thead><tr><th>{t('precos.produto')}</th><th style={{ width: 110 }}>{t('rel.qtd')}</th><th style={{ width: 130 }}>{t('pedidos.preco_un')}</th><th style={{ width: 130 }}>{t('pedidos.subtotal')}</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={5} className="vazio">{t('pedidos.sem_itens')}</td></tr>}
            {itens.map((it, i) => (
              <tr key={i}>
                <td>
                  <select value={it.produtoId} onChange={(e) => setItem(i, 'produtoId', e.target.value)} style={{ width: '100%' }}>
                    <option value="">{t('pedidos.escolha_produto')}</option>
                    {produtos.map((pp) => <option key={pp.produtoId} value={pp.produtoId}>{pp.produtoNome}</option>)}
                  </select>
                </td>
                <td><input type="number" min="0" step="1" value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} style={{ width: 90 }} /></td>
                <td>{moeda(precoDe(it.produtoId))}</td>
                <td><b>{moeda(precoDe(it.produtoId) * (Number(it.quantidade) || 0))}</b></td>
                <td><button type="button" className="btn-link" onClick={() => delItem(i)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="totais-mock">
          <div className="tl-row"><span className="muted">{t('pedidos.subtotal')}</span><b>{moeda(subtotal)}</b></div>
          <div className="tl-row">
            <span className="muted">{t('entrega.forma')}</span>
            <select value={formaEntrega} onChange={(e) => setFormaEntrega(e.target.value as Forma)} style={{ maxWidth: 180 }}>
              {FORMAS.map((f) => <option key={f} value={f}>{t('entrega.' + f)}</option>)}
            </select>
            {formaEntrega === 'motoboy' && (
              <select value={motoboyId} onChange={(e) => setMotoboyId(e.target.value)} style={{ maxWidth: 180 }}>
                <option value="">{t('entrega.motoboy')}…</option>{motoboys.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            )}
          </div>
          <div className="tl-row">
            {freteMemo && <span className="muted" style={{ fontSize: 12, marginRight: 'auto' }}>{freteMemo}</span>}
            <span className="muted">{t('pedidos.frete')}</span>
            <input type="number" min="0" step="0.01" value={frete} readOnly={freteAuto} onChange={(e) => setFrete(e.target.value)} style={{ width: 130, textAlign: 'right' }} />
          </div>
          <div className="tl-row tl-total"><span className="muted">{t('pedidos.total')}</span><b style={{ fontSize: 20 }}>{moeda(total)}</b></div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-primary" disabled={salv || motoboyFaltando} onClick={salvar}>{t('pedidos.criar')}</button>
        <button className="btn-ghost" onClick={() => nav('/comercial/pedidos')}>{t('common.cancelar')}</button>
      </div>
    </div>
  );
}
