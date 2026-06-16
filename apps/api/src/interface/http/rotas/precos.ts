import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import { brl, dataBR } from '../fmt.js';

export function rotasPrecos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  r.get('/precos', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try {
      const s = sch(req); const pid = req.params.produtoId!;
      const antes = await deps.precoBaseRepo.precoDe(s, pid).catch(() => 0);
      const prod = await deps.produtosRepo.buscarPorId(s, pid).catch(() => null);
      const novo = Number((req.body ?? {}).preco);
      await deps.precosService.definir(s, pid, novo);
      auditar(req, { modulo: 'Preços', entidade: 'PrecoBase', referencia: prod?.nome ?? pid,
        descricao: `Alterou o preço base de ${prod?.nome ?? 'produto'}: ${brl(antes)} → ${brl(novo)}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/cliente/:clienteId', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarCliente(sch(req), req.params.clienteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/cliente/:clienteId/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try {
      const s = sch(req); const cid = req.params.clienteId!; const pid = req.params.produtoId!;
      await deps.precosService.definirCliente(s, cid, pid, req.body ?? {},
        { usuarioId: req.usuario!.sub, usuarioNome: req.usuario!.nome });
      const prod = await deps.produtosRepo.buscarPorId(s, pid).catch(() => null);
      const cli = await deps.clientesRepo.buscarPorId(s, cid).catch(() => null);
      const preco = Number((req.body ?? {}).preco);
      auditar(req, { modulo: 'Preços', entidade: 'PrecoCliente', referencia: prod?.nome ?? pid,
        descricao: preco > 0
          ? `Alterou o preço de ${prod?.nome ?? 'produto'} para ${cli?.nome ?? 'cliente'}: ${brl(preco)}`
          : `Removeu o preço negociado de ${prod?.nome ?? 'produto'} para ${cli?.nome ?? 'cliente'}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/cliente/:clienteId/historico', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarHistoricoCliente(sch(req), req.params.clienteId!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/precos/campanhas/:produtoId', aut, az('comercial.preco.listar'), async (req, res: Response) => {
    try { res.json(await deps.precosService.listarCampanhas(sch(req), req.params.produtoId!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/precos/campanhas/:produtoId', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try {
      const s = sch(req); const pid = req.params.produtoId!; const b = req.body ?? {};
      await deps.precosService.criarCampanha(s, pid, b);
      const prod = await deps.produtosRepo.buscarPorId(s, pid).catch(() => null);
      auditar(req, { modulo: 'Preços', entidade: 'CampanhaPreco', referencia: prod?.nome ?? pid,
        descricao: `Criou campanha de preço de ${prod?.nome ?? 'produto'}: ${brl(Number(b.preco))} (${dataBR(b.de)} – ${dataBR(b.ate)})` });
      res.status(201).json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.put('/precos/campanhas/item/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.atualizarCampanha(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete('/precos/campanhas/item/:id', aut, az('comercial.preco.gerenciar'), async (req, res: Response) => {
    try { await deps.precosService.removerCampanha(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
