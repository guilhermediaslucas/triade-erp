import type { DataSource } from 'typeorm';
import type { AmbienteFiscal, ConfigFiscal, ConfigFiscalRepository, RegimeTributario } from '../../domain/fiscal/ConfigFiscal.js';

function mapear(r: any): ConfigFiscal {
  return {
    empresaCodigo: r.empresa_codigo,
    regimeTributario: (Number(r.regime_tributario) as RegimeTributario),
    ambiente: (r.ambiente as AmbienteFiscal),
    tokenHomologacao: r.token_homologacao ?? '',
    tokenProducao: r.token_producao ?? '',
    naturezaOperacao: r.natureza_operacao ?? '',
    cfopDentroUf: r.cfop_dentro_uf ?? '',
    cfopForaUf: r.cfop_fora_uf ?? '',
    icmsOrigem: Number(r.icms_origem ?? 0),
    csosnPadrao: r.csosn_padrao ?? '',
    cstIcmsPadrao: r.cst_icms_padrao ?? '',
    aliquotaIcms: Number(r.aliquota_icms ?? 0),
    pisCstPadrao: r.pis_cst_padrao ?? '',
    cofinsCstPadrao: r.cofins_cst_padrao ?? '',
  };
}

export class SqlConfigFiscalRepository implements ConfigFiscalRepository {
  constructor(private readonly ds: DataSource) {}

  async obter(empresaCodigo: string): Promise<ConfigFiscal | null> {
    const r = (await this.ds.query(
      `SELECT * FROM public.empresa_fiscal WHERE empresa_codigo = $1 LIMIT 1`,
      [empresaCodigo],
    ))[0];
    return r ? mapear(r) : null;
  }

  async salvar(d: ConfigFiscal): Promise<void> {
    await this.ds.query(
      `INSERT INTO public.empresa_fiscal
         (empresa_codigo, regime_tributario, ambiente, token_homologacao, token_producao,
          natureza_operacao, cfop_dentro_uf, cfop_fora_uf, icms_origem, csosn_padrao,
          cst_icms_padrao, aliquota_icms, pis_cst_padrao, cofins_cst_padrao, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
       ON CONFLICT (empresa_codigo) DO UPDATE SET
         regime_tributario = EXCLUDED.regime_tributario,
         ambiente          = EXCLUDED.ambiente,
         token_homologacao = EXCLUDED.token_homologacao,
         token_producao    = EXCLUDED.token_producao,
         natureza_operacao = EXCLUDED.natureza_operacao,
         cfop_dentro_uf    = EXCLUDED.cfop_dentro_uf,
         cfop_fora_uf      = EXCLUDED.cfop_fora_uf,
         icms_origem       = EXCLUDED.icms_origem,
         csosn_padrao      = EXCLUDED.csosn_padrao,
         cst_icms_padrao   = EXCLUDED.cst_icms_padrao,
         aliquota_icms     = EXCLUDED.aliquota_icms,
         pis_cst_padrao    = EXCLUDED.pis_cst_padrao,
         cofins_cst_padrao = EXCLUDED.cofins_cst_padrao,
         atualizado_em     = now()`,
      [d.empresaCodigo, d.regimeTributario, d.ambiente, d.tokenHomologacao, d.tokenProducao,
        d.naturezaOperacao, d.cfopDentroUf, d.cfopForaUf, d.icmsOrigem, d.csosnPadrao,
        d.cstIcmsPadrao, d.aliquotaIcms, d.pisCstPadrao, d.cofinsCstPadrao],
    );
  }
}
