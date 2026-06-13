import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { abrevMoeda, corStatus, moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';
import { Capacitor } from '@capacitor/core';
import { Ic } from '../components/Icones.js';

interface Resumo {
  vendasDia: number; vendasDiaDeltaPct: number | null;
  vendasSemana: number; vendasSemanaDeltaPct: number | null;
  vendasMes: number; vendasMesDeltaPct: number | null;
  vendasAno: number; vendasAnoDeltaPct: number | null;
  clientesAtivos: number; clientesDeltaPct: number | null;
  pedidosPorStatus: { status: string; quantidade: number }[];
  receberAberto: number; receberVencido: number;
  pagarAberto: number; pagarVencido: number;
  estoqueBaixo: number; saldoCaixa: number;
  topProdutos: { nome: string; quantidade: number; valor: number }[];
  topClientesValor: { nome: string; total: number }[];
  topClientesQtd: { nome: string; qtd: number }[];
  pedidosRecentes: { numero: number; cliente: string; vendedor: string; valor: number; status: string; data: string }[];
  fluxoEntradasMes: number; fluxoSaidasMes: number; fluxoSaldoMes: number;
  faturamentoMensal: { mes: string; total: number }[];
  faturamentoAnterior: { mes: string; total: number }[];
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
const CORES = ['#7b61ff', '#3b82f6', '#16a34a', '#ea9213', '#e1483b', '#6366f1'];
const pctBR = (n: number) => Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

// Contagem animada (0 → valor) com easing, ~0,8s. Usada nos KPIs.
function AnimaNum({ to, moeda: m }: { to: number; moeda: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now(); const dur = 800;
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1); const e = 1 - Math.pow(1 - p, 3);
      setV(to * e); if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{m ? abrevMoeda(v) : Math.round(v).toLocaleString('pt-BR')}</>;
}

function Delta({ pct, suf }: { pct: number | null; suf?: string }) {
  const { t } = useI18n();
  if (pct === null) return <div className="delta up">{t('dash.novo_periodo')}{suf ? ' · ' + suf : ''}</div>;
  const up = pct >= 0;
  return <div className={'delta ' + (up ? 'up' : 'down')}><Ic name={up ? 'i-arrow-up' : 'i-arrow-down'} className="sm" /> {pctBR(pct)}%{suf ? ' ' + suf : ''}</div>;
}

function GraficoLinha({ pontos, anteriores, onPick }: { pontos: { mes: string; total: number }[]; anteriores: number[]; onPick?: (mes: string) => void }) {
  const W = 560, H = 220, padL = 48, padR = 12, padT = 10, padB = 26;
  const n = pontos.length;
  const max = Math.max(1, ...pontos.map((p) => p.total), ...anteriores);
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const pts = pontos.map((p, i) => `${x(i)},${y(p.total)}`).join(' ');
  const ptsAnt = anteriores.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${padL},${padT + innerH} ${pts} ${x(n - 1)},${padT + innerH}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 230 }} className="dash-chart-in">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const yy = padT + innerH * (1 - g);
        return (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--borda)" strokeWidth="1" />
            <text x={padL - 6} y={yy + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{abrevMoeda(max * g)}</text>
          </g>
        );
      })}
      {anteriores.some((v) => v > 0) && <polyline points={ptsAnt} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="4 4" opacity="0.55" />}
      <polygon points={area} fill="var(--accent)" opacity="0.10" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {pontos.map((p, i) => (
        <g key={i} onClick={onPick ? () => onPick(p.mes) : undefined} style={onPick ? { cursor: 'pointer' } : undefined} className="dash-ponto">
          {onPick && <circle cx={x(i)} cy={y(p.total)} r="12" fill="transparent" />}
          <circle cx={x(i)} cy={y(p.total)} r="3.5" fill="var(--accent)" className="dash-ponto-c" />
          <text x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--muted)">{p.mes.slice(5)}/{p.mes.slice(2, 4)}</text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ dados }: { dados: { categoria: string; total: number }[] }) {
  const { t } = useI18n();
  const total = dados.reduce((a, d) => a + d.total, 0);
  const r = 52, c = 2 * Math.PI * r; let off = 0;
  return (
    <div>
      <div className="donut-wrap" style={{ height: 150 }}>
        <svg viewBox="0 0 150 150" style={{ width: 150, height: 150 }}>
          <circle cx="75" cy="75" r={r} fill="none" stroke="var(--borda)" strokeWidth="16" />
          {total > 0 && dados.map((d, i) => {
            const dash = (d.total / total) * c;
            const el = <circle key={i} cx="75" cy="75" r={r} fill="none" stroke={CORES[i % CORES.length]} strokeWidth="16" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-off} transform="rotate(-90 75 75)" />;
            off += dash; return el;
          })}
        </svg>
        <div className="donut-c"><b>{abrevMoeda(total)}</b><span>{t('dash.total')}</span></div>
      </div>
      <div className="lst" style={{ marginTop: 6 }}>
        {dados.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_vendas')}</div>}
        {dados.map((d, i) => (
          <div key={i} className="it">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: CORES[i % CORES.length], flex: 'none' }} />
            <div className="nm" style={{ flex: 1 }}>{d.categoria}</div>
            <b className="qt" style={{ color: 'var(--ink)' }}>{abrevMoeda(d.total)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [d, setD] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [drillMes, setDrillMes] = useState<string | null>(null);
  useEffect(() => { api.get<Resumo>('/dashboard', token!).then(setD).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  if (!d) return <div className="muted">{t('common.carregando')}</div>;
  const qtd = (st: string) => d.pedidosPorStatus.find((x) => x.status === st)?.quantidade ?? 0;
  const maxSaldo = Math.max(1, ...d.saldosBancarios.map((b) => Math.abs(b.saldo)));
  const totalContas = d.saldosBancarios.reduce((a, b) => a + b.saldo, 0);
  const fmtData = (s: string) => new Date(s).toLocaleDateString('pt-BR');

  const kpis: { tipo: string; ic: string; tint: string; lbl: string; raw: number; moeda: boolean; pct?: number | null; suf?: string; sub?: string }[] = [
    { tipo: 'dia', ic: 'i-cart', tint: 'tint-pp', lbl: t('dash.vendas_dia'), raw: d.vendasDia, moeda: true, pct: d.vendasDiaDeltaPct, suf: t('dash.vs_ontem') },
    { tipo: 'semana', ic: 'i-clock', tint: 'tint-bl', lbl: t('dash.vendas_semana'), raw: d.vendasSemana, moeda: true, pct: d.vendasSemanaDeltaPct, suf: t('dash.vs_semana') },
    { tipo: 'mes', ic: 'i-chart', tint: 'tint-gr', lbl: t('dash.vendas_mes'), raw: d.vendasMes, moeda: true, pct: d.vendasMesDeltaPct, suf: t('dash.vs_mes') },
    { tipo: 'ano', ic: 'i-dollar', tint: 'tint-or', lbl: t('dash.vendas_ano'), raw: d.vendasAno, moeda: true, pct: d.vendasAnoDeltaPct, suf: t('dash.vs_ano') },
    { tipo: 'clientes', ic: 'i-users', tint: 'tint-in', lbl: t('dash.clientes_ativos'), raw: d.clientesAtivos, moeda: false, sub: d.clientesAtivos.toLocaleString('pt-BR') + ' ' + t('dash.cli_ativos_total') },
  ];
  const avisos = [
    { ic: 'i-receipt', tint: 'tint-rd', n: qtd('orcamento'), txt: t('dash.av_orcamento'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: 'i-clock', tint: 'tint-or', n: qtd('aguardando_pagamento'), txt: t('dash.av_aguardando'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: 'i-box', tint: 'tint-bl', n: d.estoqueBaixo, txt: t('dash.av_estoque'), to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
    { ic: 'i-receipt', tint: 'tint-in', n: d.receberVencido > 0 ? abrevMoeda(d.receberVencido) : '0', txt: t('dash.av_receber_venc'), to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
  ].filter((a) => temCapability(a.cap));
  const acoes = [
    { ic: 'i-cart', tint: 'tint-pp', txt: t('dash.qa_novo_pedido'), to: '/comercial/pedidos/novo', cap: 'comercial.pedido.criar' },
    { ic: 'i-user', tint: 'tint-bl', txt: t('dash.qa_novo_cliente'), to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
    { ic: 'i-dollar', tint: 'tint-gr', txt: t('dash.a_receber'), to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
    { ic: 'i-receipt', tint: 'tint-or', txt: t('dash.a_pagar'), to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
    { ic: 'i-download', tint: 'tint-in', txt: t('dash.qa_entrada'), to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
  ].filter((a) => temCapability(a.cap));

  return (
    <div>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('dashboard.titulo')}</h1><div className="muted page-sub">{t('dash.subtitulo')}</div></div>
        {!Capacitor.isNativePlatform() && <button className="btn-ghost" onClick={() => navigate('/dashboard/tv')}><Ic name="i-chart" className="sm" /> {t('tv.botao')}</button>}
      </div>

      <div className="dash-row c5">
        {kpis.map((k) => (
          <div className="card clicavel" key={k.lbl} role="button" tabIndex={0} title={t('dash.kpi_drill')}
            onClick={() => navigate('/dashboard/serie/' + k.tipo)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/dashboard/serie/' + k.tipo); } }}>
            <div className="kpi">
              <div className={'kpi-ic ' + k.tint}><Ic name={k.ic} /></div>
              <div><div className="lbl">{k.lbl}</div><div className="val"><AnimaNum to={k.raw} moeda={k.moeda} /></div>{k.sub ? <div className="delta">{k.sub}</div> : <Delta pct={k.pct ?? null} suf={k.suf} />}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row d2">
        <div className="card">
          <div className="card-head"><h3>{t('dash.faturamento')}</h3>
            <div className="legendmini">
              <span><i style={{ background: 'var(--accent)' }} />{t('dash.este_periodo')}</span>
              <span><i style={{ background: 'var(--muted)' }} />{t('dash.periodo_anterior')}</span>
            </div>
          </div>
          <GraficoLinha pontos={d.faturamentoMensal} anteriores={d.faturamentoAnterior.map((a) => a.total)} onPick={setDrillMes} />
          <div className="muted" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>{t('dash.clique_ponto')}</div>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.por_categoria')}</h3></div>
          <Donut dados={d.vendasCategoria} />
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.top_produtos')}</h3></div>
          <div className="lst">
            {d.topProdutos.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_vendas')}</div>}
            {d.topProdutos.map((p) => (
              <div key={p.nome} className="it">
                <div className="thumb"><Ic name="i-drop" /></div>
                <div><div className="nm">{p.nome}</div><div className="meta">{abrevMoeda(p.valor)}</div></div>
                <div className="qt">{p.quantidade.toLocaleString('pt-BR')} {t('dash.un')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-row c2">
        <div className="card">
          <div className="card-head"><h3>{t('dash.top_cli_valor')}</h3><span className="muted" style={{ fontSize: 12 }}>{t('dash.total_comprado')}</span></div>
          <div className="lst">
            {d.topClientesValor.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_dados')}</div>}
            {d.topClientesValor.map((c) => (
              <div key={c.nome} className="it"><div className="nm" style={{ flex: 1 }}>{c.nome}</div><b className="qt" style={{ color: 'var(--ink)' }}>{abrevMoeda(c.total)}</b></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.top_cli_qtd')}</h3><span className="muted" style={{ fontSize: 12 }}>{t('dash.qtd_pedidos')}</span></div>
          <div className="lst">
            {d.topClientesQtd.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_dados')}</div>}
            {d.topClientesQtd.map((c) => (
              <div key={c.nome} className="it"><div className="nm" style={{ flex: 1 }}>{c.nome}</div><b className="qt" style={{ color: 'var(--ink)' }}>{c.qtd}</b></div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-row d3">
        <div className="card">
          <div className="card-head"><h3>{t('dash.avisos')}</h3></div>
          <div className="alerts">
            {avisos.map((a) => (
              <Link key={a.txt} to={a.to} className="alert">
                <div className="top"><div className={'kpi-ic sm ' + a.tint}><Ic name={a.ic} className="sm" /></div><div className="big">{a.n}</div></div>
                <div className="txt">{a.txt}</div><span className="lnk">{t('dash.ver_todos')} →</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.acoes')}</h3></div>
          <div className="quick">
            {acoes.map((a) => (
              <Link key={a.txt + a.to} to={a.to} className="qbtn"><span className={'qi ' + a.tint}><Ic name={a.ic} className="sm" /></span>{a.txt}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-row d3">
        <div className="card pad0">
          <div className="card-head" style={{ padding: '18px 18px 0' }}><h3>{t('dash.pedidos_recentes')}</h3><Link className="lnk" to="/comercial/pedidos" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{t('dash.ver_todos')}</Link></div>
          <table className="tabela" style={{ marginTop: 12 }}>
            <thead><tr><th>{t('dash.col_pedido')}</th><th>{t('dash.col_cliente')}</th><th>{t('dash.col_vendedor')}</th><th>{t('dash.col_valor')}</th><th>{t('usuarios.situacao')}</th><th>{t('dash.col_data')}</th></tr></thead>
            <tbody>
              {d.pedidosRecentes.length === 0 && <tr><td colSpan={6} className="vazio">{t('dash.sem_dados')}</td></tr>}
              {d.pedidosRecentes.map((p) => (
                <tr key={p.numero}>
                  <td><b>{numeroPedido(p.numero)}</b></td><td>{p.cliente}</td><td>{p.vendedor}</td><td>{moeda(p.valor)}</td>
                  <td><span className={'kb-dot ' + corStatus(p.status as StatusPedido)} /> {t('status.' + p.status)}</td>
                  <td>{fmtData(p.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.fluxo_mes')}</h3><Link to="/financeiro/fluxo" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{t('dash.ver_detalhes')}</Link></div>
          <div className="fstat"><div className="l">{t('dash.entradas')}</div><div className="v" style={{ color: 'var(--dash-green)' }}>{abrevMoeda(d.fluxoEntradasMes)}</div></div>
          <div className="fstat"><div className="l">{t('dash.saidas')}</div><div className="v" style={{ color: 'var(--dash-red)' }}>{abrevMoeda(d.fluxoSaidasMes)}</div></div>
          <div className="fstat sel"><div className="l">{t('dash.saldo')}</div><div className="v" style={{ color: 'var(--accent2)' }}>{abrevMoeda(d.fluxoSaldoMes)}</div></div>
        </div>
      </div>

      <div className="dash-row d3">
        <div className="card">
          <div className="card-head"><h3>{t('dash.saldos')}</h3></div>
          {d.saldosBancarios.length === 0 && <div className="muted">{t('dash.sem_contas')}</div>}
          {d.saldosBancarios.map((b) => (
            <div key={b.nome} className="dash-bar-row">
              <div className="dash-bar-nome">{b.nome}</div>
              <div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: (Math.abs(b.saldo) / maxSaldo * 100) + '%', background: b.saldo >= 0 ? 'var(--accent)' : 'var(--dash-red)' }} /></div>
              <div className="dash-bar-q">{abrevMoeda(b.saldo)}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.total_contas')}</h3></div>
          {d.saldosBancarios.length === 0
            ? <div className="fstat" style={{ color: 'var(--muted)' }}><div className="l">{t('dash.sem_contas')}</div></div>
            : d.saldosBancarios.map((b) => (
              <div key={b.nome} className="fstat"><div className="l">{b.nome}</div><div className="v">{abrevMoeda(b.saldo)}</div></div>
            ))}
          <div className="fstat sel"><div className="l">{t('dash.saldo_total')}</div><div className="v" style={{ color: 'var(--accent2)' }}>{abrevMoeda(totalContas)}</div></div>
        </div>
      </div>

      <div className="dash-footer">{t('dash.footer')}</div>
      {drillMes && <DrillModal mes={drillMes} onFechar={() => setDrillMes(null)} />}
    </div>
  );
}

interface DrillFat { mes: string; total: number; pedidos: number; ticketMedio: number; topClientes: { nome: string; total: number }[]; }
// Modal de drilldown de um mês do faturamento (clique no ponto do gráfico).
function DrillModal({ mes, onFechar }: { mes: string; onFechar: () => void }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [dd, setDd] = useState<DrillFat | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => { api.get<DrillFat>('/dashboard/drill?mes=' + encodeURIComponent(mes), token!).then(setDd).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, [mes]);
  const titulo = mes.slice(5) + '/' + mes.slice(0, 4);
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <div className="card-head" style={{ marginBottom: 4 }}><h2 style={{ margin: 0 }}>{t('dash.faturamento')} · {titulo}</h2></div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{t('dash.drill_sub')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {!dd && !erro && <div className="muted">{t('common.carregando')}</div>}
      {dd && (<>
        <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 14 }}>
          <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-dollar" className="sm" /></div><div><div className="kpi-lbl">{t('dash.drill_faturado')}</div><div className="kpi-val">{moeda(dd.total)}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-receipt" className="sm" /></div><div><div className="kpi-lbl">{t('dash.drill_pedidos')}</div><div className="kpi-val">{dd.pedidos}</div></div></div>
          <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-chart" className="sm" /></div><div><div className="kpi-lbl">{t('dash.drill_ticket')}</div><div className="kpi-val">{moeda(dd.ticketMedio)}</div></div></div>
        </div>
        <div className="perm-titulo">{t('dash.drill_top_clientes')}</div>
        <div className="lst">
          {dd.topClientes.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_vendas')}</div>}
          {dd.topClientes.map((c) => (
            <div key={c.nome} className="it"><div className="nm" style={{ flex: 1 }}>{c.nome}</div><b className="qt" style={{ color: 'var(--ink)' }}>{moeda(c.total)}</b></div>
          ))}
        </div>
      </>)}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}
