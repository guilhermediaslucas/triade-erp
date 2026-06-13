import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

export function rotasCrm(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const crm = deps.crmService;

  // Painéis (leitura)
  r.get('/crm/resumo', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.resumo(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/crm/oportunidades', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.listarOportunidades(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/crm/timeline', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.timeline(sch(req), String(req.query.clienteId ?? ''))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/crm/recompra', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.recompra(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/crm/inativos', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.inativos(sch(req), Number(req.query.dias ?? 60))); } catch (e) { tratarErro(res, e); }
  });
  r.get('/crm/interacoes', aut, az('comercial.crm.ver'), async (req, res: Response) => {
    try { res.json(await crm.listarInteracoes(sch(req), String(req.query.clienteId ?? ''))); } catch (e) { tratarErro(res, e); }
  });

  // Gestão (escrita)
  r.post('/crm/oportunidades', aut, az('comercial.crm.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json(await crm.criarOportunidade(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/crm/oportunidades/:id/estagio', aut, az('comercial.crm.gerenciar'), async (req, res: Response) => {
    try { await crm.mudarEstagio(sch(req), req.params.id!, (req.body ?? {}).estagio); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/crm/oportunidades/:id/perder', aut, az('comercial.crm.gerenciar'), async (req, res: Response) => {
    try { await crm.marcarPerdido(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/crm/oportunidades/:id/orcamento', aut, az('comercial.crm.gerenciar'), async (req, res: Response) => {
    try { await crm.vincularPedido(sch(req), req.params.id!, String((req.body ?? {}).pedidoId ?? '')); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.post('/crm/interacoes', aut, az('comercial.crm.gerenciar'), async (req, res: Response) => {
    try { res.status(201).json(await crm.criarInteracao(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });

  return r;
}
