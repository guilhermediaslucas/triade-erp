import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import type { TipoTitulo } from '../../../domain/financeiro/Titulo.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

function registrar(r: Router, deps: Dependencias, tipo: TipoTitulo, capBase: string): void {
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const base = `/financeiro/${tipo}`;
  r.get(base, aut, az(`${capBase}.listar`), async (req, res: Response) => {
    try { res.json(await deps.financeiroService.listar(sch(req), tipo)); } catch (e) { tratarErro(res, e); }
  });
  r.post(base, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { res.status(201).json({ id: await deps.financeiroService.criar(sch(req), tipo, req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/baixar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { await deps.financeiroService.baixar(sch(req), req.params.id!, (req.body ?? {}).formaPagamento ?? null, (req.body ?? {}).contaCorrenteId ?? null); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/cancelar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { await deps.financeiroService.cancelarBaixa(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete(`${base}/:id`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { await deps.financeiroService.excluir(sch(req), req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.post(`${base}/:id/parcelar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try { res.status(201).json({ criados: await deps.financeiroService.parcelar(sch(req), req.params.id!, req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
}

export function rotasFinanceiro(deps: Dependencias): Router {
  const r = Router();
  const autF = criarAutenticar(deps.tokens);
  const azF = criarAutorizar(deps.usuariosRepo);
  r.get('/financeiro/fluxo', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.fluxo(req.usuario!.schema)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/aging-receber', autF, azF('financeiro.receber.listar'), async (req, res) => {
    try { res.json(await deps.financeiroService.aging(req.usuario!.schema, 'receber')); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/dre', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.dre(req.usuario!.schema, req.query.de, req.query.ate, req.query.por)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/financeiro/nota', autF, azF('financeiro.compra.criar'), async (req, res) => {
    try { res.status(201).json(await deps.comprasService.lancarNota(req.usuario!.schema, req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/conciliacao', autF, azF('financeiro.conciliacao.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.conciliacao(req.usuario!.schema, req.query.contaId, req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/financeiro/conciliacao/:id', autF, azF('financeiro.conciliacao.gerenciar'), async (req, res) => {
    try { await deps.financeiroService.marcarConciliado(req.usuario!.schema, req.params.id!, !!(req.body ?? {}).conciliado); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/comissoes', autF, azF('financeiro.comissao.ver'), async (req, res) => {
    try { res.json(await deps.comissoesService.apurar(req.usuario!.schema, req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/financeiro/comissoes/fechar', autF, azF('financeiro.comissao.gerenciar'), async (req, res) => {
    try { res.status(201).json(await deps.comissoesService.fechar(req.usuario!.schema, req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  registrar(r, deps, 'receber', 'financeiro.receber');
  registrar(r, deps, 'pagar', 'financeiro.pagar');
  return r;
}
