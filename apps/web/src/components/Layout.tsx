import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { SeletorIdioma } from './SeletorIdioma.js';

interface Item { rotulo: string; icone: string; to: string; cap?: string; }
interface Secao { sublabel?: string; itens: Item[]; }
interface Grupo { rotulo?: string; secoes: Secao[]; }

// Estrutura espelhando o mockup (erp-mockup.html). Os grupos/itens só aparecem
// se o usuário tiver a capability — o menu cresce conforme as fases avançam.
const GRUPOS: Grupo[] = [
  { secoes: [{ itens: [{ rotulo: 'menu.dashboard', icone: '▦', to: '/', cap: 'dashboard.ver' }] }] },
  {
    rotulo: 'menu.comercial',
    secoes: [{ itens: [
      { rotulo: 'menu.pedidos', icone: '🧾', to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
      { rotulo: 'menu.novo_pedido', icone: '➕', to: '/comercial/pedidos/novo', cap: 'comercial.pedido.criar' },
      { rotulo: 'menu.precos', icone: '🏷️', to: '/comercial/precos', cap: 'comercial.preco.listar' },
    ] }],
  },
  {
    rotulo: 'menu.estoque_exp',
    secoes: [{ itens: [
      { rotulo: 'menu.posicao', icone: '📦', to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
      { rotulo: 'menu.entrada', icone: '📥', to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
    ] }],
  },
  {
    rotulo: 'menu.cadastros',
    secoes: [
      {
        sublabel: 'menu.sub.pessoas',
        itens: [
          { rotulo: 'menu.clientes', icone: '🧑‍⚕️', to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
          { rotulo: 'menu.fornecedores', icone: '🏭', to: '/cadastros/fornecedores', cap: 'cadastros.fornecedor.listar' },
          { rotulo: 'menu.vendedores', icone: '💼', to: '/cadastros/vendedores', cap: 'cadastros.vendedor.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.estoque',
        itens: [
          { rotulo: 'menu.produtos', icone: '📦', to: '/cadastros/produtos', cap: 'cadastros.produto.listar' },
          { rotulo: 'menu.categorias', icone: '🏷️', to: '/cadastros/categorias', cap: 'cadastros.categoria.listar' },
        ],
      },
    ],
  },
  {
    rotulo: 'menu.config',
    secoes: [{
      itens: [
        { rotulo: 'menu.usuarios', icone: '👤', to: '/acesso/usuarios', cap: 'acesso.usuario.listar' },
        { rotulo: 'menu.perfis', icone: '🔑', to: '/acesso/perfis', cap: 'acesso.perfil.listar' },
        { rotulo: 'menu.empresa', icone: '🏢', to: '/config/empresa', cap: 'acesso.empresa.editar' },
      ],
    }],
  },
  {
    rotulo: 'menu.superadmin',
    secoes: [{ itens: [{ rotulo: 'menu.empresas', icone: '🏬', to: '/superadmin/empresas', cap: 'superadmin.empresa.provisionar' }] }],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, empresaFantasia, logout, temCapability } = useAuth();
  const { branding } = useBranding();
  const { t } = useI18n();
  const fantasia = branding?.fantasia ?? empresaFantasia;
  const visivel = (it: Item) => !it.cap || temCapability(it.cap);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          {branding?.logo
            ? <img src={branding.logo} alt={fantasia ?? ''} className="sidebar-logo" />
            : <>TRIADE<span> ERP</span></>}
        </div>
        <nav>
          {GRUPOS.map((g, gi) => {
            const totalVisiveis = g.secoes.reduce((n, s) => n + s.itens.filter(visivel).length, 0);
            if (totalVisiveis === 0) return null;
            return (
              <div key={gi} className="nav-grupo">
                {g.rotulo && <div className="nav-grupo-rotulo">{t(g.rotulo)}</div>}
                {g.secoes.map((s, si) => {
                  const itens = s.itens.filter(visivel);
                  if (itens.length === 0) return null;
                  return (
                    <div key={si} className="nav-secao">
                      {s.sublabel && <div className="nav-sublabel">{t(s.sublabel)}</div>}
                      {itens.map((it) => (
                        <NavLink key={it.to} to={it.to} end={it.to === '/'}
                          className={({ isActive }) => (isActive ? 'nav-item ativo' : 'nav-item')}>
                          <span className="nav-ic">{it.icone}</span>{t(it.rotulo)}
                        </NavLink>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-empresa">{fantasia}</div>
          <div className="topbar-dir">
            <SeletorIdioma />
            <span className="topbar-user">{usuario?.nome}</span>
            <button className="btn-sair" onClick={logout}>{t('topbar.sair')}</button>
          </div>
        </header>
        <main className="conteudo">{children}</main>
      </div>
    </div>
  );
}
