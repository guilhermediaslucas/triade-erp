import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Vendedor { id: string; nome: string; email: string | null; telefone: string | null; comissaoPercentual: number; ativo: boolean; }
const vazio = (): Vendedor => ({ id: '', nome: '', email: '', telefone: '', comissaoPercentual: 0, ativo: true });

export function Vendedores() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.vendedor.gerenciar');
  const [itens, setItens] = useState<Vendedor[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Vendedor | null>(null);

  async function carregar() { try { setItens(await api.get('/vendedores', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(v: Vendedor) { try { await api.patch('/vendedores/' + v.id + '/ativo', { ativo: !v.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t('vendedores.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('vendedores.novo')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('pessoa.nome')}</th><th>{t('pessoa.email')}</th><th>{t('pessoa.telefone')}</th><th>{t('vendedores.comissao')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
          {itens.map((v) => (
            <tr key={v.id} className={v.ativo ? '' : 'linha-inativa'}>
              <td>{v.nome}</td><td>{v.email ?? '—'}</td><td>{v.telefone ?? '—'}</td><td>{v.comissaoPercentual}%</td>
              <td><span className={v.ativo ? 'pill-ok' : 'pill-off'}>{v.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td className="acoes">{pode && <>
                <button className="btn-link" onClick={() => setEdit({ ...v, email: v.email ?? '', telefone: v.telefone ?? '' })}>{t('common.editar')}</button>
                <button className="btn-link" onClick={() => alternar(v)}>{v.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
              </>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <ModalVend v={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalVend({ v, onFechar, onSalvo }: { v: Vendedor; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !v.id; const [f, setF] = useState(v);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (c: keyof Vendedor, val: any) => setF({ ...f, [c]: val });
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: f.nome, email: f.email, telefone: f.telefone, comissaoPercentual: Number(f.comissaoPercentual) };
    try { if (novo) await api.post('/vendedores', corpo, token!); else await api.put('/vendedores/' + v.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('vendedores.novo') : t('common.editar')}</h2>
      <label className="campo">{t('pessoa.nome')}<input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={f.email ?? ''} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={f.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></label>
        <label className="campo">{t('vendedores.comissao')}<input type="number" step="0.5" min="0" max="100" value={f.comissaoPercentual} onChange={(e) => set('comissaoPercentual', e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
