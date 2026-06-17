import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from './Toast.js';
import { baixarArquivo } from '../lib/download.js';
import { Ic } from './Icones.js';

interface NotaFiscal {
  status: 'processando' | 'autorizado' | 'erro' | 'cancelado';
  statusSefaz: string | null;
  mensagemSefaz: string | null;
  chave: string | null;
  numero: string | null;
  serie: string | null;
}

export function NotaFiscalCard({ pedidoId, pedidoStatus, podeEmitir }: { pedidoId: string; pedidoStatus: string; podeEmitir: boolean; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const [nota, setNota] = useState<NotaFiscal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [emitindo, setEmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [justif, setJustif] = useState('');
  const [enviandoCancel, setEnviandoCancel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const consultar = useCallback(async () => {
    try { setNota(await api.get<NotaFiscal | null>('/pedidos/' + pedidoId + '/nota', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setCarregando(false); }
  }, [pedidoId, token]);

  useEffect(() => { consultar(); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [consultar]);

  // Enquanto "processando", reconsulta a cada 4s (a Focy é assíncrona).
  useEffect(() => {
    if (nota?.status === 'processando') {
      timerRef.current = setTimeout(() => { consultar(); }, 4000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [nota, consultar]);

  async function emitir() {
    setEmitindo(true); setErro(null);
    try { setNota(await api.post<NotaFiscal>('/pedidos/' + pedidoId + '/nota', {}, token!)); toast(t('nf.emitida')); }
    catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
    finally { setEmitindo(false); }
  }

  async function baixar(tipo: 'danfe' | 'xml') {
    try {
      const blob = await api.blob('/pedidos/' + pedidoId + '/nota/' + tipo, token!);
      const ext = tipo === 'xml' ? 'xml' : 'pdf';
      await baixarArquivo('nfe-' + (nota?.numero || pedidoId) + '.' + ext, blob);
    } catch (e) { toast(t((e as ErroApi).chaveI18n), 'erro'); }
  }

  async function cancelar() {
    if (justif.trim().length < 15) { setErro('fiscal.nota.justificativa_invalida'); return; }
    setEnviandoCancel(true); setErro(null);
    try {
      setNota(await api.post<NotaFiscal>('/pedidos/' + pedidoId + '/nota/cancelar', { justificativa: justif.trim() }, token!));
      setCancelando(false); setJustif(''); toast(t('nf.cancelada_ok'));
    } catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
    finally { setEnviandoCancel(false); }
  }

  if (carregando) return null;
  const emitivel = pedidoStatus === 'expedido' || pedidoStatus === 'entregue';

  return (
    <div className="card" style={{ maxWidth: 820, marginBottom: 16 }}>
      <div className="card-head"><h3>{t('nf.titulo')}</h3></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {!nota && (
        <div>
          {emitivel
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="muted">{t('nf.nao_emitida')}</span>
                {podeEmitir && <button className="btn-primary" disabled={emitindo} onClick={emitir}><Ic name="i-receipt" className="sm" /> {t('nf.emitir')}</button>}
              </div>
            : <span className="muted">{t('nf.somente_expedido')}</span>}
        </div>
      )}

      {nota?.status === 'processando' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pill st-laranja">{t('nf.status_processando')}</span>
          <span className="muted">{t('nf.processando_hint')}</span>
          <button className="btn-ghost" onClick={consultar}><Ic name="i-clock" className="sm" /> {t('nf.atualizar')}</button>
        </div>
      )}

      {nota?.status === 'autorizado' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className="pill st-verde">{t('nf.status_autorizado')}</span>
            {nota.numero && <span className="muted">{t('nf.numero')} {nota.numero}{nota.serie ? ' / ' + t('nf.serie') + ' ' + nota.serie : ''}</span>}
          </div>
          {nota.chave && <div className="muted" style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 10, wordBreak: 'break-all' }}>{nota.chave}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-acao verde" onClick={() => baixar('danfe')}><Ic name="i-download" className="sm" /> {t('nf.danfe')}</button>
            <button className="btn-ghost" onClick={() => baixar('xml')}><Ic name="i-download" className="sm" /> {t('nf.xml')}</button>
            {podeEmitir && !cancelando && <button className="btn-acao vermelho" onClick={() => { setCancelando(true); setErro(null); }}><Ic name="i-x" className="sm" /> {t('nf.cancelar')}</button>}
          </div>
          {cancelando && (
            <div style={{ marginTop: 12 }}>
              <label className="campo">{t('nf.justificativa')}
                <textarea value={justif} onChange={(e) => setJustif(e.target.value)} rows={2} maxLength={255} placeholder={t('nf.justificativa_hint')} />
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn-acao vermelho" disabled={enviandoCancel || justif.trim().length < 15} onClick={cancelar}>{enviandoCancel ? t('nf.cancelando') : t('nf.confirmar_cancelamento')}</button>
                <button className="btn-ghost" onClick={() => { setCancelando(false); setJustif(''); }}>{t('common.cancelar')}</button>
                <span className="muted" style={{ fontSize: 12 }}>{justif.trim().length}/255</span>
              </div>
            </div>
          )}
        </div>
      )}

      {(nota?.status === 'erro' || nota?.status === 'cancelado') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span className="pill st-vermelho">{t(nota.status === 'cancelado' ? 'nf.status_cancelado' : 'nf.status_erro')}</span>
            {podeEmitir && nota.status === 'erro' && emitivel && <button className="btn-primary" disabled={emitindo} onClick={emitir}><Ic name="i-receipt" className="sm" /> {t('nf.reemitir')}</button>}
          </div>
          {nota.mensagemSefaz && <div className="alerta-erro" style={{ marginBottom: 0 }}><b>{t('nf.resposta_provedor')}</b> {nota.mensagemSefaz}</div>}
        </div>
      )}
    </div>
  );
}
