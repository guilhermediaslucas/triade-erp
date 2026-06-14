import { useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';

// Botão "Filtros" (com badge da quantidade ativa) + modal padrão (Limpar tudo /
// Cancelar / Aplicar). Os campos do filtro vão como children dentro do grid.
// onAplicar é opcional — usado por telas que buscam no servidor ao aplicar.
export function FiltrosModal({ count, onLimpar, onAplicar, children, titulo }: {
  count: number; onLimpar: () => void; onAplicar?: () => void; children: ReactNode; titulo?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const { t } = useI18n();
  return (
    <>
      <button className="btn-ghost" onClick={() => setAberto(true)}>
        <Ic name="i-gear" className="sm" /> {t('fin.filtros')}{count > 0 && <span className="flt-badge">{count}</span>}
      </button>
      {aberto && (
        <div className="modal-fundo">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <h2>{titulo ? t('flt.titulo') + ' — ' + titulo : t('flt.titulo')}</h2>
            <div className="filtros-grid">{children}</div>
            <div className="modal-acoes">
              <button className="btn-ghost" style={{ marginRight: 'auto' }} onClick={onLimpar}>{t('flt.limpar')}</button>
              <button className="btn-ghost" onClick={() => setAberto(false)}>{t('common.cancelar')}</button>
              <button className="btn-primary" onClick={() => { onAplicar?.(); setAberto(false); }}>{t('flt.aplicar')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
