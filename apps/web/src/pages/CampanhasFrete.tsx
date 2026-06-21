import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';

type TipoCamp = 'gratis' | 'fixo' | 'percentual' | 'gratis_acima';
interface Campanha { id: string; clienteId: string | null; clienteNome: string | null; tipo: TipoCamp; valor: number; motivo: string | null; de: string; ate: string; vigente: boolean; }
interface Cliente { id: string; nome: string; ativo: boolean; }
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string) => new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');

export function CampanhasFrete() {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('logistica.frete.gerenciar');
  const [itens, setItens] = useState<Campanha[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);

  function carregar() { api.get<Campanha[]>('/frete/campanhas', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); }
  useEffect(() => {
    carregar();
    api.get<Cliente[]>('/clientes', token!).then((c) => setClientes(c.filter((x) => x.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function excluir(c: Campanha) {
    if (!window.confirm(t('fretecamp.excluir_confirma'))) return;
    try { await api.del('/frete/campanhas/' + c.id, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  function rotuloTipo(c: Campanha): string {
    if (c.tipo === 'gratis') return t('fretecamp.tipo_gratis');
    if (c.tipo === 'percentual') return t('fretecamp.tipo_percentual') + ' ' + c.valor + '%';
    if (c.tipo === 'gratis_acima') return t('fretecamp.tipo_gratis') + ' ≥ ' + moeda(c.valor);
    return t('fretecamp.tipo_fixo') + ' ' + moeda(c.valor);
  }

  return (
    <div>
      <div className="crumb">{t('fretecamp.crumb')}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-titulo">{t('fretecamp.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('fretecamp.nova')}</button>}
      </div>
      <p className="muted page-sub">{t('fretecamp.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('fretecamp.cliente')}</th><th>{t('fretecamp.tipo')}</th><th>{t('fretecamp.vigencia')}</th><th>{t('fretecamp.motivo')}</th><th>{t('usuarios.situacao')}</th>{pode && <th style={{ width: 60 }}></th>}</tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((c) => (
              <tr key={c.id}>
                <td data-label={t('fretecamp.cliente')}>{c.clienteNome ?? t('fretecamp.todos')}</td>
                <td data-label={t('fretecamp.tipo')}>{rotuloTipo(c)}</td>
                <td data-label={t('fretecamp.vigencia')}>{fmtData(c.de)} – {fmtData(c.ate)}</td>
                <td data-label={t('fretecamp.motivo')}>{c.motivo ?? '—'}</td>
                <td><span className={'pill ' + (c.vigente ? 'st-verde' : 'st-cinza')}>{c.vigente ? t('fretecamp.vigente') : t('fretecamp.encerrada')}</span></td>
                {pode && <td><button className="acao-ic" title={t('common.excluir')} onClick={() => excluir(c)}><Ic name="i-trash" className="sm" /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {novo && <ModalNova clientes={clientes} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); toast(t('fretecamp.toast_criada')); }} />}
    </div>
  );
}

function ModalNova({ clientes, onFechar, onSalvo }: { clientes: Cliente[]; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState<TipoCamp>('gratis');
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [de, setDe] = useState(hoje()); const [ate, setAte] = useState(hoje());
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);

  async function salvar() {
    setErro(null); setSalv(true);
    try {
      await api.post('/frete/campanhas', { clienteId, tipo, valor: tipo === 'gratis' ? 0 : Number(valor.replace(',', '.')) || 0, motivo, de, ate }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2>{t('fretecamp.nova')}</h2>
      <label className="campo">{t('fretecamp.cliente')}
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} autoFocus>
          <option value="">{t('fretecamp.geral')}</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label className="campo">{t('fretecamp.tipo')}
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCamp)}>
          <option value="gratis">{t('fretecamp.tipo_gratis')}</option>
          <option value="gratis_acima">{t('fretecamp.tipo_gratis_acima')}</option>
          <option value="fixo">{t('fretecamp.tipo_fixo')}</option>
          <option value="percentual">{t('fretecamp.tipo_percentual')}</option>
        </select>
      </label>
      {tipo !== 'gratis' && (
        <label className="campo">{tipo === 'percentual' ? t('fretecamp.valor_pct') : tipo === 'gratis_acima' ? t('fretecamp.valor_limiar') : t('fretecamp.valor_fixo')}
          <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipo === 'percentual' ? '10' : tipo === 'gratis_acima' ? '500,00' : '0,00'} />
        </label>
      )}
      <div className="cores-grid">
        <label className="campo">{t('rel.de')}<input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="campo">{t('rel.ate')}<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
      </div>
      <label className="campo">{t('fretecamp.motivo')}<input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={t('fretecamp.motivo_ph')} /></label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
