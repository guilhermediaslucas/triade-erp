import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';

export function rotasEstoque(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/estoque', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.posicao(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/entrada', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      await deps.estoqueService.entrada(sch(req), b);
      const prod = b.produtoId ? await deps.produtosRepo.buscarPorId(sch(req), b.produtoId).catch(() => null) : null;
      const qtd = Array.isArray(b.codigos) ? b.codigos.length : Number(b.quantidade ?? 0);
      auditar(req, { modulo: 'Estoque', entidade: 'Estoque', referencia: prod?.nome ?? null,
        descricao: `Entrada de estoque: ${prod?.nome ?? 'produto'} +${qtd} un${b.lote ? ` (lote ${b.lote})` : ''}` });
      res.status(201).json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/baixa', aut, az('estoque.baixa.criar'), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      await deps.estoqueService.baixaPerda(sch(req), b);
      const prod = b.produtoId ? await deps.produtosRepo.buscarPorId(sch(req), b.produtoId).catch(() => null) : null;
      auditar(req, { modulo: 'Estoque', entidade: 'Estoque', referencia: prod?.nome ?? null,
        descricao: `Baixa/perda de estoque: ${prod?.nome ?? 'produto'} −${Number(b.quantidade ?? 0)} un${b.motivo ? ` (${b.motivo})` : ''}` });
      res.status(201).json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/lotes/:loteId/etiquetas', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.etiquetasDoLote(sch(req), req.params.loteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/etiquetas/:codigo', aut, az('estoque.saldo.ver'), async (req, res: Response) => {
    try { res.json(await deps.estoqueService.consultarEtiqueta(sch(req), req.params.codigo!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/inventario', aut, az('estoque.inventario.ver'), async (req, res: Response) => {
    try { res.json(await deps.inventarioService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/inventario/:id/faltantes', aut, az('estoque.inventario.ver'), async (req, res: Response) => {
    try { res.json(await deps.inventarioService.faltantesDe(sch(req), req.params.id!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/inventario', aut, az('estoque.inventario.gerenciar'), async (req, res: Response) => {
    try {
      // Responsável é SEMPRE o usuário logado (ignora o que vier no corpo).
      const out: any = await deps.inventarioService.finalizar(sch(req), { ...(req.body ?? {}), responsavel: req.usuario!.nome });
      const enc = out?.encontradas ?? out?.resumo?.encontradas; const falt = out?.faltantes ?? out?.resumo?.faltantes;
      auditar(req, { modulo: 'Estoque', entidade: 'Inventario',
        descricao: `Finalizou um inventário${enc != null ? `: ${enc} encontradas` : ''}${falt != null ? `, ${falt} faltantes` : ''}${(req.body ?? {}).baixarPerda ? ' (faltantes baixados como perda)' : ''}` });
      res.status(201).json(out);
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/estoque/recebimentos', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try { res.json(await deps.comprasService.listarPendentes(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/estoque/recebimentos/:id/receber', aut, az('estoque.entrada.criar'), async (req, res: Response) => {
    try {
      const rec: any = await deps.recebimentoRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      await deps.comprasService.receber(sch(req), req.params.id!, req.body ?? {});
      const item = rec ? `${rec.produtoNome ?? 'produto'} ${rec.quantidade ?? ''} un` : 'compra';
      auditar(req, { modulo: 'Estoque', entidade: 'Recebimento', referencia: rec?.produtoNome ?? null,
        descricao: `Recebeu compra: ${item}${rec?.fornecedorNome ? ' — ' + rec.fornecedorNome : ''} (entrada no estoque)` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  return r;
}
