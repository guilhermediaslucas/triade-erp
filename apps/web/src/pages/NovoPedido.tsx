import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { notificarPixPendente } from '../lib/notificarPix.js';
import { mascaraCep, buscarCep, UFS } from '../lib/br.js';
import { ModalNovaPessoa } from '../components/SeletorPessoa.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { FORMAS_PAGAMENTO, ehAVista, liberaDireto } from '../lib/pagamento.js';
import { notificarLiberadoSeparacao } from '../lib/notificarSeparacao.js';
import { useToast } from '../components/Toast.js';

interface Endereco { cep: string | null; logradouro: string | null; numero: string | null; complemento?: string | null; bairro: string | null; cidade: string | null; uf: string | null; favorito: boolean; }
interface Cliente { id: string; tipoPessoa: string; nome: string; fantasia: string | null; documento: string; email: string | null; telefone: string | null; limiteCredito: number; ativo: boolean; enderecos: Endereco[]; }
interface Vendedor { id: string; nome: string; }
interface Motoboy { id: string; nome: string; ativo: boolean; }
interface Condicao { id: string; nome: string; parcelas: number; }
interface PrecoProduto { produtoId: string; produtoNome: string; preco: number; ativo: boolean; }
interface ItemForm { produtoId: string; quantidade: string; }
interface FreteCalculo { frete: number; distanciaKm: number | null; memo: string | null; }
interface NovoEndereco { logradouro: string; numero: string; complemento: string; bairro: string; cep: string; cidade: string; uf: string; }

const FORMAS = ['retirada', 'motoboy', 'correios', 'transportadora'] as const;
type Forma = typeof FORMAS[number];
const NOVO = '__novo__';
const ATUAL = '__atual__'; // (edição) manter o endereço já salvo no pedido

function endTexto(e: Endereco): string {
  const p1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const p2 = [e.bairro, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  const t = [p1, p2].filter(Boolean).join(' - ');
  return e.cep ? [t, e.cep].filter(Boolean).join(', ') : t;
}
function novoEndTexto(e: NovoEndereco): string {
  const p1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const p2 = [e.bairro, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  const t = [p1, p2].filter(Boolean).join(' - ');
  return e.cep ? [t, e.cep].filter(Boolean).join(', ') : t;
}
const endVazio = (): NovoEndereco => ({ logradouro: '', numero: '', complemento: '', bairro: '', cep: '', cidade: '', uf: '' });

export function NovoPedido() {
  const { token, usuario, temCapability } = useAuth();
  // Vendedor travado: usuário sem a permissão "qualquer vendedor" e vinculado a um Vendedor
  // só cria pedido para si (o backend também força isso).
  const vendedorTravado = !temCapability('comercial.pedido.vendedor_qualquer') && !!usuario?.vendedorId;
  const { t } = useI18n();
  const nav = useNavigate();
  const toast = useToast();
  const { id: pedidoId } = useParams();         // presente = modo edição (orçamento)
  const editando = !!pedidoId;
  const [sp] = useSearchParams();                // ?cliente= (pré-seleciona) e ?oport= (vincula ao CRM)
  const oportId = sp.get('oport');
  const [enderecoAtual, setEnderecoAtual] = useState<string | null>(null);
  const [condAlvo, setCondAlvo] = useState<{ parcelas: number; intervalo: number } | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [condicoes, setCondicoes] = useState<Condicao[]>([]);
  const [condicaoId, setCondicaoId] = useState('');
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  // Endereço: índice do endereço salvo escolhido, ou NOVO p/ informar um novo.
  const [endSel, setEndSel] = useState('');
  const [novoEnd, setNovoEnd] = useState<NovoEndereco>(endVazio());
  const [salvarEnd, setSalvarEnd] = useState(false);
  const [cep, setCep] = useState<string | null>(null);
  const [formaEntrega, setFormaEntrega] = useState<Forma>('retirada');
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [freteMemo, setFreteMemo] = useState<string | null>(null);
  const [frete, setFrete] = useState('0');                 // CUSTO real do frete (motoboy/correios)
  const [freteCobrado, setFreteCobrado] = useState<number | null>(null);  // o que o cliente paga (campanha)
  const [desconto, setDesconto] = useState(0);                            // desconto por total do pedido (campanha vigente)
  const [obs, setObs] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([{ produtoId: '', quantidade: '1' }]);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const [novoCli, setNovoCli] = useState(false);
  const [estoque, setEstoque] = useState<Record<string, number>>({});
  const [estoqueOk, setEstoqueOk] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Cliente[]>('/clientes', token!).catch(() => []),
      api.get<Vendedor[]>('/vendedores', token!).catch(() => []),
      api.get<PrecoProduto[]>('/precos', token!).catch(() => []),
      api.get<Condicao[]>('/condicoes', token!).catch(() => []),
    ]).then(([c, v, p, cond]) => {
      setClientes(c); setVendedores(v); setProdutos(p.filter((x) => x.ativo));
      setCondicoes((cond as Condicao[]).filter((x: any) => x.ativo !== false));
    });
    // Saldo disponível por produto (informativo no ato do pedido). Pode falhar se o
    // usuário não tiver a permissão de ver estoque — nesse caso simplesmente não mostra.
    api.get<{ produtoId: string; disponivel: number }[]>('/estoque', token!)
      .then((l) => { const m: Record<string, number> = {}; l.forEach((x) => { m[x.produtoId] = x.disponivel; }); setEstoque(m); setEstoqueOk(true); })
      .catch(() => setEstoqueOk(false));
    /* eslint-disable-next-line */
  }, []);
  const dispDe = (pid: string) => estoque[pid] ?? 0;

  // Quando o vendedor é travado, força o próprio vendedor vinculado.
  useEffect(() => {
    if (vendedorTravado && usuario?.vendedorId) setVendedorId(usuario.vendedorId);
  }, [vendedorTravado, usuario?.vendedorId]);

  // Modo edição: carrega o pedido (orçamento) e preenche o formulário.
  useEffect(() => {
    if (!pedidoId) return;
    api.get<any>('/pedidos/' + pedidoId, token!).then((p) => {
      setClienteId(p.clienteId ?? '');
      setVendedorId(p.vendedorId ?? '');
      setFormaPagamento(p.formaPagamento ?? 'Pix');
      setObs(p.observacao ?? '');
      setFormaEntrega((FORMAS as readonly string[]).includes(p.formaEntrega) ? p.formaEntrega : 'retirada');
      setFrete(String(p.frete ?? 0));
      setDistanciaKm(p.distanciaKm ?? null);
      setEnderecoAtual(p.enderecoEntrega ?? null);
      setEndSel(p.enderecoEntrega ? ATUAL : NOVO);
      if (p.condicaoParcelas && p.condicaoParcelas > 1) setCondAlvo({ parcelas: p.condicaoParcelas, intervalo: p.condicaoIntervalo ?? 30 });
      const its = Array.isArray(p.itens) ? p.itens.filter((it: any) => it.produtoId) : [];
      setItens(its.length ? its.map((it: any) => ({ produtoId: it.produtoId, quantidade: String(it.quantidade) })) : [{ produtoId: '', quantidade: '1' }]);
    }).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, [pedidoId]);

  // (Gerar orçamento do CRM) pré-seleciona o cliente vindo por ?cliente= assim que a lista carrega.
  useEffect(() => {
    const cid = sp.get('cliente');
    if (editando || !cid || clienteId || clientes.length === 0) return;
    if (clientes.some((c) => c.id === cid)) escolherCliente(cid);
    /* eslint-disable-next-line */
  }, [clientes]);

  // (edição) Casa de volta a condição de pagamento pelo nº de parcelas, quando as condições carregam.
  useEffect(() => {
    if (!condAlvo || condicoes.length === 0) return;
    const c = condicoes.find((x) => x.parcelas === condAlvo.parcelas);
    if (c) setCondicaoId(c.id);
    setCondAlvo(null);
    /* eslint-disable-next-line */
  }, [condicoes, condAlvo]);

  // Recarrega a lista de clientes após cadastro inline e já seleciona o novo (por nome).
  const recarregarClientes = (nomeSel?: string) =>
    api.get<Cliente[]>('/clientes', token!).then((c) => {
      setClientes(c);
      if (nomeSel) { const n = c.find((x) => x.nome === nomeSel); if (n) escolherCliente(n.id); }
    }).catch(() => {});

  const cliente = clientes.find((c) => c.id === clienteId);
  // Endereços do cliente com o favorito no topo.
  const ends = useMemo(() => {
    const arr = cliente ? [...cliente.enderecos] : [];
    return arr.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));
  }, [cliente]);

  function escolherCliente(id: string) {
    setClienteId(id);
    const c = clientes.find((x) => x.id === id);
    const lista = c ? [...c.enderecos].sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0)) : [];
    if (lista.length) { setEndSel('0'); setCep(lista[0]!.cep ?? null); }
    else { setEndSel(NOVO); setCep(null); }
    setNovoEnd(endVazio()); setSalvarEnd(false);
  }

  // Texto e CEP do endereço efetivo (salvo escolhido, o novo digitado, ou o atual em edição).
  const usandoNovo = endSel === NOVO;
  const usandoAtual = endSel === ATUAL;
  useEffect(() => {
    if (usandoAtual) {                             // edição: deriva o CEP do endereço salvo (p/ recalcular motoboy)
      const m = (enderecoAtual ?? '').match(/\d{5}-?\d{3}/);
      setCep(m ? m[0] : null);
      return;
    }
    if (usandoNovo) setCep(novoEnd.cep || null);
    else { const e = ends[Number(endSel)]; setCep(e?.cep ?? null); }
    /* eslint-disable-next-line */
  }, [endSel, novoEnd.cep, enderecoAtual]);

  function enderecoEfetivo(): string {
    if (usandoAtual) return enderecoAtual ?? '';
    if (usandoNovo) return novoEndTexto(novoEnd);
    const e = ends[Number(endSel)];
    return e ? endTexto(e) : '';
  }

  async function cepLookup() {
    const d = await buscarCep(novoEnd.cep);
    if (d) setNovoEnd((cur) => ({ ...cur, logradouro: d.logradouro || cur.logradouro, bairro: d.bairro || cur.bairro, cidade: d.cidade || cur.cidade, uf: d.uf || cur.uf }));
  }

  // Recalcula o frete quando a forma de entrega ou o CEP mudam (retirada/motoboy são automáticos).
  useEffect(() => {
    let vivo = true;
    async function calc() {
      if (formaEntrega === 'retirada') { setFrete('0'); setDistanciaKm(null); setFreteMemo(null); return; }
      if (formaEntrega === 'motoboy') {            // frete automático: recalcula sempre, inclusive na edição
        try {
          const r = await api.post<FreteCalculo>('/frete/calcular', { formaEntrega: 'motoboy', cep }, token!);
          if (!vivo) return;
          setFrete(String(r.frete)); setDistanciaKm(r.distanciaKm); setFreteMemo(r.memo);
        } catch { /* mantém valor */ }
        return;
      }
      if (usandoAtual) return;                     // correios/transportadora em edição: preserva o frete manual salvo
      setDistanciaKm(null); setFreteMemo(null);
    }
    calc();
    return () => { vivo = false; };
    /* eslint-disable-next-line */
  }, [formaEntrega, cep]);

  // Pix é somente à vista: trava o seletor de condição.
  const pixTrava = ehAVista(formaPagamento);
  useEffect(() => { if (pixTrava && condicaoId) setCondicaoId(''); /* eslint-disable-next-line */ }, [pixTrava]);

  const precoDe = (pid: string) => produtos.find((p) => p.produtoId === pid)?.preco ?? 0;
  const subDe = (it: ItemForm) => precoDe(it.produtoId) * (Number(it.quantidade) || 0);
  const subtotal = useMemo(() => itens.reduce((acc, it) => acc + subDe(it), 0), [itens, produtos]);
  const freteCusto = Number(frete) || 0;
  const freteCobradoNum = freteCobrado != null ? freteCobrado : freteCusto;   // campanha aplicada (ou = custo)
  const freteAbsorvido = Math.max(0, Math.round((freteCusto - freteCobradoNum) * 100) / 100);
  const total = Math.round((subtotal - desconto + freteCobradoNum) * 100) / 100;
  const freteAuto = formaEntrega === 'retirada' || formaEntrega === 'motoboy';

  // Resolve o frete COBRADO do cliente (campanha vigente) p/ exibir o total certo.
  // O custo continua sendo enviado ao backend, que reaplica a campanha de forma autoritativa.
  useEffect(() => {
    let vivo = true;
    if (!clienteId || freteCusto <= 0) { setFreteCobrado(null); return; }
    api.get<{ cobrado: number }>(`/frete/cobrado?clienteId=${clienteId}&custo=${freteCusto}&subtotal=${subtotal}`, token!)
      .then((r) => { if (vivo) setFreteCobrado(r.cobrado); }).catch(() => { if (vivo) setFreteCobrado(null); });
    return () => { vivo = false; };
    /* eslint-disable-next-line */
  }, [clienteId, freteCusto, subtotal]);

  // Resolve o desconto por total do pedido (campanha vigente) p/ exibir já na digitação.
  // O backend reaplica de forma autoritativa ao salvar.
  useEffect(() => {
    let vivo = true;
    if (!clienteId || subtotal <= 0) { setDesconto(0); return; }
    api.get<{ desconto: number }>(`/comercial/descontos/resolver?clienteId=${clienteId}&subtotal=${subtotal}`, token!)
      .then((r) => { if (vivo) setDesconto(Number(r.desconto) || 0); }).catch(() => { if (vivo) setDesconto(0); });
    return () => { vivo = false; };
    /* eslint-disable-next-line */
  }, [clienteId, subtotal]);

  function setItem(i: number, campo: keyof ItemForm, val: string) { setItens(itens.map((it, idx) => idx === i ? { ...it, [campo]: val } : it)); }
  function addItem() { setItens([...itens, { produtoId: '', quantidade: '1' }]); }
  function delItem(i: number) { setItens(itens.filter((_, idx) => idx !== i)); setSel(new Set()); }
  function toggleSel(i: number) { const s = new Set(sel); s.has(i) ? s.delete(i) : s.add(i); setSel(s); }
  function toggleTodos() { setSel(sel.size === itens.length ? new Set() : new Set(itens.map((_, i) => i))); }
  function excluirSel() { setItens(itens.filter((_, i) => !sel.has(i))); setSel(new Set()); }
  const totalSel = useMemo(() => itens.reduce((acc, it, i) => acc + (sel.has(i) ? subDe(it) : 0), 0), [itens, sel, produtos]);

  function corpoPedido() {
    return {
      clienteId, vendedorId: vendedorId || null, condicaoId: condicaoId || null, formaPagamento,
      enderecoEntrega: enderecoEfetivo(), observacao: obs, frete: Number(frete) || 0,
      formaEntrega, motoboyId: null, distanciaKm,
      itens: itens.filter((it) => it.produtoId).map((it) => ({ produtoId: it.produtoId, quantidade: Number(it.quantidade) })),
    };
  }

  // Salva o novo endereço no cadastro do cliente (best-effort: não bloqueia o pedido).
  async function talvezSalvarEndereco() {
    if (!usandoNovo || !salvarEnd || !cliente) return;
    const novo: Endereco = { ...novoEnd, favorito: cliente.enderecos.length === 0 };
    const corpo = {
      tipoPessoa: cliente.tipoPessoa, nome: cliente.nome, fantasia: cliente.fantasia, documento: cliente.documento,
      email: cliente.email, telefone: cliente.telefone, limiteCredito: cliente.limiteCredito,
      enderecos: [...cliente.enderecos, novo],
    };
    try { await api.put('/clientes/' + cliente.id, corpo, token!); } catch { /* ignora */ }
  }

  // Cria (novo) ou edita (orçamento existente) e devolve o id.
  async function salvar(): Promise<string> {
    if (editando) { await api.put('/pedidos/' + pedidoId, corpoPedido(), token!); return pedidoId!; }
    const r = await api.post<{ id: string }>('/pedidos', corpoPedido(), token!);
    return r.id;
  }
  // Vincula o pedido criado à oportunidade do CRM (quando veio de "Gerar orçamento").
  async function talvezVincularOport(pedidoIdNovo: string) {
    if (!oportId) return;
    try { await api.patch('/crm/oportunidades/' + oportId + '/orcamento', { pedidoId: pedidoIdNovo }, token!); } catch { /* ignora */ }
  }

  // "Salvar como orçamento": só salva (status fica em orçamento) e vai ao detalhe.
  async function salvarOrcamento() {
    setErro(null); setSalv(true);
    try {
      const id = await salvar();
      await talvezSalvarEndereco();
      await talvezVincularOport(id);
      nav('/comercial/pedidos/' + id);
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  // "Criar pedido": cria e confirma (orçamento → aguardando pagamento, que aplica o gate
  // de forma de pagamento e o limite de crédito). Vai ao detalhe. O confirm é best-effort:
  // se o usuário não tiver a permissão de gerenciar (ou estourar o limite), o pedido fica
  // como orçamento e a confirmação acontece na tela de detalhe, com o feedback adequado.
  async function criarPedido() {
    setErro(null); setSalv(true);
    try {
      const id = await salvar();
      await talvezSalvarEndereco();
      await talvezVincularOport(id);
      let confirmou = false;
      try { await api.patch('/pedidos/' + id + '/status', { status: 'aguardando_pagamento' }, token!); confirmou = true; } catch { /* confirma no detalhe */ }
      // Pix/Link gerado → toast de ação "Pendência de baixa" (Abrir → Contas a receber).
      // Cartão/Dinheiro liberam na hora → toast "liberado para separação" (Abrir → Expedição).
      if (confirmou && (ehAVista(formaPagamento) || liberaDireto(formaPagamento))) {
        try {
          const ped = await api.get<{ numero: number; clienteNome: string | null; total: number }>('/pedidos/' + id, token!);
          if (liberaDireto(formaPagamento)) notificarLiberadoSeparacao(ped.numero, ped.clienteNome, ped.total, t);
          else notificarPixPendente(ped.numero, ped.clienteNome, ped.total, t);
        }
        catch { toast(t('pedido.toast_pix_pendente')); }
      }
      nav('/comercial/pedidos/' + id);
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  // Bloqueia criar/salvar quando algum item passa do disponível em estoque.
  const excedeEstoque = estoqueOk && itens.some((it) => it.produtoId && (Number(it.quantidade) || 0) > dispDe(it.produtoId));
  const bloqueado = salv || excedeEstoque;

  return (
    <div>
      <div className="crumb">{editando ? t('pedidos.crumb_editar') : t('pedidos.crumb_novo')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{editando ? t('pedidos.editar') : t('pedidos.novo')}</h1><div className="muted page-sub">{editando ? t('pedidos.sub_editar') : t('pedidos.sub_novo')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{t('pedidos.card_dados')}</h3></div>
        <div className="form-grid">
          <label className="campo full">
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {t('pedidos.cliente_comercial')}
              <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={() => setNovoCli(true)}>+ {t('pedidos.cadastrar_cliente')}</button>
            </span>
            <select value={clienteId} onChange={(e) => escolherCliente(e.target.value)}>
              <option value="">{t('pedidos.escolha_cliente')}</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          {novoCli && <ModalNovaPessoa tipo="cliente" onFechar={() => setNovoCli(false)} onCriado={(nome) => { setNovoCli(false); recarregarClientes(nome); }} />}
          <label className="campo">{t('pedidos.vendedor')}
            {vendedorTravado ? (
              <>
                <input value={usuario?.vendedorNome ?? t('pedidos.vendedor_voce')} disabled />
                <small className="hint">{t('pedidos.vendedor_travado')}</small>
              </>
            ) : (
              <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
                <option value="">—</option>{vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            )}
          </label>
          <label className="campo">{t('pedidos.forma_pgto')}
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              {FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="campo">{t('cond.titulo_s')}
            <select value={condicaoId} disabled={pixTrava} title={pixTrava ? t('pedidos.pix_avista') : ''} onChange={(e) => setCondicaoId(e.target.value)}>
              <option value="">{t('cond.avista_pad')}</option>{condicoes.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.parcelas}x)</option>)}
            </select>
          </label>
          <label className="campo full">{t('pedidos.obs')}<textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t('pedidos.obs_ph')} /></label>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{t('pedidos.card_endereco')}</h3></div>
        <label className="campo full" style={{ marginBottom: usandoNovo ? 12 : 0 }}>{t('pedidos.end_cliente')}
          <select value={endSel} disabled={!cliente} onChange={(e) => setEndSel(e.target.value)}>
            {!cliente && <option value="">{t('pedidos.end_selecione_cliente')}</option>}
            {editando && enderecoAtual && <option value={ATUAL}>{t('pedidos.end_manter')}: {enderecoAtual}</option>}
            {ends.map((e, i) => <option key={i} value={i}>{endTexto(e) || '—'}{e.favorito ? ' (' + t('clientes.favorito').toLowerCase() + ')' : ''}</option>)}
            <option value={NOVO}>+ {t('pedidos.end_novo')}</option>
          </select>
        </label>
        {usandoNovo && (
          <div>
            <div className="form-grid">
              <label className="campo full">{t('clientes.logradouro')}<input value={novoEnd.logradouro} onChange={(e) => setNovoEnd({ ...novoEnd, logradouro: e.target.value })} /></label>
              <label className="campo">{t('clientes.numero')}<input value={novoEnd.numero} onChange={(e) => setNovoEnd({ ...novoEnd, numero: e.target.value })} /></label>
              <label className="campo">{t('pedidos.complemento')}<input value={novoEnd.complemento} onChange={(e) => setNovoEnd({ ...novoEnd, complemento: e.target.value })} placeholder={t('pedidos.complemento_ph')} /></label>
              <label className="campo">{t('clientes.bairro')}<input value={novoEnd.bairro} onChange={(e) => setNovoEnd({ ...novoEnd, bairro: e.target.value })} /></label>
              <label className="campo">CEP<input value={novoEnd.cep} onChange={(e) => setNovoEnd({ ...novoEnd, cep: mascaraCep(e.target.value) })} onBlur={cepLookup} placeholder="00000-000" maxLength={9} /></label>
              <label className="campo">{t('clientes.cidade')}<input value={novoEnd.cidade} onChange={(e) => setNovoEnd({ ...novoEnd, cidade: e.target.value })} /></label>
              <label className="campo">UF
                <select value={novoEnd.uf} onChange={(e) => setNovoEnd({ ...novoEnd, uf: e.target.value })}>
                  <option value="">—</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
            </div>
            <label className="end-fav" style={{ marginTop: 12, cursor: cliente ? 'pointer' : 'default' }}>
              <input type="checkbox" checked={salvarEnd} disabled={!cliente} onChange={(e) => setSalvarEnd(e.target.checked)} /> {t('pedidos.end_salvar')}
            </label>
          </div>
        )}
      </div>

      <div className="card pad0" style={{ maxWidth: 'none' }}>
        <div className="card-head" style={{ padding: '18px 20px 4px', display: 'flex', gap: 10 }}>
          <h3 style={{ marginRight: 'auto' }}>{t('pedidos.itens')}</h3>
          <button type="button" className="btn-primary btn-mini" onClick={addItem}>+ {t('pedidos.add_item')}</button>
          <button type="button" className="btn-ghost btn-mini" disabled={sel.size === 0} onClick={excluirSel}>{t('pedidos.excluir_sel')}</button>
        </div>
        <div className="sumbar" style={{ margin: '0 20px 12px' }}>
          <span><b>{sel.size}</b> {t('pedidos.itens_sel')}</span>
          <span>{t('pedidos.total_sel')}: <b>{moeda(totalSel)}</b></span>
        </div>
        <table className="tabela" style={{ marginTop: 6 }}>
          <thead><tr>
            <th style={{ width: 36 }}><input type="checkbox" checked={itens.length > 0 && sel.size === itens.length} onChange={toggleTodos} /></th>
            <th>{t('precos.produto')}</th><th style={{ width: 90 }}>{t('rel.qtd')}</th><th style={{ width: 110 }}>{t('pedidos.disponivel_col')}</th><th style={{ width: 120 }}>{t('pedidos.preco_un')}</th><th style={{ width: 120 }}>{t('pedidos.subtotal')}</th><th style={{ width: 50 }}></th>
          </tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={7} className="vazio">{t('pedidos.sem_itens')}</td></tr>}
            {itens.map((it, i) => {
              const excede = estoqueOk && !!it.produtoId && (Number(it.quantidade) || 0) > dispDe(it.produtoId);
              return (
              <tr key={i} className={sel.has(i) ? 'linha-sel' : ''}>
                <td><input type="checkbox" checked={sel.has(i)} onChange={() => toggleSel(i)} /></td>
                <td>
                  <select value={it.produtoId} onChange={(e) => setItem(i, 'produtoId', e.target.value)} style={{ width: '100%' }}>
                    <option value="">{t('pedidos.escolha_produto')}</option>
                    {produtos.map((pp) => <option key={pp.produtoId} value={pp.produtoId}>{pp.produtoNome}</option>)}
                  </select>
                </td>
                <td><input type="number" min="0" step="1" value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} style={{ width: 70 }} /></td>
                <td>{!it.produtoId ? '—' : !estoqueOk ? '—' : <b style={{ color: excede ? '#e1483b' : '#16a34a' }}>{dispDe(it.produtoId)}</b>}</td>
                <td>{moeda(precoDe(it.produtoId))}</td>
                <td><b>{moeda(subDe(it))}</b></td>
                <td><button type="button" className="btn-link" onClick={() => delItem(i)} aria-label={t('common.remover')}><Ic name="i-x" className="sm" /></button></td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="totais-mock">
          <div className="tl-row"><span className="muted">{t('pedidos.subtotal')}</span><b>{moeda(subtotal)}</b></div>
          {desconto > 0 && <div className="tl-row"><span className="muted" style={{ color: '#166534' }}>{t('descped.desconto')}</span><b style={{ color: '#166534' }}>− {moeda(desconto)}</b></div>}
          <div className="tl-row">
            <span className="muted">{t('entrega.forma')}</span>
            <select value={formaEntrega} onChange={(e) => setFormaEntrega(e.target.value as Forma)} style={{ maxWidth: 180 }}>
              {FORMAS.map((f) => <option key={f} value={f}>{t('entrega.' + f)}</option>)}
            </select>
            {formaEntrega === 'motoboy' && <span className="muted" style={{ fontSize: 12 }}>{t('entrega.motoboy_na_expedicao')}</span>}
          </div>
          <div className="tl-row">
            {freteMemo && <span className="muted" style={{ fontSize: 12, marginRight: 'auto' }}>{freteMemo}</span>}
            <span className="muted">{freteCobrado != null && freteCobrado !== freteCusto ? t('pedidos.frete_custo') : t('pedidos.frete')}</span>
            <MoedaInput value={frete} disabled={freteAuto} onChange={(n) => setFrete(String(n))} style={{ width: 130, textAlign: 'right' }} />
          </div>
          {freteCobrado != null && freteCobrado !== freteCusto && (<>
            <div className="tl-row"><span className="muted" style={{ color: '#166534' }}>{t('pedidos.cliente_paga')}</span><b style={{ color: '#166534' }}>{moeda(freteCobradoNum)}</b></div>
            <div className="tl-row"><span className="muted" style={{ fontSize: 12 }}>{t('pedidos.frete_absorvido')}</span><span className="muted" style={{ fontSize: 12 }}>{moeda(freteAbsorvido)}</span></div>
          </>)}
          <div className="tl-row tl-total"><span className="muted">{t('pedidos.total')}</span><b style={{ fontSize: 20 }}>{moeda(total)}</b></div>
        </div>
      </div>

      {excedeEstoque && <div className="alerta-erro" style={{ maxWidth: 'none' }}>{t('pedidos.estoque_excede')}</div>}
      <div className="form-actions">
        <button className="btn-primary" disabled={bloqueado} onClick={criarPedido}>{editando ? t('pedidos.confirmar_virar') : t('pedidos.criar')}</button>
        <button className="btn-ghost" disabled={bloqueado} onClick={salvarOrcamento}>{editando ? t('pedidos.salvar_alteracoes') : t('pedidos.salvar_orcamento')}</button>
        <button className="btn-ghost" onClick={() => nav('/comercial/pedidos')}>{t('common.cancelar')}</button>
      </div>
    </div>
  );
}

