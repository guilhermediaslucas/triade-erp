// Configuração fiscal por empresa (emitente). Usada na emissão de NF-e (Fase 7).
// Regime e perfil de operação são POR EMPRESA (multi-tenant): cada uma pode ter o seu.

export type RegimeTributario = 1 | 2 | 3; // 1 Simples Nacional · 2 Simples (excesso sublimite) · 3 Regime Normal
export type AmbienteFiscal = 'homologacao' | 'producao';

export const REGIMES_TRIBUTARIOS: RegimeTributario[] = [1, 2, 3];
export const AMBIENTES_FISCAIS: AmbienteFiscal[] = ['homologacao', 'producao'];

// Perfil de operação padrão (aplicado a toda venda; o produto pode sobrescrever campos).
export interface PerfilFiscal {
  naturezaOperacao: string;
  cfopDentroUf: string;   // operação dentro do estado (ex.: 5102)
  cfopForaUf: string;     // operação interestadual (ex.: 6102)
  icmsOrigem: number;     // 0..8
  csosnPadrao: string;    // usado quando regime = Simples
  cstIcmsPadrao: string;  // usado quando regime = Normal
  aliquotaIcms: number;   // alíquota de ICMS (regime Normal)
  pisCstPadrao: string;
  cofinsCstPadrao: string;
}

export interface ConfigFiscal extends PerfilFiscal {
  empresaCodigo: string;
  regimeTributario: RegimeTributario;
  ambiente: AmbienteFiscal;
  // Tokens da Focus NFe — só no servidor, nunca devolvidos ao frontend.
  tokenHomologacao: string;
  tokenProducao: string;
  // Número/complemento do endereço do emitente (o resto do endereço vem de "Dados da empresa").
  numeroEmitente: string;
  complementoEmitente: string;
}

// Valores padrão para uma empresa que ainda não configurou o fiscal.
export function configFiscalPadrao(empresaCodigo: string): ConfigFiscal {
  return {
    empresaCodigo,
    regimeTributario: 1,
    ambiente: 'homologacao',
    tokenHomologacao: '',
    tokenProducao: '',
    numeroEmitente: '',
    complementoEmitente: '',
    naturezaOperacao: 'Venda de mercadoria',
    cfopDentroUf: '5102',
    cfopForaUf: '6102',
    icmsOrigem: 0,
    csosnPadrao: '102',
    cstIcmsPadrao: '00',
    aliquotaIcms: 0,
    pisCstPadrao: '07',
    cofinsCstPadrao: '07',
  };
}

export interface ConfigFiscalRepository {
  obter(empresaCodigo: string): Promise<ConfigFiscal | null>;
  salvar(dados: ConfigFiscal): Promise<void>; // upsert
}
