import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }

export function EntradaEstoque() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [custo, setCusto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  useEffect(() => { api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {}); /* eslint-disable-next-line */ }, []);

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/estoque/entrada', { produtoId, lote, validade, quantidade: Number(quantidade), custoUnitario: Number(custo) || 0 }, token!);
      setOk(true); setLote(''); setValidade(''); setQuantidade(''); setCusto('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('entrada.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('entrada.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('entrada.ok')}</div>}
      <div className="card" style={{ maxWidth: 560 }}>
        <label className="campo">{t('precos.produto')}
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">—</option>{produtos.map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('estoque.lote')}<input value={lote} onChange={(e) => setLote(e.target.value)} placeholder={t('entrada.lote_ph')} /></label>
          <label className="campo">{t('estoque.validade')}<input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('entrada.quantidade')}<input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></label>
          <label className="campo">{t('entrada.custo')}<input type="number" min="0" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} /></label>
        </div>
        <div className="modal-acoes"><button className="btn-primary" disabled={salv || !produtoId} onClick={salvar}>{t('entrada.confirmar')}</button></div>
      </div>
    </div>
  );
}
