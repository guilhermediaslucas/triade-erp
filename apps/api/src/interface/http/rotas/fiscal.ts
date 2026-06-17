import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import type { ConfigFiscal } from '../../../domain/fiscal/ConfigFiscal.js';

// Versão "pública" da config: NÃO devolve os tokens, só sinaliza se estão configurados.
function publico(c: ConfigFiscal) {
  return {
    empresaCodigo: c.empresaCodigo,
    regimeTributario: c.regimeTributario,
    ambiente: c.ambiente,
    numeroEmitente: c.numeroEmitente,
    complementoEmitente: c.complementoEmitente,
    naturezaOperacao: c.naturezaOperacao,
    cfopDentroUf: c.cfopDentroUf,
    cfopForaUf: c.cfopForaUf,
    icmsOrigem: c.icmsOrigem,
    csosnPadrao: c.csosnPadrao,
    cstIcmsPadrao: c.cstIcmsPadrao,
    aliquotaIcms: c.aliquotaIcms,
    pisCstPadrao: c.pisCstPadrao,
    cofinsCstPadrao: c.cofinsCstPadrao,
    tokenHomologacaoConfigurado: c.tokenHomologacao.trim() !== '',
    tokenProducaoConfigurado: c.tokenProducao.trim() !== '',
  };
}

export function rotasFiscal(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);

  r.get('/fiscal/config', aut, az('acesso.empresa.editar'), async (req: Request, res: Response) => {
    try { res.json(publico(await deps.configFiscalService.obter(req.usuario!.empresa))); }
    catch (e) { tratarErro(res, e); }
  });

  r.put('/fiscal/config', aut, az('acesso.empresa.editar'), async (req: Request, res: Response) => {
    try {
      await deps.configFiscalService.salvar(req.usuario!.empresa, req.body ?? {});
      auditar(req, { modulo: 'Fiscal', entidade: 'ConfigFiscal', descricao: 'Alterou a configuração fiscal da empresa' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  // ===== NF-e por pedido =====
  const sch = (req: Request) => req.usuario!.schema;
  const emp = (req: Request) => req.usuario!.empresa;

  // Emitir a NF-e de um pedido (só Expedido/Entregue).
  r.post('/pedidos/:id/nota', aut, az('fiscal.nota.emitir'), async (req: Request, res: Response) => {
    try {
      const nota = await deps.notasFiscaisService.emitir(sch(req), emp(req), req.params.id!);
      auditar(req, { modulo: 'Fiscal', entidade: 'NotaFiscal', referencia: nota.ref, descricao: `Emitiu NF-e do pedido (ref ${nota.ref})` });
      res.status(201).json(nota);
    } catch (e) { tratarErro(res, e); }
  });

  // Estado atual da nota do pedido (consulta a Focus se ainda processando).
  r.get('/pedidos/:id/nota', aut, az('fiscal.nota.ver'), async (req: Request, res: Response) => {
    try { res.json(await deps.notasFiscaisService.statusAtual(sch(req), emp(req), req.params.id!)); }
    catch (e) { tratarErro(res, e); }
  });

  // Cancelar a NF-e (justificativa 15–255). Reusa a cap de emitir.
  r.post('/pedidos/:id/nota/cancelar', aut, az('fiscal.nota.emitir'), async (req: Request, res: Response) => {
    try {
      const nota = await deps.notasFiscaisService.cancelar(sch(req), emp(req), req.params.id!, (req.body ?? {}).justificativa);
      auditar(req, { modulo: 'Fiscal', entidade: 'NotaFiscal', referencia: nota.ref, descricao: `Cancelou a NF-e do pedido (ref ${nota.ref})` });
      res.json(nota);
    } catch (e) { tratarErro(res, e); }
  });

  async function baixar(req: Request, res: Response, tipo: 'danfe' | 'xml') {
    try {
      const arq = await deps.notasFiscaisService.baixar(sch(req), emp(req), req.params.id!, tipo);
      res.setHeader('content-type', arq.tipo);
      res.send(arq.conteudo);
    } catch (e) { tratarErro(res, e); }
  }
  r.get('/pedidos/:id/nota/danfe', aut, az('fiscal.nota.ver'), (req: Request, res: Response) => baixar(req, res, 'danfe'));
  r.get('/pedidos/:id/nota/xml', aut, az('fiscal.nota.ver'), (req: Request, res: Response) => baixar(req, res, 'xml'));

  return r;
}
