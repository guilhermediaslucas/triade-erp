import { useEffect, useMemo, useState } from 'react';
import { CAPABILITIES, type Capability } from '@triade/shared';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { FiltroLista, aplicarFiltro, type FiltroStatus } from '../components/FiltroLista.js';

interface Perfil { id: string; nome: string; descricao: string; ativo: boolean; capabilities: string[]; }

export function Perfis() {
  const { token, temCapability, superAdmin } = useAuth();
  const { t } = useI18n();
  const podeGerenciar = temCapability('acesso.perfil.gerenciar');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Perfil | null>(null);
  const [novo, setNovo] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [fStatus, setFStatus] = useState<FiltroStatus>('todos');
  const filtrados = aplicarFiltro(perfis, busca, fStatus, (p) => p.nome + ' ' + p.descricao);

  const porModulo = useMemo(() => {
    const m: Record<string, Capability[]> = {};
    for (const c of CAPABILITIES) (m[c.moduloChave] ??= []).push(c);
    return m;
  }, []);
  const capModulo = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of CAPABILITIES) m[c.id] = c.moduloChave;
    return m;
  }, []);
  const todosModulos = useMemo(() => new Set(CAPABILITIES.map((c) => c.moduloChave)).size, []);
  const modulosDe = (caps: string[]) => {
    const set = new Set<string>();
    for (const id of caps) { const mch = capModulo[id]; if (mch) set.add(mch); }
    if (set.size === todosModulos && todosModulos > 0) return t('perfis.todos_modulos');
    return Array.from(set).map((mch) => t(mch)).join(', ') || '—';
  };

  async function carregar() {
    try { setPerfis(await api.get<Perfil[]>('/perfis', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  function abrirNovo() { setEditando({ id: '', nome: '', descricao: '', ativo: true, capabilities: [] }); setNovo(true); }
  function abrirEdicao(p: Perfil) { setEditando({ ...p, capabilities: [...p.capabilities] }); setNovo(false); }

  return (
    <div>
      <div className="crumb">{t('perfis.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('perfis.titulo')}</h1><div className="muted page-sub">{t('perfis.sub')}</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {superAdmin && <button className="btn-ghost" onClick={() => setMultiOpen(true)}><Ic name="i-shop" className="sm" /> {t('perfis.multi')}</button>}
          {podeGerenciar && <button className="btn-primary" onClick={abrirNovo}>+ {t('perfis.novo')}</button>}
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <FiltroLista busca={busca} onBusca={setBusca} status={fStatus} onStatus={setFStatus} />
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('perfis.nome')}</th><th>{t('perfis.modulos')}</th><th>{t('perfis.permissoes')}</th><th>{t('usuarios.situacao')}</th><th></th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td data-label={t('perfis.nome')}>{p.nome}{p.descricao && <div className="muted" style={{ fontSize: 12 }}>{p.descricao}</div>}</td>
                <td data-label={t('perfis.modulos')} className="muted">{modulosDe(p.capabilities)}</td>
                <td data-label={t('perfis.permissoes')}>{p.capabilities.length} {t('perfis.qtd_permissoes')}</td>
                <td data-label={t('usuarios.situacao')}><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {podeGerenciar && <span className="acoes-ic"><button className="acao-ic" title={t('common.editar')} onClick={() => abrirEdicao(p)}><Ic name="i-edit" className="sm" /></button></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <ModalPerfil
          perfil={editando} novo={novo} porModulo={porModulo}
          onFechar={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
      {multiOpen && <ModalPerfilMulti porModulo={porModulo} onFechar={() => setMultiOpen(false)} onSalvo={() => { setMultiOpen(false); carregar(); }} />}
    </div>
  );
}

interface PerfilEmpresaInfo { codigo: string; fantasia: string; existe: boolean; ativo: boolean; qtdCaps: number; }
interface SituacaoPerfil { empresas: PerfilEmpresaInfo[]; modelo: { descricao: string; capabilities: string[] } | null; }

// Super-admin: cria/atualiza o mesmo perfil (nome + permissões) em várias empresas de uma vez.
function ModalPerfilMulti({ porModulo, onFechar, onSalvo }: {
  porModulo: Record<string, Capability[]>; onFechar: () => void; onSalvo: () => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [caps, setCaps] = useState<string[]>([]);
  const [empresas, setEmpresas] = useState<PerfilEmpresaInfo[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function toggleMod(mod: string) { setAbertos((s) => { const n = new Set(s); n.has(mod) ? n.delete(mod) : n.add(mod); return n; }); }
  function alternar(id: string) { setCaps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])); }
  function alternarModulo(lista: Capability[]) {
    const ids = lista.map((c) => c.id);
    const todos = ids.every((id) => caps.includes(id));
    setCaps((c) => (todos ? c.filter((x) => !ids.includes(x)) : [...new Set([...c, ...ids])]));
  }
  function toggleEmp(codigo: string) { setSel((s) => { const n = new Set(s); n.has(codigo) ? n.delete(codigo) : n.add(codigo); return n; }); }

  async function buscar(nomeAtual: string) {
    setErro(null); setCarregando(true);
    try {
      const s = await api.get<SituacaoPerfil>('/superadmin/perfis/empresas?nome=' + encodeURIComponent(nomeAtual), token!);
      setEmpresas(s.empresas);
      // pré-seleciona onde já existe; pré-preenche permissões/descrição pelo modelo encontrado.
      setSel(new Set(s.empresas.filter((e) => e.existe).map((e) => e.codigo)));
      if (s.modelo) { setCaps([...s.modelo.capabilities]); setDescricao(s.modelo.descricao); }
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setCarregando(false); }
  }
  useEffect(() => { buscar(''); /* eslint-disable-next-line */ }, []);

  async function salvar() {
    setErro(null); setSalvando(true);
    try {
      await api.put('/superadmin/perfis/empresas', { nome, descricao, capabilities: caps, empresas: Array.from(sel) }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2><Ic name="i-shop" /> {t('perfis.multi')}</h2>
      <div className="nota-info" style={{ marginBottom: 10 }}>{t('perfis.multi_ajuda')}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <label className="campo" style={{ flex: 1 }}>{t('perfis.nome')}
          <input value={nome} onChange={(e) => setNome(e.target.value)} onBlur={() => nome.trim().length >= 2 && buscar(nome)} autoFocus />
        </label>
        <button type="button" className="btn-ghost" disabled={nome.trim().length < 2 || carregando} onClick={() => buscar(nome)}>{t('perfis.multi_buscar')}</button>
      </div>
      <label className="campo">{t('perfis.descricao')}
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t('perfis.descricao_ph')} />
      </label>

      <div className="perm-titulo">{t('perfis.telas_liberadas')}</div>
      <div className="perm-mods">
        {Object.entries(porModulo).map(([mod, lista]) => {
          const ids = lista.map((c) => c.id);
          const todos = ids.every((id) => caps.includes(id));
          const marcadas = ids.filter((id) => caps.includes(id)).length;
          const aberto = abertos.has(mod);
          return (
            <div key={mod} className="perm-mod">
              <div className="perm-mod-head">
                <button type="button" className="perm-mod-tg" onClick={() => toggleMod(mod)} aria-label={aberto ? '−' : '+'}>{aberto ? '−' : '+'}</button>
                <input type="checkbox" checked={todos} onChange={() => alternarModulo(lista)} />
                <span className="perm-mod-nome" onClick={() => toggleMod(mod)}>{t(mod)}</span>
                <span className="perm-mod-ct">{marcadas}/{lista.length}</span>
              </div>
              {aberto && (
                <div className="perm-grid">
                  {lista.map((c) => (
                    <label key={c.id} className="perm-item">
                      <input type="checkbox" checked={caps.includes(c.id)} onChange={() => alternar(c.id)} />
                      {t(c.labelChave)}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="campo">{t('perfis.multi_empresas')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: 220, overflowY: 'auto' }}>
          {empresas.length === 0 && <span className="muted">{carregando ? t('common.carregando') : t('perfis.multi_vazio')}</span>}
          {empresas.map((e) => (
            <label key={e.codigo} className="chk-linha" style={{ justifyContent: 'space-between' }}>
              <span><input type="checkbox" checked={sel.has(e.codigo)} onChange={() => toggleEmp(e.codigo)} /> {e.fantasia} <small className="muted">({e.codigo})</small></span>
              {e.existe ? <span className="pill-ok">{t('perfis.multi_existe')} · {e.qtdCaps}</span> : sel.has(e.codigo) ? <span className="pill-off">{t('perfis.multi_novo')}</span> : null}
            </label>
          ))}
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salvando || nome.trim().length < 2 || sel.size === 0} onClick={salvar}>{t('perfis.multi_aplicar')}</button>
      </div>
    </div></div>
  );
}

function ModalPerfil({ perfil, novo, porModulo, onFechar, onSalvo }: {
  perfil: Perfil; novo: boolean; porModulo: Record<string, Capability[]>;
  onFechar: () => void; onSalvo: () => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [nome, setNome] = useState(perfil.nome);
  const [descricao, setDescricao] = useState(perfil.descricao);
  const [ativo, setAtivo] = useState(perfil.ativo);
  const [caps, setCaps] = useState<string[]>(perfil.capabilities);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  // Módulos começam recolhidos; abre só o que quer editar (expansão +/−).
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  function toggleMod(mod: string) { setAbertos((s) => { const n = new Set(s); n.has(mod) ? n.delete(mod) : n.add(mod); return n; }); }

  function alternar(id: string) {
    setCaps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function alternarModulo(lista: Capability[]) {
    const ids = lista.map((c) => c.id);
    const todos = ids.every((id) => caps.includes(id));
    setCaps((c) => (todos ? c.filter((x) => !ids.includes(x)) : [...new Set([...c, ...ids])]));
  }

  async function salvar() {
    setErro(null); setSalvando(true);
    try {
      const corpo = { nome, descricao, ativo, capabilities: caps };
      if (novo) await api.post('/perfis', corpo, token!);
      else await api.put('/perfis/' + perfil.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('perfis.novo_titulo') : t('perfis.editar_titulo')}</h2>
        <label className="campo">{t('perfis.nome')}
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </label>
        <label className="login-lembrar" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> {t('perfis.ativo_label')}
        </label>
        <label className="campo">{t('perfis.descricao')}
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t('perfis.descricao_ph')} />
        </label>

        <div className="perm-titulo">{t('perfis.telas_liberadas')}</div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t('perfis.telas_hint')}</div>
        <div className="perm-mods">
          {Object.entries(porModulo).map(([mod, lista]) => {
            const ids = lista.map((c) => c.id);
            const todos = ids.every((id) => caps.includes(id));
            const marcadas = ids.filter((id) => caps.includes(id)).length;
            const aberto = abertos.has(mod);
            return (
              <div key={mod} className="perm-mod">
                <div className="perm-mod-head">
                  <button type="button" className="perm-mod-tg" onClick={() => toggleMod(mod)} aria-label={aberto ? '−' : '+'}>{aberto ? '−' : '+'}</button>
                  <input type="checkbox" checked={todos} onChange={() => alternarModulo(lista)} />
                  <span className="perm-mod-nome" onClick={() => toggleMod(mod)}>{t(mod)}</span>
                  <span className="perm-mod-ct">{marcadas}/{lista.length}</span>
                </div>
                {aberto && (
                  <div className="perm-grid">
                    {lista.map((c) => (
                      <label key={c.id} className="perm-item">
                        <input type="checkbox" checked={caps.includes(c.id)} onChange={() => alternar(c.id)} />
                        {t(c.labelChave)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
