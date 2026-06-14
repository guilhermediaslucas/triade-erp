import { useTema } from '../theme/ThemeContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';
import { BotaoTelaCheia } from './BotaoTelaCheia.js';

// Ações do canto do Modo TV: alternar tema e tela cheia. O logout foi removido —
// há um perfil dedicado de TV (Gestão à Vista), então o painel fica fixo na televisão.
export function TVAcoes() {
  const { escuro, alternar } = useTema();
  const { t } = useI18n();
  return (
    <div className="tv-acoes">
      <button className="tv-sair tv-icbtn" onClick={alternar} title={t('tema.alternar')} aria-label={t('tema.alternar')}>
        <Ic name={escuro ? 'i-sun' : 'i-moon'} className="sm" />
      </button>
      <BotaoTelaCheia className="tv-sair tv-icbtn" />
    </div>
  );
}
