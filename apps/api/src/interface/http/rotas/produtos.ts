import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasProdutos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/produtos', aut, az('cadastros.produto.listar'), async (req, res: Response) => {
    try { res.json(await deps.produtosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/produtos', aut, az('cadastros.produto.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.produtosService.criar(sch(req), req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/produtos/:id', aut, az('cadastros.produto.gerenciar'), async (req, res: Response) => {
    try { await deps.produtosService.editar(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/produtos/:id/ativo', aut, az('cadastros.produto.gerenciar'), async (req, res: Response) => {
    try { await deps.produtosService.alternarAtivo(sch(req), req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  // Importação em lote de produtos (CSV/XLSX parseado no front).
  r.post('/produtos/importar', aut, az('cadastros.produto.gerenciar'), async (req, res: Response) => {
    try { res.json(await deps.produtosService.importar(sch(req), (req.body ?? {}).linhas ?? [])); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
