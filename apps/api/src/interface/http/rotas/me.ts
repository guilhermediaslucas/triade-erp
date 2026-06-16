import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { tratarErro } from '../responder.js';

export function rotasMe(deps: Dependencias): Router {
  const r = Router();
  const autenticar = criarAutenticar(deps.tokens);

  r.get('/me', autenticar, async (req: Request, res: Response) => {
    try {
      const u = req.usuario!;
      const capabilities = u.superAdmin ? [] : await deps.usuariosRepo.capabilities(u.schema, u.sub);
      // foto + vendedor vinculado vêm do cadastro do usuário no tenant (super-admin → null).
      let foto: string | null = null;
      let vendedorId: string | null = null;
      let vendedorNome: string | null = null;
      if (!u.superAdmin) {
        const usr = await deps.usuariosRepo.buscarPorId(u.schema, u.sub);
        foto = usr?.foto ?? null;
        vendedorId = usr?.vendedorId ?? null;
        if (vendedorId) { const v = await deps.vendedoresRepo.buscarPorId(u.schema, vendedorId); vendedorNome = v?.nome ?? null; }
      }
      // Empresas que este login acessa (multi-tenant) — para o seletor de empresa.
      // Super-admin usa a lista completa via /empresas, então aqui vai vazio p/ ele.
      const empresas = u.superAdmin ? [] : await deps.autenticarUsuario.empresasDoUsuario(u.email).catch(() => []);
      res.json({ id: u.sub, nome: u.nome, email: u.email, empresa: u.empresa, capabilities, superAdmin: u.superAdmin === true, foto, vendedorId, vendedorNome, empresas });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
