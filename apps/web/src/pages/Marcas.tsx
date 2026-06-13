import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';

interface Marca { id: string; nome: string; fabricante: string | null; ativo: boolean; }

export function Marcas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.marca.gerenciar');
  const [itens, setItens] = useState<Marca[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Marca | null>(null);
  const [busca, setBusca] = useState(''); const [statusF, setStatusF] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  async function carregar() {
    try { setItens(await api.get<Marca[]>('/marcas', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: Marca) {
    try { await api.patch('/marcas/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
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
      <div className="crumb">{t('marcas.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('marcas.titulo')}</h1><div className="muted page-sub">{t('marcas.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', fabricante: '', ativo: true })}>+ {t('marcas.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="toolbar">
        <div className="busca-box-tb"><Ic name="i-search" className="sm" /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('marcas.buscar')} /></div>
        {(['todos', 'ativos', 'inativos'] as const).map((sf) => <span key={sf} className={'chip-f' + (statusF === sf ? ' on' : '')} onClick={() => setStatusF(sf)}>{t('common.' + sf)}</span>)}
      </div>
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('marcas.nome')}</th><th>{t('marcas.fabricante')}</th><th>{t('fin.status')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {filtrados.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('marcas.nome')}>{m.nome}</td>
                <td data-label={t('marcas.fabricante')}>{m.fabricante ?? '—'}</td>
                <td data-label={t('fin.status')}><span className={m.ativo ? 'pill-ok' : 'pill-off'}>{m.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="acoes-ic">{pode && <>
                  <button className="acao-ic" title={t('common.editar')} onClick={() => setEdit({ ...m })}><Ic name="i-edit" className="sm" /></button>
                  <button className="acao-ic danger" title={m.ativo ? t('usuarios.inativar') : t('usuarios.ativar')} onClick={() => alternar(m)}><Ic name="i-trash" className="sm" /></button>
                </>}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ModalMarca m={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalMarca({ m, onFechar, onSalvo }: { m: Marca; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !m.id;
  const [nome, setNome] = useState(m.nome);
  const [fabricante, setFabricante] = useState(m.fabricante ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    try {
      if (novo) await api.post('/marcas', { nome, fabricante }, token!);
      else await api.put('/marcas/' + m.id, { nome, fabricante }, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('marcas.nova') : t('common.editar')}</h2>
        <label className="campo">{t('marcas.nome')}<input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="campo">{t('marcas.fabricante')}<input value={fabricante} onChange={(e) => setFabricante(e.target.value)} /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
