import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface FormaEntrega { id: string; nome: string; tipo: string; prazo: string | null; observacao: string | null; ativo: boolean; }
const TIPOS = ['motoboy', 'correios', 'retirada', 'transportadora', 'propria'];

export function FormasEntrega() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.forma_entrega.gerenciar');
  const [itens, setItens] = useState<FormaEntrega[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<FormaEntrega | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() {
    try { setItens(await api.get<FormaEntrega[]>('/formas-entrega', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: FormaEntrega) {
    try { await api.patch('/formas-entrega/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const filtrados = itens.filter((x) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.prazo, x.observacao].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('formas_entrega.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('formas_entrega.titulo')}</h1><div className="muted page-sub">{t('formas_entrega.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', tipo: 'motoboy', prazo: '', observacao: '', ativo: true })}>+ {t('formas_entrega.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('formas_entrega.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('formas_entrega.nome')}</th><th>{t('formas_entrega.tipo')}</th><th>{t('formas_entrega.prazo')}</th><th>{t('formas_entrega.obs')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('formas_entrega.nome')}>{m.nome}</td>
                <td data-label={t('formas_entrega.tipo')}><span className="pill">{t('forma_entrega.tipo_' + m.tipo)}</span></td>
                <td data-label={t('formas_entrega.prazo')}>{m.prazo ?? '—'}</td>
                <td data-label={t('formas_entrega.obs')}>{m.observacao ?? '—'}</td>
                <td data-label={t('usuarios.situacao')}><span className={m.ativo ? 'pill-ok' : 'pill-off'}>{m.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...m })}><Ic name="i-edit" className="sm" /></button>
                  <button className="acao-ic danger" title={m.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(m)}><Ic name="i-trash" className="sm" /></button>
                </>}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalForma m={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalForma({ m, onFechar, onSalvo }: { m: FormaEntrega; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !m.id;
  const [nome, setNome] = useState(m.nome);
  const [tipo, setTipo] = useState(m.tipo || 'motoboy');
  const [prazo, setPrazo] = useState(m.prazo ?? '');
  const [observacao, setObs] = useState(m.observacao ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    const body = { nome, tipo, prazo, observacao };
    try {
      if (novo) await api.post('/formas-entrega', body, token!);
      else await api.put('/formas-entrega/' + m.id, body, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('formas_entrega.nova') : t('common.editar')}</h2>
        <label className="campo">{t('formas_entrega.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="campo">{t('formas_entrega.tipo')}
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((tp) => <option key={tp} value={tp}>{t('forma_entrega.tipo_' + tp)}</option>)}
          </select>
        </label>
        <label className="campo">{t('formas_entrega.prazo')}<input value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder={t('formas_entrega.prazo_ph')} /></label>
        <label className="campo">{t('formas_entrega.obs')}<input value={observacao} onChange={(e) => setObs(e.target.value)} /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
