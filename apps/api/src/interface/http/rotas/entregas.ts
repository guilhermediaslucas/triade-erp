import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasEntregas(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  // Entregas atribuídas ao motoboy logado.
  r.get('/entregas/minhas', aut, az('logistica.entrega.atualizar'), async (req, res: Response) => {
    try { res.json(await deps.rastreioService.minhasEntregas(sch(req), req.usuario!.sub)); } catch (e) { tratarErro(res, e); }
  });
  // Avança o status da entrega (aguardando → a_caminho → chegou → entregue).
  r.patch('/entregas/:id/status', aut, az('logistica.entrega.atualizar'), async (req, res: Response) => {
    try { const b = req.body ?? {}; await deps.rastreioService.mudarStatus(sch(req), req.usuario!.sub, req.params.id!, b.status, b.recebidoPor); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  // Envia a posição GPS do motoboy (alta frequência enquanto em rota).
  r.post('/entregas/:id/posicao', aut, az('logistica.entrega.atualizar'), async (req, res: Response) => {
    try { const b = req.body ?? {}; await deps.rastreioService.registrarPosicao(sch(req), req.usuario!.sub, req.params.id!, b.lat, b.lng); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  // Painel da empresa: entregas em rota.
  r.get('/entregas/ativas', aut, az('logistica.entrega.ver'), async (req, res: Response) => {
    try { res.json(await deps.rastreioService.ativas(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  // PÚBLICO (sem login): link de acompanhamento do cliente. O token é "<codigo>.<aleatório>",
  // então o código da empresa (tenant) sai do próprio token.
  r.get('/rastreio/:token', async (req: Request, res: Response) => {
    try {
      const token = String(req.params.token ?? '');
      const codigo = token.split('.')[0] ?? '';
      const emp = await deps.empresasRepo.buscarPorCodigo(codigo);
      if (!emp || !emp.ativo) { res.status(404).json({ erro: 'rastreio.nao_encontrado' }); return; }
      const dados = await deps.rastreioService.publico(emp.schemaName, token);
      if (!dados) { res.status(404).json({ erro: 'rastreio.nao_encontrado' }); return; }
      res.json(dados);
    } catch (e) { tratarErro(res, e); }
  });
  return r;
}
