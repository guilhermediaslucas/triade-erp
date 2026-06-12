import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface Linha { vendedorId: string; vendedor: string; percentual: number; vendido: number; comissao: number; }
interface Regra { id: string; nome: string; taxa: number; vendedorId: string | null; vendedorNome: string | null; de: string | null; ate: string | null; ativo: boolean; }
interface Vendedor { id: string; nome: string; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (d: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—');

export function Comissoes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeFechar = temCapability('financeiro.comissao.gerenciar');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [venc, setVenc] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [ok, setOk] = useState<string | null>(null);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [edit, setEdit] = useState<Regra | null>(null);

  async function gerar() { setErro(null); setOk(null); try { setLinhas(await api.get('/financeiro/comissoes?de=' + de + '&ate=' + ate, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  async function carregarRegras() { try { setRegras(await api.get<Regra[]>('/financeiro/comissoes/regras', token!)); } catch { /* ignora */ } }
  useEffect(() => {
    gerar(); carregarRegras();
    if (temCapability('cadastros.vendedor.listar')) api.get<Vendedor[]>('/vendedores', token!).then(setVendedores).catch(() => {});
    /* eslint-disable-next-line */
  }, []);
  const total = linhas.reduce((a, l) => a + l.comissao, 0);

  async function fechar() {
    setErro(null); setOk(null);
    try { const r = await api.post<{ total: number }>('/financeiro/comissoes/fechar', { de, ate, vencimento: venc }, token!); setOk(t('com.fechado')); gerar(); void r; }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function alternarRegra(r: Regra) {
    try { await api.patch('/financeiro/comissoes/regras/' + r.id + '/ativo', { ativo: !r.ativo }, token!); carregarRegras(); gerar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="crumb">{t('com.crumb')}</div><h1 className="page-titulo">{t('com.titulo')}</h1><p className="muted page-sub">{t('com.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{ok}</div>}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}><div className="card kpi-mock"><div className="kpi-ic tint-pp">🧮</div><div className="kpi-body"><div className="kpi-lbl">{t('com.total')}</div><div className="kpi-val">{moeda(total)}</div></div></div></div>
      <div className="card pad0" style={{ marginBottom: 16 }}><table className="tabela">
        <thead><tr><th>{t('pedidos.vendedor')}</th><th>{t('com.vendido')}</th><th>{t('com.pct')}</th><th>{t('com.comissao')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={4} className="vazio">{t('com.vazio')}</td></tr>}
          {linhas.map((l) => (<tr key={l.vendedorId}><td>{l.vendedor}</td><td>{moeda(l.vendido)}</td><td>{l.percentual}%</td><td><b>{moeda(l.comissao)}</b></td></tr>))}
        </tbody>
      </table></div>

      <div className="card pad0" style={{ marginBottom: 16 }}>
        <div className="card-head" style={{ padding: '16px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h3 style={{ margin: 0 }}>{t('comregra.titulo')}</h3><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t('comregra.sub')}</div></div>
          {podeFechar && <button className="btn-primary btn-mini" onClick={() => setEdit({ id: '', nome: '', taxa: 1, vendedorId: null, vendedorNome: null, de: null, ate: null, ativo: true })}>+ {t('comregra.nova')}</button>}
        </div>
        <table className="tabela" style={{ marginTop: 10 }}>
          <thead><tr><th>{t('comregra.nome')}</th><th>{t('pedidos.vendedor')}</th><th>{t('comregra.taxa')}</th><th>{t('rel.de')}</th><th>{t('rel.ate')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {regras.length === 0 && <tr><td colSpan={7} className="vazio">{t('comregra.vazio')}</td></tr>}
            {regras.map((r) => (
              <tr key={r.id} className={r.ativo ? '' : 'linha-inativa'}>
                <td>{r.nome}</td>
                <td>{r.vendedorNome ?? <span className="muted">{t('comregra.todos')}</span>}</td>
                <td>{r.taxa}%</td>
                <td>{r.de ? fmtData(r.de) : <span className="muted">{t('comregra.indet')}</span>}</td>
                <td>{r.ate ? fmtData(r.ate) : (r.de ? '—' : <span className="muted">{t('comregra.indet')}</span>)}</td>
                <td><span className={r.ativo ? 'pill-ok' : 'pill-off'}>{r.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="acoes-ic">{podeFechar && <>
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...r })}><Ic name="i-edit" className="sm" /></button>
                  <button className="acao-ic danger" title={r.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternarRegra(r)}><Ic name="i-trash" className="sm" /></button>
                </>}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="muted" style={{ fontSize: 12, padding: '0 18px 16px' }}>{t('comregra.prioridade')}</div>
      </div>

      {podeFechar && linhas.length > 0 && (
        <div className="card" style={{ maxWidth: 460 }}>
          <h3 style={{ marginTop: 0 }}>{t('com.fechar')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{t('com.fechar_dica')}</p>
          <label className="campo">{t('com.vencimento')}<input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} /></label>
          <div className="modal-acoes"><button className="btn-primary" disabled={!venc} onClick={fechar}>{t('com.gerar_titulo')}</button></div>
        </div>
      )}

      {edit && <ModalRegra r={edit} vendedores={vendedores} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregarRegras(); gerar(); }} />}
    </div>
  );
}

function ModalRegra({ r, vendedores, onFechar, onSalvo }: { r: Regra; vendedores: Vendedor[]; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !r.id;
  const [nome, setNome] = useState(r.nome);
  const [taxa, setTaxa] = useState(String(r.taxa));
  const [vendedorId, setVendedorId] = useState(r.vendedorId ?? '');
  const [indet, setIndet] = useState(!r.de && !r.ate);
  const [de, setDe] = useState(r.de ?? '');
  const [ate, setAte] = useState(r.ate ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);

  async function salvar() {
    setErro(null); setSalv(true);
    const body = { nome, taxa: Number(taxa), vendedorId: vendedorId || null, de: indet ? '' : de, ate: indet ? '' : ate };
    try {
      if (novo) await api.post('/financeiro/comissoes/regras', body, token!);
      else await api.put('/financeiro/comissoes/regras/' + r.id, body, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
      <h2>{novo ? t('comregra.nova') : t('common.editar')}</h2>
      <label className="campo">{t('comregra.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus placeholder={t('comregra.nome_ph')} /></label>
      <div className="cores-grid">
        <label className="campo">{t('comregra.taxa_label')}<input type="number" step="0.01" min="0" max="100" value={taxa} onChange={(e) => setTaxa(e.target.value)} /></label>
        <label className="campo">{t('pedidos.vendedor')}
          <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
            <option value="">{t('comregra.todos')}</option>
            {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </label>
      </div>
      <label className="login-lembrar" style={{ marginTop: 4 }}>
        <input type="checkbox" checked={indet} onChange={(e) => setIndet(e.target.checked)} /> {t('comregra.indet_label')}
      </label>
      {!indet && <div className="cores-grid">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
      </div>}
      <p className="muted" style={{ fontSize: 12 }}>{t('comregra.dica')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
      </div>
    </div></div>
  );
}
