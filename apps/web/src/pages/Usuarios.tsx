import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Avatar } from '../components/Avatar.js';
import { Ic } from '../components/Icones.js';

interface UsuarioResumo { id: string; nome: string; email: string; ativo: boolean; perfilId: string | null; perfilNome: string | null; foto: string | null; }
interface Perfil { id: string; nome: string; }

export function Usuarios() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeGerenciar = temCapability('acesso.usuario.gerenciar');
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<{ aberto: boolean; editandoId: string | null } | null>(null);
  const [senhaDe, setSenhaDe] = useState<UsuarioResumo | null>(null);

  async function carregar() {
    try {
      setUsuarios(await api.get<UsuarioResumo[]>('/usuarios', token!));
      if (temCapability('acesso.perfil.listar')) setPerfis(await api.get<Perfil[]>('/perfis', token!));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternarAtivo(u: UsuarioResumo) {
    try { await api.patch('/usuarios/' + u.id + '/ativo', { ativo: !u.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const filtrados = usuarios.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.email, x.perfilNome].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('usuarios.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('usuarios.titulo')}</h1><div className="muted page-sub">{t('usuarios.sub')}</div></div>
        {podeGerenciar && <button className="btn-primary" onClick={() => setForm({ aberto: true, editandoId: null })}>+ {t('usuarios.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('usuarios.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela">
          <thead><tr>
            <th>{t('usuarios.nome')}</th><th>{t('usuarios.email')}</th><th>{t('usuarios.perfil')}</th>
            <th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th>
          </tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((u) => (
              <tr key={u.id} className={u.ativo ? '' : 'linha-inativa'}>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar nome={u.nome} foto={u.foto} tamanho={26} />{u.nome}</span></td>
                <td>{u.email}</td>
                <td>{u.perfilNome ? <span className="pill">{u.perfilNome}</span> : <span className="muted">{t('usuarios.sem_perfil')}</span>}</td>
                <td><span className={u.ativo ? 'pill-ok' : 'pill-off'}>{u.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {podeGerenciar && <span className="acoes-ic">
                    <button className="acao-ic" title={t('common.editar')} onClick={() => setForm({ aberto: true, editandoId: u.id })}><Ic name="i-edit" className="sm" /></button>
                    <button className="btn-link" onClick={() => setSenhaDe(u)}>{t('usuarios.redefinir_senha')}</button>
                    <button className="acao-ic danger" title={u.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternarAtivo(u)}><Ic name="i-trash" className="sm" /></button>
                  </span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form?.aberto && (
        <ModalUsuario
          usuario={form.editandoId ? usuarios.find((x) => x.id === form.editandoId) ?? null : null}
          perfis={perfis}
          onFechar={() => setForm(null)}
          onSalvo={() => { setForm(null); carregar(); }}
        />
      )}
      {senhaDe && (
        <ModalSenha usuario={senhaDe} onFechar={() => setSenhaDe(null)} onSalvo={() => setSenhaDe(null)} />
      )}
    </div>
  );
}

function ModalUsuario({ usuario, perfis, onFechar, onSalvo }: {
  usuario: { id: string; nome: string; perfilId: string | null; foto: string | null } | null;
  perfis: Perfil[]; onFechar: () => void; onSalvo: () => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const editando = !!usuario;
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfilId, setPerfilId] = useState(usuario?.perfilId ?? '');
  const [foto, setFoto] = useState<string | null>(usuario?.foto ?? null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function escolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (arq.size > 2_000_000) { setErro('usuario.foto_grande'); return; }
    const leitor = new FileReader();
    leitor.onload = () => setFoto(String(leitor.result));
    leitor.readAsDataURL(arq);
  }

  async function salvar() {
    setErro(null); setSalvando(true);
    try {
      if (editando) await api.put('/usuarios/' + usuario!.id, { nome, perfilId: perfilId || null, foto }, token!);
      else await api.post('/usuarios', { nome, email, senha, perfilId: perfilId || null, foto }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editando ? t('usuarios.editar_titulo') : t('usuarios.novo_titulo')}</h2>
        <div className="campo">{t('usuarios.foto')}
          <div className="logo-area">
            <Avatar nome={nome} foto={foto} tamanho={56} />
            <div className="logo-btns">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={escolherFoto} />
              <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>{t('usuarios.foto_enviar')}</button>
              {foto && <button type="button" className="btn-link" onClick={() => setFoto(null)}>{t('usuarios.foto_remover')}</button>}
            </div>
          </div>
        </div>
        <label className="campo">{t('usuarios.nome')}
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </label>
        {!editando && <>
          <label className="campo">{t('usuarios.email')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="campo">{t('usuarios.senha')}
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <small className="hint">{t('usuarios.senha_hint')}</small>
          </label>
        </>}
        <label className="campo">{t('usuarios.perfil')}
          <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}>
            <option value="">{t('usuarios.sem_perfil')}</option>
            {perfis.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}

function ModalSenha({ usuario, onFechar, onSalvo }: { usuario: { id: string; nome: string }; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null); setSalvando(true);
    try { await api.patch('/usuarios/' + usuario.id + '/senha', { senha }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('usuarios.redefinir_senha')} — {usuario.nome}</h2>
        <label className="campo">{t('usuarios.nova_senha')}
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
          <small className="hint">{t('usuarios.senha_hint')}</small>
        </label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
