import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { moeda } from '../lib/pedido.js';
import { MoedaInput } from '../components/MoedaInput.js';

type TipoDesc = 'percentual' | 'fixo';
interface Desconto { id: string; clienteId: string | null; clienteNome: string | null; tipo: TipoDesc; valor: number; minimo: number; motivo: string | null; de: string; ate: string; vigente: boolean; }
interface Cliente { id: string; nome: string; ativo: boolean; }
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (s: string) => new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');

export function DescontosPedido() {
  const { token, temCapability } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const pode = temCapability('comercial.preco.gerenciar');
  const [itens, setItens] = useState<Desconto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);
  const [editar, setEditar] = useState<Desconto | null>(null);

  function carregar() { api.get<Desconto[]>('/comercial/descontos', token!).then(setItens).catch((e) => setErro((e as ErroApi).chaveI18n)); }
  useEffect(() => {
    carregar();
    api.get<Cliente[]>('/clientes', token!).then((c) => setClientes(c.filter((x) => x.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function excluir(c: Desconto) {
    if (!window.confirm(t('descped.excluir_confirma'))) return;
    try { await api.del('/comercial/descontos/' + c.id, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  const rotuloTipo = (c: Desconto) => c.tipo === 'percentual' ? c.valor + '%' : moeda(c.valor);

  return (
    <div>
      <div className="crumb">{t('descped.crumb')}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-titulo">{t('descped.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setNovo(true)}>+ {t('descped.nova')}</button>}
      </div>
      <p className="muted page-sub">{t('descped.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('fretecamp.cliente')}</th><th>{t('descped.desconto')}</th><th>{t('descped.minimo')}</th><th>{t('fretecamp.vigencia')}</th><th>{t('fretecamp.motivo')}</th><th>{t('usuarios.situacao')}</th>{pode && <th style={{ width: 90 }} />}</tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={7} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((c) => (
              <tr key={c.id}>
                <td data-label={t('fretecamp.cliente')}>{c.clienteNome ?? t('fretecamp.todos')}</td>
                <td data-label={t('descped.desconto')}>{rotuloTipo(c)}</td>
                <td data-label={t('descped.minimo')}>{moeda(c.minimo)}</td>
                <td data-label={t('fretecamp.vigencia')}>{fmtData(c.de)} – {fmtData(c.ate)}</td>
                <td data-label={t('fretecamp.motivo')}>{c.motivo ?? '—'}</td>
                <td><span className={'pill ' + (c.vigente ? 'st-verde' : 'st-cinza')}>{c.vigente ? t('fretecamp.vigente') : t('fretecamp.encerrada')}</span></td>
                {pode && <td><span className="acoes-ic">
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEditar(c)}><Ic name="i-edit" className="sm" /></button>
                  <button className="acao-ic danger" title={t('common.excluir')} onClick={() => excluir(c)}><Ic name="i-trash" className="sm" /></button>
                </span></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {novo && <ModalDesc clientes={clientes} onFechar={() => setNovo(false)} onSalvo={() => { setNovo(false); carregar(); toast(t('descped.toast_criada')); }} />}
      {editar && <ModalDesc clientes={clientes} editar={editar} onFechar={() => setEditar(null)} onSalvo={() => { setEditar(null); carregar(); toast(t('descped.toast_criada')); }} />}
    </div>
  );
}

function ModalDesc({ clientes, editar, onFechar, onSalvo }: { clientes: Cliente[]; editar?: Desconto; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const ed = editar ?? null;
  const [clienteId, setClienteId] = useState(ed?.clienteId ?? '');
  const [tipo, setTipo] = useState<TipoDesc>(ed?.tipo ?? 'percentual');
  const [valor, setValor] = useState(ed ? String(ed.valor) : '');
  const [minimo, setMinimo] = useState(ed ? String(ed.minimo) : '');
  const [motivo, setMotivo] = useState(ed?.motivo ?? '');
  const [de, setDe] = useState(ed?.de?.slice(0, 10) ?? hoje()); const [ate, setAte] = useState(ed?.ate?.slice(0, 10) ?? hoje());
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { clienteId, tipo, valor: Number(valor.replace(',', '.')) || 0, minimo: Number(minimo.replace(',', '.')) || 0, motivo, de, ate };
    try {
      if (ed) await api.put('/comercial/descontos/' + ed.id, corpo, token!);
      else await api.post('/comercial/descontos', corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
      <h2>{ed ? t('descped.editar') : t('descped.nova')}</h2>
      <label className="campo">{t('fretecamp.cliente')}
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} autoFocus>
          <option value="">{t('fretecamp.geral')}</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <div className="cores-grid">
        <label className="campo">{t('descped.tipo')}
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDesc)}>
            <option value="percentual">{t('descped.tipo_pct')}</option>
            <option value="fixo">{t('descped.tipo_fixo')}</option>
          </select>
        </label>
        <label className="campo">{tipo === 'percentual' ? t('descped.valor_pct') : t('descped.valor_fixo')}
          <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipo === 'percentual' ? '10' : '0,00'} />
        </label>
      </div>
      <label className="campo">{t('descped.minimo_lbl')}<MoedaInput value={minimo} onChange={(n) => setMinimo(n ? String(n) : '')} placeholder="0,00" /></label>
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
