import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda, numeroPedido, type StatusPedido } from '../lib/pedido.js';

interface PedidoResumo { id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido; total: number; criadoEm: string; }

// Colunas do pipeline (cancelado não aparece no quadro).
const COLUNAS: StatusPedido[] = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue'];

export function Pedidos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<PedidoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<PedidoResumo[]>('/pedidos', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  const cancelados = itens.filter((p) => p.status === 'cancelado').length;

  return (
    <div>
      <div className="page-head">
        <div><h1 className="page-titulo">{t('pedidos.titulo')}</h1><div className="muted" style={{ fontSize: 13 }}>{t('pedidos.kanban_sub')}</div></div>
        {temCapability('comercial.pedido.criar') && <button className="btn-primary" onClick={() => nav('/comercial/pedidos/novo')}>+ {t('pedidos.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kanban">
        {COLUNAS.map((col) => {
          const cards = itens.filter((p) => p.status === col);
          return (
            <div key={col} className="kb-col">
              <div className="kb-col-head">
                <span className={'kb-dot ' + corStatus(col)}></span>
                {t('status.' + col)}<span className="kb-count">{cards.length}</span>
              </div>
              <div className="kb-cards">
                {cards.map((p) => (
                  <div key={p.id} className="kb-card" onClick={() => nav('/comercial/pedidos/' + p.id)}>
                    <div className="kb-card-top"><b>{numeroPedido(p.numero)}</b><span>{moeda(p.total)}</span></div>
                    <div className="kb-card-cli">{p.clienteNome ?? '—'}</div>
                    <div className="kb-card-meta">{p.vendedorNome ?? '—'} · {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</div>
                  </div>
                ))}
                {cards.length === 0 && <div className="kb-vazio">—</div>}
              </div>
            </div>
          );
        })}
      </div>
      {cancelados > 0 && <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>{cancelados} {t('pedidos.cancelados_ocultos')}</div>}
    </div>
  );
}
