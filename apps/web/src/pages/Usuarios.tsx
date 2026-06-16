import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Avatar } from '../components/Avatar.js';
import { Ic } from '../components/Icones.js';

interface UsuarioResumo { id: string; nome: string; email: string; ativo: boolean; perfilId: string | null; perfilNome: string | null; foto: string | null; vendedorId: string | null; }
interface Perfil { id: string; nome: string; }

export function Usuarios() {
  const { token, temCapability, superAdmin } = useAuth();
  const { t } = useI18n();
  const podeGerenciar = temCapability('acesso.usuario.gerenciar');
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<{ aberto: boolean; editandoId: string | null } | null>(null);
  const [senhaDe, setSenhaDe] = useState<UsuarioResumo | null>(null);
  const [acessoEmail, setAcessoEmail] = useState<string | null>(null);   // multi-empresa (super-admin)

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
        <div style={{ display: 'flex', gap: 8 }}>
          {superAdmin && <button className="btn-ghost" onClick={() => setAcessoEmail('')}><Ic name="i-shop" className="sm" /> {t('usuarios.acesso_empresas')}</button>}
          {podeGerenciar && <button className="btn-primary" onClick={() => setForm({ aberto: true, editandoId: null })}>+ {t('usuarios.novo')}</button>}
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('usuarios.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr>
            <th>{t('usuarios.nome')}</th><th>{t('usuarios.email')}</th><th>{t('usuarios.perfil')}</th>
            <th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th>
          </tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((u) => (
              <tr key={u.id} className={u.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('usuarios.nome')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar nome={u.nome} foto={u.foto} tamanho={26} />{u.nome}</span></td>
                <td data-label={t('usuarios.email')}>{u.email}</td>
                <td data-label={t('usuarios.perfil')}>{u.perfilNome ? <span className="pill">{u.perfilNome}</span> : <span className="muted">{t('usuarios.sem_perfil')}</span>}</td>
                <td data-label={t('usuarios.situacao')}><span className={u.ativo ? 'pill-ok' : 'pill-off'}>{u.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {podeGerenciar && <span className="acoes-ic">
                    <button className="acao-ic" title={t('common.editar')} onClick={() => setForm({ aberto: true, editandoId: u.id })}><Ic name="i-edit" className="sm" /></button>
                    {superAdmin && <button className="acao-ic" title={t('usuarios.acesso_empresas')} onClick={() => setAcessoEmail(u.email)}><Ic name="i-shop" className="sm" /></button>}
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
      {acessoEmail !== null && (
        <ModalAcessoEmpresas emailInicial={acessoEmail} onFechar={() => setAcessoEmail(null)} onSalvo={() => { setAcessoEmail(null); carregar(); }} />
      )}
    </div>
  );
}

// Super-admin: vincula um login (e-mail) a várias empresas sem recadastrar.
const NOMES_PERFIL = ['Administrador', 'Diretor', 'Comercial', 'Financeiro', 'Estoque'];
interface AcessoInfo { codigo: string; fantasia: string; temAcesso: boolean; existe: boolean; perfilNome: string | null; }

function ModalAcessoEmpresas({ emailInicial, onFechar, onSalvo }: { emailInicial: string; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState(emailInicial);
  const [nome, setNome] = useState('');
  const [perfilNome, setPerfilNome] = useState('Comercial');
  const [senha, setSenha] = useState('');
  const [trocarSenha, setTrocarSenha] = useState(true);
  const [info, setInfo] = useState<AcessoInfo[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregarSituacao(e: string) {
    setErro(null); setOkMsg(null); setCarregando(true);
    try {
      const lista = await api.get<AcessoInfo[]>('/superadmin/usuarios/acessos?email=' + encodeURIComponent(e), token!);
      setInfo(lista);
      setSel(new Set(lista.filter((x) => x.temAcesso).map((x) => x.codigo)));
      const comNome = lista.find((x) => x.existe);
      const comPerfil = lista.find((x) => x.perfilNome);
      if (comPerfil?.perfilNome && NOMES_PERFIL.includes(comPerfil.perfilNome)) setPerfilNome(comPerfil.perfilNome);
      // nome não vem da situação; mantém o que o admin digitar (ou em branco para novo).
      void comNome;
    } catch (er) { setErro((er as ErroApi).chaveI18n); }
    finally { setCarregando(false); }
  }
  useEffect(() => { if (emailInicial && emailInicial.includes('@')) carregarSituacao(emailInicial); /* eslint-disable-next-line */ }, []);

  function toggle(codigo: string) { setSel((s) => { const n = new Set(s); n.has(codigo) ? n.delete(codigo) : n.add(codigo); return n; }); }

  async function salvar() {
    setErro(null); setOkMsg(null); setSalvando(true);
    try {
      await api.put('/superadmin/usuarios/acessos', {
        email, nome, perfilNome, empresas: Array.from(sel), senha: senha || null, trocarSenha,
      }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
      <h2><Ic name="i-shop" /> {t('usuarios.acesso_empresas')}</h2>
      <div className="nota-info" style={{ marginBottom: 10 }}>{t('usuarios.acesso_ajuda')}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <label className="campo" style={{ flex: 1 }}>{t('usuarios.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com" />
        </label>
        <button type="button" className="btn-ghost" disabled={!email.includes('@') || carregando} onClick={() => carregarSituacao(email)}>{t('usuarios.acesso_buscar')}</button>
      </div>
      <label className="campo">{t('usuarios.nome')}
        <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <label className="campo" style={{ flex: 1 }}>{t('usuarios.perfil')}
          <select value={perfilNome} onChange={(e) => setPerfilNome(e.target.value)}>
            {NOMES_PERFIL.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="campo" style={{ flex: 1 }}>{t('usuarios.acesso_senha')}
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder={t('usuarios.acesso_senha_ph')} />
        </label>
      </div>
      <label className="chk-linha"><input type="checkbox" checked={trocarSenha} onChange={(e) => setTrocarSenha(e.target.checked)} /> {t('usuarios.exigir_troca')}</label>

      <div className="campo">{t('usuarios.acesso_empresas_lista')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: 220, overflowY: 'auto' }}>
          {info.length === 0 && <span className="muted">{t('usuarios.acesso_busque')}</span>}
          {info.map((e) => (
            <label key={e.codigo} className="chk-linha" style={{ justifyContent: 'space-between' }}>
              <span><input type="checkbox" checked={sel.has(e.codigo)} onChange={() => toggle(e.codigo)} /> {e.fantasia} <small className="muted">({e.codigo})</small></span>
              {e.temAcesso ? <span className="pill-ok">{e.perfilNome ?? t('usuarios.sem_perfil')}</span> : e.existe ? <span className="pill-off">{t('usuarios.inativo')}</span> : null}
            </label>
          ))}
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {okMsg && <div className="nota-info">{okMsg}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salvando || !email.includes('@') || nome.trim().length < 2} onClick={salvar}>{t('common.salvar')}</button>
      </div>
    </div></div>
  );
}

function ModalUsuario({ usuario, perfis, onFechar, onSalvo }: {
  usuario: { id: string; nome: string; perfilId: string | null; foto: string | null; vendedorId: string | null } | null;
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
  const [vendedorId, setVendedorId] = useState(usuario?.vendedorId ?? '');
  const [vendedores, setVendedores] = useState<{ id: string; nome: string }[]>([]);
  const [trocarSenha, setTrocarSenha] = useState(true);   // 1º acesso: exigir troca (pré-marcado)
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { api.get<{ id: string; nome: string }[]>('/vendedores', token!).then(setVendedores).catch(() => {}); /* eslint-disable-next-line */ }, []);

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
      if (editando) await api.put('/usuarios/' + usuario!.id, { nome, perfilId: perfilId || null, foto, vendedorId: vendedorId || null }, token!);
      else await api.post('/usuarios', { nome, email, senha, perfilId: perfilId || null, foto, vendedorId: vendedorId || null, trocarSenha }, token!);
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
          <label className="chk-linha"><input type="checkbox" checked={trocarSenha} onChange={(e) => setTrocarSenha(e.target.checked)} /> {t('usuarios.exigir_troca')}</label>
        </>}
        <label className="campo">{t('usuarios.perfil')}
          <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}>
            <option value="">{t('usuarios.sem_perfil')}</option>
            {perfis.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('usuarios.vendedor')}
          <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
            <option value="">{t('usuarios.sem_vendedor')}</option>
            {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
          <small className="hint">{t('usuarios.vendedor_hint')}</small>
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
