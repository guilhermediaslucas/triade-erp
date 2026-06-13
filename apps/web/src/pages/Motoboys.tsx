import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Motoboy { id: string; nome: string; telefone: string | null; cpf: string | null; chavePix: string | null; ativo: boolean; }

export function Motoboys() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.motoboy.gerenciar');
  const [itens, setItens] = useState<Motoboy[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Motoboy | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() {
    try { setItens(await api.get<Motoboy[]>('/motoboys', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: Motoboy) {
    try { await api.patch('/motoboys/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  const filtrados = itens.filter((x: any) => {
    if (statusF === 'ativos' && !x.ativo) return false;
    if (statusF === 'inativos' && x.ativo) return false;
    if (busca) { const q = busca.toLowerCase(); const txt = [x.nome, x.fantasia, x.documento, x.email, x.telefone].filter(Boolean).join(' ').toLowerCase(); if (!txt.includes(q)) return false; }
    return true;
  });

  return (
    <div>
      <div className="crumb">{t('motoboys.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('motoboys.titulo')}</h1><div className="muted page-sub">{t('motoboys.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', telefone: '', cpf: '', chavePix: '', ativo: true })}>+ {t('motoboys.novo')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}

      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('motoboys.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('motoboys.nome')}</th><th>{t('motoboys.telefone')}</th><th>CPF</th><th>{t('motoboys.chave_pix')}</th><th>{t('fin.status')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={6} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('motoboys.nome')}><b>{m.nome}</b></td>
                <td data-label={t('motoboys.telefone')}>{m.telefone ?? '—'}</td>
                <td data-label="CPF">{m.cpf ?? '—'}</td>
                <td data-label={t('motoboys.chave_pix')}>{m.chavePix ?? '—'}</td>
                <td data-label={t('fin.status')}><span className={m.ativo ? 'pill-ok' : 'pill-off'}>{m.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="acoes-ic">
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...m, cpf: m.cpf ?? '', chavePix: m.chavePix ?? '' })}><Ic name="i-edit" className="sm" /></button>
                  {pode && <button className="acao-ic danger" title={m.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(m)}><Ic name="i-trash" className="sm" /></button>}
                </span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalMotoboy m={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalMotoboy({ m, onFechar, onSalvo }: { m: Motoboy; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !m.id;
  const [nome, setNome] = useState(m.nome);
  const [telefone, setTelefone] = useState(m.telefone ?? '');
  const [cpf, setCpf] = useState(m.cpf ?? '');
  const [chavePix, setChavePix] = useState(m.chavePix ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      const corpo = { nome, telefone, cpf, chavePix };
      if (novo) await api.post('/motoboys', corpo, token!);
      else await api.put('/motoboys/' + m.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('motoboys.novo') : t('common.editar')}</h2>
        <label className="campo">{t('motoboys.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <div className="cores-grid">
          <label className="campo">CPF<input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" /></label>
          <label className="campo">{t('motoboys.telefone')}<input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></label>
        </div>
        <label className="campo">{t('motoboys.chave_pix')}<input value={chavePix} onChange={(e) => setChavePix(e.target.value)} /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
