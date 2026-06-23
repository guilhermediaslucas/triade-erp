import { useState } from 'react';
import type { ErroApi } from '../api/client.js';
import { useI18n } from '../i18n/I18nContext.js';

// Modal de confirmação da entrega: o motoboy digita os 4 últimos dígitos do telefone
// do cliente. Sem "quem recebeu". Código errado → mostra a mensagem e NÃO finaliza.
// `onConfirmar` recebe os 4 dígitos e deve lançar (ErroApi) em caso de erro.
export function ConfirmarEntrega({ pedido, onConfirmar, onFechar }: {
  pedido: string;
  onConfirmar: (codigo: string) => Promise<void>;
  onFechar: () => void;
}) {
  const { t } = useI18n();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  const digitos = codigo.replace(/\D/g, '').slice(0, 4);
  const ok = digitos.length === 4;

  async function confirmar() {
    if (!ok) return;
    setErro(null); setSalv(true);
    try { await onConfirmar(digitos); }
    catch (e) { setErro((e as ErroApi).chaveI18n ?? 'rastreio.erro_status'); setSalv(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
      <h2 style={{ marginTop: 0 }}>{t('rastreio.confirmar_entrega')}</h2>
      <p className="muted" style={{ marginTop: -4 }}>{pedido}</p>
      <label className="campo">{t('rastreio.codigo_telefone_label')}
        <input
          inputMode="numeric" autoFocus value={digitos}
          onChange={(e) => { setErro(null); setCodigo(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && ok) confirmar(); }}
          placeholder="0000" maxLength={4}
          style={{ fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: 700 }}
        />
        <small className="hint">{t('rastreio.codigo_telefone_hint')}</small>
      </label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={!ok || salv} onClick={confirmar}>{salv ? '…' : t('rastreio.btn_entregue')}</button>
      </div>
    </div></div>
  );
}
