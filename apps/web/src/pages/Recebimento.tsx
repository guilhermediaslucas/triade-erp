import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Pend { id: string; fornecedorNome: string | null; produtoNome: string; quantidade: number; custoUnitario: number; total: number; nf: string | null; }

export function Recebimento() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [itens, setItens] = useState<Pend[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [receber, setReceber] = useState<Pend | null>(null);

  async function carregar() { try { setItens(await api.get('/estoque/recebimentos', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <h1 className="page-titulo">{t('receb.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('receb.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('fin.fornecedor')}</th><th>{t('precos.produto')}</th><th>{t('entrada.quantidade')}</th><th>{t('nota.nf')}</th><th>{t('fin.valor')}</th><th></th></tr></thead>
        <tbody>
          {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('receb.vazio')}</td></tr>}
          {itens.map((p) => (
            <tr key={p.id}>
              <td>{p.fornecedorNome ?? '—'}</td><td>{p.produtoNome}</td><td>{p.quantidade}</td><td>{p.nf ?? '—'}</td><td>{moeda(p.total)}</td>
              <td className="acoes"><button className="btn-primary btn-mini" onClick={() => setReceber(p)}>{t('receb.receber')}</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {receber && <ModalReceber p={receber} onFechar={() => setReceber(null)} onSalvo={() => { setReceber(null); carregar(); }} />}
    </div>
  );
}

function ModalReceber({ p, onFechar, onSalvo }: { p: Pend; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [lote, setLote] = useState(''); const [validade, setValidade] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try { await api.post('/estoque/recebimentos/' + p.id + '/receber', { lote, validade }, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo" onClick={onFechar}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{t('receb.receber')} — {p.produtoNome}</h2>
      <p className="muted" style={{ marginTop: 0 }}>{p.quantidade} {t('receb.un')} · {p.fornecedorNome ?? '—'}</p>
      <div className="cores-grid">
        <label className="campo">{t('estoque.lote')}<input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="Ex.: L-2026-001" /></label>
        <label className="campo">{t('estoque.validade')}<input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('receb.confirmar')}</button></div>
    </div></div>
  );
}
