import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';

interface Resumo {
  vendasDia: number; vendasDiaDeltaPct: number;
  vendasSemana: number; vendasSemanaDeltaPct: number;
  vendasMes: number; vendasMesDeltaPct: number;
  vendasAno: number; vendasAnoDeltaPct: number;
  clientesAtivos: number; clientesDeltaPct: number;
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
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
const CORES = ['#7b61ff', '#3b82f6', '#16a34a', '#ea9213', '#e1483b', '#6366f1'];
const pctBR = (n: number) => Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function Delta({ pct, suf }: { pct: number; suf?: string }) {
  const up = pct >= 0;
  return <div className={'delta ' + (up ? 'up' : 'down')}>{up ? '▲' : '▼'} {pctBR(pct)}%{suf ? ' ' + suf : ''}</div>;
}

function GraficoLinha({ pontos }: { pontos: { mes: string; total: number }[] }) {
  const W = 520, H = 210, pad = 30;
  const max = Math.max(1, ...pontos.map((p) => p.total));
  const n = pontos.length;
  const x = (i: number) => pad + (n <= 1 ? 0 : (i * (W - 2 * pad) / (n - 1)));
  const y = (v: number) => H - pad - (v / max) * (H - 2 * pad);
  const pts = pontos.map((p, i) => `${x(i)},${y(p.total)}`).join(' ');
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 230 }}>
      <polygon points={area} fill="var(--accent)" opacity="0.10" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {pontos.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.total)} r="3" fill="var(--accent)" />
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
        <div className="donut-c"><b>{moeda(total)}</b><span>{t('dash.total')}</span></div>
      </div>
      <div className="lst" style={{ marginTop: 6 }}>
        {dados.length === 0 && <div className="it" style={{ color: 'var(--muted)' }}>{t('dash.sem_vendas')}</div>}
        {dados.map((d, i) => (
          <div key={i} className="it">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: CORES[i % CORES.length], flex: 'none' }} />
            <div className="nm" style={{ flex: 1 }}>{d.categoria}</div>
            <b className="qt" style={{ color: 'var(--ink)' }}>{moeda(d.total)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const [d, setD] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => { api.get<Resumo>('/dashboard', token!).then(setD).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  if (!d) return <div className="muted">{t('common.carregando')}</div>;
  const qtd = (st: string) => d.pedidosPorStatus.find((x) => x.status === st)?.quantidade ?? 0;
  const maxSaldo = Math.max(1, ...d.saldosBancarios.map((b) => Math.abs(b.saldo)));
  const totalContas = d.saldosBancarios.reduce((a, b) => a + b.saldo, 0);
  const fmtData = (s: string) => new Date(s).toLocaleDateString('pt-BR');

  const kpis = [
    { ic: '🛒', tint: 'tint-pp', lbl: t('dash.vendas_dia'), val: moeda(d.vendasDia), pct: d.vendasDiaDeltaPct, suf: t('dash.vs_ontem') },
    { ic: '🕐', tint: 'tint-bl', lbl: t('dash.vendas_semana'), val: moeda(d.vendasSemana), pct: d.vendasSemanaDeltaPct },
    { ic: '📈', tint: 'tint-gr', lbl: t('dash.vendas_mes'), val: moeda(d.vendasMes), pct: d.vendasMesDeltaPct },
    { ic: '💲', tint: 'tint-or', lbl: t('dash.vendas_ano'), val: moeda(d.vendasAno), pct: d.vendasAnoDeltaPct },
    { ic: '👥', tint: 'tint-in', lbl: t('dash.clientes_ativos'), val: d.clientesAtivos.toLocaleString('pt-BR'), pct: d.clientesDeltaPct },
  ];
  const avisos = [
    { ic: '🧾', tint: 'tint-rd', n: qtd('orcamento'), txt: t('dash.av_orcamento'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: '⏳', tint: 'tint-or', n: qtd('aguardando_pagamento'), txt: t('dash.av_aguardando'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: '📦', tint: 'tint-bl', n: d.estoqueBaixo, txt: t('dash.av_estoque'), to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
    { ic: '🧾', tint: 'tint-in', n: d.receberVencido > 0 ? moeda(d.receberVencido) : '0', txt: t('dash.av_receber_venc'), to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
  ].filter((a) => temCapability(a.cap));
  const acoes = [
    { ic: '🛒', tint: 'tint-pp', txt: t('dash.qa_novo_pedido'), to: '/comercial/pedidos/novo', cap: 'comercial.pedido.criar' },
    { ic: '🧑‍⚕️', tint: 'tint-bl', txt: t('dash.qa_novo_cliente'), to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
    { ic: '💰', tint: 'tint-gr', txt: t('dash.a_receber'), to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
    { ic: '🧾', tint: 'tint-or', txt: t('dash.a_pagar'), to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
    { ic: '📥', tint: 'tint-in', txt: t('dash.qa_entrada'), to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
  ].filter((a) => temCapability(a.cap));

  return (
    <div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('dashboard.titulo')}</h1><div className="muted page-sub">{t('dash.subtitulo')}</div></div></div>

      <div className="dash-row c5">
        {kpis.map((k) => (
          <div className="card" key={k.lbl}>
            <div className="kpi">
              <div className={'kpi-ic ' + k.tint}>{k.ic}</div>
              <div><div className="lbl">{k.lbl}</div><div className="val">{k.val}</div><Delta pct={k.pct} suf={k.suf} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row d2">
        <div className="card">
          <div className="card-head"><h3>{t('dash.faturamento')}</h3>
            <div className="legendmini"><span><i style={{ background: 'var(--accent)' }} />{t('dash.este_periodo')}</span></div>
          </div>
          <GraficoLinha pontos={d.faturamentoMensal} />
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
                <div className="thumb">💧</div>
                <div><div className="nm">{p.nome}</div><div className="meta">{moeda(p.valor)}</div></div>
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
              <div key={c.nome} className="it"><div className="nm" style={{ flex: 1 }}>{c.nome}</div><b className="qt" style={{ color: 'var(--ink)' }}>{moeda(c.total)}</b></div>
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
                <div className="top"><div className={'kpi-ic sm ' + a.tint}>{a.ic}</div><div className="big">{a.n}</div></div>
                <div className="txt">{a.txt}</div><span className="lnk">{t('dash.ver_todos')} →</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.acoes')}</h3></div>
          <div className="quick">
            {acoes.map((a) => (
              <Link key={a.txt + a.to} to={a.to} className="qbtn"><span className={'qi ' + a.tint}>{a.ic}</span>{a.txt}</Link>
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
          <div className="fstat"><div className="l">{t('dash.entradas')}</div><div className="v" style={{ color: 'var(--dash-green)' }}>{moeda(d.fluxoEntradasMes)}</div></div>
          <div className="fstat"><div className="l">{t('dash.saidas')}</div><div className="v" style={{ color: 'var(--dash-red)' }}>{moeda(d.fluxoSaidasMes)}</div></div>
          <div className="fstat sel"><div className="l">{t('dash.saldo')}</div><div className="v" style={{ color: 'var(--accent2)' }}>{moeda(d.fluxoSaldoMes)}</div></div>
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
              <div className="dash-bar-q">{moeda(b.saldo)}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.total_contas')}</h3></div>
          {d.saldosBancarios.length === 0
            ? <div className="fstat" style={{ color: 'var(--muted)' }}><div className="l">{t('dash.sem_contas')}</div></div>
            : d.saldosBancarios.map((b) => (
              <div key={b.nome} className="fstat"><div className="l">{b.nome}</div><div className="v">{moeda(b.saldo)}</div></div>
            ))}
          <div className="fstat sel"><div className="l">{t('dash.saldo_total')}</div><div className="v" style={{ color: 'var(--accent2)' }}>{moeda(totalContas)}</div></div>
        </div>
      </div>

      <div className="dash-footer">{t('dash.footer')}</div>
    </div>
  );
}
