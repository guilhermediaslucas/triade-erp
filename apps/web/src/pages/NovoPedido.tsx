import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Endereco { logradouro: string | null; numero: string | null; bairro: string | null; cidade: string | null; uf: string | null; favorito: boolean; }
interface Cliente { id: string; nome: string; enderecos: Endereco[]; }
interface Vendedor { id: string; nome: string; }
interface Condicao { id: string; nome: string; parcelas: number; }
interface PrecoProduto { produtoId: string; produtoNome: string; preco: number; ativo: boolean; }
interface ItemForm { produtoId: string; quantidade: string; }

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
  const [condicoes, setCondicoes] = useState<Condicao[]>([]);
  const [condicaoId, setCondicaoId] = useState('');
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [endereco, setEndereco] = useState('');
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
    ]).then(([c, v, p, cond]) => { setClientes(c); setVendedores(v); setProdutos(p.filter((x) => x.ativo)); setCondicoes((cond as Condicao[]).filter((x: any) => x.ativo !== false)); });
    /* eslint-disable-next-line */
  }, []);

  function escolherCliente(id: string) {
    setClienteId(id);
    const c = clientes.find((x) => x.id === id);
    const fav = c?.enderecos.find((e) => e.favorito) ?? c?.enderecos[0];
    setEndereco(fav ? endTexto(fav) : '');
  }
  const precoDe = (pid: string) => produtos.find((p) => p.produtoId === pid)?.preco ?? 0;
  const subtotal = useMemo(() => itens.reduce((acc, it) => acc + precoDe(it.produtoId) * (Number(it.quantidade) || 0), 0), [itens, produtos]);
  const total = subtotal + (Number(frete) || 0);

  function setItem(i: number, campo: keyof ItemForm, val: string) { setItens(itens.map((it, idx) => idx === i ? { ...it, [campo]: val } : it)); }
  function addItem() { setItens([...itens, { produtoId: '', quantidade: '1' }]); }
  function delItem(i: number) { setItens(itens.filter((_, idx) => idx !== i)); }

  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = {
      clienteId, vendedorId: vendedorId || null, condicaoId: condicaoId || null, formaPagamento, enderecoEntrega: endereco,
      observacao: obs, frete: Number(frete) || 0,
      itens: itens.filter((it) => it.produtoId).map((it) => ({ produtoId: it.produtoId, quantidade: Number(it.quantidade) })),
    };
    try { const r = await api.post<{ id: string }>('/pedidos', corpo, token!); nav('/comercial/pedidos/' + r.id); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('pedidos.novo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card" style={{ maxWidth: 820 }}>
        <div className="cores-grid">
          <label className="campo">{t('pedidos.cliente')}
            <select value={clienteId} onChange={(e) => escolherCliente(e.target.value)}>
              <option value="">—</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
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
        </div>
        <label className="campo">{t('pedidos.endereco')}<input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder={t('pedidos.endereco_ph')} /></label>

        <div className="perm-titulo" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('pedidos.itens')}</span>
          <button type="button" className="btn-ghost btn-mini" onClick={addItem}>+ {t('pedidos.add_item')}</button>
        </div>
        {itens.map((it, i) => (
          <div key={i} className="item-linha">
            <select value={it.produtoId} onChange={(e) => setItem(i, 'produtoId', e.target.value)}>
              <option value="">{t('pedidos.escolha_produto')}</option>
              {produtos.map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
            </select>
            <input type="number" min="0" step="1" value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} style={{ maxWidth: 90 }} />
            <span className="item-preco">{moeda(precoDe(it.produtoId))}</span>
            <span className="item-sub">{moeda(precoDe(it.produtoId) * (Number(it.quantidade) || 0))}</span>
            <button type="button" className="btn-link" onClick={() => delItem(i)}>✕</button>
          </div>
        ))}

        <div className="totais">
          <div><span>{t('pedidos.subtotal')}</span><b>{moeda(subtotal)}</b></div>
          <div><span>{t('pedidos.frete')}</span><input type="number" min="0" step="0.01" value={frete} onChange={(e) => setFrete(e.target.value)} style={{ maxWidth: 120 }} /></div>
          <div className="total-grande"><span>{t('pedidos.total')}</span><b>{moeda(total)}</b></div>
        </div>

        <label className="campo">{t('pedidos.obs')}<input value={obs} onChange={(e) => setObs(e.target.value)} /></label>
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={() => nav('/comercial/pedidos')}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('pedidos.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
