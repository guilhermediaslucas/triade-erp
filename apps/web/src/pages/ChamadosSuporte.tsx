import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Chamado {
  id: string; tipo: 'erro' | 'sugestao' | 'duvida'; assunto: string; descricao: string;
  print: string | null; tela: string; versao: string;
  empresaCodigo: string; empresaFantasia: string; usuarioNome: string; usuarioEmail: string;
  status: 'aberto' | 'em_andamento' | 'resolvido'; criadoEm: string; resolvidoEm: string | null;
}

interface Analise { modulo: string; urgencia: 'alta' | 'media' | 'baixa'; tipo: string; causa: string; resposta: string; status: Chamado['status']; }
type Filtro = 'todos' | 'aberto' | 'em_andamento' | 'resolvido';
const URG_PILL: Record<string, string> = { alta: 'pill-erro', media: 'pill-aviso', baixa: 'pill-ok' };
const PILL_TIPO: Record<Chamado['tipo'], string> = { erro: 'pill-erro', sugestao: 'pill-info', duvida: 'pill-neutro' };
const PILL_STATUS: Record<Chamado['status'], string> = { aberto: 'pill-erro', em_andamento: 'pill-aviso', resolvido: 'pill-ok' };

function fmtData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ChamadosSuporte() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [ver, setVer] = useState<Chamado | null>(null);
  const [triagem, setTriagem] = useState<Record<string, { modulo: string; urgencia: string }>>({});
  const [triando, setTriando] = useState(false);

  async function carregar() {
    try { setChamados(await api.get<Chamado[]>('/suporte', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function analisarPendentes() {
    setTriando(true); setErro(null);
    try {
      const r = await api.post<{ id: string; modulo: string; urgencia: string }[]>('/suporte/analisar-pendentes', {}, token!);
      const m: Record<string, { modulo: string; urgencia: string }> = {};
      for (const x of r) m[x.id] = { modulo: x.modulo, urgencia: x.urgencia };
      setTriagem(m);
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setTriando(false); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const kpis = useMemo(() => ({
    aberto: chamados.filter((c) => c.status === 'aberto').length,
    andamento: chamados.filter((c) => c.status === 'em_andamento').length,
    resolvido: chamados.filter((c) => c.status === 'resolvido').length,
  }), [chamados]);

  const lista = filtro === 'todos' ? chamados : chamados.filter((c) => c.status === filtro);

  async function mudarStatus(c: Chamado, status: Chamado['status']) {
    try {
      await api.patch(`/suporte/${c.id}/status`, { status }, token!);
      setVer(null); carregar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const CHIPS: Filtro[] = ['todos', 'aberto', 'em_andamento', 'resolvido'];

  return (
    <div>
      <div className="crumb">{t('chamados.crumb')}</div>
      <div className="page-head">
        <h1 className="page-titulo">{t('chamados.titulo')}</h1>
        <button className="btn-ghost" disabled={triando} onClick={analisarPendentes}>✨ {triando ? t('chamados.analisando') : t('chamados.analisar_pendentes')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="sup-kpis">
        <div className="kpi-card"><div className="kpi-lbl">{t('chamados.abertos')}</div><div className="kpi-val sup-erro">{kpis.aberto}</div></div>
        <div className="kpi-card"><div className="kpi-lbl">{t('chamados.em_andamento')}</div><div className="kpi-val sup-aviso">{kpis.andamento}</div></div>
        <div className="kpi-card"><div className="kpi-lbl">{t('chamados.resolvidos')}</div><div className="kpi-val sup-ok">{kpis.resolvido}</div></div>
      </div>

      <div className="contas-chips" style={{ margin: '14px 0' }}>
        {CHIPS.map((c) => (
          <button key={c} className={'chip-f' + (filtro === c ? ' ativo' : '')} onClick={() => setFiltro(c)}>{t('chamados.f_' + c)}</button>
        ))}
      </div>

      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr>
            <th style={{ width: 90 }}>{t('chamados.tipo')}</th>
            <th>{t('chamados.assunto')}</th>
            <th style={{ width: 130 }}>{t('chamados.empresa')}</th>
            <th style={{ width: 120 }}>{t('chamados.data')}</th>
            <th style={{ width: 120 }}>{t('chamados.status')}</th>
          </tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} className="vazio">{t('common.nenhum')}</td></tr>}
            {lista.map((c) => (
              <tr key={c.id} className="linha-click" onClick={() => setVer(c)}>
                <td data-label={t('chamados.tipo')}><span className={'pill ' + PILL_TIPO[c.tipo]}>{t('suporte.tipo_' + c.tipo)}</span></td>
                <td data-label={t('chamados.assunto')}>{c.assunto}{triagem[c.id] && <span className={'pill ' + (URG_PILL[triagem[c.id]!.urgencia] ?? 'pill-neutro')} style={{ marginLeft: 8, fontSize: 11 }}>{triagem[c.id]!.modulo} · {t('chamados.urg_' + triagem[c.id]!.urgencia)}</span>}</td>
                <td data-label={t('chamados.empresa')}>{c.empresaFantasia || c.empresaCodigo}</td>
                <td data-label={t('chamados.data')}>{fmtData(c.criadoEm)}</td>
                <td data-label={t('chamados.status')}><span className={'pill ' + PILL_STATUS[c.status]}>{t('chamados.s_' + c.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ver && <ModalVer chamado={ver} onFechar={() => setVer(null)} onStatus={mudarStatus} onAplicado={() => { setVer(null); carregar(); }} />}
    </div>
  );
}

function ModalVer({ chamado, onFechar, onStatus, onAplicado }: {
  chamado: Chamado; onFechar: () => void; onStatus: (c: Chamado, s: Chamado['status']) => void; onAplicado: () => void;
}) {
  const { token } = useAuth(); const { t } = useI18n();
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [resposta, setResposta] = useState('');
  const [statusIA, setStatusIA] = useState<Chamado['status']>('em_andamento');
  const [aplicando, setAplicando] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);

  async function analisar() {
    setAnalisando(true); setErroIA(null);
    try { const a = await api.post<Analise>(`/suporte/${chamado.id}/analisar-ia`, {}, token!); setAnalise(a); setResposta(a.resposta); setStatusIA(a.status); }
    catch (e) { setErroIA((e as ErroApi).chaveI18n); }
    finally { setAnalisando(false); }
  }
  async function aplicar() {
    setAplicando(true); setErroIA(null);
    try { await api.post(`/suporte/${chamado.id}/aplicar`, { status: statusIA, resposta }, token!); onAplicado(); }
    catch (e) { setErroIA((e as ErroApi).chaveI18n); setAplicando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
      <h2><span className={'pill ' + PILL_TIPO[chamado.tipo]}>{t('suporte.tipo_' + chamado.tipo)}</span> {chamado.assunto}</h2>
      <table className="sup-det">
        <tbody>
          <tr><td className="det-rot">{t('chamados.empresa')}</td><td>{chamado.empresaFantasia || chamado.empresaCodigo}</td></tr>
          <tr><td className="det-rot">{t('chamados.usuario')}</td><td>{chamado.usuarioNome} · {chamado.usuarioEmail}</td></tr>
          <tr><td className="det-rot">{t('chamados.tela_versao')}</td><td>{chamado.tela || '—'} · v{chamado.versao || '—'}</td></tr>
          <tr><td className="det-rot">{t('chamados.data')}</td><td>{fmtData(chamado.criadoEm)}</td></tr>
        </tbody>
      </table>
      <p className="suporte-desc">{chamado.descricao}</p>
      {chamado.print && <>
        <div className="muted" style={{ marginBottom: 6 }}>{t('chamados.print')}</div>
        <a href={chamado.print} target="_blank" rel="noreferrer"><img src={chamado.print} alt="" className="suporte-print-full" /></a>
      </>}

      {!analise ? (
        <button className="btn-primary" style={{ marginTop: 10 }} disabled={analisando} onClick={analisar}>✨ {analisando ? t('chamados.analisando') : t('chamados.analisar_ia')}</button>
      ) : (
        <div className="ia-painel">
          <div className="ia-painel-cab">✨ {t('chamados.analise_ia')}</div>
          <div className="ia-chips">
            <span className="pill pill-neutro">{analise.modulo}</span>
            <span className={'pill ' + (URG_PILL[analise.urgencia] ?? 'pill-neutro')}>{t('chamados.urg_' + analise.urgencia)}</span>
            <span className="pill pill-info">{t('suporte.tipo_' + analise.tipo)}</span>
          </div>
          {analise.causa && <><div className="ia-lbl">{t('chamados.causa')}</div><div className="muted" style={{ fontSize: 13 }}>{analise.causa}</div></>}
          <div className="ia-lbl">{t('chamados.resposta_sugerida')}</div>
          <textarea value={resposta} onChange={(e) => setResposta(e.target.value)} rows={5} style={{ width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span className="muted" style={{ fontSize: 13 }}>{t('chamados.status')}:</span>
            <select value={statusIA} onChange={(e) => setStatusIA(e.target.value as Chamado['status'])}>
              <option value="em_andamento">{t('chamados.s_em_andamento')}</option>
              <option value="resolvido">{t('chamados.s_resolvido')}</option>
            </select>
          </div>
        </div>
      )}
      {erroIA && <div className="alerta-erro" style={{ marginTop: 10 }}>{t(erroIA)}</div>}

      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button>
        {!analise && chamado.status !== 'em_andamento' && <button className="btn-ghost" onClick={() => onStatus(chamado, 'em_andamento')}>{t('chamados.marcar_andamento')}</button>}
        {!analise && chamado.status !== 'resolvido' && <button className="btn-primary" onClick={() => onStatus(chamado, 'resolvido')}>{t('chamados.marcar_resolvido')}</button>}
        {!analise && chamado.status === 'resolvido' && <button className="btn-ghost" onClick={() => onStatus(chamado, 'aberto')}>{t('chamados.reabrir')}</button>}
        {analise && <button className="btn-primary" disabled={aplicando} onClick={aplicar}>{aplicando ? t('chamados.aplicando') : t('chamados.aplicar')}</button>}
      </div>
    </div></div>
  );
}
