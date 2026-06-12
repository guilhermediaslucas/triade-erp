import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

type Tipo = 'PF' | 'PJ';
interface Favorecido {
  id: string; nome: string; tipoPessoa: Tipo; documento: string | null;
  chavePix: string | null; banco: string | null; agencia: string | null; conta: string | null;
  observacao: string | null; ativo: boolean;
}
const vazio: Favorecido = { id: '', nome: '', tipoPessoa: 'PF', documento: '', chavePix: '', banco: '', agencia: '', conta: '', observacao: '', ativo: true };

export function Favorecidos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.favorecido.gerenciar');
  const [itens, setItens] = useState<Favorecido[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Favorecido | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() {
    try { setItens(await api.get<Favorecido[]>('/favorecidos', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(f: Favorecido) {
    try { await api.patch('/favorecidos/' + f.id + '/ativo', { ativo: !f.ativo }, token!); carregar(); }
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
      <div className="crumb">{t('favorecidos.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('favorecidos.titulo')}</h1><div className="muted page-sub">{t('favorecidos.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ ...vazio })}>+ {t('favorecidos.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb">🔎<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('favorecidos.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('favorecidos.nome')}</th><th>{t('favorecidos.tipo')}</th><th>{t('favorecidos.documento')}</th><th>{t('favorecidos.pix')}</th><th>{t('favorecidos.banco')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((f) => (
              <tr key={f.id} className={f.ativo ? '' : 'linha-inativa'}>
                <td>{f.nome}</td>
                <td>{f.tipoPessoa}</td>
                <td>{f.documento ?? '—'}</td>
                <td>{f.chavePix ?? '—'}</td>
                <td>{f.banco ?? '—'}</td>
                <td><span className={f.ativo ? 'pill-ok' : 'pill-off'}>{f.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...f, documento: f.documento ?? '', chavePix: f.chavePix ?? '', banco: f.banco ?? '', agencia: f.agencia ?? '', conta: f.conta ?? '', observacao: f.observacao ?? '' })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(f)}>{f.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalFavorecido f={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalFavorecido({ f, onFechar, onSalvo }: { f: Favorecido; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !f.id;
  const [d, setD] = useState<Favorecido>(f);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const set = (campo: keyof Favorecido) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [campo]: e.target.value }));

  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: d.nome, tipoPessoa: d.tipoPessoa, documento: d.documento, chavePix: d.chavePix, banco: d.banco, agencia: d.agencia, conta: d.conta, observacao: d.observacao };
    try {
      if (novo) await api.post('/favorecidos', corpo, token!);
      else await api.put('/favorecidos/' + f.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('favorecidos.novo') : t('common.editar')}</h2>
        <label className="campo">{t('favorecidos.nome')}<input value={d.nome} onChange={set('nome')} autoFocus /></label>
        <div className="form-linha">
          <label className="campo">{t('favorecidos.tipo')}
            <select value={d.tipoPessoa} onChange={(e) => setD((x) => ({ ...x, tipoPessoa: e.target.value as Tipo }))}>
              <option value="PF">{t('favorecidos.pf')}</option><option value="PJ">{t('favorecidos.pj')}</option>
            </select>
          </label>
          <label className="campo">{t('favorecidos.documento')}<input value={d.documento ?? ''} onChange={set('documento')} /></label>
        </div>
        <label className="campo">{t('favorecidos.pix')}<input value={d.chavePix ?? ''} onChange={set('chavePix')} /></label>
        <div className="form-linha">
          <label className="campo">{t('favorecidos.banco')}<input value={d.banco ?? ''} onChange={set('banco')} /></label>
          <label className="campo">{t('favorecidos.agencia')}<input value={d.agencia ?? ''} onChange={set('agencia')} /></label>
          <label className="campo">{t('favorecidos.conta')}<input value={d.conta ?? ''} onChange={set('conta')} /></label>
        </div>
        <label className="campo">{t('favorecidos.observacao')}<input value={d.observacao ?? ''} onChange={set('observacao')} /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
