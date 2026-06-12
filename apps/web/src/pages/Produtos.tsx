import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Categoria { id: string; nome: string; }
interface Produto {
  id: string; nome: string; categoriaId: string | null; categoriaNome: string | null;
  unidade: string; estoqueMinimo: number; localizacao: string | null; registroAnvisa: string | null; ativo: boolean;
}
const UNIDADES = ['UN', 'CX', 'ML', 'G', 'KG', 'FR', 'AMP'];
const TINTS = ['tint-pp', 'tint-bl', 'tint-or', 'tint-gr', 'tint-in', 'tint-rd'];
const vazio = (): Produto => ({ id: '', nome: '', categoriaId: '', categoriaNome: null, unidade: 'UN', estoqueMinimo: 0, localizacao: '', registroAnvisa: '', ativo: true });

export function Produtos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.produto.gerenciar');
  const [itens, setItens] = useState<Produto[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Produto | null>(null);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('');

  async function carregar() {
    try {
      setItens(await api.get('/produtos', token!));
      if (temCapability('cadastros.categoria.listar')) setCats(await api.get('/categorias', token!));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(p: Produto) { try { await api.patch('/produtos/' + p.id + '/ativo', { ativo: !p.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const tintDe = (catId: string | null) => {
    const i = cats.findIndex((c) => c.id === catId);
    return i < 0 ? 'tint-bl' : TINTS[i % TINTS.length];
  };
  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((p) => {
      if (q && !p.nome.toLowerCase().includes(q)) return false;
      if (catFiltro && p.categoriaId !== catFiltro) return false;
      return true;
    });
  }, [itens, busca, catFiltro]);

  // Formulário em página inteira (espelha o mockup) — substitui a lista enquanto edita.
  if (edit) return <FormProduto prod={edit} cats={cats} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />;

  return (
    <div>
      <div className="crumb">{t('produtos.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('produtos.titulo')}</h1><div className="muted page-sub">{t('produtos.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('produtos.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar">
        <div className="busca-box-tb"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('produtos.buscar')} /></div>
        <span className={'chip-f' + (catFiltro === '' ? ' on' : '')} onClick={() => setCatFiltro('')}>{t('produtos.todas_cat')}</span>
        {cats.map((c) => (
          <span key={c.id} className={'chip-f' + (catFiltro === c.id ? ' on' : '')} onClick={() => setCatFiltro(c.id)}>{c.nome}</span>
        ))}
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('produtos.nome')}</th><th>{t('produtos.categoria')}</th><th>{t('produtos.unidade')}</th><th>{t('produtos.minimo')}</th><th>{t('produtos.local')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
          {lista.map((p) => (
            <tr key={p.id} className={p.ativo ? '' : 'linha-inativa'}>
              <td>{p.nome}</td>
              <td>{p.categoriaNome ? <span className={'pill ' + tintDe(p.categoriaId)}>{p.categoriaNome}</span> : '—'}</td>
              <td>{p.unidade}</td><td>{p.estoqueMinimo}</td><td>{p.localizacao ?? '—'}</td>
              <td><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...p, categoriaId: p.categoriaId ?? '', localizacao: p.localizacao ?? '', registroAnvisa: p.registroAnvisa ?? '' })}><Ic name="i-edit" className="sm" /></button>
                <button className="acao-ic danger" title={p.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(p)}><Ic name="i-trash" className="sm" /></button>
              </>}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function FormProduto({ prod, cats, onFechar, onSalvo }: { prod: Produto; cats: Categoria[]; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !prod.id; const [f, setF] = useState(prod);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (c: keyof Produto, v: any) => setF({ ...f, [c]: v });
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: f.nome, categoriaId: f.categoriaId || null, unidade: f.unidade, estoqueMinimo: Number(f.estoqueMinimo), localizacao: f.localizacao, registroAnvisa: f.registroAnvisa };
    try { if (novo) await api.post('/produtos', corpo, token!); else await api.put('/produtos/' + prod.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div>
      <div className="page-head">
        <h1 className="page-titulo">{novo ? t('produtos.novo') : t('common.editar')}</h1>
        <button className="btn-ghost" onClick={onFechar}>← {t('common.voltar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card form-pagina">
        <label className="campo">{t('produtos.nome')}<input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
        <div className="cores-grid">
          <label className="campo">{t('produtos.categoria')}
            <select value={f.categoriaId ?? ''} onChange={(e) => set('categoriaId', e.target.value)}>
              <option value="">{t('produtos.sem_categoria')}</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="campo">{t('produtos.unidade')}
            <select value={f.unidade} onChange={(e) => set('unidade', e.target.value)}>{UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}</select>
          </label>
          <label className="campo">{t('produtos.minimo')}<input type="number" step="1" min="0" value={f.estoqueMinimo} onChange={(e) => set('estoqueMinimo', e.target.value)} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('produtos.local')}<input value={f.localizacao ?? ''} onChange={(e) => set('localizacao', e.target.value)} placeholder={t('produtos.local_ph')} /></label>
          <label className="campo">{t('produtos.anvisa')}<input value={f.registroAnvisa ?? ''} onChange={(e) => set('registroAnvisa', e.target.value)} /></label>
        </div>
        <div className="nota-info">{t('produtos.nota_preco')}</div>
        <div className="form-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
