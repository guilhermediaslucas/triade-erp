import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Dashboard } from './Dashboard.js';
import { primeiraRotaAcessivel } from '../lib/primeiraRota.js';

// Tela inicial:
// - "Gestão à Vista" cai direto no painel TV correspondente;
// - quem tem o Dashboard vê o dashboard normal;
// - quem NÃO tem o Dashboard é levado direto à 1ª tela que pode acessar.
export function PainelInicial() {
  const { temCapability, superAdmin } = useAuth();
  const { t } = useI18n();
  // Super-admin (god-mode) "tem" todas as caps — não deve ser redirecionado pro painel TV.
  if (!superAdmin && temCapability('painel.tv_comercial')) return <Navigate to="/dashboard/tv" replace />;
  if (!superAdmin && temCapability('painel.tv_expedicao')) return <Navigate to="/estoque/tv" replace />;

  if (superAdmin || temCapability('dashboard.ver')) return <Dashboard />;

  // Usuário sem o Dashboard: manda para a 1ª tela acessível.
  const destino = primeiraRotaAcessivel(temCapability);
  if (destino) return <Navigate to={destino} replace />;

  // Sem nenhuma tela liberada.
  return (
    <div className="card" style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
      <h2>{t('sem_telas.titulo')}</h2>
      <p className="muted">{t('sem_telas.msg')}</p>
    </div>
  );
}
