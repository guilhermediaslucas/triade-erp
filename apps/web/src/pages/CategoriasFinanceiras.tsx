import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';

type TipoCat = 'receita' | 'despesa';
interface Cat { id: string; nome: string; tipo: TipoCat; ativo: boolean; }

export function CategoriasFinanceiras() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('cadastros.catfin.gerenciar');
  const [itens, setItens] = useState<Cat[]>([]);
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

  return (
    <div>
      <div className="crumb">{t('catfin.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('catfin.titulo')}</h1><div className="muted page-sub">{t('catfin.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', tipo: 'despesa', ativo: true })}>+ {t('catfin.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('catfin.nome')}</th><th>{t('catfin.tipo')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((c) => (
              <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
                <td>{c.nome}</td>
                <td><span className={'pill ' + (c.tipo === 'receita' ? 'st-verde' : 'st-laranja')}>{t('catfin.' + c.tipo)}</span></td>
                <td><span className={c.ativo ? 'pill-ok' : 'pill-off'}>{c.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...c })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(c)}>{c.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
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
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      if (novo) await api.post('/categorias-financeiras', { nome, tipo }, token!);
      else await api.put('/categorias-financeiras/' + c.id, { nome, tipo }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('catfin.nova') : t('common.editar')}</h2>
        <label className="campo">{t('catfin.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="campo">{t('catfin.tipo')}
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCat)}>
            <option value="despesa">{t('catfin.despesa')}</option>
            <option value="receita">{t('catfin.receita')}</option>
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
