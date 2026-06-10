import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { SeletorIdioma } from './SeletorIdioma.js';

const ITENS = [
  { chave: 'menu.dashboard', icone: '▦' },
  { chave: 'menu.comercial', icone: '🛒' },
  { chave: 'menu.cadastros', icone: '🗂' },
  { chave: 'menu.estoque', icone: '📦' },
  { chave: 'menu.financeiro', icone: '💰' },
  { chave: 'menu.relatorios', icone: '📊' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, empresaFantasia, logout } = useAuth();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">TRIADE<span> ERP</span></div>
        <nav>
          {ITENS.map((it, idx) => (
            <a key={it.chave} className={idx === 0 ? 'nav-item ativo' : 'nav-item'} href="#">
              <span className="nav-ic">{it.icone}</span>
              {t(it.chave)}
            </a>
          ))}
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
