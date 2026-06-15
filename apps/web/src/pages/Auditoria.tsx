import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { baixarCsv } from '../lib/csv.js';

interface Linha { criadoEm: string; usuarioNome: string | null; modulo: string | null; metodo: string; caminho: string; status: number | null; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtDataHora = (s: string) => new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const VERBO: Record<string, string> = { POST: 'criou', PUT: 'editou', PATCH: 'alterou', DELETE: 'removeu' };

export function Auditoria() {
  const { token } = useAuth(); const { t } = useI18n();
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [fUsuario, setFUsuario] = useState(''); const [fModulo, setFModulo] = useState('');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    const q = new URLSearchParams();
    if (fUsuario) q.set('usuario', fUsuario); if (fModulo) q.set('modulo', fModulo);
    if (de) q.set('de', de); if (ate) q.set('ate', ate);
    api.get<Linha[]>('/auditoria?' + q.toString(), token!).then(setLinhas).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  useEffect(() => { api.get<string[]>('/auditoria/usuarios', token!).then(setUsuarios).catch(() => {}); /* eslint-disable-next-line */ }, []);
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [fUsuario, fModulo, de, ate]);

  const modulos = Array.from(new Set(linhas.map((l) => l.modulo).filter(Boolean))) as string[];

  function exportar() {
    const cab = [t('audit.data'), t('audit.usuario'), t('audit.modulo'), t('audit.acao')];
    const dados = linhas.map((l) => [fmtDataHora(l.criadoEm), l.usuarioNome ?? '', l.modulo ?? '', (VERBO[l.metodo] ?? l.metodo) + ' ' + l.caminho]);
    baixarCsv('auditoria_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <div className="crumb">{t('audit.crumb')}</div><h1 className="page-titulo">{t('audit.titulo')}</h1><p className="muted page-sub">{t('audit.sub')}</p>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('audit.usuario')}
          <select value={fUsuario} onChange={(e) => setFUsuario(e.target.value)}><option value="">{t('audit.todos')}</option>{usuarios.map((u) => <option key={u}>{u}</option>)}</select>
        </label>
        <label className="campo" style={{ margin: 0 }}>{t('audit.modulo')}
          <select value={fModulo} onChange={(e) => setFModulo(e.target.value)}><option value="">{t('audit.todos')}</option>{modulos.map((m) => <option key={m}>{m}</option>)}</select>
        </label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 160 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 160 }} /></label>
        {linhas.length > 0 && <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={exportar}>{t('rel.exportar_csv')}</button>}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-1linha">
          <thead><tr><th style={{ width: 140 }}>{t('audit.data')}</th><th>{t('audit.usuario')}</th><th>{t('audit.modulo')}</th><th>{t('audit.acao')}</th></tr></thead>
          <tbody>
            {linhas.length === 0 && <tr><td colSpan={4} className="vazio">{t('rel.vazio')}</td></tr>}
            {linhas.map((l, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--muted)' }}>{fmtDataHora(l.criadoEm)}</td>
                <td>{l.usuarioNome ?? '—'}</td>
                <td><span className="pill st-azul">{l.modulo ?? '—'}</span></td>
                <td style={{ color: 'var(--muted)' }}>{(VERBO[l.metodo] ?? l.metodo) + ' '}{l.caminho}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
