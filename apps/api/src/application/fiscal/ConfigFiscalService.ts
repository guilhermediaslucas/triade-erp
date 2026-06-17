import {
  AMBIENTES_FISCAIS, REGIMES_TRIBUTARIOS, configFiscalPadrao,
  type AmbienteFiscal, type ConfigFiscal, type ConfigFiscalRepository, type RegimeTributario,
} from '../../domain/fiscal/ConfigFiscal.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

const CFOP = /^\d{4}$/;
const txt = (novo: any, velho: string): string => (novo !== undefined && novo !== null ? String(novo).trim() : velho);

export class ConfigFiscalService {
  constructor(private readonly repo: ConfigFiscalRepository) {}

  // Sempre devolve uma config (salva ou os defaults), para o frontend ter o que editar.
  async obter(empresaCodigo: string): Promise<ConfigFiscal> {
    return (await this.repo.obter(empresaCodigo)) ?? configFiscalPadrao(empresaCodigo);
  }

  // Salva mesclando sobre o que já existe. Tokens em branco PRESERVAM o token atual
  // (o frontend nunca recebe o token, então manda em branco quando não quer trocar).
  async salvar(empresaCodigo: string, b: any): Promise<void> {
    const atual = await this.obter(empresaCodigo);

    const regimeTributario = Number(b.regimeTributario ?? atual.regimeTributario) as RegimeTributario;
    if (!REGIMES_TRIBUTARIOS.includes(regimeTributario)) throw new ErroAplicacao('fiscal.regime_invalido', 400);

    const ambiente = String(b.ambiente ?? atual.ambiente) as AmbienteFiscal;
    if (!AMBIENTES_FISCAIS.includes(ambiente)) throw new ErroAplicacao('fiscal.ambiente_invalido', 400);

    const cfopDentroUf = txt(b.cfopDentroUf, atual.cfopDentroUf);
    const cfopForaUf = txt(b.cfopForaUf, atual.cfopForaUf);
    if (!CFOP.test(cfopDentroUf) || !CFOP.test(cfopForaUf)) throw new ErroAplicacao('fiscal.cfop_invalido', 400);

    const icmsOrigem = Number(b.icmsOrigem ?? atual.icmsOrigem);
    if (!Number.isInteger(icmsOrigem) || icmsOrigem < 0 || icmsOrigem > 8) throw new ErroAplicacao('fiscal.origem_invalida', 400);

    const aliquotaIcms = Number(b.aliquotaIcms ?? atual.aliquotaIcms);
    if (!Number.isFinite(aliquotaIcms) || aliquotaIcms < 0 || aliquotaIcms > 100) throw new ErroAplicacao('fiscal.aliquota_invalida', 400);

    const naturezaOperacao = txt(b.naturezaOperacao, atual.naturezaOperacao);
    if (naturezaOperacao.length < 2) throw new ErroAplicacao('fiscal.natureza_invalida', 400);

    // Token só é trocado quando vem preenchido; em branco mantém o atual.
    const tokenHomologacao = b.tokenHomologacao && String(b.tokenHomologacao).trim() !== '' ? String(b.tokenHomologacao).trim() : atual.tokenHomologacao;
    const tokenProducao = b.tokenProducao && String(b.tokenProducao).trim() !== '' ? String(b.tokenProducao).trim() : atual.tokenProducao;

    await this.repo.salvar({
      empresaCodigo,
      regimeTributario, ambiente, tokenHomologacao, tokenProducao,
      numeroEmitente: txt(b.numeroEmitente, atual.numeroEmitente),
      complementoEmitente: txt(b.complementoEmitente, atual.complementoEmitente),
      naturezaOperacao, cfopDentroUf, cfopForaUf, icmsOrigem,
      csosnPadrao: txt(b.csosnPadrao, atual.csosnPadrao) || '102',
      cstIcmsPadrao: txt(b.cstIcmsPadrao, atual.cstIcmsPadrao) || '00',
      aliquotaIcms,
      pisCstPadrao: txt(b.pisCstPadrao, atual.pisCstPadrao) || '07',
      cofinsCstPadrao: txt(b.cofinsCstPadrao, atual.cofinsCstPadrao) || '07',
    });
  }
}
