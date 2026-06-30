import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { api, type ErroApi } from '../api/client.js';

type Msg = { role: 'user' | 'assistant'; texto: string };

const SUGESTOES = [
  'Quanto faturei esse mês?',
  'Quais produtos estão abaixo do mínimo?',
  'Como estão meus pedidos por status?',
  'Quais títulos a receber estão vencidos?',
];

// Assistente (IA) — botão flutuante + modal. Só consulta nesta versão.
export function AssistenteIA() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const [aberto, setAberto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, carregando, aberto]);

  if (!temCapability('ia.assistente.usar')) return null;
  const modelo = temCapability('ia.modelo_avancado') ? 'Sonnet' : 'Haiku';

  async function enviar(pergunta?: string) {
    const q = (pergunta ?? texto).trim();
    if (!q || carregando) return;
    setTexto('');
    const historico = msgs.map((m) => ({ role: m.role, content: m.texto }));
    setMsgs((m) => [...m, { role: 'user', texto: q }]);
    setCarregando(true);
    try {
      const out = await api.post<{ resposta: string; modelo: string }>('/ia/perguntar', { texto: q, historico }, token!);
      setMsgs((m) => [...m, { role: 'assistant', texto: out.resposta }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', texto: t((e as ErroApi).chaveI18n ?? 'ia.falhou') }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <button className="ia-fab" onClick={() => setAberto(true)} title="Assistente (IA)" aria-label="Assistente (IA)">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
        </svg>
      </button>

      {aberto && (
        <div className="ia-overlay" onClick={() => setAberto(false)}>
          <div className="ia-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ia-head">
              <span className="ia-ic">✦</span>
              <span className="ia-tt">Assistente (IA)</span>
              <span className="ia-mod">{modelo}</span>
              <button className="ia-x" onClick={() => setAberto(false)} aria-label="Fechar">✕</button>
            </div>

            <div className="ia-body">
              {msgs.length === 0 && !carregando && (
                <div className="ia-empty">
                  <p>Pergunte sobre vendas, pedidos, estoque e financeiro — eu busco os dados reais da sua empresa.</p>
                  <div className="ia-chips">
                    {SUGESTOES.map((s) => <button key={s} className="ia-chip" type="button" onClick={() => enviar(s)}>{s}</button>)}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={'ia-msg ' + (m.role === 'user' ? 'ia-me' : 'ia-resp')}>{m.texto}</div>
              ))}
              {carregando && <div className="ia-msg ia-resp ia-typing">Consultando…</div>}
              <div ref={fimRef} />
            </div>

            <div className="ia-foot">
              <form className="ia-input" onSubmit={(e) => { e.preventDefault(); void enviar(); }}>
                <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pergunte sobre seus dados…" autoFocus />
                <button type="submit" className="ia-send" disabled={carregando} aria-label="Enviar">➤</button>
              </form>
              <div className="ia-note">Responde com base nos seus dados e permissões · só consulta nesta versão.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
