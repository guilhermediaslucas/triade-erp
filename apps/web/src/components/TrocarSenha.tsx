import { useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from './Toast.js';
import { Ic } from './Icones.js';

// Modal de auto-serviço: o usuário logado troca a própria senha (super-admin ou usuário de tenant).
// `obrigatorio`: 1º login com senha provisória — não dá pra fechar/cancelar até trocar.
export function TrocarSenha({ onFechar, obrigatorio = false }: { onFechar: () => void; obrigatorio?: boolean }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [conf, setConf] = useState('');
  const [ver, setVer] = useState(false);   // mostrar/ocultar senhas (olho)
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  async function salvar() {
    setErro(null);
    if (nova.length < 6) { setErro('usuario.senha_curta'); return; }
    if (nova !== conf) { setErro('senha.divergem'); return; }
    setSalv(true);
    try {
      await api.put('/auth/senha', { senhaAtual: atual, novaSenha: nova }, token!);
      toast(t('senha.ok'));
      onFechar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
      <h2>{t('senha.trocar')}</h2>
      {obrigatorio && <div className="nota-info" style={{ marginBottom: 10 }}>{t('senha.obrigatoria')}</div>}
      <label className="campo">{obrigatorio ? t('senha.provisoria') : t('senha.atual')}
        <div className="login-senha">
          <input type={ver ? 'text' : 'password'} value={atual} onChange={(e) => setAtual(e.target.value)} autoFocus />
          <button type="button" className="login-eye" onClick={() => setVer((v) => !v)} title={t('login.ver_senha')}><Ic name="i-eye" className="sm" /></button>
        </div>
      </label>
      <label className="campo">{t('senha.nova')}
        <div className="login-senha">
          <input type={ver ? 'text' : 'password'} value={nova} onChange={(e) => setNova(e.target.value)} />
          <button type="button" className="login-eye" onClick={() => setVer((v) => !v)} title={t('login.ver_senha')}><Ic name="i-eye" className="sm" /></button>
        </div>
      </label>
      <label className="campo">{t('senha.confirmar')}
        <div className="login-senha">
          <input type={ver ? 'text' : 'password'} value={conf} onChange={(e) => setConf(e.target.value)} />
          <button type="button" className="login-eye" onClick={() => setVer((v) => !v)} title={t('login.ver_senha')}><Ic name="i-eye" className="sm" /></button>
        </div>
      </label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        {!obrigatorio && <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>}
        <button className="btn-primary" disabled={salv || !atual || !nova} onClick={salvar}>{t('common.salvar')}</button>
      </div>
    </div></div>
  );
}
