import type { ReactNode } from 'react';
import { Ic } from './Icones.js';
import { useI18n } from '../i18n/I18nContext.js';

export type FiltroStatus = 'todos' | 'ativos' | 'inativos';

// Toolbar de filtro padrão das listas: busca + chips Todos/Ativos/Inativos.
// Sempre presente e formatada igual em todos os CRUDs (classes .toolbar/.busca-box-tb/.chip-f).
export function FiltroLista({ busca, onBusca, status, onStatus, placeholder, semStatus, extra }: {
  busca: string;
  onBusca: (v: string) => void;
  status?: FiltroStatus;
  onStatus?: (s: FiltroStatus) => void;
  placeholder?: string;
  semStatus?: boolean;
  extra?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="toolbar">
      <span className="busca-box-tb">
        <Ic name="i-search" className="sm" />
        <input value={busca} onChange={(e) => onBusca(e.target.value)} placeholder={placeholder ?? t('filtro.buscar_ph')} />
      </span>
      {!semStatus && onStatus && (['todos', 'ativos', 'inativos'] as FiltroStatus[]).map((s) => (
        <button key={s} type="button" className={'chip-f' + (status === s ? ' on' : '')} onClick={() => onStatus(s)}>{t('filtro.' + s)}</button>
      ))}
      {extra}
    </div>
  );
}

// Helper: aplica busca (texto) + status (ativo/inativo) a uma lista.
export function aplicarFiltro<T extends { ativo?: boolean }>(itens: T[], busca: string, status: FiltroStatus, campos: (it: T) => string): T[] {
  const q = busca.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return itens.filter((it) => {
    if (status === 'ativos' && it.ativo === false) return false;
    if (status === 'inativos' && it.ativo !== false) return false;
    if (!q) return true;
    return campos(it).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q);
  });
}
