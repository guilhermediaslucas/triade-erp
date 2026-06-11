import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda } from '../lib/pedido.js';

interface Resumo {
  vendasMes: number;
  pedidosPorStatus: { status: string; quantidade: number }[];
  receberAberto: number; receberVencido: number;
  pagarAberto: number; pagarVencido: number;
  estoqueBaixo: number; saldoCaixa: number;
  topProdutos: { nome: string; quantidade: number }[];
  faturamentoMensal: { mes: string; total: number }[];
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
const STATUS_ORDEM = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue'];
const CORES = ['#7b61ff', '#3b82f6', '#16a34a', '#ea9213', '#e1483b', '#6366f1'];

function GraficoLinha({ pontos }: { pontos: { mes: string; total: number }[] }) {
  const W = 520, H = 190, pad = 30;
  const max = Math.max(1, ...pontos.map((p) => p.total));
  const n = pontos.length;
  const x = (i: number) => pad + (n <= 1 ? 0 : (i * (W - 2 * pad) / (n - 1)));
  const y = (v: number) => H - pad - (v / max) * (H - 2 * pad);
  const pts = pontos.map((p, i) => `${x(i)},${y(p.total)}`).join(' ');
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
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
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 140 140" style={{ width: 140, height: 140, flex: 'none' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--borda)" strokeWidth="16" />
        {total > 0 && dados.map((d, i) => {
          const dash = (d.total / total) * c;
          const el = <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={CORES[i % CORES.length]} strokeWidth="16" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />;
          off += dash; return el;
        })}
        <text x="70" y="67" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--ink)">{moeda(total)}</text>
        <text x="70" y="83" textAnchor="middle" fontSize="9" fill="var(--muted)">{t('dash.total')}</text>
      </svg>
      <div style={{ flex: 1, minWidth: 150 }}>
        {dados.length === 0 && <div className="muted">{t('dash.sem_vendas')}</div>}
        {dados.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: CORES[i % CORES.length], flex: 'none' }} />
            <span style={{ flex: 1 }}>{d.categoria}</span><b>{moeda(d.total)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { usuario, token, temCapability } = useAuth();
  const { t } = useI18n();
  const [d, setD] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Resumo>('/dashboard', token!).then(setD).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  if (!d) return <div className="muted">{t('common.carregando')}</div>;
  const qtd = (st: string) => d.pedidosPorStatus.find((x) => x.status === st)?.quantidade ?? 0;
  const maxTop = Math.max(1, ...d.topProdutos.map((p) => p.quantidade));
  const maxSaldo = Math.max(1, ...d.saldosBancarios.map((b) => Math.abs(b.saldo)));

  const kpis = [
    { ic: '🛒', tint: 'tint-pp', lbl: t('dash.vendas_mes'), val: moeda(d.vendasMes) },
    { ic: '💰', tint: 'tint-gr', lbl: t('dash.saldo_caixa'), val: moeda(d.saldoCaixa) },
    { ic: '📥', tint: 'tint-bl', lbl: t('dash.a_receber'), val: moeda(d.receberAberto), sub: d.receberVencido > 0 ? `${moeda(d.receberVencido)} ${t('dash.vencido')}` : t('dash.em_dia'), alerta: d.receberVencido > 0 },
    { ic: '📤', tint: 'tint-or', lbl: t('dash.a_pagar'), val: moeda(d.pagarAberto), sub: d.pagarVencido > 0 ? `${moeda(d.pagarVencido)} ${t('dash.vencido')}` : t('dash.em_dia'), alerta: d.pagarVencido > 0 },
    { ic: '📦', tint: 'tint-rd', lbl: t('dash.estoque_baixo'), val: String(d.estoqueBaixo), sub: t('dash.produtos') },
  ];
  const avisos = [
    { ic: '🧾', tint: 'tint-rd', n: qtd('orcamento'), txt: t('dash.av_orcamento'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: '⏳', tint: 'tint-or', n: qtd('aguardando_pagamento'), txt: t('dash.av_aguardando'), to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
    { ic: '📦', tint: 'tint-bl', n: d.estoqueBaixo, txt: t('dash.av_estoque'), to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
    { ic: '💸', tint: 'tint-in', n: d.receberVencido > 0 ? moeda(d.receberVencido) : '0', txt: t('dash.av_receber_venc'), to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
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
      <h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('dashboard.titulo')}</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 18 }}>{t('dash.subtitulo')} · {usuario?.nome}</p>

      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="card kpi-mock" key={k.lbl}>
            <div className={'kpi-ic ' + k.tint}>{k.ic}</div>
            <div className="kpi-body">
              <div className="kpi-lbl">{k.lbl}</div>
              <div className="kpi-val">{k.val}</div>
              {k.sub && <div className={'kpi-delta' + (k.alerta ? ' alerta' : '')}>{k.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid2">
        <div className="card">
          <div className="card-head"><h3>{t('dash.faturamento')}</h3></div>
          <GraficoLinha pontos={d.faturamentoMensal} />
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.por_categoria')}</h3></div>
          <Donut dados={d.vendasCategoria} />
        </div>
      </div>

      <div className="dash-grid2">
        {avisos.length > 0 && (
          <div className="card">
            <div className="card-head"><h3>{t('dash.avisos')}</h3></div>
            <div className="dash-alerts">
              {avisos.map((a) => (
                <Link key={a.txt} to={a.to} className="dash-alert">
                  <div className={'kpi-ic sm ' + a.tint}>{a.ic}</div>
                  <div className="dash-alert-n">{a.n}</div>
                  <div className="dash-alert-t">{a.txt}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {acoes.length > 0 && (
          <div className="card">
            <div className="card-head"><h3>{t('dash.acoes')}</h3></div>
            <div className="dash-quick">
              {acoes.map((a) => (
                <Link key={a.txt + a.to} to={a.to} className="dash-qbtn">
                  <span className={'kpi-ic sm ' + a.tint}>{a.ic}</span>{a.txt}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-grid2">
        <div className="card">
          <div className="card-head"><h3>{t('dash.pedidos_status')}</h3></div>
          <div className="dash-status">
            {STATUS_ORDEM.map((st) => (
              <div key={st} className="dash-status-item">
                <span className={'kb-dot ' + corStatus(st as any)}></span>
                <span className="dash-status-nome">{t('status.' + st)}</span>
                <span className="dash-status-q">{qtd(st)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>{t('dash.top_produtos')}</h3></div>
          {d.topProdutos.length === 0 && <div className="muted">{t('dash.sem_vendas')}</div>}
          {d.topProdutos.map((p) => (
            <div key={p.nome} className="dash-bar-row">
              <div className="dash-bar-nome">{p.nome}</div>
              <div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: (p.quantidade / maxTop * 100) + '%' }}></div></div>
              <div className="dash-bar-q">{p.quantidade}</div>
            </div>
          ))}
        </div>
      </div>

      {d.saldosBancarios.length > 0 && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <div className="card-head"><h3>{t('dash.saldos')}</h3></div>
          {d.saldosBancarios.map((b) => (
            <div key={b.nome} className="dash-bar-row">
              <div className="dash-bar-nome">{b.nome}</div>
              <div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: (Math.abs(b.saldo) / maxSaldo * 100) + '%', background: b.saldo >= 0 ? 'var(--accent)' : '#e1483b' }}></div></div>
              <div className="dash-bar-q">{moeda(b.saldo)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
