import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { SeletorIdioma } from './SeletorIdioma.js';
import { BuscaGlobal } from './BuscaGlobal.js';

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
      { rotulo: 'menu.expedicao', icone: '🚚', to: '/estoque/expedicao', cap: 'comercial.pedido.gerenciar' },
      { rotulo: 'menu.posicao', icone: '📦', to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
      { rotulo: 'menu.entrada', icone: '📥', to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
      { rotulo: 'menu.recebimento', icone: '📦', to: '/estoque/recebimento', cap: 'estoque.entrada.criar' },
      { rotulo: 'menu.baixa', icone: '📉', to: '/estoque/baixa', cap: 'estoque.baixa.criar' },
      { rotulo: 'menu.inventario', icone: '🔎', to: '/estoque/inventario', cap: 'estoque.inventario.ver' },
    ] }],
  },
  {
    rotulo: 'menu.logistica',
    secoes: [{ itens: [
      { rotulo: 'menu.gestao_fretes', icone: '🛣️', to: '/logistica/fretes', cap: 'logistica.frete.ver' },
    ] }],
  },
  {
    rotulo: 'menu.financeiro',
    secoes: [{ itens: [
      { rotulo: 'menu.receber', icone: '💰', to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
      { rotulo: 'menu.pagar', icone: '💸', to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
      { rotulo: 'menu.aging', icone: '📅', to: '/financeiro/aging-receber', cap: 'financeiro.receber.listar' },
      { rotulo: 'menu.fluxo', icone: '📊', to: '/financeiro/fluxo', cap: 'financeiro.fluxo.ver' },
      { rotulo: 'menu.dre', icone: '📋', to: '/financeiro/dre', cap: 'financeiro.fluxo.ver' },
      { rotulo: 'menu.nota', icone: '🧾', to: '/financeiro/nota', cap: 'financeiro.compra.criar' },
      { rotulo: 'menu.comissoes', icone: '🧮', to: '/financeiro/comissoes', cap: 'financeiro.comissao.ver' },
    ] }],
  },
  {
    rotulo: 'menu.relatorios',
    secoes: [{ itens: [
      { rotulo: 'menu.rel_vendas', icone: '📈', to: '/relatorios/vendas', cap: 'relatorios.ver' },
      { rotulo: 'menu.rel_produtos', icone: '🏆', to: '/relatorios/produtos', cap: 'relatorios.ver' },
      { rotulo: 'menu.rel_categorias', icone: '🧩', to: '/relatorios/vendas-categoria', cap: 'relatorios.ver' },
      { rotulo: 'menu.rel_validade', icone: '⏳', to: '/relatorios/validade', cap: 'relatorios.ver' },
      { rotulo: 'menu.rel_parado', icone: '🐢', to: '/relatorios/estoque-parado', cap: 'relatorios.ver' },
    ] }],
  },
  {
    rotulo: 'menu.cadastros',
    secoes: [
      {
        sublabel: 'menu.sub.comercial',
        itens: [
          { rotulo: 'menu.condicoes', icone: '💳', to: '/cadastros/condicoes', cap: 'cadastros.condicao.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.pessoas',
        itens: [
          { rotulo: 'menu.clientes', icone: '🧑‍⚕️', to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
          { rotulo: 'menu.fornecedores', icone: '🏭', to: '/cadastros/fornecedores', cap: 'cadastros.fornecedor.listar' },
          { rotulo: 'menu.vendedores', icone: '💼', to: '/cadastros/vendedores', cap: 'cadastros.vendedor.listar' },
          { rotulo: 'menu.motoboys', icone: '🛵', to: '/cadastros/motoboys', cap: 'cadastros.motoboy.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.estoque',
        itens: [
          { rotulo: 'menu.produtos', icone: '📦', to: '/cadastros/produtos', cap: 'cadastros.produto.listar' },
          { rotulo: 'menu.categorias', icone: '🏷️', to: '/cadastros/categorias', cap: 'cadastros.categoria.listar' },
          { rotulo: 'menu.marcas', icone: '™️', to: '/cadastros/marcas', cap: 'cadastros.marca.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.financeiro',
        itens: [
          { rotulo: 'menu.contas_correntes', icone: '🏦', to: '/cadastros/contas-correntes', cap: 'cadastros.conta.listar' },
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
      <BuscaGlobal />
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
            <button className="btn-busca" onClick={() => window.dispatchEvent(new Event('abrir-busca'))} title="Ctrl+K">
              🔎 <span>{t('busca.abrir')}</span> <kbd>Ctrl K</kbd>
            </button>
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
