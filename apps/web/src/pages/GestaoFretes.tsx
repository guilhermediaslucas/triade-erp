import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { FiltrosModal } from '../components/FiltrosModal.js';

interface FretePedido { numero: number; criadoEm: string; clienteNome: string | null; formaEntrega: string; motoboy: string | null; distanciaKm: number | null; frete: number; }
interface FreteConfig { kmRate: number; minMotoboy: number; cepOrigem: string | null; }
const numeroPedido = (n: number) => 'PE-' + String(n).padStart(6, '0');

export function GestaoFretes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeFechar = temCapability('logistica.frete.gerenciar');
  const podeParam = temCapability('cadastros.motoboy.gerenciar');
  const [de, setDe] = useState(''); const [ate, setAte] = useState(''); const [venc, setVenc] = useState('');
  const [linhas, setLinhas] = useState<FretePedido[]>([]);
  const [cfg, setCfg] = useState<FreteConfig | null>(null);
  const [kmRate, setKmRate] = useState(''); const [minMotoboy, setMinMotoboy] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [ok, setOk] = useState<string | null>(null);

  function gerar(dd = de, aa = ate) {
    setErro(null); setOk(null);
    const qs = [dd ? 'de=' + dd : '', aa ? 'ate=' + aa : ''].filter(Boolean).join('&');
    api.get<FretePedido[]>('/logistica/fretes/pedidos' + (qs ? '?' + qs : ''), token!).then(setLinhas).catch((e) => setErro((e as ErroApi).chaveI18n));
  }
  const qtdFiltros = (de ? 1 : 0) + (ate ? 1 : 0);
  function limparFiltros() { setDe(''); setAte(''); gerar('', ''); }
  useEffect(() => {
    gerar();
    api.get<FreteConfig>('/frete/config', token!).then((c) => { setCfg(c); setKmRate(String(c.kmRate)); setMinMotoboy(String(c.minMotoboy)); }).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  const total = useMemo(() => linhas.reduce((a, l) => a + l.frete, 0), [linhas]);
  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  async function salvarParam() {
    setErro(null); setOk(null);
    try {
      const c = await api.put<FreteConfig>('/frete/config', { kmRate: Number(kmRate), minMotoboy: Number(minMotoboy), cepOrigem: cfg?.cepOrigem ?? null }, token!);
      setCfg(c); setOk(t('gfrete.param_ok'));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  async function fechar() {
    setErro(null); setOk(null);
    try {
      const r = await api.post<{ total: number; titulos: number }>('/logistica/fretes/fechar', { de, ate, vencimento: venc }, token!);
      setOk(t('gfrete.fechado').replace('{n}', String(r.titulos))); gerar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  function exportar() {
    const cab = [t('gfrete.col_pedido'), t('pedidos.data'), t('fin.cliente'), t('entrega.forma'), t('entrega.motoboy'), t('gfrete.distancia'), t('gfrete.frete')];
    const linhasX = linhas.map((l) => [numeroPedido(l.numero), fmt(l.criadoEm), l.clienteNome ?? '', l.formaEntrega, l.motoboy ?? '', l.distanciaKm != null ? l.distanciaKm + ' km' : '', l.frete]);
    baixarExcel('gestao_fretes', cab, linhasX, { periodo: rotuloPeriodo(de, ate) });
  }

  return (
    <div>
      <div className="crumb">{t('gfrete.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('gfrete.titulo')}</h1><div className="muted page-sub">{t('gfrete.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{ok}</div>}

      <div className="card" style={{ maxWidth: 'none', marginBottom: 14 }}>
        <div className="card-head"><h3>{t('gfrete.parametros')}</h3></div>
        <div className="toolbar" style={{ alignItems: 'flex-end' }}>
          <label className="campo" style={{ margin: 0 }}>{t('motoboys.km_rate')}<input type="number" min="0" step="0.01" value={kmRate} disabled={!podeParam} onChange={(e) => setKmRate(e.target.value)} style={{ maxWidth: 220 }} /></label>
          <label className="campo" style={{ margin: 0 }}>{t('motoboys.min_motoboy')}<input type="number" min="0" step="0.01" value={minMotoboy} disabled={!podeParam} onChange={(e) => setMinMotoboy(e.target.value)} style={{ maxWidth: 220 }} /></label>
          {podeParam && <button className="btn-primary" onClick={salvarParam}><Ic name="i-check" className="sm" /> {t('gfrete.salvar_param')}</button>}
        </div>
      </div>

      <div className="contas-toolbar" style={{ alignItems: 'center' }}>
        <FiltrosModal count={qtdFiltros} onLimpar={limparFiltros} onAplicar={() => gerar()} titulo={t('gfrete.titulo')}>
          <label className="campo">{t('pedidos.data_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
          <label className="campo">{t('pedidos.data_ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        </FiltrosModal>
        <label className="campo" style={{ margin: 0 }}>{t('gfrete.venc1')}<input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {linhas.length > 0 && <button className="btn-acao verde" onClick={exportar}><Ic name="i-download" className="sm" /> {t('rel.exportar_xlsx')}</button>}
          {podeFechar && <button className="btn-primary" disabled={!venc || total <= 0} onClick={fechar}>$ {t('gfrete.gerar_titulos_motoboy')}</button>}
        </span>
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('gfrete.col_pedido')}</th><th>{t('pedidos.data')}</th><th>{t('fin.cliente')}</th><th>{t('entrega.forma')}</th><th>{t('entrega.motoboy')}</th><th>{t('gfrete.distancia')}</th><th style={{ textAlign: 'right' }}>{t('gfrete.frete')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={7} className="vazio">{t('gfrete.vazio')}</td></tr>}
          {linhas.map((l) => (
            <tr key={l.numero}>
              <td style={{ fontWeight: 700 }}>{numeroPedido(l.numero)}</td>
              <td>{fmt(l.criadoEm)}</td>
              <td>{l.clienteNome ?? '—'}</td>
              <td>{t('entrega.' + l.formaEntrega)}</td>
              <td>{l.motoboy ?? '—'}</td>
              <td>{l.distanciaKm != null ? l.distanciaKm + ' km' : '—'}</td>
              <td style={{ textAlign: 'right' }}>{moeda(l.frete)}</td>
            </tr>
          ))}
        </tbody>
        {linhas.length > 0 && <tfoot><tr><td colSpan={6} style={{ textAlign: 'right', fontWeight: 700 }}>{t('rel.total')}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{moeda(total)}</td></tr></tfoot>}
      </table></div>

      <div className="nota-info" style={{ marginTop: 12 }}>{t('gfrete.nota')}</div>
    </div>
  );
}
