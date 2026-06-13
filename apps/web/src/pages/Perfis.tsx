import { useEffect, useMemo, useState } from 'react';
import { CAPABILITIES, type Capability } from '@triade/shared';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { FiltroLista, aplicarFiltro, type FiltroStatus } from '../components/FiltroLista.js';

interface Perfil { id: string; nome: string; descricao: string; ativo: boolean; capabilities: string[]; }

export function Perfis() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeGerenciar = temCapability('acesso.perfil.gerenciar');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Perfil | null>(null);
  const [novo, setNovo] = useState(false);
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
        {podeGerenciar && <button className="btn-primary" onClick={abrirNovo}>+ {t('perfis.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <FiltroLista busca={busca} onBusca={setBusca} status={fStatus} onStatus={setFStatus} />
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('perfis.nome')}</th><th>{t('perfis.modulos')}</th><th>{t('perfis.permissoes')}</th><th>{t('usuarios.situacao')}</th><th></th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}{p.descricao && <div className="muted" style={{ fontSize: 12 }}>{p.descricao}</div>}</td>
                <td className="muted">{modulosDe(p.capabilities)}</td>
                <td>{p.capabilities.length} {t('perfis.qtd_permissoes')}</td>
                <td><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
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
    </div>
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
            return (
              <div key={mod} className="perm-mod">
                <label className="perm-mod-head">
                  <input type="checkbox" checked={todos} onChange={() => alternarModulo(lista)} />
                  {t(mod)}
                </label>
                <div className="perm-grid">
                  {lista.map((c) => (
                    <label key={c.id} className="perm-item">
                      <input type="checkbox" checked={caps.includes(c.id)} onChange={() => alternar(c.id)} />
                      {t(c.labelChave)}
                    </label>
                  ))}
                </div>
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
