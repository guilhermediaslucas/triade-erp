import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';
import { abrirArquivo, baixarArquivo } from '../lib/download.js';

interface Anexo { id: string; nomeArquivo: string; tipo: string; tamanho: number; usuarioNome: string | null; criadoEm: string; }

export interface AnexosUrls {
  listar: string;
  enviar: string;
  conteudo: (id: string) => string;
  remover: (id: string) => string;
}

const fmtTam = (b: number) => b >= 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const fmtData = (s: string) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

// Modal/seção genérica de anexos de documentos (arquivos no R2). Serve para títulos,
// clientes, etc. — basta passar as URLs. `inline` embute a seção sem o overlay de modal.
export function AnexosDocumentos({ titulo, urls, podeGerenciar, onFechar, inline }: {
  titulo: string; urls: AnexosUrls; podeGerenciar: boolean; onFechar?: () => void; inline?: boolean;
}) {
  const { token } = useAuth(); const { t } = useI18n();
  const [itens, setItens] = useState<Anexo[]>([]);
  const [habilitado, setHabilitado] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function carregar() { api.get<Anexo[]>(urls.listar, token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); }
  useEffect(() => {
    carregar();
    api.get<{ habilitado: boolean }>('/anexos/habilitado', token!).then((r) => setHabilitado(r.habilitado)).catch(() => {});
    /* eslint-disable-next-line */
  }, [urls.listar]);

  function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (arq.size > 10 * 1024 * 1024) { setErro('anexo.muito_grande'); return; }
    const leitor = new FileReader();
    leitor.onload = async () => {
      setErro(null); setEnviando(true);
      try { await api.post(urls.enviar, { nomeArquivo: arq.name, tipo: arq.type, conteudoBase64: String(leitor.result) }, token!); carregar(); }
      catch (er) { setErro((er as ErroApi).chaveI18n); }
      finally { setEnviando(false); if (fileRef.current) fileRef.current.value = ''; }
    };
    leitor.readAsDataURL(arq);
  }

  async function abrir(a: Anexo, baixar: boolean) {
    try {
      const blob = await api.blob(urls.conteudo(a.id), token!);
      if (baixar) await baixarArquivo(a.nomeArquivo, blob);
      else await abrirArquivo(a.nomeArquivo, blob);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  async function remover(a: Anexo) {
    if (!window.confirm(t('anexo.remover_confirma'))) return;
    try { await api.del(urls.remover(a.id), token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const conteudo = (
    <>
      {!inline && <h2><Ic name="i-clip" /> {titulo}</h2>}
      {!habilitado && <div className="nota-info">{t('anexo.indisponivel')}</div>}
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      {itens.length === 0 && <p className="muted">{t('anexo.vazio')}</p>}
      {itens.map((a) => (
        <div key={a.id} className="anexo-linha">
          <Ic name="i-clip" />
          <div className="anexo-info">
            <div className="anexo-nome">{a.nomeArquivo}</div>
            <div className="anexo-meta">{fmtTam(a.tamanho)} · {a.usuarioNome ?? '—'} · {fmtData(a.criadoEm)}</div>
          </div>
          <button className="btn-ghost btn-mini" onClick={() => abrir(a, false)}><Ic name="i-eye" className="sm" /> {t('anexo.ver')}</button>
          <button className="btn-ghost btn-mini" onClick={() => abrir(a, true)}><Ic name="i-download" className="sm" /> {t('anexo.baixar')}</button>
          {podeGerenciar && <button className="acao-ic" title={t('common.excluir')} onClick={() => remover(a)}><Ic name="i-trash" className="sm" /></button>}
        </div>
      ))}

      {podeGerenciar && habilitado && (
        <div className="anexo-upload">
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" hidden onChange={escolher} />
          <button className="btn-primary" disabled={enviando} onClick={() => fileRef.current?.click()}>
            <Ic name="i-upload" className="sm" /> {enviando ? t('anexo.enviando') : t('anexo.enviar')}
          </button>
          <small className="hint">{t('anexo.formatos')}</small>
        </div>
      )}
    </>
  );

  if (inline) return <div className="anexo-inline">{conteudo}</div>;

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
      {conteudo}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button></div>
    </div></div>
  );
}
