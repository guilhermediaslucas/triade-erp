import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';
import { brl } from '../fmt.js';

interface CrudService {
  listar(schema: string): Promise<unknown>;
  criar(schema: string, body: any): Promise<string>;
  editar(schema: string, id: string, body: any): Promise<void>;
  alternarAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}

function registrarCrud(r: Router, deps: Dependencias, caminho: string, capBase: string, servico: CrudService, rotulo: string): void {
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const ehCliente = caminho === 'clientes';
  r.get(`/${caminho}`, aut, az(`${capBase}.listar`), async (req, res: Response) => {
    try { res.json(await servico.listar(sch(req))); } catch (e) { tratarErro(res, e); }
  });
  r.post(`/${caminho}`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      const id = await servico.criar(sch(req), b);
      auditar(req, { modulo: 'Cadastros', entidade: rotulo, referencia: b.nome ?? null, descricao: `Criou ${rotulo}: ${b.nome ?? '—'}` });
      res.status(201).json({ id });
    } catch (e) { tratarErro(res, e); }
  });
  r.put(`/${caminho}/:id`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const b = req.body ?? {};
      let extra = '';
      if (ehCliente) {
        const antes = await deps.clientesRepo.buscarPorId(sch(req), req.params.id!).catch(() => null);
        const limNovo = Number(b.limiteCredito ?? b.limite_credito ?? NaN);
        if (antes && Number.isFinite(limNovo) && limNovo !== Number(antes.limiteCredito ?? 0)) {
          extra = ` · limite de crédito: ${brl(antes.limiteCredito)} → ${brl(limNovo)}`;
        }
      }
      await servico.editar(sch(req), req.params.id!, b);
      auditar(req, { modulo: 'Cadastros', entidade: rotulo, referencia: b.nome ?? null, descricao: `Editou ${rotulo}: ${b.nome ?? req.params.id}${extra}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
  r.patch(`/${caminho}/:id/ativo`, aut, az(`${capBase}.gerenciar`), async (req, res: Response) => {
    try {
      const ativo = !!(req.body ?? {}).ativo;
      await servico.alternarAtivo(sch(req), req.params.id!, ativo);
      auditar(req, { modulo: 'Cadastros', entidade: rotulo, descricao: `${ativo ? 'Ativou' : 'Inativou'} ${rotulo}` });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });
}

export function rotasPessoas(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  registrarCrud(r, deps, 'clientes', 'cadastros.cliente', deps.clientesService, 'cliente');
  registrarCrud(r, deps, 'fornecedores', 'cadastros.fornecedor', deps.fornecedoresService, 'fornecedor');
  registrarCrud(r, deps, 'vendedores', 'cadastros.vendedor', deps.vendedoresService, 'vendedor');

  // Importação em lote de clientes (CSV/XLSX parseado no front).
  r.post('/clientes/importar', aut, az('cadastros.cliente.gerenciar'), async (req, res: Response) => {
    try {
      const resultado = await deps.clientesService.importar(sch(req), (req.body ?? {}).linhas ?? []);
      auditar(req, { modulo: 'Cadastros', entidade: 'cliente', descricao: `Importou clientes: ${resultado.criados} criados, ${resultado.ignorados} ignorados` });
      res.json(resultado);
    } catch (e) { tratarErro(res, e); }
  });
  return r;
}
