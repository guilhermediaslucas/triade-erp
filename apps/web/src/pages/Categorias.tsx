import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Categoria { id: string; nome: string; }

export function Categorias() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.categoria.gerenciar');
  const [itens, setItens] = useState<Categoria[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Categoria | null>(null);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try { setItens(await api.get<Categoria[]>('/categorias', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const filtrados = itens.filter((x: any) => {
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.fantasia, x.documento, x.email, x.telefone].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('categorias.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('categorias.titulo')}</h1><div className="muted page-sub">{t('categorias.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '' })}>+ {t('categorias.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb">🔎<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('categorias.buscar')} /></div>
        
      </div>
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('categorias.nome')}</th><th></th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={2} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((c) => (
              <tr key={c.id}><td>{c.nome}</td>
                <td className="acoes">{pode && <button className="btn-link" onClick={() => setEdit({ ...c })}>{t('common.editar')}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalCategoria cat={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalCategoria({ cat, onFechar, onSalvo }: { cat: Categoria; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !cat.id;
  const [nome, setNome] = useState(cat.nome);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      if (novo) await api.post('/categorias', { nome }, token!);
      else await api.put('/categorias/' + cat.id, { nome }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('categorias.nova') : t('common.editar')}</h2>
        <label className="campo">{t('categorias.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
