import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { mascaraCnpj, mascaraCep, buscarCnpj, buscarCep, UFS } from '../lib/br.js';

type TipoPessoaSel = 'cliente' | 'fornecedor';

// Campo padrão para escolher um Cliente ou Fornecedor: SEMPRE puxa do cadastro
// (datalist de ativos) e SEMPRE oferece "+ cadastrar novo" inline (modal) sem
// sair da tela. Usar em qualquer tela que tenha um campo cliente/fornecedor.
export function SeletorPessoa({ tipo, value, onChange, label, placeholder }: {
  tipo: TipoPessoaSel;
  value: string;
  onChange: (nome: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [lista, setLista] = useState<{ id: string; nome: string; ativo?: boolean }[]>([]);
  const [novo, setNovo] = useState(false);
  const [dlId] = useState(() => 'dl-pessoa-' + Math.random().toString(36).slice(2));
  const endpoint = tipo === 'fornecedor' ? '/fornecedores' : '/clientes';

  const carregar = () => api.get<{ id: string; nome: string; ativo?: boolean }[]>(endpoint, token!)
    .then((l) => setLista(l.filter((p) => p.ativo !== false)))
    .catch(() => {});
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  return (
    <label className="campo">
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label ?? (tipo === 'fornecedor' ? t('fin.fornecedor') : t('fin.cliente'))}
        <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={() => setNovo(true)}>+ {t('fin.cadastrar_novo')}</button>
      </span>
      <input list={dlId} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? t('fin.pessoa_ph')} />
      <datalist id={dlId}>{lista.map((p) => <option key={p.id} value={p.nome} />)}</datalist>
      {novo && <ModalNovaPessoa tipo={tipo} onFechar={() => setNovo(false)} onCriado={(nome) => { setNovo(false); onChange(nome); carregar(); }} />}
    </label>
  );
}

// Cadastro rápido de Fornecedor ou Cliente sem sair da tela atual.
// O fornecedor espelha a tela "Cadastrar fornecedor" do mockup (razão, fantasia,
// CNPJ+Buscar, contato, endereço). Exportado para reuso (ex.: Contas, Novo pedido).
export function ModalNovaPessoa({ tipo, onFechar, onCriado }: {
  tipo: TipoPessoaSel;
  onFechar: () => void;
  onCriado: (nome: string) => void;
}) {
  const fornecedor = tipo === 'fornecedor';
  const { token } = useAuth(); const { t } = useI18n();
  const [nome, setNome] = useState(''); const [fantasia, setFantasia] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState<'PJ' | 'PF'>('PJ');
  const [documento, setDoc] = useState(''); const [telefone, setTel] = useState(''); const [email, setEmail] = useState('');
  const [cep, setCep] = useState(''); const [cidade, setCidade] = useState(''); const [uf, setUf] = useState('');
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [erro, setErro] = useState<string | null>(null); const [salv, setSalv] = useState(false);

  async function buscarDoc() {
    setBuscandoCnpj(true);
    try {
      const d = await buscarCnpj(documento);
      if (d) { if (!nome) setNome(d.razao ?? ''); if (!fantasia && d.fantasia) setFantasia(d.fantasia); if (d.cep) setCep(mascaraCep(d.cep)); if (d.cidade) setCidade(d.cidade); if (d.uf) setUf(d.uf); }
    } finally { setBuscandoCnpj(false); }
  }
  async function cepLookup() {
    const d = await buscarCep(cep);
    if (d) { if (d.cidade) setCidade(d.cidade); if (d.uf) setUf(d.uf); }
  }
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      const corpo = fornecedor
        ? { nome, fantasia, documento, telefone, email, cep, cidade, uf }
        : { tipoPessoa, nome, documento, telefone, email, limiteCredito: 0 };
      await api.post(fornecedor ? '/fornecedores' : '/clientes', corpo, token!);
      onCriado(nome.trim());
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }

  if (!fornecedor) return (
    <div className="modal-fundo"><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
      <h2>{t('fin.novo_cliente')}</h2>
      <label className="campo">{t('clientes.tipo')}
        <select value={tipoPessoa} onChange={(e) => setTipoPessoa(e.target.value as 'PJ' | 'PF')}>
          <option value="PJ">{t('clientes.pj')}</option><option value="PF">{t('clientes.pf')}</option>
        </select>
      </label>
      <label className="campo">{tipoPessoa === 'PJ' ? t('pessoa.razao') : t('fin.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
      <div className="cores-grid">
        <label className="campo">{tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}<input value={documento} onChange={(e) => setDoc(tipoPessoa === 'PJ' ? mascaraCnpj(e.target.value) : e.target.value)} placeholder={t('fin.doc_ph')} /></label>
        <label className="campo">{t('pessoa.telefone')}<input value={telefone} onChange={(e) => setTel(e.target.value)} /></label>
      </div>
      <label className="campo">{t('pessoa.email')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv || nome.trim().length < 2} onClick={salvar}>{t('common.salvar')}</button></div>
    </div></div>
  );

  return (
    <div className="modal-fundo"><div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
      <h2>{t('fin.cadastrar_fornecedor')}</h2>
      <label className="campo">{t('pessoa.razao')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
      <label className="campo">{t('pessoa.fantasia')}<input value={fantasia} onChange={(e) => setFantasia(e.target.value)} placeholder={t('fin.fantasia_ph')} /></label>
      <div className="cores-grid">
        <label className="campo">CNPJ
          <div className="campo-com-botao">
            <input value={documento} onChange={(e) => setDoc(mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" />
            <button type="button" className="btn-ghost btn-mini" disabled={buscandoCnpj} onClick={buscarDoc}>{buscandoCnpj ? '...' : t('clientes.buscar')}</button>
          </div>
        </label>
        <label className="campo">{t('fin.celular')}<input value={telefone} onChange={(e) => setTel(e.target.value)} placeholder="+55" /></label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('pessoa.email')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="campo">{t('fin.uf')}
          <select value={uf} onChange={(e) => setUf(e.target.value)}>
            <option value="">UF...</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      </div>
      <div className="cores-grid">
        <label className="campo">{t('clientes.cidade')}<input value={cidade} onChange={(e) => setCidade(e.target.value)} /></label>
        <label className="campo">CEP<input value={cep} onChange={(e) => setCep(mascaraCep(e.target.value))} onBlur={cepLookup} placeholder="00000-000" maxLength={9} /></label>
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="modal-acoes"><button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button><button className="btn-primary" disabled={salv || nome.trim().length < 2} onClick={salvar}>{t('fin.salvar_fornecedor')}</button></div>
    </div></div>
  );
}
