import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { useToast } from '../components/Toast.js';
import { Ic } from '../components/Icones.js';
import { numeroPedido } from '../lib/pedido.js';

interface Motoboy { id: string; nome: string; ativo: boolean; }
interface Parada { pedidoId: string; numero: number; clienteNome: string | null; enderecoEntrega: string | null; ordemRota: number | null; }

export function MontarRota() {
  const { token } = useAuth(); const { t } = useI18n();
  const toast = useToast();
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [motoboyId, setMotoboyId] = useState('');
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [otimizando, setOtimizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<Motoboy[]>('/motoboys', token!).then((l) => setMotoboys(l.filter((m) => m.ativo))).catch(() => {});
    /* eslint-disable-next-line */
  }, []);

  async function carregar(id: string) {
    setMotoboyId(id); setErro(null); setParadas([]);
    if (!id) return;
    try { setParadas(await api.get<Parada[]>('/logistica/rota/' + id, token!)); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  function soltar(destino: number) {
    if (arrastando == null || arrastando === destino) { setArrastando(null); return; }
    setParadas((p) => { const a = [...p]; const [m] = a.splice(arrastando, 1); a.splice(destino, 0, m!); return a; });
    setArrastando(null);
  }

  async function otimizar() {
    if (paradas.length < 2) return;
    setOtimizando(true);
    try {
      const r = await api.post<{ ordem: string[] }>('/logistica/rota/otimizar', { motoboyId, ordem: paradas.map((p) => p.pedidoId) }, token!);
      const byId = new Map(paradas.map((p) => [p.pedidoId, p]));
      const nova = r.ordem.map((id) => byId.get(id)).filter((p): p is Parada => !!p);
      if (nova.length === paradas.length) { setParadas(nova); toast(t('rota.otimizada')); }
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setOtimizando(false); }
  }

  async function salvar() {
    setSalvando(true);
    try { await api.post('/logistica/rota', { motoboyId, ordem: paradas.map((p) => p.pedidoId) }, token!); toast(t('rota.salva')); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  // Link público de rota p/ o motoboy avulso (freelancer, sem login) — todas as paradas num link só.
  async function linkRota() {
    try {
      const r = await api.post<{ token: string }>('/logistica/rota/' + motoboyId + '/link', {}, token!);
      const url = window.location.origin + '/rota/' + r.token;
      navigator.clipboard?.writeText(url).then(() => toast(t('rota.link_copiado'))).catch(() => window.prompt(t('rota.link_freelancer'), url));
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="crumb">{t('rota.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('rota.titulo')}</h1><div className="muted page-sub">{t('rota.sub')}</div></div></div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="card" style={{ marginBottom: 14 }}>
        <label className="muted" style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>{t('rota.motoboy')}</label>
        <select className="input" value={motoboyId} onChange={(e) => carregar(e.target.value)} style={{ maxWidth: 320 }}>
          <option value="">{t('rota.escolha_motoboy')}</option>
          {motoboys.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      {motoboyId && paradas.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 32 }}><div className="muted">{t('rota.sem_paradas')}</div></div>}

      {paradas.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn-ghost" onClick={otimizar} disabled={otimizando || paradas.length < 2}><Ic name="i-clock" className="sm" /> {otimizando ? t('rota.otimizando') : t('rota.otimizar')}</button>
            <button className="btn-primary" onClick={salvar} disabled={salvando}>{salvando ? t('rota.salvando') : t('rota.salvar')}</button>
            <button className="btn-ghost" onClick={linkRota} title={t('rota.link_freelancer_dica')}><Ic name="i-clip" className="sm" /> {t('rota.link_freelancer')}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paradas.map((p, i) => (
              <div key={p.pedidoId} className="card"
                draggable onDragStart={() => setArrastando(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => soltar(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'grab', opacity: arrastando === i ? 0.5 : 1, padding: '10px 14px' }}>
                <span style={{ flex: '0 0 32px', height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{numeroPedido(p.numero)}</b> <span className="muted">· {p.clienteNome ?? '—'}</span>
                  <div className="muted" style={{ fontSize: 12 }}>{p.enderecoEntrega ?? t('rota.sem_endereco')}</div>
                </div>
                <Ic name="i-menu" className="sm muted" />
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>{paradas.length} {t('rota.paradas')}</div>
        </>
      )}
    </div>
  );
}
