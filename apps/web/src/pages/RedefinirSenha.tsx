import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ErroApi } from '../api/client.js';
import { useI18n } from '../i18n/I18nContext.js';

// Página pública de redefinição de senha (link enviado por e-mail). Lê o token da
// URL (?token=...), pede a nova senha e chama POST /auth/redefinir-senha.
export function RedefinirSenha() {
  const { t } = useI18n();
  const nav = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [nova, setNova] = useState('');
  const [conf, setConf] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);

  async function submeter(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nova.length < 6) { setErro('usuario.senha_curta'); return; }
    if (nova !== conf) { setErro('senha.divergem'); return; }
    setSalvando(true);
    try {
      await api.post('/auth/redefinir-senha', { token, novaSenha: nova });
      setOk(true);
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="reset-page">
      <div className="login-card reset-card">
        <div className="login-logo">TR<span>Í</span>ADE</div>
        <div className="login-tag">E R P</div>

        {ok ? (
          <>
            <h2>{t('reset.ok_titulo')}</h2>
            <p className="login-acesse">{t('reset.ok_sub')}</p>
            <button className="login-btn" onClick={() => nav('/login')}>{t('reset.ir_login')}</button>
          </>
        ) : !token ? (
          <>
            <h2>{t('reset.titulo')}</h2>
            <div className="login-erro">{t('auth.reset_invalido')}</div>
            <button className="login-btn" onClick={() => nav('/login')}>{t('reset.ir_login')}</button>
          </>
        ) : (
          <form onSubmit={submeter}>
            <h2>{t('reset.titulo')}</h2>
            <p className="login-acesse">{t('reset.sub')}</p>
            <label className="campo">{t('reset.nova')}<input type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoFocus /></label>
            <label className="campo">{t('reset.confirmar')}<input type="password" value={conf} onChange={(e) => setConf(e.target.value)} /></label>
            {erro && <div className="login-erro">{t(erro)}</div>}
            <button type="submit" className="login-btn" disabled={salvando || !nova || !conf}>{t('reset.salvar')}</button>
            <div className="reset-voltar"><a href="#" onClick={(e) => { e.preventDefault(); nav('/login'); }}>← {t('reset.voltar')}</a></div>
          </form>
        )}
      </div>
    </div>
  );
}
