import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { SeletorIdioma } from './SeletorIdioma.js';

interface ItemNav { rotulo: string; icone: string; to: string; cap?: string; }
interface GrupoNav { rotulo?: string; itens: ItemNav[]; }

const GRUPOS: GrupoNav[] = [
  { itens: [{ rotulo: 'menu.dashboard', icone: '▦', to: '/', cap: 'dashboard.ver' }] },
  {
    rotulo: 'menu.acesso',
    itens: [
      { rotulo: 'menu.usuarios', icone: '👤', to: '/acesso/usuarios', cap: 'acesso.usuario.listar' },
      { rotulo: 'menu.perfis', icone: '🔑', to: '/acesso/perfis', cap: 'acesso.perfil.listar' },
    ],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, empresaFantasia, logout, temCapability } = useAuth();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">TRIADE<span> ERP</span></div>
        <nav>
          {GRUPOS.map((g, gi) => {
            const visiveis = g.itens.filter((it) => !it.cap || temCapability(it.cap));
            if (visiveis.length === 0) return null;
            return (
              <div key={gi} className="nav-grupo">
                {g.rotulo && <div className="nav-grupo-rotulo">{t(g.rotulo)}</div>}
                {visiveis.map((it) => (
                  <NavLink key={it.to} to={it.to} end={it.to === '/'}
                    className={({ isActive }) => (isActive ? 'nav-item ativo' : 'nav-item')}>
                    <span className="nav-ic">{it.icone}</span>{t(it.rotulo)}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-empresa">{empresaFantasia}</div>
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
