import { useEffect, useMemo, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';
import { lerExtrato, type TxExtrato } from '../lib/extrato.js';

interface Conta { id: string; nome: string; banco: string | null; saldo: number; ativo: boolean; }
interface Linha { id: string; tipo: 'receber' | 'pagar'; descricao: string; pessoaNome: string | null; valor: number; pagoEm: string; conciliado: boolean; }
interface Resp {
  linhas: Linha[];
  totalEntradas: number; totalSaidas: number; saldoMovimento: number;
  qtdConciliado: number; qtdPendente: number; valorConciliado: number; valorPendente: number;
}
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function Conciliacao() {
  const { token, temCapability } = useAuth(); const { t } = useI18n(); const toast = useToast();
  const pode = temCapability('financeiro.conciliacao.gerenciar');
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaId, setContaId] = useState('');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [resp, setResp] = useState<Resp | null>(null);
  const [extrato, setExtrato] = useState('');
  const [imp, setImp] = useState<{ txs: TxExtrato[]; saldoFinal: number | null } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<Conta[]>('/contas-correntes/saldos', token!)
      .then((l) => { const a = l.filter((c) => c.ativo); setContas(a); if (a[0]) setContaId(a[0].id); })
      .catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  async function gerar(id = contaId) {
    if (!id) return;
    setErro(null);
    try { setResp(await api.get<Resp>(`/financeiro/conciliacao?contaId=${id}&de=${de}&ate=${ate}`, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { if (contaId) gerar(contaId); /* eslint-disable-next-line */ }, [contaId]);

  async function alternar(l: Linha) {
    if (!pode) return;
    try {
      await api.patch(`/financeiro/conciliacao/${l.id}`, { conciliado: !l.conciliado }, token!);
      setResp((r) => r ? { ...r, linhas: r.linhas.map((x) => x.id === l.id ? { ...x, conciliado: !x.conciliado } : x) } : r);
      recomputar(l);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  // Recalcula os totais de conciliado/pendente no cliente (sem novo round-trip).
  function recomputar(_l: Linha) {
    setResp((r) => {
      if (!r) return r;
      let vc = 0, vp = 0, qc = 0, qp = 0;
      for (const x of r.linhas) {
        const sinal = x.tipo === 'receber' ? x.valor : -x.valor;
        if (x.conciliado) { vc += sinal; qc++; } else { vp += sinal; qp++; }
      }
      return { ...r, valorConciliado: Math.round(vc * 100) / 100, valorPendente: Math.round(vp * 100) / 100, qtdConciliado: qc, qtdPendente: qp };
    });
  }

  async function aoEscolherArquivo(e: { target: HTMLInputElement }) {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const texto = await f.text();
      const lido = lerExtrato(texto, f.name);
      if (lido.saldoFinal != null) setExtrato(String(lido.saldoFinal));
      if (lido.txs.length === 0) setErro('concil.imp_vazio'); else setImp(lido);
    } catch { setErro('concil.imp_erro'); }
    e.target.value = '';
  }
  async function conciliarMuitos(ids: string[]) {
    for (const id of ids) { try { await api.patch(`/financeiro/conciliacao/${id}`, { conciliado: true }, token!); } catch { /* ignora individual */ } }
    setImp(null);
    await gerar();
    toast(t('concil.imp_toast').replace('{n}', String(ids.length)));
  }

  const conta = useMemo(() => contas.find((c) => c.id === contaId) ?? null, [contas, contaId]);
  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR');
  const saldoSistema = conta?.saldo ?? 0;
  const extratoNum = extrato.trim() ? Number(extrato.replace(',', '.')) : null;
  const diferenca = extratoNum != null ? Math.round((extratoNum - saldoSistema) * 100) / 100 : null;

  return (
    <div>
      <div className="crumb">{t('concil.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('concil.titulo')}</h1><div className="muted page-sub">{t('concil.sub')}</div></div></div>
      <div className="rel-filtro">
        <label className="campo">{t('concil.conta')}
          <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            {contas.length === 0 && <option value="">{t('concil.sem_contas')}</option>}
            {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.banco ? ` · ${c.banco}` : ''}</option>)}
          </select>
        </label>
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={() => gerar()}><Ic name="i-search" className="sm" /> {t('fluxo.filtrar')}</button>
        <button className="btn-ghost" onClick={() => { setDe(primeiroDia()); setAte(hoje()); }}><Ic name="i-x" className="sm" /> {t('fluxo.limpar')}</button>
        {pode && <>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>{t('concil.importar')}</button>
          <input ref={fileRef} type="file" accept=".ofx,.csv,.txt" style={{ display: 'none' }} onChange={aoEscolherArquivo} />
        </>}
        {resp && resp.linhas.length > 0 && (
          <><button className="btn-ghost" onClick={() => baixarCsv('conciliacao_' + de + '_' + ate,
            [t('pedidos.data'), t('fin.descricao'), t('fin.cliente'), t('concil.tipo'), t('rel.valor'), t('concil.conciliado')],
            resp.linhas.map((l) => [fmt(l.pagoEm), l.descricao, l.pessoaNome ?? '', l.tipo === 'receber' ? t('concil.entrada') : t('concil.saida'), l.valor, l.conciliado ? t('common.sim') : t('common.nao')]))}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => baixarExcel('conciliacao_' + de + '_' + ate,
            [t('pedidos.data'), t('fin.descricao'), t('fin.cliente'), t('concil.tipo'), t('rel.valor'), t('concil.conciliado')],
            resp.linhas.map((l) => [fmt(l.pagoEm), l.descricao, l.pessoaNome ?? '', l.tipo === 'receber' ? t('concil.entrada') : t('concil.saida'), l.valor, l.conciliado ? t('common.sim') : t('common.nao')]), { periodo: rotuloPeriodo(de, ate) })} /></>
        )}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {resp && resp.linhas.length > 0 && (
        <>
          <div className="kpi-row">
            <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('concil.entradas')}</div><div className="kpi-val">{moeda(resp.totalEntradas)}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('concil.saidas')}</div><div className="kpi-val">{moeda(resp.totalSaidas)}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-chart" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('concil.saldo_mov')}</div><div className="kpi-val">{moeda(resp.saldoMovimento)}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-check" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('concil.conciliados')}</div><div className="kpi-val">{resp.qtdConciliado}</div></div></div>
            <div className="card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-clock" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('concil.pendentes')}</div><div className="kpi-val">{resp.qtdPendente}</div></div></div>
          </div>

          <div className="card" style={{ maxWidth: 560, marginBottom: 16 }}>
            <div className="totais" style={{ justifyContent: 'space-between' }}>
              <div style={{ alignItems: 'flex-start' }}><span className="muted">{t('concil.saldo_sistema')}</span><b>{moeda(saldoSistema)}</b></div>
              <label className="campo" style={{ margin: 0, minWidth: 160 }}>{t('concil.saldo_extrato')}
                <input type="number" step="0.01" value={extrato} onChange={(e) => setExtrato(e.target.value)} placeholder="0,00" />
              </label>
              {diferenca != null && (
                <div style={{ alignItems: 'flex-start' }}><span className="muted">{t('concil.diferenca')}</span>
                  <b className={Math.abs(diferenca) < 0.005 ? 'kpi-ok' : 'kpi-vermelho'}>{moeda(diferenca)}</b>
                </div>
              )}
            </div>
            {diferenca != null && Math.abs(diferenca) < 0.005 && <div className="alerta-ok">{t('concil.bate')}</div>}
          </div>
        </>
      )}

      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('pedidos.data')}</th><th>{t('fin.descricao')}</th><th>{t('fin.cliente')}</th><th>{t('concil.tipo')}</th><th>{t('rel.valor')}</th><th>{t('concil.conciliado')}</th></tr></thead>
        <tbody>
          {(!resp || resp.linhas.length === 0) && <tr><td colSpan={6} className="vazio">{t('concil.vazio')}</td></tr>}
          {resp && resp.linhas.map((l) => (
            <tr key={l.id} className={l.conciliado ? 'linha-sel' : ''}>
              <td>{fmt(l.pagoEm)}</td>
              <td>{l.descricao}</td>
              <td>{l.pessoaNome ?? '—'}</td>
              <td><span className="pill" style={l.tipo === 'receber' ? { background: '#dcfce7', color: '#15803d' } : { background: '#fee2e2', color: '#b91c1c' }}>{l.tipo === 'receber' ? t('concil.entrada') : t('concil.saida')}</span></td>
              <td>{moeda(l.valor)}</td>
              <td><input type="checkbox" checked={l.conciliado} disabled={!pode} onChange={() => alternar(l)} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {imp && resp && <ModalImportar linhas={resp.linhas} txs={imp.txs} onFechar={() => setImp(null)} onConfirmar={conciliarMuitos} />}
    </div>
  );
}

function ModalImportar({ linhas, txs, onFechar, onConfirmar }: { linhas: Linha[]; txs: TxExtrato[]; onFechar: () => void; onConfirmar: (ids: string[]) => void; }) {
  const { t } = useI18n();
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  // Casa cada lançamento do extrato com um título ainda não conciliado, pelo valor com sinal
  // (entrada = receber +valor; saída = pagar -valor). Cada título é usado uma vez só.
  const { pares, matchedIds } = (() => {
    const usados = new Set<string>();
    const naoConc = linhas.filter((l) => !l.conciliado);
    const pares = txs.map((tx) => {
      const alvo = naoConc.find((l) => !usados.has(l.id) && Math.abs((l.tipo === 'receber' ? l.valor : -l.valor) - tx.valor) < 0.01) || null;
      if (alvo) usados.add(alvo.id);
      return { tx, titulo: alvo };
    });
    return { pares, matchedIds: pares.filter((p) => p.titulo).map((p) => p.titulo!.id) };
  })();
  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('concil.imp_titulo')}</h2>
      <p className="muted" style={{ marginTop: -6 }}>{t('concil.imp_resumo').replace('{m}', String(matchedIds.length)).replace('{n}', String(txs.length))}</p>
      <div className="card pad0" style={{ maxHeight: 320, overflow: 'auto' }}><table className="tabela">
        <thead><tr><th>{t('pedidos.data')}</th><th>{t('rel.valor')}</th><th>{t('concil.imp_extrato')}</th><th>{t('concil.imp_match')}</th></tr></thead>
        <tbody>
          {pares.map((p, i) => (
            <tr key={i}>
              <td>{fmt(p.tx.data)}</td>
              <td className={p.tx.valor < 0 ? 'kpi-vermelho' : 'kpi-ok'}>{moeda(p.tx.valor)}</td>
              <td>{p.tx.descricao || '—'}</td>
              <td>{p.titulo ? <span className="pill" style={{ background: '#dcfce7', color: '#15803d' }}>{p.titulo.descricao}</span> : <span className="muted">{t('concil.imp_sem')}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={matchedIds.length === 0} onClick={() => onConfirmar(matchedIds)}>{t('concil.imp_conciliar').replace('{n}', String(matchedIds.length))}</button>
      </div>
    </div></div>
  );
}
