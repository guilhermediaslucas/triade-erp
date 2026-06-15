import { useState, Fragment, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import { BuscaGlobal } from './BuscaGlobal.js';
import { Avatar } from './Avatar.js';
import { Sino } from './Sino.js';
import { BotaoTelaCheia } from './BotaoTelaCheia.js';
import { useTema } from '../theme/ThemeContext.js';
import { EmpresaSwitcher } from './EmpresaSwitcher.js';
import { Ic, SpriteIcones } from './Icones.js';
import { TrocarSenha } from './TrocarSenha.js';
import { Suporte } from './Suporte.js';

interface Item { rotulo: string; icone?: string; to: string; cap?: string; soSuperAdmin?: boolean; }
interface Secao { sublabel?: string; itens: Item[]; }
interface Grupo { rotulo?: string; icone?: string; secoes: Secao[]; }

// Estrutura espelhando o mockup (erp-mockup.html). Os grupos/itens só aparecem
// se o usuário tiver a capability — o menu cresce conforme as fases avançam.
// Ícones = símbolos SVG line-style do mockup (ver Icones.tsx). Sub-itens não
// têm ícone (texto recuado), igual ao mockup.
const GRUPOS: Grupo[] = [
  { secoes: [{ itens: [{ rotulo: 'menu.dashboard', icone: 'i-grid', to: '/', cap: 'dashboard.ver' }] }] },
  {
    rotulo: 'menu.comercial', icone: 'i-cart',
    secoes: [{ itens: [
      { rotulo: 'menu.pedidos', to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
      { rotulo: 'menu.crm', to: '/comercial/crm', cap: 'comercial.crm.ver' },
      { rotulo: 'menu.metas', to: '/comercial/metas', cap: 'comercial.meta.ver' },
      { rotulo: 'menu.precos', to: '/comercial/precos', cap: 'comercial.preco.listar' },
      { rotulo: 'menu.analise', to: '/comercial/analise', cap: 'comercial.analise.ver' },
    ] }],
  },
  {
    rotulo: 'menu.financeiro', icone: 'i-dollar',
    secoes: [{ itens: [
      { rotulo: 'menu.receber', to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
      { rotulo: 'menu.pagar', to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
      { rotulo: 'menu.nota', to: '/financeiro/nota', cap: 'financeiro.compra.criar' },
      { rotulo: 'menu.fluxo', to: '/financeiro/fluxo', cap: 'financeiro.fluxo.ver' },
      { rotulo: 'menu.conciliacao', to: '/financeiro/conciliacao', cap: 'financeiro.conciliacao.ver' },
      { rotulo: 'menu.comissoes', to: '/financeiro/comissoes', cap: 'financeiro.comissao.ver' },
      { rotulo: 'menu.conferencia', to: '/financeiro/conferencia-cartao', cap: 'financeiro.receber.listar' },
    ] }],
  },
  {
    rotulo: 'menu.estoque_exp', icone: 'i-box',
    secoes: [{ itens: [
      { rotulo: 'menu.expedicao', to: '/estoque/expedicao', cap: 'comercial.pedido.gerenciar' },
      { rotulo: 'menu.posicao', to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
      { rotulo: 'menu.consultar_etiqueta', to: '/estoque/etiqueta', cap: 'estoque.saldo.ver' },
      { rotulo: 'menu.entrada', to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
      { rotulo: 'menu.recebimento', to: '/estoque/recebimento', cap: 'estoque.entrada.criar' },
      { rotulo: 'menu.baixa', to: '/estoque/baixa', cap: 'estoque.baixa.criar' },
      { rotulo: 'menu.inventario', to: '/estoque/inventario', cap: 'estoque.inventario.ver' },
    ] }],
  },
  {
    rotulo: 'menu.logistica', icone: 'i-truck',
    secoes: [{ itens: [
      { rotulo: 'menu.gestao_fretes', to: '/logistica/fretes', cap: 'logistica.frete.ver' },
      { rotulo: 'menu.campanhas_frete', to: '/logistica/campanhas-frete', cap: 'logistica.frete.ver' },
    ] }],
  },
  { secoes: [{ itens: [{ rotulo: 'menu.relatorios', icone: 'i-chart', to: '/relatorios', cap: 'relatorios.ver' }] }] },
  {
    rotulo: 'menu.cadastros', icone: 'i-clip',
    secoes: [
      {
        sublabel: 'menu.sub.comercial',
        itens: [
          { rotulo: 'menu.condicoes', to: '/cadastros/condicoes', cap: 'cadastros.condicao.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.pessoas',
        itens: [
          { rotulo: 'menu.clientes', to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
          { rotulo: 'menu.vendedores', to: '/cadastros/vendedores', cap: 'cadastros.vendedor.listar' },
          { rotulo: 'menu.fornecedores', to: '/cadastros/fornecedores', cap: 'cadastros.fornecedor.listar' },
          { rotulo: 'menu.motoboys', to: '/cadastros/motoboys', cap: 'cadastros.motoboy.listar' },
          { rotulo: 'menu.favorecidos', to: '/cadastros/favorecidos', cap: 'cadastros.favorecido.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.estoque',
        itens: [
          { rotulo: 'menu.produtos', to: '/cadastros/produtos', cap: 'cadastros.produto.listar' },
          { rotulo: 'menu.categorias', to: '/cadastros/categorias', cap: 'cadastros.categoria.listar' },
          { rotulo: 'menu.formas_entrega', to: '/cadastros/formas-entrega', cap: 'cadastros.forma_entrega.listar' },
        ],
      },
      {
        sublabel: 'menu.sub.financeiro',
        itens: [
          { rotulo: 'menu.contas_correntes', to: '/cadastros/contas-correntes', cap: 'cadastros.conta.listar' },
          { rotulo: 'menu.catfin', to: '/cadastros/categorias-financeiras', cap: 'cadastros.catfin.listar' },
          { rotulo: 'menu.tipodoc', to: '/cadastros/tipos-documento', cap: 'cadastros.tipodoc.listar' },
          { rotulo: 'menu.bancos', to: '/cadastros/bancos', cap: 'cadastros.banco.listar' },
        ],
      },
    ],
  },
  {
    rotulo: 'menu.config', icone: 'i-gear',
    secoes: [{
      itens: [
        { rotulo: 'menu.usuarios', to: '/acesso/usuarios', cap: 'acesso.usuario.listar' },
        { rotulo: 'menu.perfis', to: '/acesso/perfis', cap: 'acesso.perfil.listar' },
        { rotulo: 'menu.empresa', to: '/config/empresa', cap: 'acesso.empresa.editar' },
        { rotulo: 'menu.auditoria', to: '/config/auditoria', cap: 'acesso.usuario.listar' },
      ],
    }],
  },
  {
    rotulo: 'menu.superadmin', icone: 'i-shop',
    secoes: [{ itens: [
      { rotulo: 'menu.empresas', to: '/superadmin/empresas', soSuperAdmin: true },
      { rotulo: 'menu.chamados', to: '/superadmin/chamados', soSuperAdmin: true },
    ] }],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout, temCapability, superAdmin } = useAuth();
  const { escuro, alternar } = useTema();
  const { branding } = useBranding();
  const { t } = useI18n();
  const fantasia = branding?.fantasia ?? '';
  const visivel = (it: Item) => it.soSuperAdmin ? superAdmin : (!it.cap || temCapability(it.cap));
  // Inicia com todos os grupos recolhidos — só os nomes aparecem; clicar expande.
  const [abertos, setAbertos] = useState<Set<number>>(() => new Set());
  const [sairOpen, setSairOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const [suporteOpen, setSuporteOpen] = useState(false);
  // Drawer mobile: a sidebar vira off-canvas abaixo do breakpoint (CSS). Fecha ao navegar.
  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = () => setMenuAberto(false);
  // Recolher o menu (só desktop): esconde a sidebar e dá largura total ao conteúdo. Persistido.
  const [recolhido, setRecolhido] = useState(() => localStorage.getItem('triade_menu_recolhido') === '1');
  const toggleRecolher = () => setRecolhido((v) => { const n = !v; localStorage.setItem('triade_menu_recolhido', n ? '1' : '0'); return n; });
  const toggleGrupo = (gi: number) => setAbertos((cur) => { const n = new Set(cur); n.has(gi) ? n.delete(gi) : n.add(gi); return n; });

  return (
    <div className={'app-shell' + (menuAberto ? ' menu-aberto' : '') + (recolhido ? ' menu-recolhido' : '')}>
      <SpriteIcones />
      <BuscaGlobal />
      <div className="sidebar-backdrop" onClick={fecharMenu} />
      <aside className="sidebar">
        <div className="sidebar-brand">
          {branding?.logo
            ? <img src={branding.logo} alt={fantasia} className="sidebar-logo" />
            : fantasia
              ? <div className="brand-empresa">{fantasia}</div>
              : null}
        </div>
        <nav className="nav">
          <div className="nav-label">{t('menu.principal')}</div>
          {GRUPOS.map((g, gi) => {
            const totalVisiveis = g.secoes.reduce((n, se) => n + se.itens.filter(visivel).length, 0);
            if (totalVisiveis === 0) return null;

            // Grupo sem rótulo = itens soltos (Dashboard) — ícone + label.
            if (!g.rotulo) {
              return g.secoes.flatMap((se) => se.itens.filter(visivel).map((it) => (
                <NavLink key={it.to} to={it.to} end={it.to === '/'} onClick={fecharMenu}
                  className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                  {it.icone && <Ic name={it.icone} />}<span>{t(it.rotulo)}</span>
                </NavLink>
              )));
            }

            const aberto = abertos.has(gi);
            return (
              <div key={gi} className={'nav-grupo' + (aberto ? ' aberto' : '')}>
                <button type="button" className="nav-head" onClick={() => toggleGrupo(gi)}>
                  <span className="lead">{g.icone && <Ic name={g.icone} />}<span>{t(g.rotulo)}</span></span>
                  <Ic name="i-chev" className="sm chev" />
                </button>
                {aberto && (
                  <div className="nav-sub">
                    {g.secoes.map((se, si) => {
                      const itens = se.itens.filter(visivel);
                      if (itens.length === 0) return null;
                      return (
                        <Fragment key={si}>
                          {se.sublabel && <div className="nav-sublabel">{t(se.sublabel)}</div>}
                          {itens.map((it) => (
                            <NavLink key={it.to} to={it.to} onClick={fecharMenu}
                              className={({ isActive }) => (isActive ? 'nav-subitem active' : 'nav-subitem')}>
                              {t(it.rotulo)}
                            </NavLink>
                          ))}
                        </Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="side-brand-foot">
            <div className="lg">TR<span>Í</span>ADE</div>
            <div className="tg">E R P</div>
          </div>
          <button type="button" className="sidebar-foot-sup sidebar-foot-btn" onClick={() => setSuporteOpen(true)}>
            <Ic name="i-help" /><div><b>{t('menu.suporte')}</b><small>{t('menu.suporte_sub')}</small></div>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button type="button" className="topbar-menu" onClick={() => setMenuAberto((v) => !v)} aria-label={t('menu.principal')}>
            <Ic name={menuAberto ? 'i-x' : 'i-menu'} />
          </button>
          <button type="button" className="topbar-recolher" onClick={toggleRecolher} aria-label={t('menu.recolher')} title={t('menu.recolher')}>
            <Ic name="i-menu" />
          </button>
          <button type="button" className="topbar-busca" onClick={() => window.dispatchEvent(new Event('abrir-busca'))} title="Ctrl+K">
            <Ic name="i-search" className="sm" />
            <span className="topbar-busca-ph">{t('busca.placeholder')}</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="topbar-dir">
            <EmpresaSwitcher />
            <BotaoTelaCheia />
            <button className="btn-tema" onClick={alternar} title={t('tema.alternar')}><Ic name={escuro ? 'i-sun' : 'i-moon'} className="sm" /></button>
            <Sino />
            <button type="button" className="topbar-user" onClick={() => setSenhaOpen(true)} title={t('senha.trocar')} style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Avatar nome={usuario?.nome ?? ''} foto={usuario?.foto ?? null} />
              {usuario?.nome}
            </button>
            <button className="btn-sair" onClick={() => setSairOpen(true)}>{t('topbar.sair')}</button>
          </div>
        </header>
        <main className="conteudo">{children}</main>
      </div>
      {sairOpen && (
        <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
          <h2>{t('logout.titulo')}</h2>
          <p className="muted">{t('logout.msg')}</p>
          <div className="modal-acoes">
            <button className="btn-ghost" onClick={() => setSairOpen(false)}>{t('common.cancelar')}</button>
            <button className="btn-primary" onClick={logout}>{t('topbar.sair')}</button>
          </div>
        </div></div>
      )}
      {senhaOpen && <TrocarSenha onFechar={() => setSenhaOpen(false)} />}
      {suporteOpen && <Suporte onFechar={() => setSuporteOpen(false)} />}
    </div>
  );
}
