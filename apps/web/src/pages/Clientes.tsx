import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

type TipoPessoa = 'PJ' | 'PF';
interface Cliente {
  id: string; tipoPessoa: TipoPessoa; nome: string; fantasia: string | null; documento: string;
  email: string | null; telefone: string | null; limiteCredito: number; ativo: boolean;
}
const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const vazio = (): Cliente => ({ id: '', tipoPessoa: 'PJ', nome: '', fantasia: '', documento: '', email: '', telefone: '', limiteCredito: 0, ativo: true });

export function Clientes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.cliente.gerenciar');
  const [itens, setItens] = useState<Cliente[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Cliente | null>(null);

  async function carregar() { try { setItens(await api.get('/clientes', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(c: Cliente) { try { await api.patch('/clientes/' + c.id + '/ativo', { ativo: !c.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t('clientes.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('clientes.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('clientes.nome')}</th><th>{t('clientes.tipo')}</th><th>{t('pessoa.documento')}</th><th>{t('clientes.limite')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
          {itens.map((c) => (
            <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
              <td>{c.nome}{c.fantasia ? <span className="muted"> · {c.fantasia}</span> : null}</td>
              <td>{c.tipoPessoa}</td><td>{c.documento}</td><td>{moeda(c.limiteCredito)}</td>
              <td><span className={c.ativo ? 'pill-ok' : 'pill-off'}>{c.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td className="acoes">{pode && <>
                <button className="btn-link" onClick={() => setEdit({ ...c, fantasia: c.fantasia ?? '', email: c.email ?? '', telefone: c.telefone ?? '' })}>{t('common.editar')}</button>
                <button className="btn-link" onClick={() => alternar(c)}>{c.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
              </>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <ModalCli c={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalCli({ c, onFechar, onSalvo }: { c: Cliente; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !c.id; const [v, setV] = useState(c);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (campo: keyof Cliente, val: any) => setV({ ...v, [campo]: val });
  const pj = v.tipoPessoa === 'PJ';
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { tipoPessoa: v.tipoPessoa, nome: v.nome, fantasia: pj ? v.fantasia : null, documento: v.documento, email: v.email, telefone: v.telefone, limiteCredito: Number(v.limiteCredito) };
    try { if (novo) await api.post('/clientes', corpo, token!); else await api.put('/clientes/' + c.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('clientes.novo') : t('common.editar')}</h2>
      <label className="campo">{t('clientes.tipo')}
        <select value={v.tipoPessoa} onChange={(e) => set('tipoPessoa', e.target.value)}>
          <option value="PJ">{t('clientes.pj')}</option><option value="PF">{t('clientes.pf')}</option>
        </select>
      </label>
      <label className="campo">{pj ? t('pessoa.razao') : t('clientes.nome_completo')}<input value={v.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
      {pj && <label className="campo">{t('pessoa.fantasia')}<input value={v.fantasia ?? ''} onChange={(e) => set('fantasia', e.target.value)} /></label>}
      <div className="cores-grid">
        <label className="campo">{pj ? 'CNPJ' : 'CPF'}<input value={v.documento} onChange={(e) => set('documento', e.target.value)} /></label>
        <label className="campo">{t('clientes.limite')}<input type="number" step="0.01" min="0" value={v.limiteCredito} onChange={(e) => set('limiteCredito', e.target.value)} /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={v.email ?? ''} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={v.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
