import { useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from './Toast.js';
import { Ic } from './Icones.js';

// Versão do app (espelha apps/web/package.json — vai junto no chamado p/ contexto).
const VERSAO = '0.1.0';
const TIPOS = ['erro', 'sugestao', 'duvida'] as const;
type Tipo = (typeof TIPOS)[number];
const ICONE: Record<Tipo, string> = { erro: 'i-x', sugestao: 'i-help', duvida: 'i-help' };

// Modal de suporte: qualquer usuário logado relata erro / sugestão / dúvida.
// O chamado chega na tela "Chamados de suporte" do administrador do sistema.
export function Suporte({ onFechar }: { onFechar: () => void }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const [tipo, setTipo] = useState<Tipo>('erro');
  const [assunto, setAssunto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [print, setPrint] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function escolherPrint(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (arq.size > 2_800_000) { setErro('suporte.print_grande'); return; }
    const leitor = new FileReader();
    leitor.onload = () => setPrint(String(leitor.result));
    leitor.readAsDataURL(arq);
  }

  async function enviar() {
    setErro(null);
    if (assunto.trim().length < 3) { setErro('suporte.assunto_invalido'); return; }
    if (descricao.trim().length < 3) { setErro('suporte.descricao_invalida'); return; }
    setEnviando(true);
    try {
      await api.post('/suporte', {
        tipo, assunto, descricao, print,
        tela: window.location.pathname, versao: VERSAO,
      }, token!);
      toast(t('suporte.enviado'));
      onFechar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setEnviando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2><Ic name="i-help" /> {t('suporte.titulo')}</h2>
      <p className="muted" style={{ marginTop: 0 }}>{t('suporte.subtitulo')}</p>

      <div className="campo">{t('suporte.tipo')}
        <div className="suporte-tipos">
          {TIPOS.map((ti) => (
            <button key={ti} type="button"
              className={'chip-f' + (tipo === ti ? ' ativo' : '')}
              onClick={() => setTipo(ti)}>
              <Ic name={ICONE[ti]} className="sm" /> {t('suporte.tipo_' + ti)}
            </button>
          ))}
        </div>
      </div>

      <label className="campo">{t('suporte.assunto')}
        <input value={assunto} onChange={(e) => setAssunto(e.target.value)} maxLength={140} autoFocus />
      </label>
      <label className="campo">{t('suporte.descricao')}
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} />
      </label>

      <div className="campo">{t('suporte.print')}
        <div className="logo-area">
          {print
            ? <img src={print} alt="" className="suporte-print-thumb" />
            : <div className="suporte-print-vazio"><Ic name="i-receipt" /></div>}
          <div className="logo-btns">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={escolherPrint} />
            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>{t('suporte.print_enviar')}</button>
            {print && <button type="button" className="btn-link" onClick={() => setPrint(null)}>{t('suporte.print_remover')}</button>}
          </div>
        </div>
      </div>

      <p className="muted suporte-nota">{t('suporte.nota_contexto')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
        <button className="btn-primary" disabled={enviando || !assunto || !descricao} onClick={enviar}>{t('suporte.enviar')}</button>
      </div>
    </div></div>
  );
}
