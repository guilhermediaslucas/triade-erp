import { Ic } from './Icones.js';
import { useI18n } from '../i18n/I18nContext.js';

// Botão padrão de exportação para Excel — sempre verde, com ícone de download.
export function BotaoExcel({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const { t } = useI18n();
  return (
    <button className="btn-acao verde" disabled={disabled} onClick={onClick}>
      <Ic name="i-download" className="sm" /> {t('rel.exportar_xlsx')}
    </button>
  );
}
