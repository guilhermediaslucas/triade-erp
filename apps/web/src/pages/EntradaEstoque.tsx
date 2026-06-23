import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { BotaoEscanear } from '../components/BotaoEscanear.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { useAutoBip } from '../lib/useAutoBip.js';

interface PrecoProduto { produtoId: string; produtoNome: string; ativo: boolean; }

export function EntradaEstoque() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [produtos, setProdutos] = useState<PrecoProduto[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [custo, setCusto] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [nf, setNf] = useState('');
  const [emissao, setEmissao] = useState('');
  const [codigos, setCodigos] = useState<string[]>([]);
  const [scan, setScan] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [detErro, setDetErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<PrecoProduto[]>('/precos', token!).then((l) => setProdutos(l.filter((p) => p.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  function bipar(valor: string) {
    const cod = valor.trim().toUpperCase();
    if (!cod) return;
    setErro(null); setDetErro(null);
    if (codigos.includes(cod)) { setErro('etiqueta.duplicada_leitura'); setScan(''); return; }
    setCodigos((cs) => [...cs, cod]);
    setScan('');
    scanRef.current?.focus();
  }
  const remover = (cod: string) => setCodigos((cs) => cs.filter((c) => c !== cod));
  const { aoDigitar, aoEnter } = useAutoBip(bipar);

  async function salvar() {
    setErro(null); setDetErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/estoque/entrada', { produtoId, lote, validade, custoUnitario: Number(custo) || 0, codigos, fornecedor: fornecedor || null, nf: nf || null, emissao: emissao || null }, token!);
      setOk(true); setLote(''); setValidade(''); setCusto(''); setFornecedor(''); setNf(''); setEmissao(''); setCodigos([]); setScan('');
    } catch (e) { const er = e as ErroApi; setErro(er.chaveI18n); setDetErro(er.detalhe ?? null); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('entrada.crumb')}</div><h1 className="page-titulo">{t('entrada.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('entrada.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}{detErro ? ': ' + detErro : ''}</div>}
      {ok && <div className="alerta-ok">{t('entrada.ok')}</div>}
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-head"><h3>{t('entrada.card')}</h3></div>
        <label className="campo">{t('precos.produto')}
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">—</option>{produtos.map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('estoque.lote')}<input value={lote} onChange={(e) => setLote(e.target.value)} placeholder={t('entrada.lote_ph')} /></label>
          <label className="campo">{t('estoque.validade')}<input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} /></label>
        </div>
        <label className="campo">{t('entrada.custo')}<MoedaInput value={custo} onChange={(n) => setCusto(n ? String(n) : '')} /></label>
        <div className="cores-grid">
          <label className="campo">{t('entrada.fornecedor')}<input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder={t('entrada.fornecedor_ph')} /></label>
          <label className="campo">{t('entrada.nf')}<input value={nf} onChange={(e) => setNf(e.target.value)} placeholder={t('entrada.nf_ph')} /></label>
        </div>
        <label className="campo">{t('entrada.emissao')}<input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} /></label>

        <label className="campo">
          {t('etq.bipe')} <span className="muted">· {codigos.length} {t('etq.bipados')}</span>
          <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
            onChange={(e) => aoDigitar(e.target.value, setScan)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aoEnter(scan); } }} />
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
