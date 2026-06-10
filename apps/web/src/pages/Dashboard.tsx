import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

export function Dashboard() {
  const { usuario } = useAuth();
  const { t } = useI18n();
  return (
    <div>
      <h1 className="page-titulo">{t('dashboard.titulo')}</h1>
      <div className="card">
        <h3>{t('dashboard.bemvindo')}, {usuario?.nome} 👋</h3>
        <p className="muted">{t('dashboard.placeholder')}</p>
      </div>
    </div>
  );
}
