import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { baixarExcel } from '../lib/excel.js';

interface Lanc { id: string; tipo: 'entrada' | 'saida'; numero: string; descricao: string; pessoaNome: string | null; conta: string | null; dataCaixa: string; previsto: boolean; situacao: 'baixado' | 'vencido' | 'aberto'; valor: number; }
interface Semana { de: string; ate: string; rotulo: string; entradas: number; saidas: number; }
interface Fluxo { lancamentos: Lanc[]; entradas: number; saidas: number; semanas: Semana[]; }
interface Conta { id: string; nome: string; saldo?: number; }

const fmtData = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

export function FluxoCaixa() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [dados, setDados] = useState<Fluxo>({ lancamentos: [], entradas: 0, saidas: 0, semanas: [] });
  const [contas, setContas] = useState<Conta[]>([]);
  const [bancosSel, setBancosSel] = useState<Set<string>>(new Set());
  const [semanaSel, setSemanaSel] = useState<number | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);

  function carregar(d = de, a = ate) {
    const qs = [d ? 'de=' + d : '', a ? 'ate=' + a : ''].filter(Boolean).join('&');
    api.get<Fluxo>('/financeiro/fluxo' + (qs ? '?' + qs : ''), token!).then((r) => { setDados(r); setSemanaSel(null); setSel(new Set(r.lancamentos.map((l) => l.id))); }).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  useEffect(() => {
    carregar();
    api.get<Conta[]>('/contas-correntes/saldos', token!).then((l) => { setContas(l); setBancosSel(new Set(l.map((c) => c.id))); }).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  const saldoInicial = useMemo(() => contas.filter((c) => bancosSel.has(c.id)).reduce((a, c) => a + (c.saldo ?? 0), 0), [contas, bancosSel]);
  const saldoPeriodo = saldoInicial + dados.entradas - dados.saidas;
  function toggleBanco(id: string) { setBancosSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  // Lançamentos exibidos (filtra pela semana clicada, se houver).
  const mostrados = useMemo(() => {
    const w = semanaSel == null ? undefined : dados.semanas[semanaSel];
    if (!w) return dados.lancamentos;
    return dados.lancamentos.filter((l) => l.dataCaixa >= w.de && l.dataCaixa <= w.ate);
  }, [dados, semanaSel]);
  const totalSel = useMemo(() => mostrados.filter((l) => sel.has(l.id)).reduce((a, l) => a + (l.tipo === 'entrada' ? l.valor : -l.valor), 0), [mostrados, sel]);
  const todosMarcados = mostrados.length > 0 && mostrados.every((l) => sel.has(l.id));
  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleTodos() { setSel((s) => { const n = new Set(s); mostrados.forEach((l) => (todosMarcados ? n.delete(l.id) : n.add(l.id))); return n; }); }

  function exportar() {
    const cab = [t('fluxo.tipo'), t('fin.numero'), t('fin.descricao'), t('fin.fornecedor'), t('fluxo.conta'), t('fluxo.data_caixa'), t('fin.situacao'), t('fin.valor')];
    const linhas = mostrados.map((l) => [t('fluxo.' + l.tipo), l.numero, l.descricao, l.pessoaNome ?? '', l.conta ?? '', l.dataCaixa, t('fluxo.' + l.situacao), (l.tipo === 'saida' ? -l.valor : l.valor)]);
    baixarExcel('fluxo_caixa', cab, linhas);
  }

  // Gráfico SVG de barras semanais (entradas verde / saídas vermelha).
  const maxV = Math.max(1, ...dados.semanas.flatMap((s) => [s.entradas, s.saidas]));
  const W = Math.max(320, dados.semanas.length * 64), H = 200, pad = 28;
  const slot = dados.semanas.length ? (W - pad) / dados.semanas.length : 0;
  const bw = Math.min(18, slot / 3);

  return (
    <div>
      <div className="crumb">{t('fluxo.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('fluxo.titulo')}</h1><div className="muted page-sub">{t('fluxo.sub_full')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="contas-toolbar" style={{ alignItems: 'flex-end' }}>
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_ini')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('fluxo.data_fim')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 180 }} /></label>
        <button className="btn-primary" onClick={() => carregar()}>🔎 {t('fluxo.filtrar')}</button>
        <button className="btn-ghost" onClick={() => { setDe(''); setAte(''); carregar('', ''); }}>✕ {t('fluxo.limpar')}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card" style={{ maxWidth: 'none' }}>
          <div className="card-head"><h3>{t('fluxo.entradas_saidas')}</h3>
            <span style={{ fontSize: 12 }}><span style={{ color: '#16a34a' }}>■</span> {t('fluxo.entradas')} &nbsp; <span style={{ color: '#e1483b' }}>■</span> {t('fluxo.saidas')}</span>
          </div>
          {dados.semanas.length === 0 ? <div className="vazio" style={{ padding: 24 }}>{t('fluxo.vazio')}</div> : (
            <div style={{ overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 220 }}>
                {dados.semanas.map((s, i) => {
                  const x = pad + i * slot + slot / 2;
                  const he = (s.entradas / maxV) * (H - pad - 16);
                  const hs = (s.saidas / maxV) * (H - pad - 16);
                  const base = H - 18;
                  const ativo = semanaSel === i;
                  return (
                    <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSemanaSel((cur) => (cur === i ? null : i))} opacity={semanaSel == null || ativo ? 1 : 0.45}>
                      <rect x={x - bw - 1} y={base - he} width={bw} height={he} fill="#16a34a" rx={2} />
                      <rect x={x + 1} y={base - hs} width={bw} height={hs} fill="#e1483b" rx={2} />
                      <text x={x} y={H - 4} textAnchor="middle" fontSize={10} fill="#8a90a2">{s.rotulo}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'right' }}>{t('fluxo.clique_barras')}</div>
        </div>

        <div className="card" style={{ maxWidth: 'none' }}>
          <div className="card-head"><h3>{t('fluxo.resumo')}</h3></div>
          <div className="fluxo-lin"><span>{t('fluxo.saldo_inicial')}</span><b style={{ color: 'var(--accent)' }}>{moeda(saldoInicial)}</b></div>
          <div className="fluxo-lin"><span>{t('fluxo.entradas')}</span><b style={{ color: '#16a34a' }}>{moeda(dados.entradas)}</b></div>
          <div className="fluxo-lin"><span>{t('fluxo.saidas')}</span><b style={{ color: '#e1483b' }}>{moeda(dados.saidas)}</b></div>
          <div className="fluxo-lin" style={{ fontSize: 15, fontWeight: 700, borderBottom: 'none' }}><span>{t('fluxo.saldo_periodo')}</span><b style={{ color: saldoPeriodo >= 0 ? '#16a34a' : '#e1483b' }}>{moeda(saldoPeriodo)}</b></div>
          <div style={{ borderTop: '1px solid var(--borda)', marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{t('fluxo.saldos_banco')}</div>
            {contas.length === 0 && <div className="muted" style={{ fontSize: 13 }}>{t('fluxo.sem_contas')}</div>}
            {contas.map((c) => (
              <label key={c.id} className="fluxo-banco">
                <span><input type="checkbox" checked={bancosSel.has(c.id)} onChange={() => toggleBanco(c.id)} /> {c.nome}</span>
                <b>{moeda(c.saldo ?? 0)}</b>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="card pad0">
        <div className="card-head" style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ marginRight: 'auto' }}>{t('fluxo.lancamentos')}{semanaSel != null && dados.semanas[semanaSel] ? ` · ${dados.semanas[semanaSel]!.rotulo}` : ''}</h3>
          {semanaSel != null && <button className="btn-link" onClick={() => setSemanaSel(null)}>{t('fluxo.limpar')}</button>}
          {mostrados.length > 0 && <button className="btn-acao verde" onClick={exportar}>⬇ {t('rel.exportar_xlsx')}</button>}
        </div>
        <table className="tabela">
          <thead><tr><th style={{ width: 34 }}><input type="checkbox" checked={todosMarcados} onChange={toggleTodos} /></th><th>{t('fluxo.tipo')}</th><th>{t('fin.numero')}</th><th>{t('fin.descricao')}</th><th>{t('fluxo.cli_forn')}</th><th>{t('fluxo.conta')}</th><th>{t('fluxo.data_caixa')}</th><th>{t('fluxo.prev_efet')}</th><th>{t('fin.situacao')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th></tr></thead>
          <tbody>
            {mostrados.length === 0 && <tr><td colSpan={10} className="vazio">{t('fluxo.vazio')}</td></tr>}
            {mostrados.map((l) => (
              <tr key={l.id} className={sel.has(l.id) ? 'linha-sel' : ''}>
                <td><input type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} /></td>
                <td><span className={'pill ' + (l.tipo === 'entrada' ? 'st-verde' : 'st-vermelho')}>{t('fluxo.' + l.tipo)}</span></td>
                <td style={{ fontWeight: 700 }}>{l.numero}</td>
                <td>{l.descricao}</td>
                <td>{l.pessoaNome ?? '—'}</td>
                <td>{l.conta ?? '—'}</td>
                <td>{fmtData(l.dataCaixa)}</td>
                <td>{l.previsto ? t('fluxo.previsto') : t('fluxo.efetivo')}</td>
                <td><span className={'pill ' + (l.situacao === 'baixado' ? 'st-verde' : l.situacao === 'vencido' ? 'st-vermelho' : 'st-laranja')}>{t('fluxo.' + l.situacao)}</span></td>
                <td style={{ textAlign: 'right', color: l.tipo === 'entrada' ? '#15803d' : '#b91c1c', fontWeight: 600 }}>{l.tipo === 'saida' ? '-' : ''}{moeda(l.valor)}</td>
              </tr>
            ))}
          </tbody>
          {mostrados.length > 0 && <tfoot><tr><td colSpan={9} style={{ textAlign: 'right', fontWeight: 700 }}>{t('fluxo.saldo_sel')}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{moeda(totalSel)}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  );
}
