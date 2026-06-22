import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import { brl, dataBR } from '../fmt.js';

export function rotasFrete(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/frete/config', aut, az('cadastros.motoboy.listar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.obterConfig(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.put('/frete/config', aut, az('cadastros.motoboy.gerenciar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.salvarConfig(sch(req), req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  // Cálculo usado pelo Novo pedido (qualquer um que possa criar pedido).
  r.post('/frete/calcular', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.json(await deps.freteService.calcular(sch(req), req.usuario!.empresa, req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });

  // Campanhas de frete por cliente (grátis / fixo / desconto %), com período.
  r.get('/frete/campanhas', aut, az('logistica.frete.ver'), async (req, res: Response) => {
    try { res.json(await deps.freteCampanhasService.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post('/frete/campanhas', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try {
      const s = sch(req); const b = req.body ?? {};
      await deps.freteCampanhasService.criar(s, b);
      const cli = b.clienteId ? await deps.clientesRepo.buscarPorId(s, b.clienteId).catch(() => null) : null;
      const tipoTxt = b.tipo === 'gratis' ? 'frete grátis' : b.tipo === 'percentual' ? `desconto de ${Number(b.valor)}%` : b.tipo === 'gratis_acima' ? `frete grátis acima de ${brl(Number(b.valor))}` : `frete fixo ${brl(Number(b.valor))}`;
      const alvo = cli?.nome ?? 'todos os clientes';
      auditar(req, { modulo: 'Logística', entidade: 'CampanhaFrete', referencia: cli?.nome ?? 'geral',
        descricao: `Criou campanha de ${tipoTxt} para ${alvo} (${dataBR(b.de)} – ${dataBR(b.ate)})` });
      res.status(201).json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.put('/frete/campanhas/:id', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try {
      const s = sch(req); const b = req.body ?? {};
      await deps.freteCampanhasService.editar(s, req.params.id!, b);
      const cli = b.clienteId ? await deps.clientesRepo.buscarPorId(s, b.clienteId).catch(() => null) : null;
      auditar(req, { modulo: 'Logística', entidade: 'CampanhaFrete', referencia: cli?.nome ?? 'geral',
        descricao: `Editou campanha de frete de ${cli?.nome ?? 'todos os clientes'} (${dataBR(b.de)} – ${dataBR(b.ate)})` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.delete('/frete/campanhas/:id', aut, az('logistica.frete.gerenciar'), async (req, res: Response) => {
    try {
      await deps.freteCampanhasService.remover(sch(req), req.params.id!);
      auditar(req, { modulo: 'Logística', entidade: 'CampanhaFrete', referencia: req.params.id!, descricao: 'Removeu uma campanha de frete' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  // Frete cobrado do cliente (campanha vigente aplicada ao custo) — p/ o Novo pedido exibir o total certo.
  r.get('/frete/cobrado', aut, az('comercial.pedido.criar'), async (req, res: Response) => {
    try { res.json({ cobrado: await deps.freteCampanhasService.cobrado(sch(req), String(req.query.clienteId ?? ''), Number(req.query.custo ?? 0), Number(req.query.subtotal ?? 0)) }); } catch (e) { tratarErro(res, e); }
  });
  return r;
}
