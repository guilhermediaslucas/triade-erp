import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { api, type ErroApi } from '../api/client.js';
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
            <div className="login-footer">{t('login.dev')} <b>Guilherme Dias</b><br />TRÍADE ERP © 2026 · v{__APP_VERSION__}</div>
          </form>
        </div>
      </div>
      {recuperar && <ModalRecuperar onFechar={() => setRecuperar(false)} />}
    </div>
  );
}

// Janela de "navegador" com as telas do sistema passando sozinhas (showcase em
// loop). Puramente ilustrativo, some no mobile junto com o hero.
const kpi = (l: string, v: string, cor?: string) => (
  <div style={{ background: '#fff', border: '1px solid #e8e9f1', borderRadius: 9, padding: 9 }}>
    <div style={{ fontSize: 10, color: '#8a90a2' }}>{l}</div>
    <div style={{ fontSize: 15, fontWeight: 800, marginTop: 3, color: cor ?? '#1f2430' }}>{v}</div>
  </div>
);
const row = (esq: ReactNode, pill: string, cls: string) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e8e9f1', borderRadius: 8, padding: '7px 10px', marginBottom: 6, fontSize: 12 }}>
    <span>{esq}</span><span className={'lhs-pill ' + cls}>{pill}</span>
  </div>
);
const kb = (t: string, n: string, itens: string[]) => (
  <div style={{ background: '#fff', border: '1px solid #e8e9f1', borderRadius: 9, padding: 8 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 7, display: 'flex', justifyContent: 'space-between' }}>{t}<span style={{ color: '#8a90a2' }}>{n}</span></div>
    {itens.map((i, k) => <div key={k} style={{ background: '#f7f7fc', border: '1px solid #e8e9f1', borderRadius: 7, padding: 6, fontSize: 10.5, marginBottom: 5 }}>{i}</div>)}
  </div>
);

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
          <div className="lhp-nav">Estoque</div>
          <div className="lhp-nav">Financeiro</div>
          <div className="lhp-nav">Logística</div>
        </div>
        <div className="lhp-main lhs-stage">

          {/* 1 — Dashboard */}
          <div className="lhs-scr lhs-s1">
            <h4>Dashboard <small>visão geral</small></h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {kpi('Faturamento', 'R$ 184.230')}{kpi('Pedidos', '312')}{kpi('Ticket médio', 'R$ 590')}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 78, marginTop: 10, padding: 10, background: '#fff', border: '1px solid #e8e9f1', borderRadius: 9 }}>
              {[55, 72, 48, 88, 66, 95].map((h, i) => <i key={i} style={{ flex: 1, height: h + '%', borderRadius: '4px 4px 0 0', background: 'linear-gradient(#dc2626,#f3a3a3)' }} />)}
            </div>
          </div>

          {/* 2 — Comercial / Pedidos */}
          <div className="lhs-scr lhs-s2">
            <h4>Comercial · Pedidos <small>workflow</small></h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {kb('Novo', '3', ['#1042 · Maria ME', '#1043 · Bar do João'])}
              {kb('Separação', '2', ['#1039 · Mercado Sul'])}
              {kb('Expedição', '1', ['#1037 · Padaria Pão'])}
            </div>
          </div>

          {/* 3 — Estoque / Produtos */}
          <div className="lhs-scr lhs-s3">
            <h4>Estoque · Produtos <small>saldo</small></h4>
            {row(<><b>Refrigerante 2L</b> <span style={{ color: '#8a90a2' }}>· SKU 8841</span></>, '240 un', 'vd')}
            {row(<><b>Água 500ml (fardo)</b> <span style={{ color: '#8a90a2' }}>· SKU 2210</span></>, '38 un', 'am')}
            {row(<><b>Suco Uva 1L</b> <span style={{ color: '#8a90a2' }}>· SKU 5567</span></>, '112 un', 'rx')}
            {row(<><b>Energético 250ml</b> <span style={{ color: '#8a90a2' }}>· SKU 9003</span></>, '410 un', 'vd')}
          </div>

          {/* 4 — Financeiro */}
          <div className="lhs-scr lhs-s4">
            <h4>Financeiro <small>a pagar / a receber · fluxo</small></h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {kpi('A receber', 'R$ 92.400', '#16a34a')}{kpi('A pagar', 'R$ 61.180', '#e1483b')}{kpi('Saldo proj.', 'R$ 31.220')}
            </div>
            <div style={{ marginTop: 10 }}>
              {row(<>Boleto · Fornecedor Alfa</>, 'vence 02/07', 'am')}
              {row(<>Recebível · Mercado Sul</>, 'pago', 'vd')}
            </div>
          </div>

          {/* 5 — Mapa dos motoboys */}
          <div className="lhs-scr lhs-s5">
            <h4>Logística · Mapa dos motoboys <small>ao vivo</small></h4>
            <div className="lhs-map">
              <div className="lhs-moto" style={{ left: '16%', top: '34%', background: '#dc2626' }}>M1</div>
              <div className="lhs-moto" style={{ left: '52%', top: '54%', background: '#22c55e' }}>M2</div>
              <div className="lhs-moto" style={{ left: '74%', top: '28%', background: '#f59e0b' }}>M3</div>
              <div style={{ position: 'absolute', right: 8, bottom: 8, background: '#fff', border: '1px solid #e8e9f1', borderRadius: 8, padding: '6px 8px', fontSize: 10 }}>
                <div>🔴 M1 · entregando</div><div>🟢 M2 · a caminho</div><div>🟠 M3 · retornando</div>
              </div>
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
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    // Resposta sempre neutra (o backend não revela se o e-mail existe).
    try { await api.post('/auth/esqueci-senha', { email }); } catch { /* ignora */ }
    setEnviado(true);
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2><Ic name="i-key" className="sm" /> {t('login.rec_titulo')}</h2>
      {!enviado ? (
        <>
          <p className="muted">{t('login.rec_sub')}</p>
          <label className="campo">{t('login.email')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoFocus /></label>
          <div className="modal-acoes">
            <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
            <button className="btn-primary" disabled={!email.trim() || enviando} onClick={enviar}>{t('login.rec_enviar')}</button>
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
