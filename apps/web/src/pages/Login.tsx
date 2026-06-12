import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import type { ErroApi } from '../api/client.js';
import { useTema } from '../theme/ThemeContext.js';

const FEATS: [string, string, string][] = [
  ['▦', 'login.f1_t', 'login.f1_d'],
  ['🛒', 'login.f2_t', 'login.f2_d'],
  ['💰', 'login.f3_t', 'login.f3_d'],
  ['📦', 'login.f4_t', 'login.f4_d'],
  ['📈', 'login.f5_t', 'login.f5_d'],
  ['🛡️', 'login.f6_t', 'login.f6_d'],
];

export function Login() {
  const { login } = useAuth();
  const { escuro, alternar } = useTema();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [recuperar, setRecuperar] = useState(false);

  // Lembra o último e-mail usado (quando "Lembrar-me" estava marcado) — preenche ao abrir.
  useEffect(() => {
    try {
      const ultimo = localStorage.getItem('triade_ultimo_email');
      if (ultimo) { setEmail(ultimo); setLembrar(true); }
    } catch { /* ignora */ }
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault(); setErro(null); setCarregando(true);
    try {
      await login(email, senha, lembrar);
      try {
        if (lembrar) localStorage.setItem('triade_ultimo_email', email.trim());
        else localStorage.removeItem('triade_ultimo_email');
      } catch { /* ignora */ }
      navigate('/');
    }
    catch (ex) { setErro((ex as ErroApi).chaveI18n ?? 'erro.interno'); }
    finally { setCarregando(false); }
  }

  return (
    <div className="login">
      <div className="login-top"><button className="btn-tema" onClick={alternar} title={t('tema.alternar')}>{escuro ? '☀️' : '🌙'}</button></div>
      <div className="login-wrap">
        <div className="login-hero">
          <div className="lh-brand">TR<span>Í</span>ADE <small>ERP</small></div>
          <h1>{t('login.hero_titulo')}</h1>
          <div className="lh-sub">{t('login.hero_sub')}</div>
          <div className="lh-feats">
            {FEATS.map(([ic, tk, dk]) => (
              <div className="lh-feat" key={tk}>
                <div className="lh-ic">{ic}</div>
                <div><div className="lh-t">{t(tk)}</div><div className="lh-d">{t(dk)}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="login-pane">
          <form className="login-card" onSubmit={enviar}>
            <div className="login-logo">TR<span>Í</span>ADE</div>
            <div className="login-tag">E R P</div>
            <h2>{t('login.entrar')}</h2>
            <p className="login-acesse">{t('login.acesse')}</p>
            <label className="campo">{t('login.email')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></label>
            <label className="campo">{t('login.senha')}
              <div className="login-senha">
                <input type={verSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} />
                <button type="button" className="login-eye" onClick={() => setVerSenha((v) => !v)} title={t('login.ver_senha')}>{verSenha ? '🙈' : '👁'}</button>
              </div>
            </label>
            <div className="login-opts">
              <label className="login-lembrar"><input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} /> {t('login.lembrar')}</label>
              <a href="#" onClick={(e) => { e.preventDefault(); setRecuperar(true); }}>{t('login.esqueci')}</a>
            </div>
            {erro && <div className="login-erro">{t(erro)}</div>}
            <button type="submit" className="login-btn" disabled={carregando}>{carregando ? t('login.entrando') : t('login.entrar')}</button>
            <div className="login-footer">{t('login.dev')} <b>Guilherme Dias</b><br />TRÍADE ERP © 2026 · v0.1.0</div>
          </form>
        </div>
      </div>
      {recuperar && <ModalRecuperar onFechar={() => setRecuperar(false)} />}
    </div>
  );
}

function ModalRecuperar({ onFechar }: { onFechar: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2>🔑 {t('login.rec_titulo')}</h2>
      {!enviado ? (
        <>
          <p className="muted">{t('login.rec_sub')}</p>
          <label className="campo">{t('login.email')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoFocus /></label>
          <div className="modal-acoes">
            <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
            <button className="btn-primary" disabled={!email.trim()} onClick={() => setEnviado(true)}>{t('login.rec_enviar')}</button>
          </div>
        </>
      ) : (
        <>
          <div className="alerta-ok">{t('login.rec_ok')}</div>
          <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
        </>
      )}
    </div></div>
  );
}
