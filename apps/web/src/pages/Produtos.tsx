import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { ImportadorPlanilha, type CampoImport } from '../components/ImportadorPlanilha.js';
import { MoedaInput } from '../components/MoedaInput.js';

const CAMPOS_PRODUTO: CampoImport[] = [
  { chave: 'nome', rotulo: 'Nome', obrigatorio: true, exemplo: 'Toxina Botulínica 100U', aliases: ['produto', 'descricao', 'descrição'] },
  { chave: 'unidade', rotulo: 'Unidade', exemplo: 'UN', aliases: ['un', 'medida'] },
  { chave: 'estoqueMinimo', rotulo: 'Estoque mínimo', exemplo: '0', aliases: ['minimo', 'mínimo', 'estoque minimo'] },
  { chave: 'localizacao', rotulo: 'Localização', exemplo: 'A1-03', aliases: ['local', 'localizacao'] },
  { chave: 'registroAnvisa', rotulo: 'Registro ANVISA', exemplo: '', aliases: ['anvisa', 'registro'] },
  { chave: 'ncm', rotulo: 'NCM', exemplo: '', aliases: ['ncm'] },
];

interface Categoria { id: string; nome: string; }
interface Produto {
  id: string; nome: string; precoBase: number; categoriaId: string | null; categoriaNome: string | null;
  unidade: string; estoqueMinimo: number; localizacao: string | null; registroAnvisa: string | null;
  ncm: string | null; cfop: string | null; cstFiscal: string | null; origemFiscal: string | null; ativo: boolean;
}
const UNIDADES = ['UN', 'CX', 'ML', 'G', 'KG', 'FR', 'AMP'];
// Tint estável por categoria (cor do pill), ciclando por hash do id.
const TINTS = ['tint-pp', 'tint-bl', 'tint-gr', 'tint-or', 'tint-rd'];
const tintDe = (id: string | null): string => id ? TINTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length]! : 'tint-bl';
const vazio = (): Produto => ({ id: '', nome: '', precoBase: 0, categoriaId: '', categoriaNome: null, unidade: 'UN', estoqueMinimo: 0, localizacao: '', registroAnvisa: '', ncm: '', cfop: '', cstFiscal: '', origemFiscal: '', ativo: true });

export function Produtos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.produto.gerenciar');
  const [itens, setItens] = useState<Produto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Produto | null>(null);
  const [importar, setImportar] = useState(false);
  const [busca, setBusca] = useState('');
  const [cats, setCats] = useState<Categoria[]>([]);
  const [catFiltro, setCatFiltro] = useState('');

  function enviarImportacao(linhas: Record<string, string>[]) {
    const corpo = linhas.map((l) => ({ nome: l.nome, unidade: l.unidade || 'UN', estoqueMinimo: Number(l.estoqueMinimo) || 0, localizacao: l.localizacao || null, registroAnvisa: l.registroAnvisa || null, ncm: l.ncm || null }));
    return api.post<{ criados: number; ignorados: number; erros: { linha: number; motivo: string }[] }>('/produtos/importar', { linhas: corpo }, token!);
  }

  async function carregar() {
    try {
      setItens(await api.get('/produtos', token!));
      if (temCapability('cadastros.categoria.listar')) setCats(await api.get<Categoria[]>('/categorias', token!));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(p: Produto) { try { await api.patch('/produtos/' + p.id + '/ativo', { ativo: !p.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((p) => (!q || p.nome.toLowerCase().includes(q)) && (!catFiltro || p.categoriaId === catFiltro));
  }, [itens, busca, catFiltro]);

  // Formulário em página inteira (espelha o mockup) — substitui a lista enquanto edita.
  if (edit) return <FormProduto prod={edit} cats={cats} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />;

  return (
    <div>
      <div className="crumb">{t('produtos.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('produtos.titulo')}</h1><div className="muted page-sub">{t('produtos.sub')}</div></div>
        {pode && <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => setImportar(true)}><Ic name="i-upload" className="sm" /> {t('produtos.importar')}</button>
          <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('produtos.novo')}</button>
        </div>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('produtos.buscar')} /></div>
        {cats.length > 0 && (
          <div className="chips-f">
            <button className={'chip-f' + (catFiltro === '' ? ' on' : '')} onClick={() => setCatFiltro('')}>{t('produtos.todas_categorias')}</button>
            {cats.map((c) => <button key={c.id} className={'chip-f' + (catFiltro === c.id ? ' on' : '')} onClick={() => setCatFiltro(c.id)}>{c.nome}</button>)}
          </div>
        )}
      </div>

      <div className="card pad0"><table className="tabela tabela-cards">
        <thead><tr><th>{t('produtos.nome')}</th><th>{t('produtos.categoria')}</th><th>{t('produtos.unidade')}</th><th>{t('produtos.minimo')}</th><th>{t('produtos.local')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
          {lista.map((p) => (
            <tr key={p.id} className={p.ativo ? '' : 'linha-inativa'}>
              <td data-label={t('produtos.nome')}>{p.nome}</td>
              <td data-label={t('produtos.categoria')}>{p.categoriaNome ? <span className={'pill ' + tintDe(p.categoriaId)}>{p.categoriaNome}</span> : '—'}</td>
              <td data-label={t('produtos.unidade')}>{p.unidade}</td><td data-label={t('produtos.minimo')}>{p.estoqueMinimo}</td><td data-label={t('produtos.local')}>{p.localizacao ?? '—'}</td>
              <td data-label={t('usuarios.situacao')}><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...p, categoriaId: p.categoriaId ?? '', localizacao: p.localizacao ?? '', registroAnvisa: p.registroAnvisa ?? '', ncm: p.ncm ?? '', cfop: p.cfop ?? '', cstFiscal: p.cstFiscal ?? '', origemFiscal: p.origemFiscal ?? '' })}><Ic name="i-edit" className="sm" /></button>
                <button className="acao-ic danger" title={p.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(p)}><Ic name="i-trash" className="sm" /></button>
              </>}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {importar && <ImportadorPlanilha titulo={t('produtos.importar')} campos={CAMPOS_PRODUTO} modelo="modelo-produtos" onImportar={enviarImportacao} onConcluido={carregar} onFechar={() => setImportar(false)} />}
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
    const corpo = { nome: f.nome, categoriaId: f.categoriaId || null, preco: Number(f.precoBase) || 0, unidade: f.unidade, estoqueMinimo: Number(f.estoqueMinimo), localizacao: f.localizacao, registroAnvisa: f.registroAnvisa, ncm: f.ncm, cfop: f.cfop, cstFiscal: f.cstFiscal, origemFiscal: f.origemFiscal };
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
        <label className="campo">{t('produtos.categoria')}
          <select value={f.categoriaId ?? ''} onChange={(e) => set('categoriaId', e.target.value)}>
            <option value="">{t('produtos.sem_categoria')}</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <div className="cores-grid">
          <label className="campo">{t('produtos.preco')}<MoedaInput value={f.precoBase ?? 0} onChange={(n) => set('precoBase', n)} /></label>
          <label className="campo">{t('produtos.unidade')}
            <select value={f.unidade} onChange={(e) => set('unidade', e.target.value)}>{UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}</select>
          </label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('produtos.minimo')}<input type="number" step="1" min="0" value={f.estoqueMinimo} onChange={(e) => set('estoqueMinimo', e.target.value)} /></label>
          <label className="campo">{t('produtos.local')}<input value={f.localizacao ?? ''} onChange={(e) => set('localizacao', e.target.value)} placeholder={t('produtos.local_ph')} /></label>
        </div>
        <label className="campo">{t('produtos.anvisa')}<input value={f.registroAnvisa ?? ''} onChange={(e) => set('registroAnvisa', e.target.value)} /></label>
        <h3 className="emp-sec" style={{ marginTop: 14 }}>{t('produtos.fiscal')}</h3>
        <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t('produtos.fiscal_hint')}</div>
        <div className="cores-grid">
          <label className="campo">{t('produtos.ncm')}<input value={f.ncm ?? ''} onChange={(e) => set('ncm', e.target.value)} placeholder={t('produtos.ncm_ph')} /></label>
          <label className="campo">{t('produtos.cfop_override')}<input value={f.cfop ?? ''} onChange={(e) => set('cfop', e.target.value)} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('produtos.cst_override')}<input value={f.cstFiscal ?? ''} onChange={(e) => set('cstFiscal', e.target.value)} /></label>
          <label className="campo">{t('produtos.origem_override')}<input value={f.origemFiscal ?? ''} onChange={(e) => set('origemFiscal', e.target.value)} placeholder="0-8" /></label>
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
