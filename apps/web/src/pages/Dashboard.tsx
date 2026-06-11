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
}
const STATUS_ORDEM = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue'];

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
    </div>
  );
}
