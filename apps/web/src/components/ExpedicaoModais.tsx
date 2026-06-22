import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.js';
import { numeroPedido } from '../lib/pedido.js';

// Modal exibido ao mover um pedido para "Expedido". A FORMA DE ENTREGA vem do
// pedido de venda e NÃO pode ser alterada aqui — só se informa o detalhe que falta:
//  - retirada      → nada a informar (o cliente retira);
//  - motoboy       → escolher o motoboy (cadastro); é aqui que o frete passa a ser
//                    atribuído ao motoboy (Gestão de fretes);
//  - correios      → código de rastreio;
//  - transportadora→ nome da transportadora (+ código de rastreio opcional).
export function ModalFormaEnvio({ numero, formaEntrega, motoboys, onFechar, onConfirmar }: {
  numero: number; formaEntrega: string;
  motoboys?: { id: string; nome: string }[];
  onFechar: () => void; onConfirmar: (formaEnvio: string, detalhe: string, motoboyId: string | null) => void;
}) {
  const { t } = useI18n();
  const [motoboyId, setMotoboyId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [transp, setTransp] = useState('');

  const ehMotoboy = formaEntrega === 'motoboy';
  const ehCorreios = formaEntrega === 'correios';
  const ehTransp = formaEntrega === 'transportadora';
  const ok = ehMotoboy ? !!motoboyId : ehCorreios ? !!codigo.trim() : ehTransp ? !!transp.trim() : true;

  function confirmar() {
    let detalhe = '';
    if (ehCorreios) detalhe = codigo.trim();
    else if (ehTransp) detalhe = [transp.trim(), codigo.trim()].filter(Boolean).join(' · ');
    onConfirmar(formaEntrega, detalhe, motoboyId || null);
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
      <h2>{t('fenv.titulo')} · {numeroPedido(numero)}</h2>
      <div className="campo">
        <span>{t('entrega.forma')}</span>
        <div className="fenv-forma-fixa">{t('entrega.' + formaEntrega)}</div>
      </div>
      {formaEntrega === 'retirada' && <div className="nota-info">{t('fenv.retirada_nota')}</div>}
      {ehMotoboy && (
        <label className="campo">{t('entrega.motoboy')}
          <select value={motoboyId} onChange={(e) => setMotoboyId(e.target.value)} autoFocus>
            <option value="">{t('fenv.selecione_motoboy')}</option>
            {(motoboys ?? []).map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
          {(motoboys ?? []).length === 0 && <span className="hint">{t('fenv.sem_motoboy')}</span>}
        </label>
      )}
      {ehCorreios && (
        <label className="campo">{t('fenv.cod_rastreio')}
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder={t('fenv.cod_rastreio_ph')} autoFocus />
        </label>
      )}
      {ehTransp && (
        <>
          <label className="campo">{t('fenv.transportadora')}
            <input value={transp} onChange={(e) => setTransp(e.target.value)} placeholder={t('fenv.transportadora_ph')} autoFocus />
          </label>
          <label className="campo">{t('fenv.cod_rastreio')} <span className="muted">({t('fenv.opcional')})</span>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder={t('fenv.cod_rastreio_ph')} />
          </label>
        </>
      )}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={!ok} onClick={confirmar}>{t('fenv.confirmar')}</button>
      </div>
    </div></div>
  );
}

// Modal exibido ao mover um pedido para "Entregue": informa a data de entrega
// e, opcionalmente, quem recebeu (fica em branco se a entrega foi de outra forma).
export function ModalDataEntrega({ numero, inicial, onFechar, onConfirmar }: {
  numero: number; inicial?: string | null; onFechar: () => void; onConfirmar: (data: string, recebidoPor: string) => void;
}) {
  const { t } = useI18n();
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(inicial || hoje);
  const [recebidoPor, setRecebidoPor] = useState('');
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
      <h2>{t('ent.titulo')} · {numeroPedido(numero)}</h2>
      <label className="campo">{t('ent.data')}<input type="date" value={data} onChange={(e) => setData(e.target.value)} autoFocus /></label>
      <label className="campo">{t('ent.recebido_por')}<b className="obrig"> *</b>
        <input value={recebidoPor} onChange={(e) => setRecebidoPor(e.target.value)} placeholder={t('ent.recebido_por_ph')} />
      </label>
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={!data || !recebidoPor.trim()} onClick={() => onConfirmar(data, recebidoPor.trim())}>{t('ent.confirmar')}</button>
      </div>
    </div></div>
  );
}
