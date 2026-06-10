import { useEffect, useState } from 'react';
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
  const { usuario, token } = useAuth();
  const { t } = useI18n();
  const [d, setD] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Resumo>('/dashboard', token!).then(setD).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  if (!d) return <div className="muted">{t('common.carregando')}</div>;
  const qtd = (st: string) => d.pedidosPorStatus.find((x) => x.status === st)?.quantidade ?? 0;
  const maxTop = Math.max(1, ...d.topProdutos.map((p) => p.quantidade));

  return (
    <div>
      <h1 className="page-titulo">{t('dashboard.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('dashboard.bemvindo')}, {usuario?.nome}</p>

      <div className="dash-cards">
        <div className="dash-card"><div className="dash-l">{t('dash.vendas_mes')}</div><div className="dash-v">{moeda(d.vendasMes)}</div></div>
        <div className="dash-card"><div className="dash-l">{t('dash.saldo_caixa')}</div><div className="dash-v" style={{ color: d.saldoCaixa >= 0 ? '#15803d' : '#b91c1c' }}>{moeda(d.saldoCaixa)}</div></div>
        <div className="dash-card"><div className="dash-l">{t('dash.a_receber')}</div><div className="dash-v">{moeda(d.receberAberto)}</div><div className="dash-s">{d.receberVencido > 0 ? <span className="dash-alerta">{moeda(d.receberVencido)} {t('dash.vencido')}</span> : t('dash.em_dia')}</div></div>
        <div className="dash-card"><div className="dash-l">{t('dash.a_pagar')}</div><div className="dash-v">{moeda(d.pagarAberto)}</div><div className="dash-s">{d.pagarVencido > 0 ? <span className="dash-alerta">{moeda(d.pagarVencido)} {t('dash.vencido')}</span> : t('dash.em_dia')}</div></div>
        <div className="dash-card"><div className="dash-l">{t('dash.estoque_baixo')}</div><div className="dash-v" style={{ color: d.estoqueBaixo > 0 ? '#b45309' : '#15803d' }}>{d.estoqueBaixo}</div><div className="dash-s">{t('dash.produtos')}</div></div>
      </div>

      <div className="dash-grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('dash.pedidos_status')}</h3>
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
          <h3 style={{ marginTop: 0 }}>{t('dash.top_produtos')}</h3>
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
