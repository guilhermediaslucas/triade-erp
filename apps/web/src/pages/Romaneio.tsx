import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda, numeroPedido } from '../lib/pedido.js';

interface Item { produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number; }
interface Pedido {
  id: string; numero: number; clienteNome: string | null; vendedorNome: string | null; status: string;
  enderecoEntrega: string | null; formaEntrega: string; motoboyNome: string | null; distanciaKm: number | null;
  formaPagamento: string | null; subtotal: number; frete: number; total: number; criadoEm: string; itens: Item[];
}

export function Romaneio() {
  const { id } = useParams();
  const { token } = useAuth();
  const { branding } = useBranding();
  const { t } = useI18n();
  const nav = useNavigate();
  const [p, setP] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => { api.get<Pedido>('/pedidos/' + id, token!).then(setP).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, [id]);

  if (erro) return <div className="muted" style={{ padding: 24 }}>{t(erro)}</div>;
  if (!p) return <div className="muted" style={{ padding: 24 }}>{t('common.carregando')}</div>;

  const entrega = t('entrega.' + p.formaEntrega)
    + (p.formaEntrega === 'motoboy' && p.motoboyNome ? ' · ' + p.motoboyNome : '')
    + (p.distanciaKm != null ? ' · ' + p.distanciaKm + ' km' : '');

  return (
    <>
      <div className="romaneio-toolbar no-print">
        <button className="btn-ghost" onClick={() => nav('/comercial/pedidos/' + p.id)}>← {t('pedidos.voltar')}</button>
        <button className="btn-primary" onClick={() => window.print()}>🖨️ {t('romaneio.imprimir')}</button>
      </div>

      <div className="romaneio-wrap">
        <div className="rom-head">
          <div>
            {branding?.logo
              ? <img src={branding.logo} alt={branding?.fantasia ?? ''} className="rom-logo" />
              : <div className="rom-marca">{branding?.fantasia ?? ''}</div>}
            {branding?.logo && branding?.fantasia && <div style={{ fontSize: 13, marginTop: 4 }}>{branding.fantasia}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 className="rom-titulo">{t('romaneio.titulo')}</h1>
            <div className="rom-marca" style={{ marginTop: 4 }}>TRIADE</div>
          </div>
        </div>

        <div className="rom-grid">
          <div><div className="l">{t('romaneio.pedido')}</div><div><b>{numeroPedido(p.numero)}</b></div></div>
          <div><div className="l">{t('pedidos.data')}</div><div>{new Date(p.criadoEm).toLocaleString('pt-BR')}</div></div>
          <div><div className="l">{t('pedidos.cliente')}</div><div>{p.clienteNome ?? '—'}</div></div>
          <div><div className="l">{t('pedidos.vendedor')}</div><div>{p.vendedorNome ?? '—'}</div></div>
          <div><div className="l">{t('entrega.forma')}</div><div>{entrega}</div></div>
          <div><div className="l">{t('pedidos.forma_pgto')}</div><div>{p.formaPagamento ?? '—'}</div></div>
          <div style={{ gridColumn: '1 / -1' }}><div className="l">{t('pedidos.endereco')}</div><div>{p.enderecoEntrega ?? '—'}</div></div>
        </div>

        <table className="rom-tabela">
          <thead><tr><th>{t('precos.produto')}</th><th>{t('pedidos.qtd')}</th><th>{t('pedidos.preco_unit')}</th><th>{t('pedidos.subtotal')}</th></tr></thead>
          <tbody>
            {p.itens.map((it, i) => (
              <tr key={i}><td>{it.produtoNome}</td><td>{it.quantidade}</td><td>{moeda(it.precoUnitario)}</td><td>{moeda(it.subtotal)}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="rom-tot">
          <div>{t('pedidos.subtotal')}: {moeda(p.subtotal)}</div>
          <div>{t('pedidos.frete')}: {moeda(p.frete)}</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>{t('pedidos.total')}: {moeda(p.total)}</div>
        </div>

        <div className="rom-assinatura">{t('romaneio.recebido_por')}</div>
      </div>
    </>
  );
}
