import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar, criarTemCaps } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import { brl } from '../fmt.js';
const PE = (n: number) => 'PE-' + String(n).padStart(6, '0');

// A cap "gerenciar" continua sendo guarda-chuva (quem a tem pode tudo); as caps
// granulares (separar/expedir/cancelar) permitem liberar a ação isolada num perfil.
const GERENCIAR = 'comercial.pedido.gerenciar';

export function rotasPedidos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const tem = criarTemCaps(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/pedidos', aut, az('comercial.pedido.listar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  // Busca por número (PE-000142 ou 142) — precede '/pedidos/:id' por ser segmento distinto.
  r.get('/pedidos/numero/:numero', aut, az('comercial.pedido.listar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.obterPorNumero(sch(req), req.params.numero!)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/pedidos/:id', aut, az('comercial.pedido.listar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.obter(sch(req), req.params.id!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/pedidos', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try {
      const out = await deps.pedidosService.criar(sch(req), req.body ?? {}, { usuarioId: req.usuario!.sub, superAdmin: !!req.usuario!.superAdmin });
      const ped = await deps.pedidoRepo.buscarPorId(sch(req), out.id).catch(() => null);
      auditar(req, { modulo: 'Comercial', entidade: 'Pedido', referencia: PE(out.numero),
        descricao: `Criou o pedido ${PE(out.numero)}${ped?.clienteNome ? ' — ' + ped.clienteNome : ''} (${brl(ped?.total)})` });
      res.status(201).json(out);
    } catch (e) { tratarErro(res, e); }
  });
  r.put('/pedidos/:id', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.editar(sch(req), req.params.id!, req.body ?? {}, { usuarioId: req.usuario!.sub, superAdmin: !!req.usuario!.superAdmin })); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/pedidos/:id/status', aut, async (req, res: Response) => {
    const b = req.body ?? {};
    // Autorização por destino: cancelar e expedir/entregar têm cap própria (ou gerenciar).
    const querer = (b.status === 'cancelado' || b.status === 'orcamento') ? ['comercial.pedido.cancelar', GERENCIAR]
      : (b.status === 'expedido' || b.status === 'entregue') ? ['comercial.pedido.expedir', GERENCIAR]
      : [GERENCIAR];
    if (!(await tem(req, querer))) { res.status(403).json({ erro: 'auth.sem_permissao' }); return; }
    try {
      const antes = await deps.pedidoRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      await deps.pedidosService.mudarStatus(sch(req), req.params.id!, b.status, { formaEnvio: b.formaEnvio, formaEnvioDetalhe: b.formaEnvioDetalhe, entregueEm: b.entregueEm, recebidoPor: b.recebidoPor, motoboyId: b.motoboyId }, req.usuario?.nome ?? null);
      const ref = antes ? PE(antes.numero) : null;
      auditar(req, { modulo: 'Comercial', entidade: 'Pedido', referencia: ref,
        descricao: `Mudou o status do pedido ${ref ?? ''}: ${antes?.status ?? '?'} → ${b.status}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.post('/pedidos/:id/separar', aut, az(['comercial.pedido.separar', GERENCIAR]), async (req, res: Response) => {
    try { await deps.pedidosService.separarBipando(sch(req), req.params.id!, (req.body ?? {}).codigos, req.usuario?.nome ?? null); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/pedidos/:id/forma-entrega', aut, az(['comercial.pedido.expedir', GERENCIAR]), async (req, res: Response) => {
    try { await deps.pedidosService.alterarFormaEntrega(sch(req), req.params.id!, req.body ?? {}, req.usuario?.nome ?? null); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.get('/pedidos/:id/forma-entrega/historico', aut, az(['comercial.pedido.expedir', 'comercial.pedido.listar', GERENCIAR]), async (req, res: Response) => {
    try { res.json(await deps.pedidosService.historicoFormaEntrega(sch(req), req.params.id!)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/pedidos/:id/refazer-entrega', aut, az(['comercial.pedido.expedir', GERENCIAR]), async (req, res: Response) => {
    try { await deps.pedidosService.refazerEntrega(sch(req), req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
