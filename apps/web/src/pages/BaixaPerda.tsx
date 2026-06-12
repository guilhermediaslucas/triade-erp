import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface Lote { id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number; }
interface Posicao { produtoId: string; produtoNome: string; lotes: Lote[]; }
const MOTIVOS = ['Vencimento', 'Avaria', 'Furto', 'Ajuste de inventário', 'Devolução descartada', 'Outro'];
const hojeISO = () => new Date().toISOString().slice(0, 10);

export function BaixaPerda() {
  const { token, usuario } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<Posicao[]>([]);
  const [produtoNome, setProdutoNome] = useState('');
  const [loteId, setLoteId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [motivo, setMotivo] = useState(MOTIVOS[0]!);
  const [data, setData] = useState(hojeISO());
  const [obs, setObs] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salv, setSalv] = useState(false);

  async function carregar() { try { setItens(await api.get('/estoque', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const produto = useMemo(() => itens.find((p) => p.produtoNome.toLowerCase() === produtoNome.trim().toLowerCase()) ?? null, [itens, produtoNome]);
  const lotes = produto?.lotes ?? [];
  const loteSel = lotes.find((l) => l.id === loteId);
  const fmtData = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  const qtdN = Number(quantidade) || 0;
  const custoUn = loteSel?.custoUnitario ?? 0;
  const valorPerda = qtdN * custoUn;
  const saldoApos = loteSel ? loteSel.quantidade - qtdN : 0;

  async function salvar() {
    setErro(null); setOk(false); setSalv(true);
    try {
      const motivoFull = obs.trim() ? `${motivo} - ${obs.trim()}` : motivo;
      await api.post('/estoque/baixa', { loteId, quantidade: qtdN, motivo: motivoFull }, token!);
      setOk(true); setQuantidade('1'); setObs(''); await carregar(); setLoteId('');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('perda.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('perda.titulo')}</h1><div className="muted page-sub">{t('perda.sub')}</div></div>
        <button className="btn-ghost" onClick={() => nav(-1)}>← {t('pedidos.voltar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('perda.ok')}</div>}

      <div className="card" style={{ maxWidth: 'none' }}>
        <div className="cores-grid">
          <label className="campo">{t('precos.produto')}
            <input list="dlProdPerda" value={produtoNome} onChange={(e) => { setProdutoNome(e.target.value); setLoteId(''); }} placeholder={t('perda.produto_ph')} />
            <datalist id="dlProdPerda">{itens.filter((p) => p.lotes.length > 0).map((p) => <option key={p.produtoId} value={p.produtoNome} />)}</datalist>
          </label>
          <label className="campo">{t('perda.lote_label')}
            <select value={loteId} onChange={(e) => setLoteId(e.target.value)} disabled={!produto}>
              <option value="">{produto ? '—' : t('perda.sem_estoque')}</option>
              {lotes.map((l) => <option key={l.id} value={l.id}>{(l.lote ?? '—') + ' · ' + fmtData(l.validade) + ' · ' + t('estoque.saldo') + ' ' + l.quantidade}</option>)}
            </select>
          </label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('perda.qtd_baixar')}
            <input type="number" min="1" step="1" max={loteSel?.quantidade ?? undefined} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            {loteSel && <small className="hint">{t('perda.max')}: {loteSel.quantidade}</small>}
          </label>
          <label className="campo">{t('perda.motivo')}
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>{MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('perda.data_ocorrencia')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
          <label className="campo">{t('perda.responsavel')}<input value={usuario?.email ?? ''} readOnly style={{ background: 'var(--bg)' }} /></label>
        </div>
        <label className="campo">{t('perda.obs')}<input value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t('perda.obs_ph')} /></label>

        <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }}>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-dollar" /></div><div><div className="kpi-lbl">{t('perda.custo_un')}</div><div className="kpi-val">{moeda(custoUn)}</div></div></div>
          <div className="card kpi-mock" style={{ borderColor: '#e1483b' }}><div className="kpi-ic tint-rd"><Ic name="i-alert" /></div><div><div className="kpi-lbl">{t('perda.valor_perda')}</div><div className="kpi-val" style={{ color: '#e1483b' }}>{moeda(valorPerda)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-box" /></div><div><div className="kpi-lbl">{t('perda.saldo_apos')}</div><div className="kpi-val">{saldoApos}</div></div></div>
        </div>

        <div className="nota-info" style={{ marginTop: 12 }}>{t('perda.nota')}</div>
      </div>

      <div className="form-actions">
        <button className="btn-ghost" onClick={() => nav(-1)}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salv || !loteId || qtdN < 1} onClick={salvar}>🗑 {t('perda.confirmar')}</button>
      </div>
    </div>
  );
}
