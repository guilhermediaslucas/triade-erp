import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';

type TipoCat = 'receita' | 'despesa';
interface Cat { id: string; nome: string; tipo: TipoCat; ativo: boolean; contaContabilId: string | null; }
interface ContaContabil { id: string; codigo: string; descricao: string; tipo: string; ativo: boolean; }

export function CategoriasFinanceiras() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('cadastros.catfin.gerenciar');
  const [itens, setItens] = useState<Cat[]>([]);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Cat | null>(null);

  async function carregar() {
    try { setItens(await api.get<Cat[]>('/categorias-financeiras', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(c: Cat) {
    try { await api.patch('/categorias-financeiras/' + c.id + '/ativo', { ativo: !c.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const filtrados = itens.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.email, x.perfilNome].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('catfin.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('catfin.titulo')}</h1><div className="muted page-sub">{t('catfin.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', tipo: 'despesa', ativo: true, contaContabilId: null })}>+ {t('catfin.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('catfin.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('catfin.nome')}</th><th>{t('catfin.tipo')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((c) => (
              <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('catfin.nome')}>{c.nome}</td>
                <td data-label={t('catfin.tipo')}><span className={'pill ' + (c.tipo === 'receita' ? 'st-verde' : 'st-laranja')}>{t('catfin.' + c.tipo)}</span></td>
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
      {edit && <ModalCat c={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); toast(t('common.salvo')); }} />}
    </div>
  );
}

function ModalCat({ c, onFechar, onSalvo }: { c: Cat; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !c.id;
  const [nome, setNome] = useState(c.nome);
  const [tipo, setTipo] = useState<TipoCat>(c.tipo);
  const [contaContabilId, setContaContabilId] = useState<string>(c.contaContabilId ?? '');
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  useEffect(() => { api.get<ContaContabil[]>('/contas-contabeis', token!).then((l) => setContas(l.filter((x) => x.ativo))).catch(() => {}); /* eslint-disable-next-line */ }, []);
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome, tipo, contaContabilId: contaContabilId || null };
    try {
      if (novo) await api.post('/categorias-financeiras', corpo, token!);
      else await api.put('/categorias-financeiras/' + c.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('catfin.nova') : t('common.editar')}</h2>
        <label className="campo">{t('catfin.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="campo">{t('catfin.tipo')}
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCat)}>
            <option value="despesa">{t('catfin.despesa')}</option>
            <option value="receita">{t('catfin.receita')}</option>
          </select>
        </label>
        <label className="campo">{t('catfin.conta_contabil')}
          <select value={contaContabilId} onChange={(e) => setContaContabilId(e.target.value)}>
            <option value="">{t('catfin.sem_conta')}</option>
            {contas.map((cc) => <option key={cc.id} value={cc.id}>{cc.codigo} · {cc.descricao}</option>)}
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
