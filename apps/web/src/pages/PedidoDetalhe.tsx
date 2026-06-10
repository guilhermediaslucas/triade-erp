import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { corStatus, moeda, numeroPedido, PROXIMOS, type StatusPedido } from '../lib/pedido.js';

interface Item { produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number; }
interface Pedido {
  id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: StatusPedido;
  formaPagamento: string | null; observacao: string | null; enderecoEntrega: string | null;
  subtotal: number; frete: number; total: number; criadoEm: string; itens: Item[];
}

export function PedidoDetalhe() {
  const { id } = useParams();
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [p, setP] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const podeGerenciar = temCapability('comercial.pedido.gerenciar');

  async function carregar() { try { setP(await api.get('/pedidos/' + id, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [id]);

  async function mudar(status: StatusPedido) {
    setErro(null);
    try { await api.patch('/pedidos/' + id + '/status', { status }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  if (!p) return <div className="muted">{erro ? t(erro) : t('common.carregando')}</div>;
  const proximos = PROXIMOS[p.status];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-titulo">{numeroPedido(p.numero)} <span className={'pill ' + corStatus(p.status)}>{t('status.' + p.status)}</span></h1>
        <button className="btn-ghost" onClick={() => nav('/comercial/pedidos')}>← {t('pedidos.voltar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card" style={{ maxWidth: 820, marginBottom: 16 }}>
        <div className="det-grid">
          <div><span className="det-l">{t('pedidos.cliente')}</span><div>{p.clienteNome ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.vendedor')}</span><div>{p.vendedorNome ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.forma_pgto')}</span><div>{p.formaPagamento ?? '—'}</div></div>
          <div><span className="det-l">{t('pedidos.data')}</span><div>{new Date(p.criadoEm).toLocaleString('pt-BR')}</div></div>
          <div style={{ gridColumn: '1 / -1' }}><span className="det-l">{t('pedidos.endereco')}</span><div>{p.enderecoEntrega ?? '—'}</div></div>
          {p.observacao && <div style={{ gridColumn: '1 / -1' }}><span className="det-l">{t('pedidos.obs')}</span><div>{p.observacao}</div></div>}
        </div>
      </div>

      <div className="card pad0" style={{ maxWidth: 820, marginBottom: 16 }}><table className="tabela">
        <thead><tr><th>{t('precos.produto')}</th><th>{t('pedidos.qtd')}</th><th>{t('pedidos.preco_unit')}</th><th>{t('pedidos.subtotal')}</th></tr></thead>
        <tbody>
          {p.itens.map((it, i) => (
            <tr key={i}><td>{it.produtoNome}</td><td>{it.quantidade}</td><td>{moeda(it.precoUnitario)}</td><td>{moeda(it.subtotal)}</td></tr>
          ))}
        </tbody>
      </table></div>

      <div className="card" style={{ maxWidth: 820 }}>
        <div className="totais">
          <div><span>{t('pedidos.subtotal')}</span><b>{moeda(p.subtotal)}</b></div>
          <div><span>{t('pedidos.frete')}</span><b>{moeda(p.frete)}</b></div>
          <div className="total-grande"><span>{t('pedidos.total')}</span><b>{moeda(p.total)}</b></div>
        </div>
        {podeGerenciar && proximos.length > 0 && (
          <div className="acoes-status">
            {proximos.map((s) => (
              <button key={s} className={s === 'cancelado' ? 'btn-ghost' : 'btn-primary'} onClick={() => mudar(s)}>
                {t('pedidos.acao.' + s)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
