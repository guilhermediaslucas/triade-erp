import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';

function brandingDe(e: any) {
  return {
    codigo: e.codigo, nome: e.nome, fantasia: e.fantasia,
    logo: e.logo, corPrimaria: e.corPrimaria, corSecundaria: e.corSecundaria,
    corMenuFundo: e.corMenuFundo, corMenuFonte: e.corMenuFonte, logoAltura: e.logoAltura,
    idiomaPadrao: e.idiomaPadrao, timezonePadrao: e.timezonePadrao,
    cnpj: e.cnpj, inscricaoEstadual: e.inscricaoEstadual, telefone: e.telefone, email: e.email,
    logradouro: e.logradouro, bairro: e.bairro, cep: e.cep, uf: e.uf, cidade: e.cidade,
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
        nome: b.nome, fantasia: b.fantasia, logo: b.logo ?? null,
        corPrimaria: b.corPrimaria, corSecundaria: b.corSecundaria,
        corMenuFundo: b.corMenuFundo, corMenuFonte: b.corMenuFonte, logoAltura: b.logoAltura,
        idiomaPadrao: b.idiomaPadrao, timezonePadrao: b.timezonePadrao,
        cnpj: b.cnpj, inscricaoEstadual: b.inscricaoEstadual, telefone: b.telefone, email: b.email,
        logradouro: b.logradouro, bairro: b.bairro, cep: b.cep, uf: b.uf, cidade: b.cidade,
      });
      auditar(req, { modulo: 'Empresa', entidade: 'Empresa', descricao: 'Alterou os dados da empresa (identidade/branding)' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
