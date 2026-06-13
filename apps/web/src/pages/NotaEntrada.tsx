import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { SeletorPessoa } from '../components/SeletorPessoa.js';

interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }

const hojeISO = () => new Date().toISOString().slice(0, 10);

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
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  useEffect(() => {
    api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  // Produto: datalist por nome → resolve o id pelo nome digitado/escolhido.
  const produtoId = useMemo(() => produtos.find((p) => p.produtoNome.toLowerCase() === produtoNome.trim().toLowerCase())?.produtoId ?? '', [produtos, produtoNome]);
  const qtdN = Number(quantidade) || 0;
  const custoN = Number(custo) || 0;
  const total = qtdN * custoN;

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/financeiro/nota', {
        fornecedorNome, produtoId, quantidade: qtdN, custoUnitario: custoN,
        nf, serie, emissao: emissao || null, vencimento: vencimento || null,
      }, token!);
      setOk(true); setProdutoNome(''); setQtd('1'); setCusto(''); setNf(''); setSerie(''); setVenc('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('nota.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('nota.titulo')}</h1><div className="muted page-sub">{t('nota.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('nota.ok')}</div>}

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="card-head"><h3>{t('nota.card')}</h3></div>
        <div className="cores-grid">
          <SeletorPessoa tipo="fornecedor" value={fornecedorNome} onChange={setFornecedor} placeholder={t('nota.forn_ph')} />
          <label className="campo">{t('precos.produto')}
            <input list="dlProd" value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} placeholder={t('nota.produto_ph')} />
            <datalist id="dlProd">{produtos.map((p) => <option key={p.produtoId} value={p.produtoNome} />)}</datalist>
          </label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('entrada.quantidade')}<input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQtd(e.target.value)} /></label>
          <label className="campo">{t('entrada.custo')}<input type="number" min="0" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="0,00" /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('nota.nf')}<input value={nf} onChange={(e) => setNf(e.target.value)} placeholder={t('nota.nf_ph')} /></label>
          <label className="campo">{t('nota.serie')}<input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder={t('nota.serie_ph')} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('fin.emissao')}<input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></label>
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
        <button className="btn-ghost" onClick={() => nav(-1)}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salv || !produtoId} onClick={salvar}>✓ {t('nota.lancar')}</button>
      </div>
    </div>
  );
}
