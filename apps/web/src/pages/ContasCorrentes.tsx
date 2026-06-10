import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Conta { id: string; nome: string; banco: string | null; saldoInicial: number; ativo: boolean; saldo?: number; }
const vazio = (): Conta => ({ id: '', nome: '', banco: '', saldoInicial: 0, ativo: true });

export function ContasCorrentes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.conta.gerenciar');
  const [itens, setItens] = useState<Conta[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Conta | null>(null);

  async function carregar() { try { setItens(await api.get('/contas-correntes/saldos', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <div className="page-head"><h1 className="page-titulo">{t('cc.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('cc.nova')}</button>}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="dash-cards">
        {itens.map((c) => (
          <div key={c.id} className="dash-card">
            <div className="dash-l">{c.nome}{c.banco ? ' · ' + c.banco : ''}</div>
            <div className="dash-v" style={{ color: (c.saldo ?? 0) >= 0 ? '#15803d' : '#b91c1c' }}>{moeda(c.saldo ?? 0)}</div>
            <div className="dash-s">{t('cc.saldo_inicial')}: {moeda(c.saldoInicial)}{pode && <> · <button className="btn-link" onClick={() => setEdit({ ...c, banco: c.banco ?? '' })}>{t('common.editar')}</button></>}</div>
          </div>
        ))}
        {itens.length === 0 && <div className="muted">{t('cc.vazio')}</div>}
      </div>
      {edit && <ModalConta c={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalConta({ c, onFechar, onSalvo }: { c: Conta; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !c.id; const [v, setV] = useState(c);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const set = (k: keyof Conta, val: any) => setV({ ...v, [k]: val });
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { nome: v.nome, banco: v.banco, saldoInicial: Number(v.saldoInicial) };
    try { if (novo) await api.post('/contas-correntes', corpo, token!); else await api.put('/contas-correntes/' + c.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('cc.nova') : t('common.editar')}</h2>
      <label className="campo">{t('categorias.nome')}<input value={v.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Itaú Movimento" autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{t('cc.banco')}<input value={v.banco ?? ''} onChange={(e) => set('banco', e.target.value)} /></label>
        <label className="campo">{t('cc.saldo_inicial')}<input type="number" step="0.01" value={v.saldoInicial} onChange={(e) => set('saldoInicial', e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
