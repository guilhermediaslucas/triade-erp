import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import type { ErroApi } from '../api/client.js';
import { useTema } from '../theme/ThemeContext.js';
import { Ic, SpriteIcones } from '../components/Icones.js';

const FEATS: [string, string, string][] = [
  ['i-grid', 'login.f1_t', 'login.f1_d'],
  ['i-cart', 'login.f2_t', 'login.f2_d'],
  ['i-dollar', 'login.f3_t', 'login.f3_d'],
  ['i-box', 'login.f4_t', 'login.f4_d'],
  ['i-chart', 'login.f5_t', 'login.f5_d'],
  ['i-shield', 'login.f6_t', 'login.f6_d'],
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
      <SpriteIcones />
      <div className="login-top"><button className="btn-tema" onClick={alternar} title={t('tema.alternar')}><Ic name={escuro ? 'i-sun' : 'i-moon'} className="sm" /></button></div>
      <div className="login-wrap">
        <div className="login-hero">
          <div className="lh-brand">TR<span>Í</span>ADE <small>ERP</small></div>
          <h1>{t('login.hero_titulo')}</h1>
          <div className="lh-sub">{t('login.hero_sub')}</div>
          <div className="lh-feats">
            {FEATS.map(([ic, tk, dk]) => (
              <div className="lh-feat" key={tk}>
                <div className="lh-ic"><Ic name={ic} /></div>
                <div><div className="lh-t">{t(tk)}</div><div className="lh-d">{t(dk)}</div></div>
              </div>
            ))}
          </div>
          <PreviewSistema />
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
                <button type="button" className="login-eye" onClick={() => setVerSenha((v) => !v)} title={t('login.ver_senha')}><Ic name="i-eye" className="sm" /></button>
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

// Janela de "navegador" com um mini-dashboard no hero do login (igual ao mockup).
// Puramente ilustrativo (dados estáticos), some no mobile junto com o hero.
function PreviewSistema() {
  return (
    <div className="lh-preview" aria-hidden="true">
      <div className="lhp-bar">
        <span className="lhp-dot" style={{ background: '#ef5f56' }} /><span className="lhp-dot" style={{ background: '#f6bd3b' }} /><span className="lhp-dot" style={{ background: '#5fc24f' }} />
        <span className="lhp-brand">TR<span>Í</span>ADE</span>
      </div>
      <div className="lhp-body">
        <div className="lhp-side">
          <div className="lhp-logo">TR<span>Í</span>ADE</div>
          <div className="lhp-nav on">Dashboard</div>
          <div className="lhp-nav">Comercial</div>
          <div className="lhp-nav">Financeiro</div>
          <div className="lhp-nav">Estoque</div>
          <div className="lhp-nav">Relatórios</div>
        </div>
        <div className="lhp-main">
          <div className="lhp-kpis">
            <div className="lhp-kpi"><span>Vendas do mês</span><b>R$ 2,14M</b></div>
            <div className="lhp-kpi"><span>Pedidos</span><b>1.234</b></div>
            <div className="lhp-kpi"><span>A receber</span><b>R$ 2,65M</b></div>
            <div className="lhp-kpi"><span>Clientes</span><b>1.256</b></div>
          </div>
          <div className="lhp-charts">
            <div className="lhp-card">
              <div className="lhp-card-t">Faturamento</div>
              <svg viewBox="0 0 240 80" preserveAspectRatio="none" style={{ width: '100%', height: 64 }}>
                <polygon points="0,80 0,62 40,58 80,50 120,52 160,38 200,24 235,8 235,80" fill="#dc2626" opacity="0.10" />
                <polyline points="0,62 40,58 80,50 120,52 160,38 200,24 235,8" fill="none" stroke="#dc2626" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="lhp-card">
              <div className="lhp-card-t">Por categoria</div>
              <svg viewBox="0 0 80 80" style={{ width: 60, height: 60, display: 'block', margin: '4px auto 0' }}>
                <circle cx="40" cy="40" r="28" fill="none" stroke="#ececf2" strokeWidth="11" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="#7b61ff" strokeWidth="11" strokeDasharray="70 106" transform="rotate(-90 40 40)" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="#3b82f6" strokeWidth="11" strokeDasharray="44 132" strokeDashoffset="-70" transform="rotate(-90 40 40)" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="#ea9213" strokeWidth="11" strokeDasharray="32 144" strokeDashoffset="-114" transform="rotate(-90 40 40)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalRecuperar({ onFechar }: { onFechar: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2><Ic name="i-key" className="sm" /> {t('login.rec_titulo')}</h2>
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
