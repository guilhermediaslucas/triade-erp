import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Vendedor { id: string; nome: string; email: string | null; telefone: string | null; regiao: string | null; metaMensal: number; comissaoPercentual: number; segueRegraGeral: boolean; ativo: boolean; vendasMes: number; }
const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const vazio = (): Vendedor => ({ id: '', nome: '', email: '', telefone: '', regiao: '', metaMensal: 0, comissaoPercentual: 0, segueRegraGeral: false, ativo: true, vendasMes: 0 });

export function Vendedores() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.vendedor.gerenciar');
  const [itens, setItens] = useState<Vendedor[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Vendedor | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  async function carregar() { try { setItens(await api.get('/vendedores', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(v: Vendedor) { try { await api.patch('/vendedores/' + v.id + '/ativo', { ativo: !v.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const filtrados = itens.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.fantasia, x.documento, x.email].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('vendedores.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('vendedores.titulo')}</h1><div className="muted page-sub">{t('vendedores.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('vendedores.novo')}</button>}</div>
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('vendedores.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela tabela-cards">
        <thead><tr><th>{t('vendedores.col_vend')}</th><th>{t('pessoa.email')}</th><th>{t('pessoa.telefone')}</th><th>{t('vendedores.regiao_s')}</th><th>{t('vendedores.vendas_mes')}</th><th>{t('vendedores.meta_s')}</th><th>{t('vendedores.comissao_s')}</th><th>{t('fin.status')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={9} className="vazio">{t('common.nenhum')}</td></tr>}
          {filtrados.map((v) => (
            <tr key={v.id} className={v.ativo ? '' : 'linha-inativa'}>
              <td data-label={t('vendedores.col_vend')}><b>{v.nome}</b></td><td data-label={t('pessoa.email')}>{v.email || '—'}</td><td data-label={t('pessoa.telefone')}>{v.telefone || '—'}</td><td data-label={t('vendedores.regiao_s')}>{v.regiao ?? '—'}</td>
              <td data-label={t('vendedores.vendas_mes')}>{v.vendasMes > 0 ? <b>{moeda(v.vendasMes)}</b> : <span className="muted">{moeda(0)}</span>}</td><td data-label={t('vendedores.meta_s')}>{moeda(v.metaMensal)}</td>
              <td data-label={t('vendedores.comissao_s')}>{v.segueRegraGeral ? t('vendedores.regra_geral_curta') : v.comissaoPercentual + '%'}</td>
              <td data-label={t('fin.status')}><span className={v.ativo ? 'pill-ok' : 'pill-off'}>{v.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
              <td style={{ textAlign: 'right' }}><span className="acoes-ic">
                <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...v, email: v.email ?? '', telefone: v.telefone ?? '', regiao: v.regiao ?? '' })}><Ic name="i-edit" className="sm" /></button>
                {pode && <button className="acao-ic danger" title={v.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(v)}><Ic name="i-trash" className="sm" /></button>}
              </span></td>
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
    const corpo = { nome: f.nome, email: f.email, telefone: f.telefone, regiao: f.regiao, metaMensal: Number(f.metaMensal), comissaoPercentual: Number(f.comissaoPercentual), segueRegraGeral: f.segueRegraGeral };
    try { if (novo) await api.post('/vendedores', corpo, token!); else await api.put('/vendedores/' + v.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('vendedores.novo') : t('common.editar')}</h2>
      <label className="campo">{t('clientes.nome_completo')}<input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={f.email ?? ''} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={f.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></label>
      </div>
      <label className="campo">{t('vendedores.regiao')}<input value={f.regiao ?? ''} onChange={(e) => set('regiao', e.target.value)} placeholder={t('vendedores.regiao_ph')} /></label>
      <div className="cores-grid">
        <label className="campo">{t('vendedores.meta')}<input type="number" step="0.01" min="0" value={f.metaMensal} onChange={(e) => set('metaMensal', e.target.value)} /></label>
        <label className="campo">{t('vendedores.comissao')}<input type="number" step="0.5" min="0" max="100" value={f.comissaoPercentual} onChange={(e) => set('comissaoPercentual', e.target.value)} disabled={f.segueRegraGeral} /></label>
      </div>
      <label className="chk-linha"><input type="checkbox" checked={f.segueRegraGeral} onChange={(e) => set('segueRegraGeral', e.target.checked)} /> {t('vendedores.regra_geral')}</label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
