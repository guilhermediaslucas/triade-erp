import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { BotaoEscanear } from '../components/BotaoEscanear.js';

interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }
interface Marca { id: string; nome: string; ativo: boolean; }

export function EntradaEstoque() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [custo, setCusto] = useState('');
  const [codigos, setCodigos] = useState<string[]>([]);
  const [scan, setScan] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {});
    api.get<Marca[]>('/marcas', token!).then((l) => setMarcas(l.filter((m) => m.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  function bipar(valor: string) {
    const cod = valor.trim().toUpperCase();
    if (!cod) return;
    setErro(null);
    if (codigos.includes(cod)) { setErro('etiqueta.duplicada_leitura'); setScan(''); return; }
    setCodigos((cs) => [...cs, cod]);
    setScan('');
    scanRef.current?.focus();
  }
  const remover = (cod: string) => setCodigos((cs) => cs.filter((c) => c !== cod));

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/estoque/entrada', { produtoId, marcaId: marcaId || null, lote, validade, custoUnitario: Number(custo) || 0, codigos }, token!);
      setOk(true); setLote(''); setValidade(''); setCusto(''); setCodigos([]); setScan('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('entrada.crumb')}</div><h1 className="page-titulo">{t('entrada.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('entrada.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('entrada.ok')}</div>}
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-head"><h3>{t('entrada.card')}</h3></div>
        <label className="campo">{t('precos.produto')}
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">—</option>{produtos.map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
          </select>
        </label>
        <label className="campo">{t('marcas.titulo_sing')} <span className="muted">({t('common.opcional')})</span>
          <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)}>
            <option value="">—</option>{marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('estoque.lote')}<input value={lote} onChange={(e) => setLote(e.target.value)} placeholder={t('entrada.lote_ph')} /></label>
          <label className="campo">{t('estoque.validade')}<input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} /></label>
        </div>
        <label className="campo">{t('entrada.custo')}<input type="number" min="0" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} /></label>

        <label className="campo">
          {t('etq.bipe')} <span className="muted">· {codigos.length} {t('etq.bipados')}</span>
          <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bipar(scan); } }} />
        </label>
        <div style={{ marginTop: 6 }}><BotaoEscanear onLido={bipar} /></div>
        {codigos.length > 0 && (
          <div className="chips">
            {codigos.map((c) => (
              <span key={c} className="chip" style={{ fontFamily: 'monospace' }}>
                {c}<button type="button" className="chip-x" onClick={() => remover(c)} title={t('common.remover')}>×</button>
              </span>
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 12 }}>{t('etq.bipe_ajuda')}</p>

        <div className="modal-acoes"><button className="btn-primary" disabled={salv || !produtoId || codigos.length === 0} onClick={salvar}>{t('entrada.confirmar')}</button></div>
      </div>
    </div>
  );
}
