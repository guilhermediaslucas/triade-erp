import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';
import { numeroPedido } from '../lib/pedido.js';

// Modal exibido ao mover um pedido para "Expedido": escolhe a forma de envio
// (sugestões vêm do cadastro Formas de entrega) + um detalhe opcional (rastreio/motoboy).
export function ModalFormaEnvio({ numero, formas, inicial, onFechar, onConfirmar }: {
  numero: number; formas: string[]; inicial?: { forma: string | null; detalhe: string | null };
  onFechar: () => void; onConfirmar: (formaEnvio: string, detalhe: string) => void;
}) {
  const { t } = useI18n();
  const [forma, setForma] = useState(inicial?.forma ?? '');
  const [detalhe, setDetalhe] = useState(inicial?.detalhe ?? '');
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('fenv.titulo')} · {numeroPedido(numero)}</h2>
      <label className="campo">{t('fenv.forma')}
        <input list="fenv-formas" value={forma} onChange={(e) => setForma(e.target.value)} placeholder={t('fenv.selecione')} autoFocus />
        <datalist id="fenv-formas">{formas.map((f) => <option key={f} value={f} />)}</datalist>
      </label>
      <label className="campo">{t('fenv.detalhe')}<input value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder={t('fenv.detalhe_ph')} /></label>
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={!forma.trim()} onClick={() => onConfirmar(forma.trim(), detalhe.trim())}>{t('fenv.confirmar')}</button>
      </div>
    </div></div>
  );
}

// Modal exibido ao mover um pedido para "Entregue": informa a data de entrega.
export function ModalDataEntrega({ numero, inicial, onFechar, onConfirmar }: {
  numero: number; inicial?: string | null; onFechar: () => void; onConfirmar: (data: string) => void;
}) {
  const { t } = useI18n();
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(inicial || hoje);
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
      <h2>{t('ent.titulo')} · {numeroPedido(numero)}</h2>
      <label className="campo">{t('ent.data')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} autoFocus /></label>
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={!data} onClick={() => onConfirmar(data)}>{t('ent.confirmar')}</button>
      </div>
    </div></div>
  );
}
