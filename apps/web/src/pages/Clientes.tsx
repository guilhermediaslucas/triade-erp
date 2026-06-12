import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { UFS, buscarMunicipios } from '../lib/br.js';

type TipoPessoa = 'PJ' | 'PF';
interface Endereco { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string; favorito: boolean; }
interface Cliente {
  id: string; tipoPessoa: TipoPessoa; nome: string; fantasia: string | null; documento: string;
  email: string | null; telefone: string | null; limiteCredito: number; ativo: boolean; enderecos: Endereco[];
  emAberto: number;
}
const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const so = (v: string) => (v || '').replace(/\D/g, '');
function mascaraCnpj(v: string) { const d = so(v).slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); }
function mascaraCpf(v: string) { const d = so(v).slice(0, 11); return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'); }
function mascaraCep(v: string) { const d = so(v).slice(0, 8); return d.replace(/^(\d{5})(\d)/, '$1-$2'); }
const endVazio = (): Endereco => ({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', favorito: false });
const vazio = (): Cliente => ({ id: '', tipoPessoa: 'PJ', nome: '', fantasia: '', documento: '', email: '', telefone: '', limiteCredito: 0, ativo: true, enderecos: [], emAberto: 0 });

export function Clientes() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.cliente.gerenciar');
  const [itens, setItens] = useState<Cliente[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState('');
  const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() { try { setItens(await api.get('/clientes', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); } }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  async function alternar(c: Cliente) { try { await api.patch('/clientes/' + c.id + '/ativo', { ativo: !c.ativo }, token!); carregar(); } catch (e) { setErro((e as ErroApi).chaveI18n); } }

  const filtrados = itens.filter((c) => {
    if (statusF === 'ativos' && !c.ativo) return false;
    if (statusF === 'inativos' && c.ativo) return false;
    if (busca) {
      const q = busca.toLowerCase();
      const cid = c.enderecos.find((e) => e.favorito) ?? c.enderecos[0];
      const txt = (c.nome + ' ' + (c.fantasia ?? '') + ' ' + c.documento + ' ' + (cid?.cidade ?? '')).toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('clientes.crumb')}</div>
      <div className="page-head"><div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('clientes.titulo')}</h1><div className="muted page-sub">{t('clientes.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit(vazio())}>+ {t('clientes.novo')}</button>}</div>
      <div className="toolbar">
        <div className="busca-box-tb">🔎<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('clientes.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0"><table className="tabela">
        <thead><tr><th>{t('clientes.nome')}</th><th>{t('clientes.tipo')}</th><th>{t('pessoa.documento')}</th><th>{t('clientes.limite')}</th><th>{t('clientes.cidade')}</th><th>{t('clientes.em_aberto')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
        <tbody>
          {filtrados.length === 0 && <tr><td colSpan={8} className="vazio">{t('common.nenhum')}</td></tr>}
          {filtrados.map((c) => {
            const fav = c.enderecos.find((e) => e.favorito) ?? c.enderecos[0];
            return (
              <tr key={c.id} className={c.ativo ? '' : 'linha-inativa'}>
                <td>{c.nome}{c.fantasia ? <span className="muted"> · {c.fantasia}</span> : null}</td>
                <td>{c.tipoPessoa}</td><td>{c.documento}</td><td>{moeda(c.limiteCredito)}</td>
                <td>{fav ? `${fav.cidade ?? ''}${fav.uf ? '/' + fav.uf : ''}` : '—'}</td>
                <td>{c.emAberto > 0 ? <b>{moeda(c.emAberto)}</b> : <span className="muted">{moeda(0)}</span>}</td>
                <td><span className={c.ativo ? 'pill-ok' : 'pill-off'}>{c.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...c, fantasia: c.fantasia ?? '', email: c.email ?? '', telefone: c.telefone ?? '', enderecos: c.enderecos.map((e) => ({ ...endVazio(), ...e, cep: e.cep ?? '', logradouro: e.logradouro ?? '', numero: e.numero ?? '', complemento: e.complemento ?? '', bairro: e.bairro ?? '', cidade: e.cidade ?? '', uf: e.uf ?? '' })) })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(c)}>{c.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      {edit && <ModalCli c={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalCli({ c, onFechar, onSalvo }: { c: Cliente; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth(); const { t } = useI18n();
  const novo = !c.id; const [v, setV] = useState(c);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const set = (campo: keyof Cliente, val: any) => setV((x) => ({ ...x, [campo]: val }));
  const pj = v.tipoPessoa === 'PJ';

  function setDocumento(raw: string) { set('documento', pj ? mascaraCnpj(raw) : mascaraCpf(raw)); }

  async function buscarCnpj() {
    const d = so(v.documento);
    if (d.length !== 14) { setErro('clientes.cnpj_incompleto'); return; }
    setErro(null); setBuscandoCnpj(true);
    try {
      const resp = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + d);
      if (!resp.ok) throw new Error();
      const dados = await resp.json();
      setV((x) => ({ ...x, nome: dados.razao_social ?? x.nome, fantasia: dados.nome_fantasia ?? x.fantasia }));
    } catch { setErro('clientes.cnpj_nao_encontrado'); }
    finally { setBuscandoCnpj(false); }
  }

  // endereços
  const ends = v.enderecos;
  const setEnds = (novos: Endereco[]) => set('enderecos', novos);
  function addEnd() { setEnds([...ends, { ...endVazio(), favorito: ends.length === 0 }]); }
  function delEnd(i: number) { const arr = ends.filter((_, idx) => idx !== i); if (arr.length && !arr.some((e) => e.favorito)) arr[0]!.favorito = true; setEnds(arr); }
  function setEnd(i: number, campo: keyof Endereco, val: any) { setEnds(ends.map((e, idx) => idx === i ? { ...e, [campo]: val } : e)); }
  function setFav(i: number) { setEnds(ends.map((e, idx) => ({ ...e, favorito: idx === i }))); }
  async function buscarCep(i: number) {
    const cep = so(ends[i]!.cep);
    if (cep.length !== 8) return;
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await resp.json();
      if (d.erro) return;
      setEnds(ends.map((e, idx) => idx === i ? { ...e, logradouro: d.logradouro || e.logradouro, bairro: d.bairro || e.bairro, cidade: d.localidade || e.cidade, uf: d.uf || e.uf } : e));
    } catch { /* ignora */ }
  }

  // Municípios por UF (IBGE) para sugerir a cidade nos endereços.
  const [munisPorUf, setMunisPorUf] = useState<Record<string, string[]>>({});
  const ufsDosEnds = ends.map((e) => e.uf).filter(Boolean).join(',');
  useEffect(() => {
    Array.from(new Set(ends.map((e) => e.uf).filter(Boolean))).forEach((uf) => {
      if (!munisPorUf[uf]) buscarMunicipios(uf).then((lista) => setMunisPorUf((cur) => (cur[uf] ? cur : { ...cur, [uf]: lista })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ufsDosEnds]);

  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = {
      tipoPessoa: v.tipoPessoa, nome: v.nome, fantasia: pj ? v.fantasia : null, documento: v.documento,
      email: v.email, telefone: v.telefone, limiteCredito: Number(v.limiteCredito),
      enderecos: ends.map((e) => ({ ...e })),
    };
    try { if (novo) await api.post('/clientes', corpo, token!); else await api.put('/clientes/' + c.id, corpo, token!); onSalvo(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{novo ? t('clientes.novo') : t('common.editar')}</h2>
      <label className="campo">{t('clientes.tipo')}
        <select value={v.tipoPessoa} onChange={(e) => set('tipoPessoa', e.target.value)}>
          <option value="PJ">{t('clientes.pj')}</option><option value="PF">{t('clientes.pf')}</option>
        </select>
      </label>
      <label className="campo">{pj ? t('pessoa.razao') : t('clientes.nome_completo')}<input value={v.nome} onChange={(e) => set('nome', e.target.value)} autoFocus /></label>
      {pj && <label className="campo">{t('pessoa.fantasia')}<input value={v.fantasia ?? ''} onChange={(e) => set('fantasia', e.target.value)} /></label>}
      <div className="cores-grid">
        <label className="campo">{pj ? 'CNPJ' : 'CPF'}
          <div className="campo-com-botao">
            <input value={v.documento} onChange={(e) => setDocumento(e.target.value)} placeholder={pj ? '00.000.000/0000-00' : '000.000.000-00'} />
            {pj && <button type="button" className="btn-ghost btn-mini" disabled={buscandoCnpj} onClick={buscarCnpj}>{buscandoCnpj ? '...' : t('clientes.buscar')}</button>}
          </div>
        </label>
        <label className="campo">{t('clientes.limite')}<input type="number" step="0.01" min="0" value={v.limiteCredito} onChange={(e) => set('limiteCredito', e.target.value)} /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={v.email ?? ''} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={v.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></label>
      </div>

      <div className="perm-titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{t('clientes.enderecos')}</span>
        <button type="button" className="btn-ghost btn-mini" onClick={addEnd}>+ {t('clientes.add_endereco')}</button>
      </div>
      {ends.length === 0 && <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>{t('clientes.sem_endereco')}</div>}
      {ends.map((e, i) => (
        <div key={i} className="end-bloco">
          <div className="end-topo">
            <label className="end-fav"><input type="radio" name="favEnd" checked={e.favorito} onChange={() => setFav(i)} /> {t('clientes.favorito')}</label>
            <button type="button" className="btn-link" onClick={() => delEnd(i)}>{t('clientes.remover')}</button>
          </div>
          <div className="end-grid">
            <input placeholder="CEP" value={e.cep} onChange={(ev) => setEnd(i, 'cep', mascaraCep(ev.target.value))} onBlur={() => buscarCep(i)} style={{ maxWidth: 110 }} />
            <input placeholder={t('clientes.logradouro')} value={e.logradouro} onChange={(ev) => setEnd(i, 'logradouro', ev.target.value)} />
            <input placeholder={t('clientes.numero')} value={e.numero} onChange={(ev) => setEnd(i, 'numero', ev.target.value)} style={{ maxWidth: 90 }} />
          </div>
          <div className="end-grid">
            <input placeholder={t('clientes.bairro')} value={e.bairro} onChange={(ev) => setEnd(i, 'bairro', ev.target.value)} />
            <input list={`mun-${i}`} placeholder={t('clientes.cidade')} value={e.cidade} onChange={(ev) => setEnd(i, 'cidade', ev.target.value)} />
            <datalist id={`mun-${i}`}>{(munisPorUf[e.uf] ?? []).map((m) => <option key={m} value={m} />)}</datalist>
            <select value={e.uf} onChange={(ev) => setEnd(i, 'uf', ev.target.value)} style={{ maxWidth: 80 }}>
              <option value="">UF</option>
              {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
      ))}

      {erro && <div className="alerta-erro" style={{ marginTop: 12 }}>{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );
}
