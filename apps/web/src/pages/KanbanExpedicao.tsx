import { useEffect, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda, numeroPedido, PROXIMOS, type StatusPedido } from '../lib/pedido.js';

interface PedidoResumo { id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido; total: number; criadoEm: string; }
const COLUNAS: StatusPedido[] = ['orcamento', 'aguardando_pagamento', 'aprovado', 'separacao', 'expedido', 'entregue'];

export function KanbanExpedicao() {
  const { token } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [itens, setItens] = useState<PedidoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<StatusPedido | null>(null);

  async function carregar() { try { setItens(await api.get('/pedidos', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  function onDrop(col: StatusPedido) {
    setSobre(null);
    const id = arrastando; setArrastando(null);
    if (!id) return;
    const ped = itens.find((p) => p.id === id);
    if (!ped || ped.status === col) return;
    if (!PROXIMOS[ped.status].includes(col)) { setErro('pedido.transicao_invalida'); return; }
    setErro(null);
    api.patch('/pedidos/' + id + '/status', { status: col }, token!).then(carregar).catch((e) => { setErro((e as ErroApi).chaveI18n); carregar(); });
  }

  return (
    <div>
      <div className="crumb">{t('expedicao.crumb')}</div><h1 className="page-titulo">{t('expedicao.titulo')}</h1><p className="muted page-sub">{t('expedicao.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="kanban">
        {COLUNAS.map((col) => {
          const cards = itens.filter((p) => p.status === col);
          return (
            <div key={col}
              className={'kb-col' + (sobre === col ? ' kb-col-sobre' : '')}
              onDragOver={(e: DragEvent) => { e.preventDefault(); setSobre(col); }}
              onDragLeave={() => setSobre((x) => (x === col ? null : x))}
              onDrop={() => onDrop(col)}>
              <div className="kb-col-head"><span className={'kb-dot ' + corStatus(col)}></span>{t('status.' + col)}<span className="kb-count">{cards.length}</span></div>
              <div className="kb-cards">
                {cards.map((p) => (
                  <div key={p.id} className="kb-card kb-drag" draggable
                    onDragStart={() => setArrastando(p.id)} onDragEnd={() => setArrastando(null)}
                    onClick={() => nav('/comercial/pedidos/' + p.id)}>
                    <div className="kb-card-top"><b>{numeroPedido(p.numero)}</b><span>{moeda(p.total)}</span></div>
                    <div className="kb-card-cli">{p.clienteNome ?? '—'}</div>
                  </div>
                ))}
                {cards.length === 0 && <div className="kb-vazio">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
