import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Marca { id: string; nome: string; fabricante: string | null; ativo: boolean; }

export function Marcas() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.marca.gerenciar');
  const [itens, setItens] = useState<Marca[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Marca | null>(null);

  async function carregar() {
    try { setItens(await api.get<Marca[]>('/marcas', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: Marca) {
    try { await api.patch('/marcas/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="page-head">
        <h1 className="page-titulo">{t('marcas.titulo')}</h1>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', nome: '', fabricante: '', ativo: true })}>+ {t('marcas.nova')}</button>}
      </div>
      <p className="muted" style={{ marginTop: -8 }}>{t('marcas.sub')}</p>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0">
        <table className="tabela">
          <thead><tr><th>{t('marcas.nome')}</th><th>{t('marcas.fabricante')}</th><th>{t('usuarios.situacao')}</th><th>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td>{m.nome}</td>
                <td>{m.fabricante ?? '—'}</td>
                <td><span className={m.ativo ? 'pill-ok' : 'pill-off'}>{m.ativo ? t('usuarios.ativo') : t('usuarios.inativo')}</span></td>
                <td className="acoes">{pode && <>
                  <button className="btn-link" onClick={() => setEdit({ ...m })}>{t('common.editar')}</button>
                  <button className="btn-link" onClick={() => alternar(m)}>{m.ativo ? t('usuarios.inativar') : t('usuarios.ativar')}</button>
                </>}</td>
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
    <div className="modal-fundo" onClick={onFechar}>
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
