import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import type { ConfigFiscal } from '../../../domain/fiscal/ConfigFiscal.js';

// Versão "pública" da config: NÃO devolve os tokens, só sinaliza se estão configurados.
function publico(c: ConfigFiscal) {
  return {
    empresaCodigo: c.empresaCodigo,
    regimeTributario: c.regimeTributario,
    ambiente: c.ambiente,
    naturezaOperacao: c.naturezaOperacao,
    cfopDentroUf: c.cfopDentroUf,
    cfopForaUf: c.cfopForaUf,
    icmsOrigem: c.icmsOrigem,
    csosnPadrao: c.csosnPadrao,
    cstIcmsPadrao: c.cstIcmsPadrao,
    aliquotaIcms: c.aliquotaIcms,
    pisCstPadrao: c.pisCstPadrao,
    cofinsCstPadrao: c.cofinsCstPadrao,
    tokenHomologacaoConfigurado: c.tokenHomologacao.trim() !== '',
    tokenProducaoConfigurado: c.tokenProducao.trim() !== '',
  };
}

export function rotasFiscal(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);

  r.get('/fiscal/config', aut, az('acesso.empresa.editar'), async (req: Request, res: Response) => {
    try { res.json(publico(await deps.configFiscalService.obter(req.usuario!.empresa))); }
    catch (e) { tratarErro(res, e); }
  });

  r.put('/fiscal/config', aut, az('acesso.empresa.editar'), async (req: Request, res: Response) => {
    try {
      await deps.configFiscalService.salvar(req.usuario!.empresa, req.body ?? {});
      auditar(req, { modulo: 'Fiscal', entidade: 'ConfigFiscal', descricao: 'Alterou a configuração fiscal da empresa' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
