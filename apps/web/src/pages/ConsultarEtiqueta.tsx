import { useState, type ReactNode } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface Etq {
  codigo: string; status: 'estoque' | 'saida' | 'perda';
  produtoId: string; produtoNome: string; unidade: string | null;
  loteId: string; lote: string | null; validade: string | null;
  saldoLote: number; custoUnitario: number;
  fornecedor: string | null; nf: string | null; emissao: string | null;
}

const fmtData = (s: string | null) => s ? new Date(s + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

export function ConsultarEtiqueta() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [codigo, setCodigo] = useState('');
  const [etq, setEtq] = useState<Etq | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscou, setBuscou] = useState(false);

  async function consultar() {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    setErro(null); setEtq(null); setBuscou(false);
    try { setEtq(await api.get<Etq>('/estoque/etiquetas/' + encodeURIComponent(c), token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setBuscou(true); }
  }

  const stPill = (s: Etq['status']) => s === 'estoque' ? 'pill st-verde' : s === 'saida' ? 'pill st-laranja' : 'pill st-vermelho';
  const linha = (rot: string, val: ReactNode) => (
    <tr><td style={{ color: 'var(--muted)', padding: '5px 0', width: '40%' }}>{rot}</td><td style={{ padding: '5px 0' }}>{val}</td></tr>
  );

  return (
    <div>
      <div className="crumb">{t('etqc.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('etqc.titulo')}</h1><div className="muted page-sub">{t('etqc.sub')}</div></div></div>

      <div className="card" style={{ maxWidth: 560 }}>
        <label className="campo">{t('etqc.codigo')}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') consultar(); }} autoFocus placeholder={t('etqc.codigo_ph')} style={{ flex: 1, fontFamily: 'monospace', letterSpacing: 1 }} />
            <button className="btn-primary" onClick={consultar}><Ic name="i-search" className="sm" /> {t('etqc.consultar')}</button>
          </div>
        </label>

        {erro && <div className="alerta-erro" style={{ marginTop: 12 }}>{t(erro)}</div>}
        {buscou && !etq && !erro && <div className="vazio" style={{ marginTop: 12 }}>{t('etqc.nao_encontrada')}</div>}

        {etq && (
          <div style={{ marginTop: 14, border: '0.5px solid var(--borda)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <b style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{etq.codigo}</b>
              <span className={stPill(etq.status)}>{t('etq.st.' + etq.status)}</span>
            </div>
            <table className="tabela-det" style={{ width: '100%', fontSize: 13 }}><tbody>
              {linha(t('precos.produto'), etq.produtoNome + (etq.unidade ? ' · ' + etq.unidade : ''))}
              {linha(t('estoque.lote'), etq.lote ?? '—')}
              {linha(t('estoque.validade'), fmtData(etq.validade))}
              {linha(t('etqc.saldo_lote'), etq.saldoLote + (etq.unidade ? ' ' + etq.unidade : ''))}
              {linha(t('entrada.custo'), moeda(etq.custoUnitario))}
              {linha(t('nota.forn'), etq.fornecedor ?? '—')}
              {linha('NF', etq.nf ?? '—')}
              {linha(t('fin.emissao'), fmtData(etq.emissao))}
            </tbody></table>
          </div>
        )}
      </div>
    </div>
  );
}
