import { useEffect, useMemo, useState } from 'react';
import { CAPABILITIES, type Capability } from '@triade/shared';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Perfil { id: string; nome: string; capabilities: string[]; }

export function Perfis() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeGerenciar = temCapability('acesso.perfil.gerenciar');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Perfil | null>(null);
  const [novo, setNovo] = useState(false);

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

  function abrirNovo() { setEditando({ id: '', nome: '', capabilities: [] }); setNovo(true); }
  function abrirEdicao(p: Perfil) { setEditando({ ...p, capabilities: [...p.capabilities] }); setNovo(false); }

  return (
    <div>
      <div className="crumb">{t('perfis.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('perfis.titulo')}</h1><div className="muted page-sub">{t('perfis.sub')}</div></div>
        {podeGerenciar && <button className="btn-primary" onClick={abrirNovo}>+ {t('perfis.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('perfis.nome')}</th><th>{t('perfis.modulos')}</th><th>{t('perfis.permissoes')}</th><th></th></tr></thead>
          <tbody>
            {perfis.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {perfis.map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td className="muted">{modulosDe(p.capabilities)}</td>
                <td>{p.capabilities.length} {t('perfis.qtd_permissoes')}</td>
                <td className="acoes">
                  {podeGerenciar && <button className="btn-link" onClick={() => abrirEdicao(p)}>{t('common.editar')}</button>}
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
  const [caps, setCaps] = useState<string[]>(perfil.capabilities);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function alternar(id: string) {
    setCaps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  async function salvar() {
    setErro(null); setSalvando(true);
    try {
      if (novo) await api.post('/perfis', { nome, capabilities: caps }, token!);
      else await api.put('/perfis/' + perfil.id, { nome, capabilities: caps }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalvando(false); }
  }

  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('perfis.novo_titulo') : t('perfis.editar_titulo')}</h2>
        <label className="campo">{t('perfis.nome')}
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </label>
        <div className="perm-titulo">{t('perfis.permissoes')}</div>
        <div className="perm-lista">
          {Object.entries(porModulo).map(([mod, lista]) => (
            <div key={mod} className="perm-grupo">
              <div className="perm-modulo">{t(mod)}</div>
              {lista.map((c) => (
                <label key={c.id} className="perm-item">
                  <input type="checkbox" checked={caps.includes(c.id)} onChange={() => alternar(c.id)} />
                  {t(c.labelChave)}
                </label>
              ))}
            </div>
          ))}
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
