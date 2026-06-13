import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { Dashboard } from './Dashboard.js';

// Tela inicial: usuários de "Gestão à Vista" caem direto no painel TV correspondente;
// os demais veem o dashboard normal.
export function PainelInicial() {
  const { temCapability, superAdmin } = useAuth();
  // Super-admin (god-mode) "tem" todas as caps — não deve ser redirecionado pro painel TV.
  if (!superAdmin && temCapability('painel.tv_comercial')) return <Navigate to="/dashboard/tv" replace />;
  if (!superAdmin && temCapability('painel.tv_expedicao')) return <Navigate to="/estoque/tv" replace />;
  return <Dashboard />;
}
