import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import type { Branding } from '../branding/tema.js';
import { mascaraCnpj, mascaraCep, buscarCnpj, buscarCep, UFS } from '../lib/br.js';
import { Ic } from '../components/Icones.js';
import { ConfigFiscalCard } from '../components/ConfigFiscalCard.js';

export function DadosEmpresa() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { branding, definir } = useBranding();
  const [form, setForm] = useState<Branding | null>(branding);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form) return;
    api.get<Branding>('/empresa', token!).then(setForm).catch((e) => setErro((e as ErroApi).chaveI18n));
  }, [form, token]);

  if (!form) return <div className="muted">{t('common.carregando')}</div>;
  const f = form;
  const set = (campo: keyof Branding, valor: string | number | null) => setForm({ ...f, [campo]: valor } as Branding);

  function escolherLogo(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (arq.size > 2_000_000) { setErro('empresa.logo_grande'); return; }
    const leitor = new FileReader();
    leitor.onload = () => set('logo', String(leitor.result));
    leitor.readAsDataURL(arq);
  }

  async function buscarDocumento() {
    setBuscandoCnpj(true); setErro(null);
    try {
      const d = await buscarCnpj(f.cnpj);
      if (d) setForm({
        ...f, nome: d.razao ?? f.nome, fantasia: f.fantasia || (d.fantasia ?? ''),
        cidade: d.cidade ?? f.cidade, uf: d.uf ?? f.uf, cep: d.cep ? mascaraCep(d.cep) : f.cep,
      });
    } catch { /* silencioso */ }
    finally { setBuscandoCnpj(false); }
  }

  async function buscarEndereco() {
    if (!f.cep) return;
    try {
      const d = await buscarCep(f.cep);
      if (d) setForm({ ...f, logradouro: d.logradouro ?? f.logradouro, bairro: d.bairro ?? f.bairro, cidade: d.cidade ?? f.cidade, uf: d.uf ?? f.uf });
    } catch { /* silencioso */ }
  }

  async function salvar() {
    setErro(null); setOk(false); setSalvando(true);
    try {
      await api.put('/empresa', {
        nome: f.nome, fantasia: f.fantasia, logo: f.logo,
        corPrimaria: f.corPrimaria, corSecundaria: f.corSecundaria,
        corMenuFundo: f.corMenuFundo, corMenuFonte: f.corMenuFonte, logoAltura: f.logoAltura,
        idiomaPadrao: f.idiomaPadrao, timezonePadrao: f.timezonePadrao,
        cnpj: f.cnpj, inscricaoEstadual: f.inscricaoEstadual, telefone: f.telefone, email: f.email,
        logradouro: f.logradouro, bairro: f.bairro, cep: f.cep, uf: f.uf, cidade: f.cidade,
      }, token!);
      definir(f);          // aplica o tema (cores + altura da logo) na hora
      setOk(true);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  return (
    <div>
      <div className="crumb">{t('empresa.crumb')}</div><h1 className="page-titulo">{t('empresa.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('empresa.salvo')}</div>}

      <div className="emp-grid">
        <div className="card">
          <h3 className="emp-sec">{t('empresa.identificacao')}</h3>
          <label className="campo">{t('empresa.razao')}<input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></label>
          <label className="campo">{t('empresa.fantasia')}<input value={f.fantasia} onChange={(e) => set('fantasia', e.target.value)} /><small className="hint">{t('empresa.fantasia_hint')}</small></label>
          <div className="cores-grid">
            <label className="campo">{t('empresa.cnpj')}
              <div className="inp-acao"><input value={f.cnpj} onChange={(e) => set('cnpj', mascaraCnpj(e.target.value))} /><button type="button" className="btn-ghost" disabled={buscandoCnpj} onClick={buscarDocumento}><Ic name="i-search" className="sm" /> {t('empresa.buscar')}</button></div>
            </label>
            <label className="campo">{t('empresa.ie')}<input value={f.inscricaoEstadual} onChange={(e) => set('inscricaoEstadual', e.target.value)} /></label>
          </div>
          <div className="cores-grid">
            <label className="campo">{t('empresa.telefone')}<input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} /></label>
            <label className="campo">{t('empresa.email')}<input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></label>
          </div>
          <label className="campo">{t('empresa.endereco')}<input value={f.logradouro} onChange={(e) => set('logradouro', e.target.value)} /></label>
          <div className="cores-grid">
            <label className="campo">{t('empresa.bairro')}<input value={f.bairro} onChange={(e) => set('bairro', e.target.value)} /></label>
            <label className="campo">{t('empresa.cep')}<input value={f.cep} onChange={(e) => set('cep', mascaraCep(e.target.value))} onBlur={buscarEndereco} /></label>
          </div>
          <div className="cores-grid">
            <label className="campo">{t('empresa.uf')}<select value={f.uf} onChange={(e) => set('uf', e.target.value)}><option value="">—</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}</select></label>
            <label className="campo">{t('empresa.cidade')}<input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} /></label>
          </div>
        </div>

        <div className="card">
          <h3 className="emp-sec">{t('empresa.logo')}</h3>
          <div className="emp-logo-row">
            {f.logo ? <img src={f.logo} alt="logo" className="emp-logo-prev" /> : <div className="emp-logo-vazio">—</div>}
            <div className="muted" style={{ fontSize: 13 }}><b style={{ color: 'var(--ink)' }}>{t('empresa.preview')}</b><br />{t('empresa.logo_onde')}</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={escolherLogo} />
          <button type="button" className="emp-drop" onClick={() => fileRef.current?.click()}>
            <Ic name="i-upload" /><span>{t('empresa.logo_inserir')}</span><small>{t('empresa.logo_hint')}</small>
          </button>
          {f.logo && <button type="button" className="btn-link" onClick={() => set('logo', null)}>{t('empresa.logo_remover')}</button>}

          <div className="emp-slider">
            <div className="emp-slider-top"><span>{t('empresa.logo_tamanho')}</span><span>{f.logoAltura} px</span></div>
            <input type="range" min={24} max={120} value={f.logoAltura} onChange={(e) => set('logoAltura', Number(e.target.value))} />
            <small className="hint">{t('empresa.logo_tamanho_hint')}</small>
          </div>

          <h3 className="emp-sec" style={{ marginTop: 18 }}>{t('empresa.paleta')}</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t('empresa.paleta_hint')}</div>
          <ColorRow label={t('empresa.cor_primaria')} value={f.corPrimaria} onChange={(v) => set('corPrimaria', v)} />
          <ColorRow label={t('empresa.cor_secundaria')} value={f.corSecundaria} onChange={(v) => set('corSecundaria', v)} />
          <ColorRow label={t('empresa.cor_menu_fundo')} value={f.corMenuFundo} onChange={(v) => set('corMenuFundo', v)} />
          <ColorRow label={t('empresa.cor_menu_fonte')} value={f.corMenuFonte} onChange={(v) => set('corMenuFonte', v)} />
          <small className="hint" style={{ display: 'block', marginTop: 8 }}>{t('empresa.cor_secundaria_hint')}</small>

          <div className="modal-acoes">
            <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
          </div>
        </div>
      </div>

      <ConfigFiscalCard />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="emp-cor">
      <span className="emp-cor-lbl">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span className="emp-cor-hex">{value.toUpperCase()}</span>
    </div>
  );
}
