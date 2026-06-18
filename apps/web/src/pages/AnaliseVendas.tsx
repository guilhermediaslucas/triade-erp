import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';
import { Ic } from '../components/Icones.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Linha { nome: string; quantidade: number; total: number; }
type Chip = 'produtos' | 'clientes_valor' | 'clientes_pedidos';
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

const dimDoChip = (c: Chip): string => (c === 'clientes_valor' || c === 'clientes_pedidos') ? 'clientes' : c;
const metricaDoChip = (c: Chip): 'quantidade' | 'total' => (c === 'clientes_pedidos' ? 'quantidade' : 'total');

export function AnaliseVendas() {
  const { token } = useAuth(); const { t } = useI18n();
  const [chip, setChip] = useState<Chip>('produtos');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  function carregar(c = chip, dd = de, aa = ate) {
    setCarregando(true); setErro(null);
    api.get<{ linhas: Linha[] }>(`/comercial/analise?dim=${dimDoChip(c)}&de=${dd}&ate=${aa}`, token!)
      .then((r) => setLinhas(r.linhas)).catch((e) => setErro((e as ErroApi).chaveI18n)).finally(() => setCarregando(false));
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  function trocarChip(c: Chip) { setChip(c); if (dimDoChip(c) !== dimDoChip(chip)) carregar(c); }

  const metrica = metricaDoChip(chip);
  const ordenadas = useMemo(() => [...linhas].sort((a, b) => b[metrica] - a[metrica]), [linhas, metrica]);
  const totalMetrica = useMemo(() => ordenadas.reduce((a, l) => a + l[metrica], 0), [ordenadas, metrica]);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('analise.item'), t('rel.qtd'), t('fin.valor')];
    const ls = ordenadas.map((l) => [l.nome, l.quantidade, l.total]);
    const nome = 'analise_' + chip + '_' + de + '_' + ate;
    if (fmt === 'xlsx') baixarExcel(nome, cab, ls, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv(nome, cab, ls);
  }

  const CHIPS: { c: Chip; k: string }[] = [
    { c: 'produtos', k: 'analise.produtos' },
    { c: 'clientes_valor', k: 'analise.clientes_valor' }, { c: 'clientes_pedidos', k: 'analise.clientes_pedidos' },
  ];

  return (
    <div>
      <div className="crumb">{t('analise.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('analise.titulo')}</h1><div className="muted page-sub">{t('analise.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {CHIPS.map((x) => <button key={x.c} className={'chip-f' + (chip === x.c ? ' on' : '')} onClick={() => trocarChip(x.c)}>{t(x.k)}</button>)}
      </div>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <button className="btn-primary" onClick={() => carregar()}><Ic name="i-search" className="sm" /> {t('rel.gerar')}</button>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button>
          <BotaoExcel onClick={() => exportar('xlsx')} />
        </span>
      </div>

      {carregando ? <div className="muted">{t('common.carregando')}</div> : (
        <div className="card" style={{ maxWidth: 'none', marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>
            <table className="tabela">
              <thead><tr><th style={{ width: 36 }}>#</th><th>{t('analise.item')}</th><th style={{ width: '40%' }} /><th style={{ textAlign: 'right' }}>{t('rel.qtd')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'right' }}>%</th></tr></thead>
              <tbody>
                {ordenadas.length === 0 && <tr><td colSpan={6} className="vazio">{t('rel.vazio')}</td></tr>}
                {ordenadas.map((l, i) => {
                  const p = totalMetrica > 0 ? Math.round((l[metrica] / totalMetrica) * 100) : 0;
                  return (
                    <tr key={l.nome + i}>
                      <td className="muted">{i + 1}</td>
                      <td>{l.nome}</td>
                      <td><span style={{ display: 'block', height: 8, background: '#f0f0f4', borderRadius: 6, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: p + '%', background: '#7b61ff' }} /></span></td>
                      <td style={{ textAlign: 'right' }}>{Math.round(l.quantidade).toLocaleString('pt-BR')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(l.total)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{p}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
