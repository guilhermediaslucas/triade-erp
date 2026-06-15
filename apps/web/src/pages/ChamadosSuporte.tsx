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

type Filtro = 'todos' | 'aberto' | 'em_andamento' | 'resolvido';
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

  async function carregar() {
    try { setChamados(await api.get<Chamado[]>('/suporte', token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
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
      <div className="crumb">{t('chamados.crumb')}</div><h1 className="page-titulo">{t('chamados.titulo')}</h1>
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
                <td data-label={t('chamados.assunto')}>{c.assunto}</td>
                <td data-label={t('chamados.empresa')}>{c.empresaFantasia || c.empresaCodigo}</td>
                <td data-label={t('chamados.data')}>{fmtData(c.criadoEm)}</td>
                <td data-label={t('chamados.status')}><span className={'pill ' + PILL_STATUS[c.status]}>{t('chamados.s_' + c.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ver && <ModalVer chamado={ver} onFechar={() => setVer(null)} onStatus={mudarStatus} />}
    </div>
  );
}

function ModalVer({ chamado, onFechar, onStatus }: {
  chamado: Chamado; onFechar: () => void; onStatus: (c: Chamado, s: Chamado['status']) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
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
      <div className="modal-acoes">
        <button className="btn-ghost" onClick={onFechar}>{t('common.fechar')}</button>
        {chamado.status !== 'em_andamento' && <button className="btn-ghost" onClick={() => onStatus(chamado, 'em_andamento')}>{t('chamados.marcar_andamento')}</button>}
        {chamado.status !== 'resolvido' && <button className="btn-primary" onClick={() => onStatus(chamado, 'resolvido')}>{t('chamados.marcar_resolvido')}</button>}
        {chamado.status === 'resolvido' && <button className="btn-ghost" onClick={() => onStatus(chamado, 'aberto')}>{t('chamados.reabrir')}</button>}
      </div>
    </div></div>
  );
}
