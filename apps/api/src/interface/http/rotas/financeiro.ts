import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import type { TipoTitulo } from '../../../domain/financeiro/Titulo.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import { brl } from '../fmt.js';

function registrar(r: Router, deps: Dependencias, tipo: TipoTitulo, capBase: string): void {
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const base = `/financeiro/${tipo}`;
  // A listagem alimenta a tela operacional (Contas) E o relatório contábil — por
  // isso aceita tanto a cap de listar quanto a cap do relatório contábil (any-of).
  const capContabil = `relatorios.contabil.${tipo}.ver`;
  r.get(base, aut, az([`${capBase}.listar`, capContabil]), async (req, res: Response) => {
    try { res.json(await deps.financeiroService.listar(sch(req), tipo)); } catch (e) { tratarErro(res, e); }
  });
  const rotuloTipo = tipo === 'receber' ? 'a receber' : 'a pagar';
  r.post(base, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      const id = await deps.financeiroService.criar(sch(req), tipo, b);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo',
        descricao: `Criou título ${rotuloTipo}: ${b.descricao ?? '—'} (${brl(Number(b.valor))})` });
      res.status(201).json({ id });
    } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/baixar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      const r2 = await deps.financeiroService.baixar(sch(req), req.params.id!, b.formaPagamento ?? null, b.contaCorrenteId ?? null, b.dataBaixa ?? null, { desconto: b.desconto, multa: b.multa, juros: b.juros });
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Baixou o título ${t?.numero ?? ''} (${brl(t?.valor)})${t?.pessoaNome ? ' — ' + t.pessoaNome : ''}${b.formaPagamento ? ', forma ' + b.formaPagamento : ''}` });
      res.json({ ok: true, ...r2 });
    } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/cancelar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      await deps.financeiroService.cancelarBaixa(sch(req), req.params.id!);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Cancelou a baixa do título ${t?.numero ?? ''} (${brl(t?.valor)})${t?.pessoaNome ? ' — ' + t.pessoaNome : ''}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/previsto`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const prev = !!(req.body ?? {}).previsto;
      await deps.financeiroService.definirPrevisto(sch(req), req.params.id!, prev);
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `${prev ? 'Marcou' : 'Desmarcou'} o título ${t?.numero ?? ''} como previsto` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.patch(`${base}/:id/reembolso`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      await deps.financeiroService.definirReembolso(sch(req), req.params.id!, req.body ?? {});
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Ajustou o reembolso a terceiro do título ${t?.numero ?? ''} (${brl(t?.valor)})` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.delete(`${base}/:id`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      await deps.financeiroService.excluir(sch(req), req.params.id!);
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Excluiu o título ${t?.numero ?? ''} (${brl(t?.valor)})${t?.pessoaNome ? ' — ' + t.pessoaNome : ''}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.post(`${base}/:id/parcelar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      const criados = await deps.financeiroService.parcelar(sch(req), req.params.id!, req.body ?? {});
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Parcelou o título ${t?.numero ?? ''} (${brl(t?.valor)}) em ${(req.body ?? {}).parcelas ?? '?'}x` });
      res.status(201).json({ criados });
    } catch (e) { tratarErro(res, e); }
  });
  r.post(`${base}/:id/multiplicar`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const t = await deps.tituloRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
      const criados = await deps.financeiroService.multiplicar(sch(req), req.params.id!, req.body ?? {});
      auditar(req, { modulo: 'Financeiro', entidade: 'Titulo', referencia: t?.numero ?? null,
        descricao: `Replicou o título ${t?.numero ?? ''} (${brl(t?.valor)}) em ${(req.body ?? {}).parcelas ?? '?'} cópias` });
      res.status(201).json({ criados });
    } catch (e) { tratarErro(res, e); }
  });
}

export function rotasFinanceiro(deps: Dependencias): Router {
  const r = Router();
  const autF = criarAutenticar(deps.tokens);
  const azF = criarAutorizar(deps.usuariosRepo);
  r.get('/financeiro/fluxo', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.fluxoCompleto(req.usuario!.schema, req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/aging-receber', autF, azF('financeiro.receber.listar'), async (req, res) => {
    try { res.json(await deps.financeiroService.aging(req.usuario!.schema, 'receber')); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/fluxo-projetado', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.fluxoProjetado(req.usuario!.schema)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/dre', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.dre(req.usuario!.schema, req.query.de, req.query.ate, req.query.por)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/dre/detalhe', autF, azF('financeiro.fluxo.ver'), async (req, res) => {
    try { res.json(await deps.financeiroService.dreDetalhe(req.usuario!.schema, req.query.de, req.query.ate, req.query.por, req.query.tipo, req.query.chave)); } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/conferencia-cartao', autF, azF('financeiro.receber.listar'), async (req, res) => {
    try { res.json(await deps.financeiroService.conferenciaCartao(req.usuario!.schema, req.query.dia)); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/financeiro/conferencia-cartao/:id', autF, azF('financeiro.receber.gerenciar'), async (req, res) => {
    try {
      const conf = (req.body ?? {}).conferido;
      await deps.financeiroService.marcarConferido(req.usuario!.schema, req.params.id!, conf);
      auditar(req, { modulo: 'Financeiro', entidade: 'Conferencia', descricao: `${conf ? 'Conferiu' : 'Desfez a conferência de'} um recebimento de cartão/dinheiro` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.post('/financeiro/nota', autF, azF('financeiro.compra.criar'), async (req, res) => {
    try {
      const b = req.body ?? {};
      const out = await deps.comprasService.lancarNota(req.usuario!.schema, b);
      const total = Array.isArray(b.itens) ? b.itens.reduce((a: number, it: any) => a + (Number(it.total) || 0), 0) : (Number(b.total) || 0);
      const partes = [b.fornecedorNome, b.nf ? 'NF ' + b.nf : null, total ? brl(total) : null].filter(Boolean).join(', ');
      auditar(req, { modulo: 'Financeiro', entidade: 'NotaEntrada', referencia: b.nf ?? b.fornecedorNome ?? null,
        descricao: `Lançou nota de entrada (compra)${partes ? ' — ' + partes : ''}` });
      res.status(201).json(out);
    } catch (e) { tratarErro(res, e); }
  });
  r.get('/financeiro/notas', autF, azF('financeiro.compra.criar'), async (req, res) => {
    try { res.json(await deps.comprasService.listarNotas(req.usuario!.schema, req.query.de, req.query.ate)); } catch (e) { tratarErro(res, e); }
  });
  r.put('/financeiro/nota/:id', autF, azF('financeiro.compra.criar'), async (req, res) => {
    try { await deps.comprasService.editarNota(req.usuario!.schema, req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.delete('/financeiro/nota/:id', autF, azF('financeiro.compra.criar'), async (req, res) => {
    try { await deps.comprasService.excluirNota(req.usuario!.schema, req.params.id!); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
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
  r.get('/financeiro/comissoes/regras', autF, azF('financeiro.comissao.ver'), async (req, res) => {
    try { res.json(await deps.comissoesService.listarRegras(req.usuario!.schema)); } catch (e) { tratarErro(res, e); }
  });
  r.post('/financeiro/comissoes/regras', autF, azF('financeiro.comissao.gerenciar'), async (req, res) => {
    try { res.status(201).json({ id: await deps.comissoesService.criarRegra(req.usuario!.schema, req.body ?? {}) }); } catch (e) { tratarErro(res, e); }
  });
  r.put('/financeiro/comissoes/regras/:id', autF, azF('financeiro.comissao.gerenciar'), async (req, res) => {
    try { await deps.comissoesService.editarRegra(req.usuario!.schema, req.params.id!, req.body ?? {}); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.patch('/financeiro/comissoes/regras/:id/ativo', autF, azF('financeiro.comissao.gerenciar'), async (req, res) => {
    try { await deps.comissoesService.alternarAtivoRegra(req.usuario!.schema, req.params.id!, !!(req.body ?? {}).ativo); res.json({ ok: true }); } catch (e) { tratarErro(res, e); }
  });
  r.post('/financeiro/comissoes/fechar', autF, azF('financeiro.comissao.gerenciar'), async (req, res) => {
    try { res.status(201).json(await deps.comissoesService.fechar(req.usuario!.schema, req.body ?? {})); } catch (e) { tratarErro(res, e); }
  });
  registrar(r, deps, 'receber', 'financeiro.receber');
  registrar(r, deps, 'pagar', 'financeiro.pagar');
  return r;
}
