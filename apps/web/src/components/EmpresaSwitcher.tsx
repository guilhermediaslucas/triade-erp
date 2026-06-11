import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Emp { codigo: string; nome: string; fantasia: string; ativo: boolean; }

// Seletor de empresa do administrador global do sistema (espelha o mockup).
export function EmpresaSwitcher() {
  const { token, superAdmin, usuario, trocarEmpresa } = useAuth();
  const { t } = useI18n();
  const [emps, setEmps] = useState<Emp[]>([]);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!superAdmin) return;
    api.get<Emp[]>('/empresas', token!).then((l) => setEmps(l.filter((e) => e.ativo))).catch(() => {});
  }, [superAdmin, token]);

  if (!superAdmin) return null;
  const atual = emps.find((e) => e.codigo === usuario?.empresa);

  return (
    <div className="emp-switch">
      <button className="emp-pill" onClick={() => setAberto((v) => !v)} title={t('emp.trocar')}>
        🏢 <span>{atual?.fantasia ?? usuario?.empresa}</span> <small>▾</small>
      </button>
      {aberto && (
        <>
          <div className="emp-overlay" onClick={() => setAberto(false)} />
          <div className="emp-menu">
            <div className="emp-menu-h">{t('emp.titulo')}</div>
            {emps.length === 0 && <div className="emp-vazio">{t('emp.vazio')}</div>}
            {emps.map((e) => (
              <button key={e.codigo} className={'emp-item' + (e.codigo === usuario?.empresa ? ' ativo' : '')}
                onClick={() => { setAberto(false); if (e.codigo !== usuario?.empresa) trocarEmpresa(e.codigo); }}>
                <span>{e.fantasia}</span><small>{e.codigo}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
