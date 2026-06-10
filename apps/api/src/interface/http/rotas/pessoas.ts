import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

interface CrudService {
  listar(schema: string): Promise<unknown>;
  criar(schema: string, body: any): Promise<string>;
  editar(schema: string, id: string, body: any): Promise<void>;
  alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}

function registrarCrud(r: Router, deps: Dependencias, caminho: string, capBase: string, servico: CrudService): void {
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get(`/${caminho}`, aut, az(`${capBase}.listar`), async (req, res: Response) => {
    try { res.json(await servico.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post(`/${caminho}`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { res.status(201).json({ id: await servico.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put(`/${caminho}/:id`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { await servico.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch(`/${caminho}/:id/ativo`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { await servico.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
}

export function rotasPessoas(deps: Dependencias): Router {
  const r = Router();
  registrarCrud(r, deps, 'clientes', 'cadastros.cliente', deps.clientesService);
  registrarCrud(r, deps, 'fornecedores', 'cadastros.fornecedor', deps.fornecedoresService);
  registrarCrud(r, deps, 'vendedores', 'cadastros.vendedor', deps.vendedoresService);
  return r;
}
