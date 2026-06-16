import { useEffect, useMemo, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { CabecalhoRelatorio } from '../components/CabecalhoRelatorio.js';
import { Ic } from '../components/Icones.js';
import { AnexosTitulo } from '../components/AnexosTitulo.js';
import { moeda } from '../lib/pedido.js';
import { baixarCsv } from '../lib/csv.js';
import { baixarExcel, rotuloPeriodo } from '../lib/excel.js';
import { BotaoExcel } from '../components/BotaoExcel.js';

interface Titulo {
  id: string; numero: string; descricao: string; pessoaNome: string | null; valor: number; vencimento: string;
  emissao: string | null; criadoEm: string; anexosCount: number;
  status: 'aberto' | 'pago'; categoriaFinanceiraNome: string | null; favorecidoNome: string | null;
}
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string | null) => (s ? new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR') : '—');
// Data de emissão do título (competência) — usa a emissão; sem ela, cai na criação.
const emissaoDe = (x: Titulo) => (x.emissao ?? x.criadoEm).slice(0, 10);

export function RelContasPagarContabil() {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const pode = temCapability('financeiro.pagar.gerenciar');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [itens, setItens] = useState<Titulo[]>([]); const [erro, setErro] = useState<string | null>(null);
  const [anexoT, setAnexoT] = useState<Titulo | null>(null);

  useEffect(() => { api.get<Titulo[]>('/financeiro/pagar', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); /* eslint-disable-next-line */ }, []);

  // Filtra pela EMISSÃO (competência contábil), não pelo vencimento.
  const filtrados = useMemo(() => itens.filter((x) => {
    const e = emissaoDe(x);
    return (!de || e >= de) && (!ate || e <= ate);
  }), [itens, de, ate]);
  const total = filtrados.reduce((a, x) => a + x.valor, 0);

  function exportar(fmt: 'csv' | 'xlsx') {
    const cab = [t('fin.numero'), t('fin.descricao'), t('relcp.categoria'), t('relcp.fornecedor'), t('fin.emissao'), t('fin.vencimento'), t('fin.valor'), t('fin.situacao'), t('relcp.anexos')];
    const dados = filtrados.map((x) => [x.numero, x.descricao, x.categoriaFinanceiraNome ?? '', x.pessoaNome ?? x.favorecidoNome ?? '', fmtData(emissaoDe(x)), fmtData(x.vencimento), x.valor, t('fin.' + x.status), x.anexosCount]);
    if (fmt === 'xlsx') baixarExcel('contas_pagar_' + de + '_' + ate, cab, dados, { periodo: rotuloPeriodo(de, ate) });
    else baixarCsv('contas_pagar_' + de + '_' + ate, cab, dados);
  }

  if (erro) return <div className="alerta-erro">{t(erro)}</div>;
  return (
    <div>
      <CabecalhoRelatorio titulo={t('relcp.titulo')} />
      <div className="crumb">{t('relcp.crumb')}</div><h1 className="page-titulo">{t('relcp.titulo')}</h1><p className="muted page-sub">{t('relcp.sub_emissao')}</p>
      <div className="toolbar" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <label className="campo" style={{ margin: 0 }}>{t('relcp.emissao_de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ maxWidth: 170 }} /></label>
        <label className="campo" style={{ margin: 0 }}>{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ maxWidth: 170 }} /></label>
        {filtrados.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><button className="btn-ghost" onClick={() => exportar('csv')}>{t('rel.exportar_csv')}</button> <BotaoExcel onClick={() => exportar('xlsx')} /></span>}
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="card kpi-mock"><div className="kpi-ic tint-rd"><Ic name="i-dollar" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relcp.total')}</div><div className="kpi-val">{moeda(total)}</div></div></div>
        <div className="card kpi-mock"><div className="kpi-ic tint-pp"><Ic name="i-receipt" className="sm" /></div><div className="kpi-body"><div className="kpi-lbl">{t('relcp.titulos')}</div><div className="kpi-val">{filtrados.length}</div></div></div>
      </div>
      <div className="card pad0">
        <table className="tabela tabela-1linha">
          <thead><tr><th>{t('fin.numero')}</th><th>{t('fin.descricao')}</th><th>{t('relcp.categoria')}</th><th>{t('relcp.fornecedor')}</th><th>{t('fin.emissao')}</th><th>{t('fin.vencimento')}</th><th style={{ textAlign: 'right' }}>{t('fin.valor')}</th><th style={{ textAlign: 'center' }}>{t('fin.situacao')}</th><th style={{ textAlign: 'center' }}>{t('relcp.anexos')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={9} className="vazio">{t('rel.vazio')}</td></tr>}
            {filtrados.map((x) => (
              <tr key={x.id}>
                <td style={{ fontWeight: 700 }}>{x.numero}</td><td>{x.descricao}</td><td>{x.categoriaFinanceiraNome ?? '—'}</td>
                <td>{x.pessoaNome ?? x.favorecidoNome ?? '—'}</td><td>{fmtData(emissaoDe(x))}</td><td style={{ color: 'var(--muted)' }}>{fmtData(x.vencimento)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{moeda(x.valor)}</td>
                <td style={{ textAlign: 'center' }}><span className={'pill ' + (x.status === 'pago' ? 'st-verde' : 'st-vermelho')}>{t('fin.' + x.status)}</span></td>
                <td style={{ textAlign: 'center' }}><button className={'btn-ghost btn-mini' + (x.anexosCount > 0 ? '' : ' muted')} onClick={() => setAnexoT(x)}><Ic name="i-clip" className="sm" /> {x.anexosCount > 0 ? x.anexosCount : t('relcp.anexar')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {anexoT && <AnexosTitulo tituloId={anexoT.id} numero={anexoT.numero} podeGerenciar={pode} onFechar={() => setAnexoT(null)} />}
    </div>
  );
}
