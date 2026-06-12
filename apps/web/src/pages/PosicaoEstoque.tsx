import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Lote { id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number; marca: string | null; }
interface Posicao { produtoId: string; produtoNome: string; unidade: string; estoqueMinimo: number; saldo: number; abaixoMinimo: boolean; lotes: Lote[]; }
interface Etiqueta { id: string; codigo: string; status: 'estoque' | 'saida' | 'perda'; criadoEm: string; }
interface CtxLote { produtoNome: string; lote: string | null; validade: string | null; }
type Filtro = '' | 'ok' | 'baixo' | 'validade';

function diasAte(validade: string | null): number | null {
  if (!validade) return null;
  const d = new Date(validade + 'T00:00:00').getTime() - Date.now();
  return Math.floor(d / 86400000);
}

export function PosicaoEstoque() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<Posicao[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('');
  const [ctx, setCtx] = useState<CtxLote | null>(null);
  const [etqs, setEtqs] = useState<Etiqueta[]>([]);

  useEffect(() => { api.get<Posicao[]>('/estoque', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);
  const fmtData = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  const valorDe = (p: Posicao) => p.lotes.reduce((s, l) => s + l.quantidade * l.custoUnitario, 0);
  const venceProx = (p: Posicao) => p.lotes.some((l) => { const d = diasAte(l.validade); return d !== null && d < 90; });
  const situacaoDe = (p: Posicao): Filtro => p.abaixoMinimo ? 'baixo' : (venceProx(p) ? 'validade' : 'ok');

  const kpis = useMemo(() => {
    const skus = itens.length;
    const baixo = itens.filter((p) => p.abaixoMinimo).length;
    const validade = itens.filter((p) => venceProx(p)).length;
    const valor = itens.reduce((s, p) => s + valorDe(p), 0);
    return { skus, baixo, validade, valor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((p) => {
      if (q && !p.produtoNome.toLowerCase().includes(q)) return false;
      if (filtro && situacaoDe(p) !== filtro) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, busca, filtro]);

  async function abrirEtiquetas(p: Posicao, l: Lote) {
    setCtx({ produtoNome: p.produtoNome, lote: l.lote, validade: l.validade });
    setEtqs([]);
    try { setEtqs(await api.get<Etiqueta[]>(`/estoque/lotes/${l.id}/etiquetas`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const stPill = (s: Etiqueta['status']) =>
    s === 'estoque' ? 'pill st-verde' : s === 'saida' ? 'pill st-laranja' : 'pill';
  const badgeSit = (s: Filtro) =>
    s === 'baixo' ? <span className="pill st-laranja">{t('estoque.baixo')}</span>
      : s === 'validade' ? <span className="pill st-vermelho">{t('estoque.sit_validade')}</span>
        : <span className="pill st-verde">{t('estoque.ok')}</span>;

  const chips: { v: Filtro; rot: string }[] = [
    { v: '', rot: 'common.todos' }, { v: 'ok', rot: 'estoque.ok' },
    { v: 'baixo', rot: 'estoque.baixo' }, { v: 'validade', rot: 'estoque.f_validade' },
  ];

  return (
    <div>
      <div className="crumb">{t('estoque.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo">{t('estoque.titulo')}</h1><p className="muted page-sub">{t('estoque.sub')}</p></div>
        <button className="btn-primary" onClick={() => nav('/estoque/entrada')}>📥 {t('estoque.btn_entrada')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="kpi-row">
        <div className="card kpi-mock"><div className="kpi-ic tint-bl">📦</div><div><div className="kpi-lbl">{t('estoque.kpi_skus')}</div><div className="kpi-val">{kpis.skus}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-or">⚠️</div><div><div className="kpi-lbl">{t('estoque.kpi_baixo')}</div><div className="kpi-val">{kpis.baixo}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd">⏰</div><div><div className="kpi-lbl">{t('estoque.kpi_validade90')}</div><div className="kpi-val">{kpis.validade}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr">💰</div><div><div className="kpi-lbl">{t('estoque.kpi_valor')}</div><div className="kpi-val">{moeda(kpis.valor)}</div></div></div>
      </div>

      <div className="toolbar">
        <div className="busca-box-tb"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('estoque.buscar')} /></div>
        {chips.map((c) => (
          <span key={c.v} className={'chip-f' + (filtro === c.v ? ' on' : '')} onClick={() => setFiltro(c.v)}>{t(c.rot)}</span>
        ))}
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr><th></th><th>{t('precos.produto')}</th><th>{t('estoque.saldo')}</th><th>{t('produtos.minimo')}</th><th>{t('estoque.valor')}</th><th>{t('usuarios.situacao')}</th></tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={6} className="vazio">{t('precos.sem_produtos')}</td></tr>}
          {lista.map((p) => (
            <Fragment key={p.produtoId}>
              <tr className="linha-click" onClick={() => setAberto({ ...aberto, [p.produtoId]: !aberto[p.produtoId] })}>
                <td style={{ width: 28 }}>{p.lotes.length > 0 ? (aberto[p.produtoId] ? '▾' : '▸') : ''}</td>
                <td>{p.produtoNome} <span className="muted">· {p.lotes.length} {t('estoque.lote').toLowerCase()}(s)</span></td>
                <td><b>{p.saldo}</b></td><td>{p.estoqueMinimo}</td><td>{moeda(valorDe(p))}</td>
                <td>{badgeSit(situacaoDe(p))}</td>
              </tr>
              {aberto[p.produtoId] && p.lotes.map((l) => (
                <tr key={l.id} className="lote-row">
                  <td></td>
                  <td colSpan={2} style={{ paddingLeft: 24 }}>{t('estoque.lote')}: <b>{l.lote ?? '—'}</b>{l.marca ? ' · ' + l.marca : ''}</td>
                  <td>{l.quantidade}</td>
                  <td>{t('estoque.validade')}: {fmtData(l.validade)}</td>
                  <td><button className="btn-link" onClick={(e) => { e.stopPropagation(); abrirEtiquetas(p, l); }}>{t('etq.ver')}</button></td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table></div>
      <div className="nota-info" style={{ marginTop: 10 }}>{t('estoque.nota_lotes')}</div>

      {ctx && (
        <div className="modal-fundo" onClick={() => setCtx(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('etq.titulo')}</h2>
            <div className="dash-s" style={{ marginBottom: 8 }}>
              <b>{ctx.produtoNome}</b> {'·'} {t('estoque.lote')}: {ctx.lote ?? '—'}
              {ctx.validade ? ' · ' + t('estoque.validade') + ': ' + fmtData(ctx.validade) : ''}
            </div>
            <div className="dash-s" style={{ marginBottom: 10 }}>{t('etq.subtitulo')}</div>
            {etqs.length === 0 ? <div className="vazio">{t('etq.vazio')}</div> : (
              <div className="card pad0" style={{ maxHeight: 320, overflow: 'auto' }}>
                <table className="tabela">
                  <thead><tr><th>{t('etq.codigo')}</th><th>{t('etq.situacao')}</th></tr></thead>
                  <tbody>
                    {etqs.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{e.codigo}</td>
                        <td><span className={stPill(e.status)}>{t('etq.st.' + e.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-acoes">
              <button className="btn-ghost" onClick={() => setCtx(null)}>{t('common.fechar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
