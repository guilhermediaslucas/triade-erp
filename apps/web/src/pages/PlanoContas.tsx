import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';

type TipoConta = 'receita' | 'despesa' | 'ativo' | 'passivo';
const TIPOS: TipoConta[] = ['receita', 'despesa', 'ativo', 'passivo'];
interface Conta { id: string; codigo: string; descricao: string; tipo: TipoConta; paiId: string | null; ativo: boolean; }

export function PlanoContas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('cadastros.catfin.gerenciar');
  const [itens, setItens] = useState<Conta[]>([]);
  const [busca, setBusca] = useState('');
  const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Conta | null>(null);

  async function carregar() { try { setItens(await api.get<Conta[]>('/contas-contabeis', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(c: Conta) { try { await api.patch('/contas-contabeis/' + c.id + '/ativo', { ativo: !c.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const nomePai = (id: string | null) => (id ? (itens.find((x) => x.id === id)?.codigo ?? '—') : '—');
  const filtrados = itens.filter((c) => {
    if (statusF === 'ativos' && !c.ativo) return false;
    if (statusF === 'inativos' && c.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); if (!(`${c.codigo} ${c.descricao}`).toLowerCase().includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('plano.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('plano.titulo')}</h1><div className="muted page-sub">{t('plano.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', codigo: '', descricao: '', tipo: 'despesa', paiId: null, ativo: true })}>+ {t('plano.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('plano.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('plano.codigo')}</th><th>{t('plano.descricao')}</th><th>{t('plano.tipo')}</th><th>{t('plano.pai')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((c) => (
              <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('plano.codigo')}><b>{c.codigo}</b></td>
                <td data-label={t('plano.descricao')}>{c.descricao}</td>
                <td data-label={t('plano.tipo')}><span className="muted">{t('plano.tipo_' + c.tipo)}</span></td>
                <td data-label={t('plano.pai')} className="muted">{nomePai(c.paiId)}</td>
                <td data-label={t('usuarios.situacao')}><span className={c.ativo ? 'pill-ok' : 'pill-off'}>{c.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...c })}><Ic name="i-edit" className="sm" /></button>
                  <button className="acao-ic danger" title={c.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(c)}><Ic name="i-trash" className="sm" /></button>
                </>}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalConta c={edit} contas={itens} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); toast(t('common.salvo')); }} />}
    </div>
  );
}

function ModalConta({ c, contas, onFechar, onSalvo }: { c: Conta; contas: Conta[]; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !c.id;
  const [codigo, setCodigo] = useState(c.codigo);
  const [descricao, setDescricao] = useState(c.descricao);
  const [tipo, setTipo] = useState<TipoConta>(c.tipo);
  const [paiId, setPaiId] = useState<string>(c.paiId ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { codigo, descricao, tipo, paiId: paiId || null };
    try {
      if (novo) await api.post('/contas-contabeis', corpo, token!);
      else await api.put('/contas-contabeis/' + c.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('plano.nova') : t('common.editar')}</h2>
        <div className="cores-grid">
          <label className="campo">{t('plano.codigo')}<input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="3.1.01" autoFocus /></label>
          <label className="campo">{t('plano.tipo')}
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoConta)}>
              {TIPOS.map((tp) => <option key={tp} value={tp}>{t('plano.tipo_' + tp)}</option>)}
            </select>
          </label>
        </div>
        <label className="campo">{t('plano.descricao')}<input value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
        <label className="campo">{t('plano.pai')}
          <select value={paiId} onChange={(e) => setPaiId(e.target.value)}>
            <option value="">{t('plano.sem_pai')}</option>
            {contas.filter((x) => x.id !== c.id).map((x) => <option key={x.id} value={x.id}>{x.codigo} · {x.descricao}</option>)}
          </select>
        </label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
