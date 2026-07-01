import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { api, type ErroApi } from '../api/client.js';

type Proposta = { tipo: string; titulo: string; resumo: [string, string][]; dados: Record<string, unknown> };
type Msg = { role: 'user' | 'assistant'; texto: string; proposta?: Proposta; pStatus?: 'pendente' | 'aplicada' | 'descartada' };

const SUGESTOES = [
  'Quanto faturei esse mês?',
  'Quais produtos estão abaixo do mínimo?',
  'Como estão meus pedidos por status?',
  'Quais títulos a receber estão vencidos?',
];

// Assistente (IA) — botão flutuante + modal. Consulta + ações propostas (nível avançado).
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
  const podeAgir = temCapability('ia.modelo_avancado');
  const modelo = podeAgir ? 'Sonnet' : 'Haiku';

  async function enviar(pergunta?: string) {
    const q = (pergunta ?? texto).trim();
    if (!q || carregando) return;
    setTexto('');
    const historico = msgs.map((m) => ({ role: m.role, content: m.texto }));
    setMsgs((m) => [...m, { role: 'user', texto: q }]);
    setCarregando(true);
    try {
      const out = await api.post<{ resposta: string; modelo: string; proposta?: Proposta }>('/ia/perguntar', { texto: q, historico }, token!);
      setMsgs((m) => [...m, { role: 'assistant', texto: out.resposta, proposta: out.proposta, pStatus: out.proposta ? 'pendente' : undefined }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', texto: t((e as ErroApi).chaveI18n ?? 'ia.falhou') }]);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar(idx: number, proposta: Proposta) {
    setCarregando(true);
    try {
      const out = await api.post<{ mensagem: string }>('/ia/aplicar', { proposta }, token!);
      setMsgs((m) => [...m.map((x, i): Msg => (i === idx ? { ...x, pStatus: 'aplicada' } : x)), { role: 'assistant', texto: '✅ ' + out.mensagem }]);
    } catch (e) {
      setMsgs((m) => m.concat({ role: 'assistant', texto: t((e as ErroApi).chaveI18n ?? 'ia.falhou') }));
    } finally {
      setCarregando(false);
    }
  }
  function descartar(idx: number) {
    setMsgs((m) => m.map((x, i) => (i === idx ? { ...x, pStatus: 'descartada' } : x)));
  }

  // Fechar limpa a conversa → reabrir começa na tela de opções.
  function fechar() { setAberto(false); setMsgs([]); setTexto(''); }

  return (
    <>
      <button className="ia-fab" onClick={() => setAberto(true)} title="Assistente (IA)" aria-label="Assistente (IA)">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
        </svg>
      </button>

      {aberto && (
        <div className="ia-overlay" onClick={fechar}>
          <div className="ia-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ia-head">
              <span className="ia-ic">✦</span>
              <span className="ia-tt">Assistente (IA)</span>
              <span className="ia-mod">{modelo}</span>
              <button className="ia-x" onClick={fechar} aria-label="Fechar">✕</button>
            </div>

            <div className="ia-body">
              {msgs.length === 0 && !carregando && (
                <div className="ia-empty">
                  <p>Pergunte sobre vendas, pedidos, estoque e financeiro — eu busco os dados reais da sua empresa.{podeAgir ? ' Também posso criar pedido, cliente e título: eu monto e você confirma.' : ''}</p>
                  <div className="ia-chips">
                    {SUGESTOES.map((s) => <button key={s} className="ia-chip" type="button" onClick={() => enviar(s)}>{s}</button>)}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className="ia-linha">
                  {m.texto && <div className={'ia-msg ' + (m.role === 'user' ? 'ia-me' : 'ia-resp')}>{m.texto}</div>}
                  {m.proposta && (
                    <div className="ia-acao">
                      <div className="ia-acao-h">Ação proposta — {m.proposta.titulo}</div>
                      {m.proposta.resumo.map(([k, v], j) => (
                        <div className="ia-acao-l" key={j}><span>{k}</span><span>{v}</span></div>
                      ))}
                      {m.pStatus === 'pendente' ? (
                        <div className="ia-acao-bt">
                          <button className="ia-ok" onClick={() => confirmar(i, m.proposta!)} disabled={carregando}>Confirmar e criar</button>
                          <button className="ia-no" onClick={() => descartar(i)} disabled={carregando}>Descartar</button>
                        </div>
                      ) : (
                        <div className={'ia-acao-st ' + (m.pStatus === 'aplicada' ? 'ok' : 'no')}>
                          {m.pStatus === 'aplicada' ? '✓ Aplicada' : 'Descartada'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {carregando && <div className="ia-msg ia-resp ia-typing">Consultando…</div>}
              <div ref={fimRef} />
            </div>

            <div className="ia-foot">
              <form className="ia-input" onSubmit={(e) => { e.preventDefault(); void enviar(); }}>
                <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pergunte sobre seus dados…" autoFocus />
                <button type="submit" className="ia-send" disabled={carregando} aria-label="Enviar">➤</button>
              </form>
              <div className="ia-note">{podeAgir
                ? 'Consulto seus dados e posso criar pedido, cliente e título — você confirma antes de aplicar.'
                : 'Respondo com base nos seus dados e permissões · nesta versão, apenas consulta.'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
