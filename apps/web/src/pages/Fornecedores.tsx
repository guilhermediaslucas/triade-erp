import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { mascaraCnpj, mascaraCep, buscarCnpj, buscarCep } from '../lib/br.js';

interface Fornecedor { id: string; nome: string; fantasia: string | null; documento: string; email: string | null; telefone: string | null; cep: string | null; cidade: string | null; uf: string | null; ativo: boolean; }
const vazio = (): Fornecedor => ({ id: '', nome: '', fantasia: '', documento: '', email: '', telefone: '', cep: '', cidade: '', uf: '', ativo: true });

export function Fornecedores() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.fornecedor.gerenciar');
  const [itens, setItens] = useState<Fornecedor[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Fornecedor | null>(null);
  async function carregar() { try { setItens(await api.get('/fornecedores', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(f: Fornecedor) { try { await api.patch('/fornecedores/' + f.id + '/ativo', { ativo: !f.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t('fornecedores.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('fornecedores.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('pessoa.nome')}</th><th>{t('pessoa.documento')}</th><th>{t('clientes.cidade')}</th><th>{t('pessoa.telefone')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
          {itens.map((f) => (
            <tr key={f.id} className={f.ativo ? '' : 'linha-inativa'}>
              <td>{f.nome}{f.fantasia ? <span className="muted"> · {f.fantasia}</span> : null}</td>
              <td>{f.documento}</td><td>{f.cidade ? `${f.cidade}${f.uf ? '/' + f.uf : ''}` : '—'}</td><td>{f.telefone ?? '—'}</td>
              <td><span className={f.ativo ? 'pill-ok' : 'pill-off'}>{f.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td className="acoes">{pode && <>
                <button className="btn-link" onClick={() => setEdit({ ...f, fantasia: f.fantasia ?? '', email: f.email ?? '', telefone: f.telefone ?? '', cep: f.cep ?? '', cidade: f.cidade ?? '', uf: f.uf ?? '' })}>{t('common.editar')}</button>
                <button className="btn-link" onClick={() => alternar(f)}>{f.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
              </>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <ModalForn f={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalForn({ f, onFechar, onSalvo }: { f: Fornecedor; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !f.id; const [v, setV] = useState(f);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false); const [busc, setBusc] = useState(false);
  const set = (c: keyof Fornecedor, val: any) => setV((x) => ({ ...x, [c]: val }));
  async function acharCnpj() {
    setErro(null); setBusc(true);
    try { const d = await buscarCnpj(v.documento); if (!d) { setErro('clientes.cnpj_nao_encontrado'); return; }
      setV((x) => ({ ...x, nome: d.razao ?? x.nome, fantasia: d.fantasia ?? x.fantasia, cep: d.cep ?? x.cep, cidade: d.cidade ?? x.cidade, uf: d.uf ?? x.uf })); }
    catch { setErro('clientes.cnpj_nao_encontrado'); } finally { setBusc(false); }
  }
  async function acharCep() { const d = await buscarCep(v.cep ?? ''); if (d) setV((x) => ({ ...x, cidade: d.cidade ?? x.cidade, uf: d.uf ?? x.uf })); }
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: v.nome, fantasia: v.fantasia, documento: v.documento, email: v.email, telefone: v.telefone, cep: v.cep, cidade: v.cidade, uf: v.uf };
    try { if (novo) await api.post('/fornecedores', corpo, token!); else await api.put('/fornecedores/' + f.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('fornecedores.novo') : t('common.editar')}</h2>
      <label className="campo">{t('pessoa.razao')}<input value={v.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
      <label className="campo">{t('pessoa.fantasia')}<input value={v.fantasia ?? ''} onChange={(e) => set('fantasia', e.target.value)} /></label>
      <label className="campo">CNPJ
        <div className="campo-com-botao">
          <input value={v.documento} onChange={(e) => set('documento', mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" />
          <button type="button" className="btn-ghost btn-mini" disabled={busc} onClick={acharCnpj}>{busc ? '...' : t('clientes.buscar')}</button>
        </div>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={v.email ?? ''} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={v.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">CEP<input value={v.cep ?? ''} onChange={(e) => set('cep', mascaraCep(e.target.value))} onBlur={acharCep} /></label>
        <label className="campo">{t('clientes.cidade')}<input value={v.cidade ?? ''} onChange={(e) => set('cidade', e.target.value)} /></label>
        <label className="campo">UF<input value={v.uf ?? ''} onChange={(e) => set('uf', e.target.value.toUpperCase().slice(0, 2))} style={{ maxWidth: 80 }} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
