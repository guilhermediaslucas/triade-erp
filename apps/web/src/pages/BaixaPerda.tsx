import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Lote { id: string; lote: string | null; validade: string | null; quantidade: number; }
interface Posicao { produtoId: string; produtoNome: string; lotes: Lote[]; }
const MOTIVOS = ['Vencimento', 'Avaria', 'Furto', 'Ajuste de inventário', 'Devolução descartada', 'Outro'];

export function BaixaPerda() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [itens, setItens] = useState<Posicao[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [loteId, setLoteId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  async function carregar() { try { setItens(await api.get('/estoque', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const lotes = useMemo(() => itens.find((p) => p.produtoId === produtoId)?.lotes ?? [], [itens, produtoId]);
  const loteSel = lotes.find((l) => l.id === loteId);
  const fmtData = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      await api.post('/estoque/baixa', { loteId, quantidade: Number(quantidade), motivo }, token!);
      setOk(true); setQuantidade(''); await carregar(); setLoteId('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('perda.crumb')}</div><h1 className="page-titulo">{t('perda.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('perda.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('perda.ok')}</div>}
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-head"><h3>{t('perda.card')}</h3></div>
        <label className="campo">{t('precos.produto')}
          <select value={produtoId} onChange={(e) => { setProdutoId(e.target.value); setLoteId(''); }}>
            <option value="">—</option>{itens.filter((p) => p.lotes.length > 0).map((p) => <option key={p.produtoId} value={p.produtoId}>{p.produtoNome}</option>)}
          </select>
        </label>
        <label className="campo">{t('estoque.lote')}
          <select value={loteId} onChange={(e) => setLoteId(e.target.value)} disabled={!produtoId}>
            <option value="">—</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{(l.lote ?? '—') + ' · ' + t('estoque.validade') + ' ' + fmtData(l.validade) + ' · ' + t('estoque.saldo') + ' ' + l.quantidade}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('entrada.quantidade')}
            <input type="number" min="1" step="1" max={loteSel?.quantidade ?? undefined} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            {loteSel && <small className="hint">{t('perda.max')}: {loteSel.quantidade}</small>}
          </label>
          <label className="campo">{t('perda.motivo')}
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>{MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </label>
        </div>
        <div className="modal-acoes"><button className="btn-primary" disabled={salv || !loteId || !quantidade} onClick={salvar}>{t('perda.confirmar')}</button></div>
      </div>
    </div>
  );
}
