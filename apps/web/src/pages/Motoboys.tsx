import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Motoboy { id: string; nome: string; telefone: string | null; ativo: boolean; }
interface FreteConfig { kmRate: number; minMotoboy: number; }

export function Motoboys() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.motoboy.gerenciar');
  const [itens, setItens] = useState<Motoboy[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Motoboy | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() {
    try { setItens(await api.get<Motoboy[]>('/motoboys', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: Motoboy) {
    try { await api.patch('/motoboys/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const filtrados = itens.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.fantasia, x.documento, x.email, x.telefone].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('motoboys.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('motoboys.titulo')}</h1><div className="muted page-sub">{t('motoboys.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', telefone: '', ativo: true })}>+ {t('motoboys.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <ConfigFrete pode={pode} />

      <div className="toolbar">
        <div className="busca-box-tb">🔎<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('motoboys.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('motoboys.nome')}</th><th>{t('motoboys.telefone')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td>{m.nome}</td>
                <td>{m.telefone ?? '—'}</td>
                <td><span className={m.ativo ? 'pill-ok' : 'pill-off'}>{m.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...m })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(m)}>{m.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalMotoboy m={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ConfigFrete({ pode }: { pode: boolean }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [cfg, setCfg] = useState<FreteConfig | null>(null);
  const [kmRate, setKmRate] = useState('');
  const [minMotoboy, setMinMotoboy] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<FreteConfig>('/frete/config', token!).then((c) => { setCfg(c); setKmRate(String(c.kmRate)); setMinMotoboy(String(c.minMotoboy)); }).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function salvar() {
    setErro(null); setMsg(null);
    try {
      const c = await api.put<FreteConfig>('/frete/config', { kmRate: Number(kmRate), minMotoboy: Number(minMotoboy) }, token!);
      setCfg(c); setMsg('motoboys.cfg_ok');
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  if (!cfg) return null;
  return (
    <div className="card" style={{ marginBottom: 14, maxWidth: 560 }}>
      <div className="perm-titulo">{t('motoboys.cfg_titulo')}</div>
      <p className="muted" style={{ marginTop: 0, fontSize: 12 }}>{t('motoboys.cfg_sub')}</p>
      <div className="cores-grid">
        <label className="campo">{t('motoboys.km_rate')}
          <input type="number" min="0" step="0.01" value={kmRate} disabled={!pode} onChange={(e) => setKmRate(e.target.value)} /></label>
        <label className="campo">{t('motoboys.min_motoboy')}
          <input type="number" min="0" step="0.01" value={minMotoboy} disabled={!pode} onChange={(e) => setMinMotoboy(e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {msg && <div className="alerta-ok">{t(msg)}</div>}
      {pode && <div className="modal-acoes"><button className="btn-primary btn-mini" onClick={salvar}>{t('common.salvar')}</button></div>}
    </div>
  );
}

function ModalMotoboy({ m, onFechar, onSalvo }: { m: Motoboy; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !m.id;
  const [nome, setNome] = useState(m.nome);
  const [telefone, setTelefone] = useState(m.telefone ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      if (novo) await api.post('/motoboys', { nome, telefone }, token!);
      else await api.put('/motoboys/' + m.id, { nome, telefone }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('motoboys.novo') : t('common.editar')}</h2>
        <label className="campo">{t('motoboys.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="campo">{t('motoboys.telefone')}<input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
