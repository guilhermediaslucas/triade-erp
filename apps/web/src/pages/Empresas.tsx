import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { FiltroLista, aplicarFiltro, type FiltroStatus } from '../components/FiltroLista.js';

interface EmpresaResumo { codigo: string; nome: string; fantasia: string; ativo: boolean; }
const VAZIO = { nome: '', fantasia: '', adminNome: '', adminEmail: '', adminSenha: '' };

export function Empresas() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<EmpresaResumo | null>(null);
  const [busca, setBusca] = useState('');
  const [fStatus, setFStatus] = useState<FiltroStatus>('todos');
  const filtradas = aplicarFiltro(empresas, busca, fStatus, (e) => e.nome + ' ' + e.fantasia);

  async function carregar() {
    try { setEmpresas(await api.get<EmpresaResumo[]>('/empresas', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const set = (c: keyof typeof VAZIO, v: string) => setForm({ ...form, [c]: v });

  async function criar() {
    setErro(null); setOk(null); setSalvando(true);
    try {
      await api.post('/empresas', form, token!);
      setOk('empresas.criada'); setForm(VAZIO); carregar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  async function excluir(e: EmpresaResumo) {
    if (!window.confirm(t('empresas.excluir_confirma').replace('{nome}', e.fantasia || e.nome))) return;
    setErro(null); setOk(null);
    try { await api.del(`/empresas/${e.codigo}`, token!); setOk('empresas.excluida'); carregar(); }
    catch (ex) { setErro((ex as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="crumb">{t('empresas.crumb')}</div><h1 className="page-titulo">{t('empresas.titulo')}</h1>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t(ok)}</div>}

      <FiltroLista busca={busca} onBusca={setBusca} status={fStatus} onStatus={setFStatus} />
      <div className="card pad0" style={{ marginBottom: 24 }}>
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('empresas.nome')}</th><th>{t('empresas.fantasia')}</th><th>{t('usuarios.situacao')}</th><th style={{ width: 160 }}>{t('empresas.acoes')}</th></tr></thead>
          <tbody>
            {filtradas.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtradas.map((e) => (
              <tr key={e.codigo}>
                <td data-label={t('empresas.nome')}>{e.nome}</td>
                <td data-label={t('empresas.fantasia')}>{e.fantasia}</td>
                <td data-label={t('usuarios.situacao')}><span className={e.ativo ? 'pill-ok' : 'pill-off'}>{e.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td>
                  <button className="btn-link" onClick={() => setEditando(e)}>{t('empresas.editar')}</button>
                  {' · '}
                  <button className="btn-link" style={{ color: 'var(--dash-red)' }} onClick={() => excluir(e)}>{t('empresas.excluir')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <h3 style={{ marginTop: 0 }}>{t('empresas.provisionar')}</h3>
        <p className="muted" style={{ marginTop: 0 }}>{t('empresas.provisionar_hint')}</p>
        <label className="campo">{t('empresas.nome')}
          <input value={form.nome} onChange={(e) => set('nome', e.target.value)} />
        </label>
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
          <button className="btn-primary" disabled={salvando} onClick={criar}>{t('empresas.provisionar')}</button>
        </div>
      </div>

      {editando && (
        <ModalEditar
          empresa={editando}
          onFechar={() => setEditando(null)}
          onSalvo={() => { setEditando(null); setOk('empresas.salva'); carregar(); }}
          onErro={(c) => setErro(c)}
        />
      )}
    </div>
  );
}

function ModalEditar({ empresa, onFechar, onSalvo, onErro }: {
  empresa: EmpresaResumo; onFechar: () => void; onSalvo: () => void; onErro: (c: string) => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [nome, setNome] = useState(empresa.nome);
  const [fantasia, setFantasia] = useState(empresa.fantasia);
  const [ativo, setAtivo] = useState(empresa.ativo);
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get<{ nome: string; email: string } | null>(`/empresas/${empresa.codigo}/admin`, token!)
      .then((a) => { if (a) { setAdminNome(a.nome); setAdminEmail(a.email); } }).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function salvar() {
    setSalvando(true);
    try {
      await api.put(`/empresas/${empresa.codigo}`, { nome, fantasia, ativo }, token!);
      await api.put(`/empresas/${empresa.codigo}/admin`, { nome: adminNome, email: adminEmail, senha: adminSenha || undefined }, token!);
      onSalvo();
    }
    catch (e) { onErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
      <h2>{t('empresas.editar_titulo')}</h2>
      <label className="campo">{t('empresas.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
      <label className="campo">{t('empresas.fantasia')}<input value={fantasia} onChange={(e) => setFantasia(e.target.value)} /></label>
      <label className="login-lembrar" style={{ marginTop: 8 }}>
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> {t('empresas.ativa')}
      </label>
      <div className="perm-titulo" style={{ marginTop: 14 }}>{t('empresas.admin')}</div>
      <label className="campo">{t('usuarios.nome')}<input value={adminNome} onChange={(e) => setAdminNome(e.target.value)} /></label>
      <div className="cores-grid">
        <label className="campo">{t('usuarios.email')}<input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} /></label>
        <label className="campo">{t('empresas.admin_nova_senha')}<input type="password" value={adminSenha} onChange={(e) => setAdminSenha(e.target.value)} placeholder={t('empresas.admin_senha_ph')} /><small className="hint">{t('usuarios.senha_hint')}</small></label>
      </div>
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
      </div>
    </div></div>
  );
}
