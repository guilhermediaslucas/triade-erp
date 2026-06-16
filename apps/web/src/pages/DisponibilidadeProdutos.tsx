import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel } from '../lib/excel.js';

interface Lote { id: string; lote: string | null; validade: string | null; quantidade: number; custoUnitario: number; marca: string | null; }
interface Posicao {
  produtoId: string; produtoNome: string; unidade: string; estoqueMinimo: number;
  saldo: number; abaixoMinimo: boolean; lotes: Lote[];
  reservado?: number; disponivel?: number;
}
type Filtro = '' | 'disponivel' | 'sem' | 'baixo';

const dispDe = (p: Posicao) => p.disponivel ?? (p.saldo - (p.reservado ?? 0));
const reservDe = (p: Posicao) => p.reservado ?? Math.max(0, p.saldo - dispDe(p));
const valorEstoque = (p: Posicao) => p.lotes.reduce((s, l) => s + l.quantidade * l.custoUnitario, 0);
const valorDisp = (p: Posicao) => (p.saldo > 0 ? valorEstoque(p) * (Math.max(0, dispDe(p)) / p.saldo) : 0);

// Dashboard de DISPONIBILIDADE: foco no que dá pra vender hoje (saldo − reservado),
// não no total físico. Reaproveita o GET /estoque (já devolve reservado/disponível).
export function DisponibilidadeProdutos() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [itens, setItens] = useState<Posicao[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('');

  useEffect(() => { api.get<Posicao[]>('/estoque', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  const kpis = useMemo(() => {
    const skus = itens.length;
    const disp = itens.filter((p) => dispDe(p) > 0).length;
    const sem = itens.filter((p) => dispDe(p) <= 0).length;
    const baixo = itens.filter((p) => p.abaixoMinimo).length;
    const reservado = itens.reduce((s, p) => s + reservDe(p), 0);
    const valor = itens.reduce((s, p) => s + valorDisp(p), 0);
    return { skus, disp, sem, baixo, reservado, valor };
  }, [itens]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((p) => {
      if (q && !p.produtoNome.toLowerCase().includes(q)) return false;
      if (filtro === 'disponivel' && dispDe(p) <= 0) return false;
      if (filtro === 'sem' && dispDe(p) > 0) return false;
      if (filtro === 'baixo' && !p.abaixoMinimo) return false;
      return true;
    }).sort((a, b) => dispDe(a) - dispDe(b)); // menos disponível primeiro (atenção no topo)
  }, [itens, busca, filtro]);

  const cab = [t('precos.produto'), t('estoque.saldo'), t('disp.reservado'), t('disp.disponivel'), t('produtos.minimo'), t('usuarios.situacao')];
  const linhas = (): (string | number)[][] => lista.map((p) => [
    p.produtoNome, p.saldo, reservDe(p), dispDe(p), p.estoqueMinimo,
    dispDe(p) <= 0 ? t('disp.sem') : p.abaixoMinimo ? t('estoque.baixo') : t('disp.ok'),
  ]);

  function situacao(p: Posicao) {
    const d = dispDe(p);
    if (d <= 0) return <span className="pill st-vermelho">{t('disp.sem')}</span>;
    if (p.abaixoMinimo) return <span className="pill st-laranja">{t('estoque.baixo')}</span>;
    return <span className="pill st-verde">{t('disp.ok')}</span>;
  }

  const chips: { v: Filtro; rot: string }[] = [
    { v: '', rot: 'common.todos' }, { v: 'disponivel', rot: 'disp.f_disponivel' },
    { v: 'sem', rot: 'disp.f_sem' }, { v: 'baixo', rot: 'estoque.baixo' },
  ];

  return (
    <div>
      <div className="crumb">{t('disp.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo">{t('disp.titulo')}</h1><p className="muted page-sub">{t('disp.sub')}</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => baixarCsv(t('disp.titulo'), cab, linhas())}><Ic name="i-download" className="sm" /> CSV</button>
          <button className="btn-ghost" onClick={() => baixarExcel(t('disp.titulo'), cab, linhas())}><Ic name="i-download" className="sm" /> Excel</button>
        </div>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="kpi-row">
        <div className="card kpi-mock"><div className="kpi-ic tint-bl"><Ic name="i-box" /></div><div><div className="kpi-lbl">{t('estoque.kpi_skus')}</div><div className="kpi-val">{kpis.skus}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-check" /></div><div><div className="kpi-lbl">{t('disp.kpi_disp')}</div><div className="kpi-val">{kpis.disp}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-alert" /></div><div><div className="kpi-lbl">{t('disp.kpi_sem')}</div><div className="kpi-val">{kpis.sem}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-or"><Ic name="i-alert" /></div><div><div className="kpi-lbl">{t('estoque.kpi_baixo')}</div><div className="kpi-val">{kpis.baixo}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-clock" /></div><div><div className="kpi-lbl">{t('disp.kpi_reservado')}</div><div className="kpi-val">{kpis.reservado}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-gr"><Ic name="i-dollar" /></div><div><div className="kpi-lbl">{t('disp.kpi_valor')}</div><div className="kpi-val">{moeda(kpis.valor)}</div></div></div>
      </div>

      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('estoque.buscar')} /></div>
        <span className="muted" style={{ fontSize: 12 }}>{t('usuarios.situacao')}:</span>
        {chips.map((c) => (
          <span key={c.v} className={'chip-f' + (filtro === c.v ? ' on' : '')} onClick={() => setFiltro(c.v)}>{t(c.rot)}</span>
        ))}
        <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{lista.length} {t('estoque.de')} {itens.length} {t('estoque.item')}</span>
      </div>

      <div className="card pad0"><table className="tabela">
        <thead><tr>
          <th>{t('precos.produto')}</th><th>{t('estoque.saldo')}</th><th>{t('disp.reservado')}</th>
          <th>{t('disp.disponivel')}</th><th>{t('produtos.minimo')}</th><th>{t('usuarios.situacao')}</th>
        </tr></thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={6} className="vazio">{t('precos.sem_produtos')}</td></tr>}
          {lista.map((p) => {
            const d = dispDe(p);
            return (
              <tr key={p.produtoId} className={d <= 0 ? 'linha-inativa' : ''}>
                <td>{p.produtoNome} <span className="muted">· {p.unidade}</span></td>
                <td>{p.saldo}</td>
                <td>{reservDe(p) > 0 ? <span className="pill st-laranja">{reservDe(p)}</span> : <span className="muted">0</span>}</td>
                <td><b style={{ color: d <= 0 ? 'var(--vermelho, #e1483b)' : undefined }}>{d}</b></td>
                <td>{p.estoqueMinimo}</td>
                <td>{situacao(p)}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <div className="nota-info" style={{ marginTop: 10 }}>{t('disp.nota')}</div>
    </div>
  );
}
