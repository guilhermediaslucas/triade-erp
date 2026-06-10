import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Categoria { id: string; nome: string; }
interface Produto {
  id: string; nome: string; categoriaId: string | null; categoriaNome: string | null;
  unidade: string; preco: number; estoqueMinimo: number; ativo: boolean;
}

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Produtos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.produto.gerenciar');
  const [itens, setItens] = useState<Produto[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Produto | null>(null);

  async function carregar() {
    try {
      setItens(await api.get<Produto[]>('/produtos', token!));
      if (temCapability('cadastros.categoria.listar')) setCats(await api.get<Categoria[]>('/categorias', token!));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(p: Produto) {
    try { await api.patch('/produtos/' + p.id + '/ativo', { ativo: !p.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const vazio = (): Produto => ({ id: '', nome: '', categoriaId: '', categoriaNome: null, unidade: 'UN', preco: 0, estoqueMinimo: 0, ativo: true });

  return (
    <div>
      <div className="page-head">
        <h1 className="page-titulo">{t('produtos.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('produtos.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0">
        <table className="tabela">
          <thead><tr>
            <th>{t('produtos.nome')}</th><th>{t('produtos.categoria')}</th><th>{t('produtos.unidade')}</th>
            <th>{t('produtos.preco')}</th><th>{t('produtos.minimo')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th>
          </tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((p) => (
              <tr key={p.id} className={p.ativo ? '' : 'linha-inativa'}>
                <td>{p.nome}</td><td>{p.categoriaNome ?? '—'}</td><td>{p.unidade}</td>
                <td>{moeda(p.preco)}</td><td>{p.estoqueMinimo}</td>
                <td><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...p, categoriaId: p.categoriaId ?? '' })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(p)}>{p.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalProduto prod={edit} cats={cats} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalProduto({ prod, cats, onFechar, onSalvo }: { prod: Produto; cats: Categoria[]; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !prod.id;
  const [f, setF] = useState(prod);
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const set = (c: keyof Produto, v: any) => setF({ ...f, [c]: v });

  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: f.nome, categoriaId: f.categoriaId || null, unidade: f.unidade, preco: Number(f.preco), estoqueMinimo: Number(f.estoqueMinimo) };
    try {
      if (novo) await api.post('/produtos', corpo, token!);
      else await api.put('/produtos/' + prod.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('produtos.novo') : t('common.editar')}</h2>
        <label className="campo">{t('produtos.nome')}<input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
        <label className="campo">{t('produtos.categoria')}
          <select value={f.categoriaId ?? ''} onChange={(e) => set('categoriaId', e.target.value)}>
            <option value="">{t('produtos.sem_categoria')}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('produtos.unidade')}<input value={f.unidade} onChange={(e) => set('unidade', e.target.value)} /></label>
          <label className="campo">{t('produtos.preco')}<input type="number" step="0.01" min="0" value={f.preco} onChange={(e) => set('preco', e.target.value)} /></label>
          <label className="campo">{t('produtos.minimo')}<input type="number" step="1" min="0" value={f.estoqueMinimo} onChange={(e) => set('estoqueMinimo', e.target.value)} /></label>
        </div>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
