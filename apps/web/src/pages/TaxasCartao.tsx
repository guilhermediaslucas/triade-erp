import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from '../components/Icones.js';
import { MoedaInput } from '../components/MoedaInput.js';

interface Taxa { id: string; forma: string; percentual: number; ativo: boolean; }

export function TaxasCartao() {
  const { token, temCapability } = useAuth();
  const { t } = useI18n();
  const pode = temCapability('cadastros.taxa_cartao.gerenciar');
  const [itens, setItens] = useState<Taxa[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [edit, setEdit] = useState<Taxa | null>(null);

  async function carregar() {
    try { setItens(await api.get<Taxa[]>('/taxas-cartao', token!)); } catch (e) { setErro((e as ErroApi).chaveI18n); }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  async function alternar(m: Taxa) {
    try { await api.patch('/taxas-cartao/' + m.id + '/ativo', { ativo: !m.ativo }, token!); carregar(); }
    catch (e) { setErro((e as ErroApi).chaveI18n); }
  }

  return (
    <div>
      <div className="crumb">{t('taxacartao.crumb')}</div>
      <div className="page-head">
        <div><h1 className="page-titulo" style={{ marginBottom: 2 }}>{t('taxacartao.titulo')}</h1><div className="muted page-sub">{t('taxacartao.sub')}</div></div>
        {pode && <button className="btn-primary" onClick={() => setEdit({ id: '', forma: '', percentual: 0, ativo: true })}>+ {t('taxacartao.nova')}</button>}
      </div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      <div className="card pad0">
        <table className="tabela tabela-cards">
          <thead><tr><th>{t('taxacartao.forma')}</th><th style={{ textAlign: 'right' }}>{t('taxacartao.percentual')}</th><th>{t('fin.status')}</th><th style={{ textAlign: 'right' }}>{t('usuarios.acoes')}</th></tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={4} className="vazio">{t('common.nenhum')}</td></tr>}
            {itens.map((m) => (
              <tr key={m.id} className={m.ativo ? '' : 'linha-inativa'}>
                <td data-label={t('taxacartao.forma')}>{m.forma}</td>
                <td data-label={t('taxacartao.percentual')} style={{ textAlign: 'right' }}>{m.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
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
      {edit && <ModalTaxa m={edit} onFechar={() => setEdit(null)} onSalvo={() => { setEdit(null); carregar(); }} />}
    </div>
  );
}

function ModalTaxa({ m, onFechar, onSalvo }: { m: Taxa; onFechar: () => void; onSalvo: () => void; }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const novo = !m.id;
  const [forma, setForma] = useState(m.forma);
  const [percentual, setPercentual] = useState(String(m.percentual || ''));
  const [erro, setErro] = useState<string | null>(null);
  const [salv, setSalv] = useState(false);
  async function salvar() {
    setErro(null); setSalv(true);
    const corpo = { forma, percentual: Number(percentual) || 0 };
    try {
      if (novo) await api.post('/taxas-cartao', corpo, token!);
      else await api.put('/taxas-cartao/' + m.id, corpo, token!);
      onSalvo();
    } catch (e) { setErro((e as ErroApi).chaveI18n); setSalv(false); }
  }
  return (
    <div className="modal-fundo">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{novo ? t('taxacartao.nova') : t('taxacartao.editar')}</h2>
        <label className="campo">{t('taxacartao.forma')}<input value={forma} onChange={(e) => setForma(e.target.value)} autoFocus placeholder={t('taxacartao.forma_ph')} /></label>
        <label className="campo">{t('taxacartao.percentual')}<MoedaInput value={percentual} onChange={(n) => setPercentual(n ? String(n) : '')} placeholder="0,00" /></label>
        {erro && <div className="alerta-erro">{t(erro)}</div>}
        <div className="modal-acoes">
          <button className="btn-ghost" onClick={onFechar}>{t('common.cancelar')}</button>
          <button className="btn-primary" disabled={salv} onClick={salvar}>{t('common.salvar')}</button>
        </div>
      </div>
    </div>
  );
}
