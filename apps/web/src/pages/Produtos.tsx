import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Produto {
  id: string; nome: string;
  unidade: string; estoqueMinimo: number; localizacao: string | null; registroAnvisa: string | null;
  ncm: string | null; cfop: string | null; cstFiscal: string | null; origemFiscal: string | null; ativo: boolean;
}
const UNIDADES = ['UN', 'CX', 'ML', 'G', 'KG', 'FR', 'AMP'];
const vazio = (): Produto => ({ id: '', nome: '', unidade: 'UN', estoqueMinimo: 0, localizacao: '', registroAnvisa: '', ncm: '', cfop: '', cstFiscal: '', origemFiscal: '', ativo: true });

export function Produtos() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.produto.gerenciar');
  const [itens, setItens] = useState<Produto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Produto | null>(null);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      setItens(await api.get('/produtos', token!));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(p: Produto) { try { await api.patch('/produtos/' + p.id + '/ativo', { ativo: !p.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((p) => !q || p.nome.toLowerCase().includes(q));
  }, [itens, busca]);

  // Formulário em página inteira (espelha o mockup) — substitui a lista enquanto edita.
  if (edit) return <FormProduto prod={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />;

  return (
    <div>
      <div className="crumb">{t('produtos.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('produtos.titulo')}</h1><div className="muted page-sub">{t('produtos.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('produtos.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar">
        <div className="busca-box-tb"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('produtos.buscar')} /></div>
      </div>

      <div className="card pad0"><table className="tabela tabela-cards">
        <thead><tr><th>{t('produtos.nome')}</th><th>{t('produtos.unidade')}</th><th>{t('produtos.minimo')}</th><th>{t('produtos.local')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
          {lista.map((p) => (
            <tr key={p.id} className={p.ativo ? '' : 'linha-inativa'}>
              <td data-label={t('produtos.nome')}>{p.nome}</td>
              <td data-label={t('produtos.unidade')}>{p.unidade}</td><td data-label={t('produtos.minimo')}>{p.estoqueMinimo}</td><td data-label={t('produtos.local')}>{p.localizacao ?? '—'}</td>
              <td data-label={t('usuarios.situacao')}><span className={p.ativo ? 'pill-ok' : 'pill-off'}>{p.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...p, localizacao: p.localizacao ?? '', registroAnvisa: p.registroAnvisa ?? '', ncm: p.ncm ?? '', cfop: p.cfop ?? '', cstFiscal: p.cstFiscal ?? '', origemFiscal: p.origemFiscal ?? '' })}><Ic name="i-edit" className="sm" /></button>
                <button className="acao-ic danger" title={p.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(p)}><Ic name="i-trash" className="sm" /></button>
              </>}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function FormProduto({ prod, onFechar, onSalvo }: { prod: Produto; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !prod.id; const [f, setF] = useState(prod);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (c: keyof Produto, v: any) => setF({ ...f, [c]: v });
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: f.nome, unidade: f.unidade, estoqueMinimo: Number(f.estoqueMinimo), localizacao: f.localizacao, registroAnvisa: f.registroAnvisa, ncm: f.ncm, cfop: f.cfop, cstFiscal: f.cstFiscal, origemFiscal: f.origemFiscal };
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
          <label className="campo">{t('produtos.unidade')}
            <select value={f.unidade} onChange={(e) => set('unidade', e.target.value)}>{UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}</select>
          </label>
          <label className="campo">{t('produtos.minimo')}<input type="number" step="1" min="0" value={f.estoqueMinimo} onChange={(e) => set('estoqueMinimo', e.target.value)} /></label>
        </div>
        <div className="cores-grid">
          <label className="campo">{t('produtos.local')}<input value={f.localizacao ?? ''} onChange={(e) => set('localizacao', e.target.value)} placeholder={t('produtos.local_ph')} /></label>
          <label className="campo">{t('produtos.anvisa')}<input value={f.registroAnvisa ?? ''} onChange={(e) => set('registroAnvisa', e.target.value)} /></label>
        </div>
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
