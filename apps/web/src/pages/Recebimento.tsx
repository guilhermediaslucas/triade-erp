import { useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Pend { id: string; fornecedorNome: string | null; produtoNome: string; quantidade: number; custoUnitario: number; total: number; nf: string | null; }
interface Marca { id: string; nome: string; ativo: boolean; }
interface Bloco { lote: string; validade: string; marcaId: string; codigos: string[]; }

const blocoVazio = (): Bloco => ({ lote: '', validade: '', marcaId: '', codigos: [] });

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
      <div className="crumb">{t('receb.crumb')}</div><h1 className="page-titulo">{t('receb.titulo')}</h1>
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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [blocos, setBlocos] = useState<Bloco[]>([blocoVazio()]);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);

  useEffect(() => { api.get<Marca[]>('/marcas', token!).then((l) => setMarcas(l.filter((m) => m.ativo))).catch(() => {}); /* eslint-disable-next-line */ }, []);

  const totalBipado = blocos.reduce((a, b) => a + b.codigos.length, 0);
  const todosCodigos = blocos.flatMap((b) => b.codigos);
  const semDup = new Set(todosCodigos).size === todosCodigos.length;
  const blocosOk = blocos.every((b) => b.marcaId && b.codigos.length > 0);
  const podeConfirmar = blocosOk && semDup && totalBipado === p.quantidade;

  function patch(i: number, dados: Partial<Bloco>) { setBlocos((bs) => bs.map((b, j) => (j === i ? { ...b, ...dados } : b))); }
  function biparEm(i: number, valor: string): boolean {
    const cod = valor.trim().toUpperCase();
    if (!cod) return false;
    if (todosCodigos.includes(cod)) { setErro('etiqueta.duplicada_leitura'); return false; }
    setErro(null);
    setBlocos((bs) => bs.map((b, j) => (j === i ? { ...b, codigos: [...b.codigos, cod] } : b)));
    return true;
  }
  const removerCod = (i: number, cod: string) => setBlocos((bs) => bs.map((b, j) => (j === i ? { ...b, codigos: b.codigos.filter((c) => c !== cod) } : b)));
  const addBloco = () => setBlocos((bs) => [...bs, blocoVazio()]);
  const removerBloco = (i: number) => setBlocos((bs) => (bs.length > 1 ? bs.filter((_, j) => j !== i) : bs));

  async function salvar() {
    setErro(null); setSalv(true);
    try {
      await api.post('/estoque/recebimentos/' + p.id + '/receber', {
        lotes: blocos.map((b) => ({ lote: b.lote, validade: b.validade, marcaId: b.marcaId, codigos: b.codigos })),
      }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('receb.receber')} — {p.produtoNome}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {p.quantidade} {t('receb.un')} · {p.fornecedorNome ?? '—'} · <strong>{totalBipado}/{p.quantidade}</strong> {t('receb.bipados')}
      </p>
      {blocos.map((b, i) => (
        <LoteBloco key={i} idx={i} b={b} marcas={marcas} podeRemover={blocos.length > 1}
          onPatch={(d) => patch(i, d)} onBipar={(v) => biparEm(i, v)} onRemoverCod={(c) => removerCod(i, c)} onRemoverBloco={() => removerBloco(i)} />
      ))}
      <button className="btn-ghost btn-mini" onClick={addBloco}>+ {t('receb.add_lote')}</button>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={salv || !podeConfirmar} onClick={salvar}>{t('receb.confirmar')}</button>
      </div>
    </div></div>
  );
}

function LoteBloco({ idx, b, marcas, podeRemover, onPatch, onBipar, onRemoverCod, onRemoverBloco }: {
  idx: number; b: Bloco; marcas: Marca[]; podeRemover: boolean;
  onPatch: (d: Partial<Bloco>) => void; onBipar: (v: string) => boolean; onRemoverCod: (c: string) => void; onRemoverBloco: () => void;
}) {
  const { t } = useI18n();
  const [scan, setScan] = useState('');
  const scanRef = useRef<HTMLInputElement>(null);
  return (
    <div className="card" style={{ marginBottom: 10, background: 'var(--card-2, #fafafa)' }}>
      <div className="page-head" style={{ marginBottom: 6 }}>
        <strong>{t('receb.lote_n')} {idx + 1}</strong>
        {podeRemover && <button className="btn-link" onClick={onRemoverBloco}>{t('common.remover')}</button>}
      </div>
      <div className="cores-grid">
        <label className="campo">{t('marcas.titulo_sing')}
          <select value={b.marcaId} onChange={(e) => onPatch({ marcaId: e.target.value })}>
            <option value="">—</option>{marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </label>
        <label className="campo">{t('estoque.lote')}<input value={b.lote} onChange={(e) => onPatch({ lote: e.target.value })} placeholder="Ex.: L-2026-001" /></label>
        <label className="campo">{t('estoque.validade')}<input type="date" value={b.validade} onChange={(e) => onPatch({ validade: e.target.value })} /></label>
      </div>
      <label className="campo">
        {t('etq.bipe')} <span className="muted">· {b.codigos.length} {t('etq.bipados')}</span>
        <input ref={scanRef} value={scan} autoComplete="off" placeholder={t('etq.bipe_ph')}
          onChange={(e) => setScan(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (onBipar(scan)) { setScan(''); scanRef.current?.focus(); } } }} />
      </label>
      {b.codigos.length > 0 && (
        <div className="chips">
          {b.codigos.map((c) => (
            <span key={c} className="chip" style={{ fontFamily: 'monospace' }}>
              {c}<button type="button" className="chip-x" onClick={() => onRemoverCod(c)} title={t('common.remover')}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
