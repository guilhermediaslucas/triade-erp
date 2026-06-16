import { useEffect, useState } from 'react';
import { api, type ErroApi } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface ConfigFiscal {
  empresaCodigo: string;
  regimeTributario: 1 | 2 | 3;
  ambiente: 'homologacao' | 'producao';
  naturezaOperacao: string;
  cfopDentroUf: string;
  cfopForaUf: string;
  icmsOrigem: number;
  csosnPadrao: string;
  cstIcmsPadrao: string;
  aliquotaIcms: number;
  pisCstPadrao: string;
  cofinsCstPadrao: string;
  tokenHomologacaoConfigurado: boolean;
  tokenProducaoConfigurado: boolean;
}

// Origem da mercadoria (NF-e) — códigos universais; rótulos curtos em pt-BR (domínio fiscal brasileiro).
const ORIGENS = [
  '0 - Nacional',
  '1 - Estrangeira (importação direta)',
  '2 - Estrangeira (mercado interno)',
  '3 - Nacional (>40% importação)',
  '4 - Nacional (processos produtivos básicos)',
  '5 - Nacional (<40% importação)',
  '6 - Estrangeira (importação direta, sem similar)',
  '7 - Estrangeira (mercado interno, sem similar)',
  '8 - Nacional (>70% importação)',
];

export function ConfigFiscalCard() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [f, setF] = useState<ConfigFiscal | null>(null);
  const [tokenHom, setTokenHom] = useState('');
  const [tokenProd, setTokenProd] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get<ConfigFiscal>('/fiscal/config', token!).then(setF).catch((e) => setErro((e as ErroApi).chaveI18n));
  }, [token]);

  if (!f) return null;
  const set = (campo: keyof ConfigFiscal, valor: any) => setF({ ...f, [campo]: valor });

  async function salvar() {
    if (!f) return;
    setErro(null); setOk(false); setSalvando(true);
    try {
      await api.put('/fiscal/config', {
        regimeTributario: f.regimeTributario, ambiente: f.ambiente,
        naturezaOperacao: f.naturezaOperacao, cfopDentroUf: f.cfopDentroUf, cfopForaUf: f.cfopForaUf,
        icmsOrigem: f.icmsOrigem, csosnPadrao: f.csosnPadrao, cstIcmsPadrao: f.cstIcmsPadrao,
        aliquotaIcms: f.aliquotaIcms, pisCstPadrao: f.pisCstPadrao, cofinsCstPadrao: f.cofinsCstPadrao,
        tokenHomologacao: tokenHom, tokenProducao: tokenProd,
      }, token!);
      setOk(true); setTokenHom(''); setTokenProd('');
      setF({ ...f, tokenHomologacaoConfigurado: f.tokenHomologacaoConfigurado || tokenHom.trim() !== '', tokenProducaoConfigurado: f.tokenProducaoConfigurado || tokenProd.trim() !== '' });
    } catch (e) { setErro((e as ErroApi).chaveI18n); }
    finally { setSalvando(false); }
  }

  const simples = f.regimeTributario === 1 || f.regimeTributario === 2;

  return (
    <div className="card" style={{ maxWidth: 'none', marginTop: 18 }}>
      <h3 className="emp-sec">{t('fiscal.titulo')}</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{t('fiscal.sub')}</div>
      {erro && <div className="alerta-erro">{t(erro)}</div>}
      {ok && <div className="alerta-ok">{t('fiscal.salvo')}</div>}

      <div className="cores-grid">
        <label className="campo">{t('fiscal.regime')}
          <select value={f.regimeTributario} onChange={(e) => set('regimeTributario', Number(e.target.value))}>
            <option value={1}>{t('fiscal.regime_1')}</option>
            <option value={2}>{t('fiscal.regime_2')}</option>
            <option value={3}>{t('fiscal.regime_3')}</option>
          </select>
        </label>
        <label className="campo">{t('fiscal.ambiente')}
          <select value={f.ambiente} onChange={(e) => set('ambiente', e.target.value)}>
            <option value="homologacao">{t('fiscal.amb_homologacao')}</option>
            <option value="producao">{t('fiscal.amb_producao')}</option>
          </select>
        </label>
      </div>

      <div className="cores-grid">
        <label className="campo">{t('fiscal.token_homologacao')} {f.tokenHomologacaoConfigurado && <small className="hint" style={{ color: '#16a34a' }}>{t('fiscal.token_configurado')}</small>}
          <input value={tokenHom} onChange={(e) => setTokenHom(e.target.value)} placeholder={t('fiscal.token_ph')} autoComplete="off" />
        </label>
        <label className="campo">{t('fiscal.token_producao')} {f.tokenProducaoConfigurado && <small className="hint" style={{ color: '#16a34a' }}>{t('fiscal.token_configurado')}</small>}
          <input value={tokenProd} onChange={(e) => setTokenProd(e.target.value)} placeholder={t('fiscal.token_ph')} autoComplete="off" />
        </label>
      </div>
      <small className="hint" style={{ display: 'block', marginBottom: 14 }}>{t('fiscal.token_hint')}</small>

      <h3 className="emp-sec">{t('fiscal.perfil')}</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t('fiscal.perfil_hint')}</div>
      <label className="campo">{t('fiscal.natureza')}<input value={f.naturezaOperacao} onChange={(e) => set('naturezaOperacao', e.target.value)} /></label>
      <div className="cores-grid">
        <label className="campo">{t('fiscal.cfop_dentro')}<input value={f.cfopDentroUf} onChange={(e) => set('cfopDentroUf', e.target.value)} placeholder="5102" /></label>
        <label className="campo">{t('fiscal.cfop_fora')}<input value={f.cfopForaUf} onChange={(e) => set('cfopForaUf', e.target.value)} placeholder="6102" /></label>
        <label className="campo">{t('fiscal.origem')}
          <select value={f.icmsOrigem} onChange={(e) => set('icmsOrigem', Number(e.target.value))}>
            {ORIGENS.map((o, i) => <option key={i} value={i}>{o}</option>)}
          </select>
        </label>
      </div>
      <div className="cores-grid">
        {simples
          ? <label className="campo">{t('fiscal.csosn')}<input value={f.csosnPadrao} onChange={(e) => set('csosnPadrao', e.target.value)} placeholder="102" /></label>
          : <>
              <label className="campo">{t('fiscal.cst_icms')}<input value={f.cstIcmsPadrao} onChange={(e) => set('cstIcmsPadrao', e.target.value)} placeholder="00" /></label>
              <label className="campo">{t('fiscal.aliquota_icms')}<input type="number" step="0.01" min="0" max="100" value={f.aliquotaIcms} onChange={(e) => set('aliquotaIcms', Number(e.target.value))} /></label>
            </>}
      </div>
      <div className="cores-grid">
        <label className="campo">{t('fiscal.pis_cst')}<input value={f.pisCstPadrao} onChange={(e) => set('pisCstPadrao', e.target.value)} placeholder="07" /></label>
        <label className="campo">{t('fiscal.cofins_cst')}<input value={f.cofinsCstPadrao} onChange={(e) => set('cofinsCstPadrao', e.target.value)} placeholder="07" /></label>
      </div>

      <div className="modal-acoes">
        <button className="btn-primary" disabled={salvando} onClick={salvar}>{t('common.salvar')}</button>
      </div>
    </div>
  );
}
