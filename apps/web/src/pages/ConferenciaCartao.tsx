import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';

interface Item {
  id: string; numero: string; descricao: string; pessoaNome: string | null;
  pedidoFormaPagamento: string | null; valor: number; conferido: boolean; conferidoEm: string | null;
}
type Filtro = 'todos' | 'pendentes' | 'conferidos';
const hojeISO = () => new Date().toISOString().slice(0, 10);
const norm = (f: string | null) => (f ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ehDinheiro = (f: string | null) => norm(f).includes('dinheiro');

export function ConferenciaCartao() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('financeiro.receber.gerenciar');
  const [dia, setDia] = useState(hojeISO());
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [itens, setItens] = useState<Item[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  function carregar(d = dia) {
    setCarregando(true); setErro(null); setSel(new Set());
    api.get<Item[]>('/financeiro/conferencia-cartao?dia=' + d, token!)
      .then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)).finally(() => setCarregando(false));
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  function mudarDia(d: string) { setDia(d); carregar(d); }
  function passoDia(n: number) { const d = new Date(dia + 'T00:00:00'); d.setDate(d.getDate() + n); mudarDia(d.toISOString().slice(0, 10)); }

  const cartaoSistema = useMemo(() => itens.filter((i) => !ehDinheiro(i.pedidoFormaPagamento)).reduce((a, i) => a + i.valor, 0), [itens]);
  const dinheiroSistema = useMemo(() => itens.filter((i) => ehDinheiro(i.pedidoFormaPagamento)).reduce((a, i) => a + i.valor, 0), [itens]);
  const totalSistema = cartaoSistema + dinheiroSistema;
  const conferidoTotal = useMemo(() => itens.filter((i) => i.conferido).reduce((a, i) => a + i.valor, 0), [itens]);

  const mostrados = useMemo(() => itens.filter((i) => filtro === 'todos' || (filtro === 'conferidos' ? i.conferido : !i.conferido)), [itens, filtro]);
  const pendentesSel = mostrados.filter((i) => !i.conferido);
  function toggle(id: string) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function confirmar(ids: string[], conferido: boolean) {
    if (ids.length === 0) return;
    try {
      for (const id of ids) await api.patch('/financeiro/conferencia-cartao/' + id, { conferido }, token!);
      toast(t(conferido ? 'conf.toast_confirmado' : 'conf.toast_desfeito'));
      carregar();
    } catch (e) { const k = (e as ErroApi).chaveI18n; setErro(k); toast(t(k), 'erro'); }
  }

  const fmtForma = (f: string | null) => f ?? '—';
  const dataExtenso = new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <div className="crumb">{t('conf.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('conf.titulo')}</h1><div className="muted page-sub">{t('conf.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-ghost btn-mini" onClick={() => passoDia(-1)} aria-label="‹">‹</button>
        <label className="campo" style={{ margin: 0 }}>{t('conf.dia')}<input type="date" value={dia} onChange={(e) => mudarDia(e.target.value)} /></label>
        <button className="btn-ghost btn-mini" onClick={() => passoDia(1)} aria-label="›">›</button>
        <span className="muted" style={{ fontSize: 12, textTransform: 'capitalize' }}>{dataExtenso}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['todos', 'pendentes', 'conferidos'] as Filtro[]).map((f) => (
            <button key={f} className={'chip-f' + (filtro === f ? ' on' : '')} onClick={() => setFiltro(f)}>{t('conf.f_' + f)}</button>
          ))}
        </span>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12 }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('conf.cartao_sistema')}</div><div className="kpi-val">{moeda(cartaoSistema)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('conf.dinheiro_sistema')}</div><div className="kpi-val">{moeda(dinheiroSistema)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-check" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('conf.conferido')}</div><div className="kpi-val">{moeda(conferidoTotal)} <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>/ {moeda(totalSistema)}</span></div></div></div>
      </div>

      <div className="card pad0" style={{ marginTop: 12 }}>
        <div className="card-head" style={{ padding: '16px 18px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ marginRight: 'auto' }}>{t('conf.lista')}</h3>
          {pode && sel.size > 0 && <button className="btn-acao verde" onClick={() => confirmar([...sel], true)}><Ic name="i-check" className="sm" /> {t('conf.confirmar_sel').replace('{n}', String(sel.size))}</button>}
        </div>
        <table className="tabela">
          <thead><tr>
            {pode && <th style={{ width: 34 }}><input type="checkbox" checked={pendentesSel.length > 0 && pendentesSel.every((i) => sel.has(i.id))} onChange={(e) => setSel(e.target.checked ? new Set(pendentesSel.map((i) => i.id)) : new Set())} /></th>}
            <th>{t('conf.pedido')}</th><th>{t('pedidos.cliente')}</th><th>{t('conf.forma')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'center' }}>{t('conf.status')}</th><th>{t('conf.conferido_em')}</th>
          </tr></thead>
          <tbody>
            {carregando && <tr><td colSpan={7} className="vazio">{t('common.carregando')}</td></tr>}
            {!carregando && mostrados.length === 0 && <tr><td colSpan={7} className="vazio">{t('conf.vazio')}</td></tr>}
            {!carregando && mostrados.map((i) => (
              <tr key={i.id}>
                {pode && <td>{!i.conferido && <input type="checkbox" checked={sel.has(i.id)} onChange={() => toggle(i.id)} />}</td>}
                <td style={{ fontWeight: 700 }}>{i.descricao}</td>
                <td>{i.pessoaNome ?? '—'}</td>
                <td>{fmtForma(i.pedidoFormaPagamento)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{moeda(i.valor)}</td>
                <td style={{ textAlign: 'center' }}>
                  {i.conferido
                    ? <span className="pe-ef">{t('conf.conferido_st')}</span>
                    : <span className="muted">{t('conf.pendente')}</span>}
                </td>
                <td>
                  {i.conferido
                    ? <span>{i.conferidoEm ? new Date(i.conferidoEm).toLocaleString('pt-BR') : '—'}{pode && <> · <button className="btn-link" onClick={() => confirmar([i.id], false)}>{t('conf.desfazer')}</button></>}</span>
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="nota-info" style={{ marginTop: 12 }}><Ic name="i-shield" className="sm" /> {t('conf.aviso')}</div>
    </div>
  );
}
