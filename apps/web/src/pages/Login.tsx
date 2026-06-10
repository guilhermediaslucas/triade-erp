import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import type { ErroApi } from '../api/client.js';
import { SeletorIdioma } from '../components/SeletorIdioma.js';

export function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(codigoEmpresa, email, senha);
      navigate('/');
    } catch (ex) {
      setErro((ex as ErroApi).chaveI18n ?? 'erro.interno');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-lang"><SeletorIdioma /></div>
        <div className="login-brand">TRIADE<span> ERP</span></div>
        <p className="login-sub">{t('login.subtitulo')}</p>
        <form onSubmit={enviar}>
          <label>
            {t('login.empresa')}
            <input value={codigoEmpresa} onChange={(e) => setCodigoEmpresa(e.target.value)} autoFocus />
          </label>
          <label>
            {t('login.email')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {t('login.senha')}
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          {erro && <div className="login-erro">{t(erro)}</div>}
          <button type="submit" disabled={carregando}>
            {carregando ? t('login.entrando') : t('login.entrar')}
          </button>
        </form>
      </div>
    </div>
  );
}
