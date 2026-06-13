import { useBranding } from '../branding/BrandingContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { TVAcoes } from './TVAcoes.js';

// Cabeçalho dos painéis de TV: logo da EMPRESA à esquerda; nome do painel +
// hora/data no centro; marca TRÍADE ERP + ações à direita.
export function TVHeader({ titulo, hora, atualizado }: { titulo: string; hora: Date; atualizado: Date | null }) {
  const { branding } = useBranding();
  const { t } = useI18n();
  const hhmmss = (x: Date) => x.toLocaleTimeString('pt-BR');
  return (
    <div className="tv-top">
      <div className="tv-marca">
        {branding?.logo
          ? <img src={branding.logo} alt={branding?.fantasia ?? ''} className="tv-logo" />
          : <span className="tv-empresa">{branding?.fantasia ?? ''}</span>}
      </div>
      <div className="tv-centro">
        <div className="tv-painel-nome">{titulo}</div>
        <div className="tv-sub-linha">
          <b className="tv-relogio-in">{hhmmss(hora)}</b>
          <span className="tv-sub-sep"> · {hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
          {atualizado && <span className="tv-sub-upd"> · {t('tv.atualizado')} {hhmmss(atualizado)}</span>}
        </div>
      </div>
      <div className="tv-top-dir">
        <span className="tv-wordmark tv-brand-lg">TR<span className="tv-rm-i">Í</span>ADE <span className="tv-rm-erp">ERP</span></span>
        <TVAcoes />
      </div>
    </div>
  );
}
