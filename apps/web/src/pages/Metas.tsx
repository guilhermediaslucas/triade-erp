import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';

interface Metas { dia: number; semana: number; mes: number; ano: number; }

export function Metas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('comercial.meta.gerenciar');

  const [dia, setDia] = useState('0');
  const [semana, setSemana] = useState('0');
  const [mes, setMes] = useState('0');
  const [ano, setAno] = useState('0');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  useEffect(() => {
    api.get<Metas>('/metas', token!).then((m) => {
      setDia(String(m.dia ?? 0)); setSemana(String(m.semana ?? 0)); setMes(String(m.mes ?? 0)); setAno(String(m.ano ?? 0));
    }).catch((e) => setErro((e as ErroApi).chaveI18n));
    /* eslint-disable-next-line */
  }, []);

  async function salvar() {
    setErro(null); setSalv(true);
    try {
      await api.put('/metas', { dia: Number(dia) || 0, semana: Number(semana) || 0, mes: Number(mes) || 0, ano: Number(ano) || 0 }, token!);
      toast(t('metas.salvo'));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalv(false); }
  }

  return (
    <div>
      <div className="crumb">{t('metas.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('metas.titulo')}</h1><div className="muted page-sub">{t('metas.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="cores-grid">
          <label className="campo">{t('metas.dia')}<input type="number" min="0" step="0.01" value={dia} onChange={(e) => setDia(e.target.value)} disabled={!pode} /></label>
          <label className="campo">{t('metas.semana')}<input type="number" min="0" step="0.01" value={semana} onChange={(e) => setSemana(e.target.value)} disabled={!pode} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('metas.mes')}<input type="number" min="0" step="0.01" value={mes} onChange={(e) => setMes(e.target.value)} disabled={!pode} /></label>
          <label className="campo">{t('metas.ano')}<input type="number" min="0" step="0.01" value={ano} onChange={(e) => setAno(e.target.value)} disabled={!pode} /></label>
        </div>
        <div className="nota-info" style={{ marginTop: 12 }}><Ic name="i-shield" className="sm" /> {t('metas.nota')}</div>
      </div>

      {pode && <div className="form-actions">
        <button className="btn-primary" disabled={salv} onClick={salvar}><Ic name="i-check" className="sm" /> {t('metas.salvar')}</button>
      </div>}
    </div>
  );
}
