import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { MoedaInput } from '../components/MoedaInput.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { FiltrosModal } from '../components/FiltrosModal.js';

interface FretePedido { id: string; numero: number; criadoEm: string; clienteNome: string | null; formaEntrega: string; motoboy: string | null; distanciaKm: number | null; frete: number; gerado: boolean; }
interface FreteConfig { kmRate: number; minMotoboy: number; cepOrigem: string | null; }
const numeroPedido = (n: number) => 'PE-' + String(n).padStart(6, '0');

export function GestaoFretes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeFechar = temCapability('logistica.frete.gerenciar');
  const podeParam = temCapability('cadastros.motoboy.gerenciar');
  const [de, setDe] = useState(''); const [ate, setAte] = useState('');
  const [venc, setVenc] = useState(''); const [emissao, setEmissao] = useState(new Date().toISOString().slice(0, 10));
  const [fGerado, setFGerado] = useState<'nao' | 'sim' | 'todos'>('nao'); // padrão: só não gerados
  const [linhas, setLinhas] = useState<FretePedido[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirmar, setConfirmar] = useState(false);
  const [cfg, setCfg] = useState<FreteConfig | null>(null);
  const [kmRate, setKmRate] = useState(''); const [minMotoboy, setMinMotoboy] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [ok, setOk] = useState<string | null>(null);

  function gerar(dd = de, aa = ate, g = fGerado) {
    setErro(null); setOk(null); setSel(new Set());
    const qs = [dd ? 'de=' + dd : '', aa ? 'ate=' + aa : '', 'gerado=' + g].filter(Boolean).join('&');
    api.get<FretePedido[]>('/logistica/fretes/pedidos?' + qs, token!).then(setLinhas).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  const qtdFiltros = (de ? 1 : 0) + (ate ? 1 : 0);
  function limparFiltros() { setDe(''); setAte(''); gerar('', '', fGerado); }
  useEffect(() => {
    gerar();
    api.get<FreteConfig>('/frete/config', token!).then((c) => { setCfg(c); setKmRate(String(c.kmRate)); setMinMotoboy(String(c.minMotoboy)); }).catch(() => {});
    /* eslint-disable-next-line */
  }, []);
  function trocarFiltroGerado(g: 'nao' | 'sim' | 'todos') { setFGerado(g); gerar(de, ate, g); }

  const total = useMemo(() => linhas.reduce((a, l) => a + l.frete, 0), [linhas]);
  // Só pedidos NÃO gerados podem ser selecionados.
  const selecionaveis = useMemo(() => linhas.filter((l) => !l.gerado), [linhas]);
  const totalSel = useMemo(() => linhas.filter((l) => sel.has(l.id)).reduce((a, l) => a + l.frete, 0), [linhas, sel]);
  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleTodos() { setSel((s) => (s.size === selecionaveis.length ? new Set() : new Set(selecionaveis.map((l) => l.id)))); }

  async function salvarParam() {
    setErro(null); setOk(null);
    try {
      const c = await api.put<FreteConfig>('/frete/config', { kmRate: Number(kmRate), minMotoboy: Number(minMotoboy), cepOrigem: cfg?.cepOrigem ?? null }, token!);
      setCfg(c); setOk(t('gfrete.param_ok'));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function confirmarGerar() {
    setErro(null); setOk(null); setConfirmar(false);
    try {
      const r = await api.post<{ total: number; titulos: number }>('/logistica/fretes/gerar', { pedidoIds: [...sel], vencimento: venc, emissao }, token!);
      setOk(t('gfrete.fechado').replace('{n}', String(r.titulos))); gerar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  function exportar() {
    const cab = [t('gfrete.col_pedido'), t('pedidos.data'), t('fin.cliente'), t('entrega.forma'), t('entrega.motoboy'), t('gfrete.distancia'), t('gfrete.frete'), t('gfrete.col_gerado')];
    const linhasX = linhas.map((l) => [numeroPedido(l.numero), fmt(l.criadoEm), l.clienteNome ?? '', l.formaEntrega, l.motoboy ?? '', l.distanciaKm != null ? l.distanciaKm + ' km' : '', l.frete, l.gerado ? t('common.sim') : t('common.nao')]);
    baixarExcel('gestao_fretes', cab, linhasX, { periodo: rotuloPeriodo(de, ate) });
  }

  const FILTROS: ('nao' | 'sim' | 'todos')[] = ['nao', 'sim', 'todos'];

  return (
    <div>
      <div className="crumb">{t('gfrete.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('gfrete.titulo')}</h1><div className="muted page-sub">{t('gfrete.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{ok}</div>}

      <div className="card" style={{ maxWidth: 'none', marginBottom: 14 }}>
        <div className="card-head"><h3>{t('gfrete.parametros')}</h3></div>
        <div className="toolbar" style={{ alignItems: 'flex-end' }}>
          <label className="campo" style={{ margin: 0 }}>{t('motoboys.km_rate')}<MoedaInput value={kmRate} disabled={!podeParam} onChange={(n) => setKmRate(String(n))} style={{ maxWidth: 220 }} /></label>
          <label className="campo" style={{ margin: 0 }}>{t('motoboys.min_motoboy')}<MoedaInput value={minMotoboy} disabled={!podeParam} onChange={(n) => setMinMotoboy(String(n))} style={{ maxWidth: 220 }} /></label>
          {podeParam && <button className="btn-primary" onClick={salvarParam}><Ic name="i-check" className="sm" /> {t('gfrete.salvar_param')}</button>}
        </div>
      </div>

      <div className="toolbar" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {FILTROS.map((g) => <button key={g} className={'chip-f' + (fGerado === g ? ' on' : '')} onClick={() => trocarFiltroGerado(g)}>{t('gfrete.f_' + g)}</button>)}
      </div>

      <div className="contas-toolbar" style={{ alignItems: 'flex-end' }}>
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} onAplicar={() => gerar()} titulo={t('gfrete.titulo')}>
          <label className="campo">{t('pedidos.data_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('pedidos.data_ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </FiltrosModal>
        <label className="campo" style={{ margin: 0 }}>{t('gfrete.emissao')}<input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('gfrete.venc1')}<input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {linhas.length > 0 && <button className="btn-acao verde" onClick={exportar}><Ic name="i-download" className="sm" /> {t('rel.exportar_xlsx')}</button>}
          {podeFechar && <button className="btn-primary" disabled={!venc || sel.size === 0} onClick={() => setConfirmar(true)}>$ {t('gfrete.gerar_sel')}{sel.size > 0 ? ` (${sel.size})` : ''}</button>}
        </span>
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr>
          {podeFechar && <th style={{ width: 34 }}><input type="checkbox" checked={selecionaveis.length > 0 && sel.size === selecionaveis.length} onChange={toggleTodos} /></th>}
          <th>{t('gfrete.col_pedido')}</th><th>{t('pedidos.data')}</th><th>{t('fin.cliente')}</th><th>{t('entrega.motoboy')}</th><th>{t('gfrete.distancia')}</th><th style={{ textAlign: 'right' }}>{t('gfrete.frete')}</th><th>{t('gfrete.col_gerado')}</th>
        </tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={podeFechar ? 8 : 7} className="vazio">{t('gfrete.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.id} className={(l.gerado ? 'linha-gerada ' : '') + (sel.has(l.id) ? 'linha-sel' : '')}>
              {podeFechar && <td>{!l.gerado && <input type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} />}</td>}
              <td style={{ fontWeight: 700 }}>{numeroPedido(l.numero)}</td>
              <td>{fmt(l.criadoEm)}</td>
              <td>{l.clienteNome ?? '—'}</td>
              <td>{l.motoboy ?? '—'}</td>
              <td>{l.distanciaKm != null ? l.distanciaKm + ' km' : '—'}</td>
              <td style={{ textAlign: 'right' }}>{moeda(l.frete)}</td>
              <td>{l.gerado ? <span className="pill st-verde">{t('gfrete.gerado_badge')}</span> : <span className="pill st-laranja">{t('gfrete.pendente_badge')}</span>}</td>
            </tr>
          ))}
        </tbody>
        {linhas.length > 0 && <tfoot><tr><td colSpan={podeFechar ? 6 : 5} style={{ textAlign: 'right', fontWeight: 700 }}>{t('rel.total')}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{moeda(total)}</td><td /></tr></tfoot>}
      </table></div>

      <div className="nota-info" style={{ marginTop: 12 }}>{t('gfrete.nota')}</div>

      {confirmar && (
        <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <h2>{t('gfrete.confirmar_titulo')}</h2>
          <p style={{ lineHeight: 1.6 }}>{t('gfrete.confirmar_msg').replace('{n}', String(sel.size)).replace('{v}', moeda(totalSel))}</p>
          <div className="modal-acoes">
            <button className="btn-ghost" onClick={() => setConfirmar(false)}>{t('common.cancelar')}</button>
            <button className="btn-primary" onClick={confirmarGerar}>{t('gfrete.gerar_sel')}</button>
          </div>
        </div></div>
      )}
    </div>
  );
}
