import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useTema } from '../theme/ThemeContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';
import { BotaoTelaCheia } from './BotaoTelaCheia.js';

// Ações do canto do Modo TV: alternar tema, tela cheia e sair (logout).
// Usado pelos painéis de TV (usuários de Gestão à Vista não têm a topbar).
export function TVAcoes() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const { escuro, alternar } = useTema();
  const { t } = useI18n();
  function sair() { logout(); nav('/login'); }
  return (
    <div className="tv-acoes">
      <button className="tv-sair tv-icbtn" onClick={alternar} title={t('tema.alternar')} aria-label={t('tema.alternar')}>
        <Ic name={escuro ? 'i-sun' : 'i-moon'} className="sm" />
      </button>
      <BotaoTelaCheia className="tv-sair tv-icbtn" />
      <button className="tv-sair" onClick={sair}><Ic name="i-key" className="sm" /> {t('tv.sair_conta')}</button>
    </div>
  );
}
