import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Condicao { id: string; nome: string; parcelas: number; intervaloDias: number; ativo: boolean; }
const vazio = (): Condicao => ({ id: '', nome: '', parcelas: 1, intervaloDias: 30, ativo: true });

export function Condicoes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.condicao.gerenciar');
  const [itens, setItens] = useState<Condicao[]>([]);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Condicao | null>(null);

  async function carregar() { try { setItens(await api.get('/condicoes', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(c: Condicao) { try { await api.patch('/condicoes/' + c.id + '/ativo', { ativo: !c.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const filtrados = itens.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.email, x.perfilNome].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('cond.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('cond.titulo')}</h1><div className="muted page-sub">{t('cond.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('cond.nova')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('cond.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0"><table className="tabela tabela-cards">
        <thead><tr><th>{t('categorias.nome')}</th><th>{t('cond.parcelas')}</th><th>{t('cond.intervalo')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
          {filtrados.map((c) => (
            <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
              <td data-label={t('categorias.nome')}>{c.nome}</td><td data-label={t('cond.parcelas')}>{c.parcelas}x</td><td data-label={t('cond.intervalo')}>{c.intervaloDias} {t('cond.dias')}</td>
              <td data-label={t('usuarios.situacao')}><span className={c.ativo ? 'pill-ok' : 'pill-off'}>{c.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <><button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...c })}><Ic name="i-edit" className="sm" /></button><button className="acao-ic danger" title={c.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(c)}><Ic name="i-trash" className="sm" /></button></>}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <ModalCond c={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalCond({ c, onFechar, onSalvo }: { c: Condicao; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !c.id; const [v, setV] = useState(c);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (k: keyof Condicao, val: any) => setV({ ...v, [k]: val });
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: v.nome, parcelas: Number(v.parcelas), intervaloDias: Number(v.intervaloDias) };
    try { if (novo) await api.post('/condicoes', corpo, token!); else await api.put('/condicoes/' + c.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('cond.nova') : t('common.editar')}</h2>
      <label className="campo">{t('categorias.nome')}<input value={v.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: À vista, 30/60/90" autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('cond.parcelas')}<input type="number" min="1" max="99" value={v.parcelas} onChange={(e) => set('parcelas', e.target.value)} /></label>
        <label className="campo">{t('cond.intervalo')} ({t('cond.dias')})<input type="number" min="0" value={v.intervaloDias} onChange={(e) => set('intervaloDias', e.target.value)} /></label>
      </div>
      <div className="nota-info">{t('cond.dica')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
