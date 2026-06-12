import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useBranding } from '../branding/BrandingContext.js';
import type { Branding } from '../branding/tema.js';

export function DadosEmpresa() {
  const { token } = useAuth();
  const { t } = useI18n();
  const { branding, definir } = useBranding();
  const [form, setForm] = useState<Branding | null>(branding);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form) return;
    api.get<Branding>('/empresa', token!).then(setForm).catch((e) => setErro((e as ErroApi).chaveI18n));
  }, [form, token]);

  if (!form) return <div className="muted">{t('common.carregando')}</div>;
  const set = (campo: keyof Branding, valor: string | null) => setForm({ ...form, [campo]: valor } as Branding);

  function escolherLogo(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (arq.size > 1_500_000) { setErro('empresa.logo_grande'); return; }
    const leitor = new FileReader();
    leitor.onload = () => set('logo', String(leitor.result));
    leitor.readAsDataURL(arq);
  }

  async function salvar() {
    if (!form) return;
    setErro(null); setOk(false); setSalvando(true);
    try {
      await api.put('/empresa', {
        fantasia: form.fantasia, logo: form.logo,
        corPrimaria: form.corPrimaria, corMenuFundo: form.corMenuFundo, corMenuFonte: form.corMenuFonte,
        idiomaPadrao: form.idiomaPadrao, timezonePadrao: form.timezonePadrao,
      }, token!);
      definir(form);          // aplica o tema na hora
      setOk(true);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  return (
    <div>
      <div className="crumb">{t('empresa.crumb')}</div><h1 className="page-titulo">{t('empresa.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('empresa.salvo')}</div>}

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="card-head"><h3>{t('empresa.card')}</h3></div>
        <label className="campo">{t('empresa.fantasia')}
          <input value={form.fantasia} onChange={(e) => set('fantasia', e.target.value)} />
        </label>

        <div className="campo">{t('empresa.logo')}
          <div className="logo-area">
            {form.logo
              ? <img src={form.logo} alt="logo" className="logo-preview" />
              : <div className="logo-vazio">—</div>}
            <div className="logo-btns">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={escolherLogo} />
              <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>{t('empresa.logo_enviar')}</button>
              {form.logo && <button type="button" className="btn-link" onClick={() => set('logo', null)}>{t('empresa.logo_remover')}</button>}
            </div>
          </div>
          <small className="hint">{t('empresa.logo_hint')}</small>
        </div>

        <div className="cores-grid">
          <label className="campo">{t('empresa.cor_primaria')}
            <input type="color" value={form.corPrimaria} onChange={(e) => set('corPrimaria', e.target.value)} />
          </label>
          <label className="campo">{t('empresa.cor_menu_fundo')}
            <input type="color" value={form.corMenuFundo} onChange={(e) => set('corMenuFundo', e.target.value)} />
          </label>
          <label className="campo">{t('empresa.cor_menu_fonte')}
            <input type="color" value={form.corMenuFonte} onChange={(e) => set('corMenuFonte', e.target.value)} />
          </label>
        </div>

        <div className="modal-acoes">
          <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
