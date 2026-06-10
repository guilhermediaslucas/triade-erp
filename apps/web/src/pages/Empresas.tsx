import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface EmpresaResumo { codigo: string; nome: string; fantasia: string; ativo: boolean; }
const VAZIO = { codigo: '', nome: '', fantasia: '', adminNome: '', adminEmail: '', adminSenha: '' };

export function Empresas() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try { setEmpresas(await api.get<EmpresaResumo[]>('/empresas', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const set = (c: keyof typeof VAZIO, v: string) => setForm({ ...form, [c]: v });

  async function provisionar() {
    setErro(null); setOk(null); setSalvando(true);
    try {
      await api.post('/empresas', form, token!);
      setOk('empresas.criada'); setForm(VAZIO); carregar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('empresas.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t(ok)}</div>}

      <div className="card pad0" style={{ marginBottom: 24 }}>
        <table className="tabela">
          <thead><tr><th>{t('empresas.codigo')}</th><th>{t('empresas.fantasia')}</th><th>{t('usuarios.situacao')}</th></tr></thead>
          <tbody>
            {empresas.length === 0 && <tr><td colSpan={3} className="vazio">{t('common.nenhum')}</td></tr>}
            {empresas.map((e) => (
              <tr key={e.codigo}>
                <td><code>{e.codigo}</code></td>
                <td>{e.fantasia}</td>
                <td><span className={e.ativo ? 'pill-ok' : 'pill-off'}>{e.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <h3 style={{ marginTop: 0 }}>{t('empresas.provisionar')}</h3>
        <p className="muted" style={{ marginTop: 0 }}>{t('empresas.provisionar_hint')}</p>
        <div className="cores-grid">
          <label className="campo">{t('empresas.codigo')}
            <input value={form.codigo} onChange={(e) => set('codigo', e.target.value)} placeholder="ex.: dermacenter" />
            <small className="hint">{t('empresas.codigo_hint')}</small>
          </label>
          <label className="campo">{t('empresas.nome')}
            <input value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </label>
        </div>
        <label className="campo">{t('empresas.fantasia')}
          <input value={form.fantasia} onChange={(e) => set('fantasia', e.target.value)} />
        </label>
        <div className="perm-titulo">{t('empresas.admin')}</div>
        <label className="campo">{t('usuarios.nome')}
          <input value={form.adminNome} onChange={(e) => set('adminNome', e.target.value)} />
        </label>
        <div className="cores-grid">
          <label className="campo">{t('usuarios.email')}
            <input type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} />
          </label>
          <label className="campo">{t('usuarios.senha')}
            <input type="password" value={form.adminSenha} onChange={(e) => set('adminSenha', e.target.value)} />
            <small className="hint">{t('usuarios.senha_hint')}</small>
          </label>
        </div>
        <div className="modal-acoes">
          <button className="btn-primary" disabled={salvando} onClick={provisionar}>{t('empresas.provisionar')}</button>
        </div>
      </div>
    </div>
  );
}
