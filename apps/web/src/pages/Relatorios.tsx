import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Rel { rotulo: string; to: string; cap: string; }
interface Grupo { chave: string; titulo: string; desc: string; icone: string; tint: string; itens: Rel[]; }

const GRUPOS: Grupo[] = [
  {
    chave: 'financeiro', titulo: 'rel.g_financeiro', desc: 'rel.g_financeiro_d', icone: 'i-dollar', tint: 'tint-gr',
    itens: [{ rotulo: 'menu.rel_reembolsos', to: '/relatorios/reembolsos', cap: 'financeiro.pagar.listar' }],
  },
  {
    chave: 'comercial', titulo: 'rel.g_comercial', desc: 'rel.g_comercial_d', icone: 'i-cart', tint: 'tint-bl',
    itens: [
      { rotulo: 'menu.rel_vendas', to: '/relatorios/vendas', cap: 'relatorios.vendas.ver' },
      { rotulo: 'menu.rel_pedidos', to: '/relatorios/pedidos', cap: 'relatorios.pedidos.ver' },
      { rotulo: 'menu.rel_produtos', to: '/relatorios/produtos', cap: 'relatorios.produtos.ver' },
      { rotulo: 'menu.rel_categorias', to: '/relatorios/vendas-categoria', cap: 'relatorios.categorias.ver' },
      { rotulo: 'menu.rel_abc', to: '/relatorios/curva-abc', cap: 'relatorios.abc.ver' },
    ],
  },
  {
    chave: 'estoque', titulo: 'rel.g_estoque', desc: 'rel.g_estoque_d', icone: 'i-box', tint: 'tint-pp',
    itens: [
      { rotulo: 'menu.rel_validade', to: '/relatorios/validade', cap: 'relatorios.validade.ver' },
      { rotulo: 'menu.rel_parado', to: '/relatorios/estoque-parado', cap: 'relatorios.parado.ver' },
      { rotulo: 'menu.rel_perdas', to: '/relatorios/perdas', cap: 'relatorios.perdas.ver' },
      { rotulo: 'menu.rel_inventarios', to: '/relatorios/inventarios', cap: 'estoque.inventario.ver' },
    ],
  },
];

export function Relatorios() {
  const { temCapability } = useAuth();
  const { t } = useI18n();
  const [aberto, setAberto] = useState<Record<string, boolean>>({});

  const grupos = GRUPOS.map((g) => ({ ...g, itens: g.itens.filter((i) => temCapability(i.cap)) })).filter((g) => g.itens.length > 0);

  return (
    <div>
      <div className="crumb">{t('rel.crumb_hub')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('menu.relatorios')}</h1><div className="muted page-sub">{t('rel.hub_sub')}</div></div></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {grupos.map((g) => {
          const open = !!aberto[g.chave];
          return (
            <div key={g.chave} className="card" style={{ maxWidth: 'none' }}>
              <div className={'kpi-ic ' + g.tint}><Ic name={g.icone} /></div>
              <h3 style={{ margin: '14px 0 4px' }}>{t(g.titulo)}</h3>
              <div className="muted" style={{ fontSize: 13 }}>{t(g.desc)}</div>
              <button className="btn-link" style={{ marginTop: 14, padding: 0 }} onClick={() => setAberto((a) => ({ ...a, [g.chave]: !a[g.chave] }))}>
                {open ? t('rel.fechar_grupo') : t('rel.abrir_grupo')} {open ? '↑' : '→'}
              </button>
              {open && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {g.itens.map((i) => (
                    <NavLink key={i.to} to={i.to} className="rel-link">{t(i.rotulo)}</NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
