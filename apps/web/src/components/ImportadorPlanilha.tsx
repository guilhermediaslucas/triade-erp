import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useI18n } from '../i18n/I18nContext.js';
import { baixarCsv } from '../lib/csv.js';

// Importador genérico de planilha (CSV/XLSX) reaproveitado por Clientes e Leads.
// Lê o arquivo no navegador, mapeia colunas (auto por nome do cabeçalho), mostra
// uma prévia e chama onImportar com as linhas já mapeadas (JSON). O backend só
// recebe os objetos normalizados.

export interface CampoImport { chave: string; rotulo: string; obrigatorio?: boolean; exemplo?: string; aliases?: string[]; }
export interface ResultadoImport { criados: number; ignorados: number; erros: { linha: number; motivo: string }[]; }

// Remove acentos (faixa de diacríticos combinantes U+0300–U+036F) p/ casar cabeçalhos.
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const PREVIA = 8;

export function ImportadorPlanilha({ titulo, campos, modelo, onImportar, onFechar, onConcluido }: {
  titulo: string;
  campos: CampoImport[];
  modelo: string;
  onImportar: (linhas: Record<string, string>[]) => Promise<ResultadoImport>;
  onFechar: () => void;
  onConcluido?: () => void;
}) {
  const { t } = useI18n();
  const [headers, setHeaders] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<string[][]>([]);
  const [map, setMap] = useState<Record<string, number>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImport | null>(null);

  function autoMap(hs: string[]): Record<string, number> {
    const m: Record<string, number> = {};
    for (const c of campos) {
      const alvos = [c.chave, c.rotulo, ...(c.aliases ?? [])].map(norm);
      m[c.chave] = hs.findIndex((h) => alvos.includes(norm(h)));
    }
    return m;
  }

  async function lerArquivo(file: File | null) {
    if (!file) return;
    setErro(null); setResultado(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const nomeAba = wb.SheetNames[0];
      const ws = nomeAba ? wb.Sheets[nomeAba] : undefined;
      if (!ws) { setErro('import.vazio'); return; }
      const arr = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false, defval: '' }) as any[][];
      if (!arr.length) { setErro('import.vazio'); return; }
      const hs = (arr[0] ?? []).map((x) => String(x ?? '').trim());
      const dados = arr.slice(1)
        .map((l) => hs.map((_, i) => String(l[i] ?? '').trim()))
        .filter((l) => l.some((c) => c !== ''));
      setHeaders(hs); setLinhas(dados); setMap(autoMap(hs));
    } catch { setErro('import.erro_ler'); }
  }

  const objetos = useMemo(() => linhas.map((l) => {
    const o: Record<string, string> = {};
    for (const c of campos) { const i = map[c.chave]; o[c.chave] = i != null && i >= 0 ? (l[i] ?? '') : ''; }
    return o;
  }), [linhas, map, campos]);

  const validas = objetos.filter((o) => campos.every((c) => !c.obrigatorio || (o[c.chave] ?? '').trim() !== '')).length;

  function baixarModelo() {
    baixarCsv(modelo, campos.map((c) => c.rotulo), [campos.map((c) => c.exemplo ?? '')]);
  }

  async function importar() {
    setEnviando(true); setErro(null);
    try { setResultado(await onImportar(objetos)); onConcluido?.(); }
    catch { setErro('import.erro_enviar'); }
    finally { setEnviando(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{titulo}</h2>

      {!resultado && <>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <input type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={(e) => lerArquivo(e.target.files?.[0] ?? null)} />
          <button type="button" className="btn-ghost btn-mini" onClick={baixarModelo}>{t('import.baixar_modelo')}</button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{t('import.aceita')}</div>

        {headers.length > 0 && <>
          <div className="perm-titulo">{t('import.mapear')}</div>
          <div className="form-grid">
            {campos.map((c) => (
              <label key={c.chave} className="campo">{c.rotulo}{c.obrigatorio ? ' *' : ''}
                <select value={map[c.chave] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [c.chave]: Number(e.target.value) }))}>
                  <option value={-1}>— {t('import.ignorar')} —</option>
                  {headers.map((h, i) => <option key={i} value={i}>{h || `(${t('import.coluna')} ${i + 1})`}</option>)}
                </select>
              </label>
            ))}
          </div>

          <div className="perm-titulo" style={{ marginTop: 12 }}>{t('import.previa')} ({Math.min(PREVIA, objetos.length)}/{objetos.length})</div>
          <div className="card pad0" style={{ maxWidth: 'none', overflowX: 'auto' }}>
            <table className="tabela">
              <thead><tr>{campos.map((c) => <th key={c.chave}>{c.rotulo}</th>)}</tr></thead>
              <tbody>
                {objetos.slice(0, PREVIA).map((o, i) => {
                  const invalida = campos.some((c) => c.obrigatorio && (o[c.chave] ?? '').trim() === '');
                  return <tr key={i} className={invalida ? 'linha-inativa' : ''}>{campos.map((c) => <td key={c.chave}>{o[c.chave] || '—'}</td>)}</tr>;
                })}
                {objetos.length === 0 && <tr><td colSpan={campos.length} className="vazio">{t('common.nenhum')}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{objetos.length} {t('import.linhas')} · {validas} {t('import.validas')}</div>
        </>}

        {erro && <div className="alerta-erro" style={{ marginTop: 12 }}>{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={enviando || validas === 0} onClick={importar}>{t('import.importar')} ({validas})</button>
        </div>
      </>}

      {resultado && <>
        <div className="dash-row c3" style={{ marginBottom: 12 }}>
          <div className="card"><div className="kpi"><div><div className="lbl">{t('import.criados')}</div><div className="val" style={{ color: '#16a34a' }}>{resultado.criados}</div></div></div></div>
          <div className="card"><div className="kpi"><div><div className="lbl">{t('import.ignorados')}</div><div className="val">{resultado.ignorados}</div></div></div></div>
          <div className="card"><div className="kpi"><div><div className="lbl">{t('import.erros')}</div><div className="val" style={{ color: resultado.erros.length ? '#e1483b' : undefined }}>{resultado.erros.length}</div></div></div></div>
        </div>
        {resultado.ignorados > 0 && <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>{t('import.nota_dedup')}</div>}
        {resultado.erros.length > 0 && <div className="card pad0" style={{ maxWidth: 'none', overflowX: 'auto' }}>
          <table className="tabela"><thead><tr><th>{t('import.linha')}</th><th>{t('import.motivo')}</th></tr></thead>
            <tbody>{resultado.erros.map((er, i) => <tr key={i}><td>{er.linha}</td><td>{t(er.motivo)}</td></tr>)}</tbody>
          </table>
        </div>}
        <div className="modal-acoes"><button className="btn-primary" onClick={onFechar}>{t('common.fechar')}</button></div>
      </>}
    </div></div>
  );
}
