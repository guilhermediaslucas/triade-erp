import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { moeda } from '../lib/pedido.js';

interface Linha { motoboyId: string; motoboy: string; qtdPedidos: number; totalFrete: number; }
const primeiroDia = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const hoje = () => new Date().toISOString().slice(0, 10);

export function GestaoFretes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const podeFechar = temCapability('logistica.frete.gerenciar');
  const [de, setDe] = useState(primeiroDia()); const [ate, setAte] = useState(hoje());
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [venc, setVenc] = useState('');
  const [erro, setErro] = useState<string | null>(null); const [ok, setOk] = useState<string | null>(null);

  async function gerar() { setErro(null); setOk(null); try { setLinhas(await api.get('/logistica/fretes?de=' + de + '&ate=' + ate, token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { gerar(); /* eslint-disable-next-line */ }, []);
  const total = linhas.reduce((a, l) => a + l.totalFrete, 0);
  const qtd = linhas.reduce((a, l) => a + l.qtdPedidos, 0);

  async function fechar() {
    setErro(null); setOk(null);
    try {
      const r = await api.post<{ total: number; titulos: number }>('/logistica/fretes/fechar', { de, ate, vencimento: venc }, token!);
      setOk(t('gfrete.fechado').replace('{n}', String(r.titulos))); gerar();
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <h1 className="page-titulo">{t('gfrete.titulo')}</h1>
      <p className="muted" style={{ marginTop: -8 }}>{t('gfrete.sub')}</p>
      <div className="rel-filtro">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <button className="btn-primary" onClick={gerar}>{t('rel.gerar')}</button>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{ok}</div>}
      <div className="kpis">
        <div className="kpi-card"><div className="kpi-l">{t('gfrete.total')}</div><div className="kpi-v">{moeda(total)}</div></div>
        <div className="kpi-card"><div className="kpi-l">{t('gfrete.pedidos')}</div><div className="kpi-v">{qtd}</div></div>
      </div>
      <div className="card pad0" style={{ marginBottom: 16 }}><table className="tabela">
        <thead><tr><th>{t('entrega.motoboy')}</th><th>{t('gfrete.pedidos')}</th><th>{t('gfrete.frete')}</th></tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={3} className="vazio">{t('gfrete.vazio')}</td></tr>}
          {linhas.map((l) => (<tr key={l.motoboyId}><td>{l.motoboy}</td><td>{l.qtdPedidos}</td><td><b>{moeda(l.totalFrete)}</b></td></tr>))}
        </tbody>
      </table></div>
      {podeFechar && linhas.length > 0 && (
        <div className="card" style={{ maxWidth: 460 }}>
          <h3 style={{ marginTop: 0 }}>{t('gfrete.fechar')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{t('gfrete.fechar_dica')}</p>
          <label className="campo">{t('com.vencimento')}<input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} /></label>
          <div className="modal-acoes"><button className="btn-primary" disabled={!venc} onClick={fechar}>{t('gfrete.gerar_titulos')}</button></div>
        </div>
      )}
    </div>
  );
}
