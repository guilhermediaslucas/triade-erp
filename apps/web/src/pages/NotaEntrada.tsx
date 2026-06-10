import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Fornecedor { id: string; nome: string; }
interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }

export function NotaEntrada() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [forns, setForns] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [fornecedorNome, setFornecedor] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQtd] = useState('');
  const [custo, setCusto] = useState('');
  const [nf, setNf] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  useEffect(() => {
    api.get<Fornecedor[]>('/fornecedores', token!).then(setForns).catch(() => {});
    api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);
  const total = (Number(quantidade) || 0) * (Number(custo) || 0);

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/financeiro/nota', { fornecedorNome, produtoId, quantidade: Number(quantidade), custoUnitario: Number(custo), nf }, token!);
      setOk(true); setProdutoId(''); setQtd(''); setCusto(''); setNf('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('nota.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('nota.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('nota.ok')}</div>}
      <div className="card" style={{ maxWidth: 560 }}>
        <label className="campo">{t('fin.fornecedor')}
          <input list="dlForn" value={fornecedorNome} onChange={(e) => setFornecedor(e.target.value)} placeholder={t('nota.forn_ph')} />
          <datalist id="dlForn">{forns.map((f) => <option key={f.id} value={f.nome} />)}</datalist>
        </label>
        <label className="campo">{t('precos.produto')}
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">—</option>{produtos.map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('entrada.quantidade')}<input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQtd(e.target.value)} /></label>
          <label className="campo">{t('entrada.custo')}<input type="number" min="0" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} /></label>
          <label className="campo">{t('nota.nf')}<input value={nf} onChange={(e) => setNf(e.target.value)} /></label>
        </div>
        <div className="nota-info">{t('nota.total')}: <b>{moeda(total)}</b> — {t('nota.gera')}</div>
        <div className="modal-acoes"><button className="btn-primary" disabled={salv || !produtoId} onClick={salvar}>{t('nota.lancar')}</button></div>
      </div>
    </div>
  );
}
