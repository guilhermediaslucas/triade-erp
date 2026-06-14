import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { SeletorPessoa } from '../components/SeletorPessoa.js';

interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }
interface Nota {
  id: string; fornecedorNome: string | null; produtoNome: string; quantidade: number; custoUnitario: number;
  total: number; nf: string | null; status: 'pendente' | 'recebido'; criadoEm: string;
}

const hojeISO = () => new Date().toISOString().slice(0, 10);
const fmtData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export function NotaEntrada() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [fornecedorNome, setFornecedor] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [quantidade, setQtd] = useState('1');
  const [custo, setCusto] = useState('');
  const [nf, setNf] = useState('');
  const [serie, setSerie] = useState('');
  const [emissao, setEmissao] = useState(hojeISO());
  const [vencimento, setVenc] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  // Lista de notas + filtro de data
  const [notas, setNotas] = useState<Nota[]>([]);
  const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [filtro, setFiltro] = useState<{ de: string; ate: string }>({ de: '', ate: '' });

  function carregarNotas(d = filtro.de, a = filtro.ate) {
    const qs = [d ? 'de=' + d : '', a ? 'ate=' + a : ''].filter(Boolean).join('&');
    api.get<Nota[]>('/financeiro/notas' + (qs ? '?' + qs : ''), token!).then(setNotas).catch(() => {});
  }
  useEffect(() => {
    api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {});
    carregarNotas();
    /* eslint-disable-next-line */
  }, []);

  const produtoId = useMemo(() => produtos.find((p) => p.produtoNome.toLowerCase() === produtoNome.trim().toLowerCase())?.produtoId ?? '', [produtos, produtoNome]);
  const qtdN = Number(quantidade) || 0;
  const custoN = Number(custo) || 0;
  const total = qtdN * custoN;

  function limpar() {
    setEditId(null); setFornecedor(''); setProdutoNome(''); setQtd('1'); setCusto(''); setNf(''); setSerie(''); setVenc(''); setEmissao(hojeISO());
  }
  function editar(n: Nota) {
    setEditId(n.id); setFornecedor(n.fornecedorNome ?? ''); setProdutoNome(n.produtoNome);
    setQtd(String(n.quantidade)); setCusto(String(n.custoUnitario));
    const nfp = (n.nf ?? '').split(' / '); setNf(nfp[0] ?? ''); setSerie(nfp[1] ?? '');
    setVenc(''); setErro(null); setOk(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function excluir(id: string) {
    if (!confirm(t('nota.confirmar_excluir'))) return;
    try { await api.del('/financeiro/nota/' + id, token!); if (editId === id) limpar(); carregarNotas(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    const corpo = { fornecedorNome, produtoId, quantidade: qtdN, custoUnitario: custoN, nf, serie, emissao: emissao || null, vencimento: vencimento || null };
    try {
      if (editId) await api.put('/financeiro/nota/' + editId, corpo, token!);
      else await api.post('/financeiro/nota', corpo, token!);
      setOk(true); limpar(); carregarNotas();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('nota.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{editId ? t('nota.editar') : t('nota.titulo')}</h1><div className="muted page-sub">{t('nota.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('nota.ok')}</div>}

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{editId ? t('nota.editar') : t('nota.card')}</h3></div>
        <div className="cores-grid">
          <SeletorPessoa tipo="fornecedor" value={fornecedorNome} onChange={setFornecedor} placeholder={t('nota.forn_ph')} />
          <label className="campo">{t('precos.produto')}
            <input list="dlProd" value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} placeholder={t('nota.produto_ph')} readOnly={!!editId} style={editId ? { background: 'var(--bg)' } : undefined} />
            <datalist id="dlProd">{produtos.map((p) => <option key={p.produtoId} value={p.produtoNome} />)}</datalist>
          </label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('entrada.quantidade')}<input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQtd(e.target.value)} /></label>
          <label className="campo">{t('entrada.custo')}<MoedaInput value={custo} onChange={(n) => setCusto(n ? String(n) : '')} placeholder="0,00" /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('nota.nf')}<input value={nf} onChange={(e) => setNf(e.target.value)} placeholder={t('nota.nf_ph')} /></label>
          <label className="campo">{t('nota.serie')}<input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder={t('nota.serie_ph')} /></label>
        </div>
        <div className="cores-grid">
          {!editId && <label className="campo">{t('fin.emissao')}<input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></label>}
          <label className="campo">{t('nota.venc1')}<input type="date" value={vencimento} onChange={(e) => setVenc(e.target.value)} /></label>
        </div>

        <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }}>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-box" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('entrada.quantidade')}</div><div className="kpi-val">{qtdN}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-pp">$</div><div className="kpi-body"><div className="kpi-lbl">{t('entrada.custo')}</div><div className="kpi-val">{moeda(custoN)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-gr">$</div><div className="kpi-body"><div className="kpi-lbl">{t('nota.valor_total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
        </div>

        <div className="nota-info" style={{ marginTop: 12 }}>{t('nota.gera_full')}</div>
      </div>

      <div className="form-actions">
        {editId
          ? <button className="btn-ghost" onClick={limpar}>{t('camp.cancelar_edicao')}</button>
          : <button className="btn-ghost" onClick={() => nav(-1)}>{t('common.cancelar')}</button>}
        <button className="btn-primary" disabled={salv || !produtoId} onClick={salvar}><Ic name="i-check" className="sm" /> {editId ? t('camp.salvar') : t('nota.lancar')}</button>
      </div>

      {/* Notas lançadas */}
      <div className="card pad0" style={{ maxWidth: 'none', marginTop: 18 }}>
        <div className="card-head" style={{ padding: '18px 20px 4px', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ marginRight: 'auto' }}>{t('nota.lancadas')}</h3>
          <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
          <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
          <button className="btn-primary btn-mini" onClick={() => { setFiltro({ de, ate }); carregarNotas(de, ate); }}><Ic name="i-search" className="sm" /> {t('pedidos.filtrar')}</button>
          <button className="btn-ghost btn-mini" onClick={() => { setDe(''); setAte(''); setFiltro({ de: '', ate: '' }); carregarNotas('', ''); }}>{t('fin.f_limpar')}</button>
        </div>
        <table className="tabela">
          <thead><tr><th>{t('pedidos.data')}</th><th>{t('nota.forn')}</th><th>{t('precos.produto')}</th><th>{t('rel.qtd')}</th><th>{t('entrada.custo')}</th><th>{t('nota.valor_total')}</th><th>NF</th><th>{t('dash.col_status')}</th><th></th></tr></thead>
          <tbody>
            {notas.length === 0 && <tr><td colSpan={9} className="vazio">{t('nota.lista_vazia')}</td></tr>}
            {notas.map((n) => (
              <tr key={n.id}>
                <td>{fmtData(n.criadoEm)}</td><td>{n.fornecedorNome ?? '—'}</td><td>{n.produtoNome}</td>
                <td>{n.quantidade}</td><td>{moeda(n.custoUnitario)}</td><td><b>{moeda(n.total)}</b></td><td>{n.nf ?? '—'}</td>
                <td>{n.status === 'pendente' ? <span className="pill st-laranja">{t('nota.pendente')}</span> : <span className="pill st-verde">{t('nota.recebida')}</span>}</td>
                <td className="acoes-ic">
                  {n.status === 'pendente' && <>
                    <button className="acao-ic" title={t('camp.editar')} onClick={() => editar(n)}><Ic name="i-edit" className="sm" /></button>
                    <button className="acao-ic" title={t('clientes.remover')} onClick={() => excluir(n.id)}><Ic name="i-trash" className="sm" /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
