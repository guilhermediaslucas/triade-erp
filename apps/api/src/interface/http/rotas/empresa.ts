import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

function brandingDe(e: any) {
  return {
    codigo: e.codigo, nome: e.nome, fantasia: e.fantasia,
    logo: e.logo, corPrimaria: e.corPrimaria, corMenuFundo: e.corMenuFundo,
    corMenuFonte: e.corMenuFonte, idiomaPadrao: e.idiomaPadrao, timezonePadrao: e.timezonePadrao,
  };
}

export function rotasEmpresa(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);
  const autorizar = criarAutorizar(deps.usuariosRepo);

  // Qualquer usuario logado pode LER (necessario para aplicar o tema).
  r.get('/empresa', autenticar, async (req: Request, res: Response) => {
    try { res.json(brandingDe(await deps.empresaService.obter(req.usuario!.empresa))); }
    catch (e) { tratarErro(res, e); }
  });

  // Editar exige a capability.
  r.put('/empresa', autenticar, autorizar('acesso.empresa.editar'), async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      await deps.empresaService.atualizar(req.usuario!.empresa, {
        fantasia: b.fantasia, logo: b.logo ?? null,
        corPrimaria: b.corPrimaria, corMenuFundo: b.corMenuFundo, corMenuFonte: b.corMenuFonte,
        idiomaPadrao: b.idiomaPadrao, timezonePadrao: b.timezonePadrao,
      });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
