import { Router, type Request, type Response } from 'express';
import type { Readable } from 'node:stream';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarTemCaps } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';
import { auditar } from '../audit.js';

const CAPS_VER = ['financeiro.receber.listar', 'financeiro.pagar.listar'];
const CAPS_GER = ['financeiro.receber.gerenciar', 'financeiro.pagar.gerenciar'];

// Anexos de documentos nos títulos (NF, conta de energia, etc.) — arquivos no R2.
export function rotasAnexos(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const tem = criarTemCaps(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;
  const negar = (res: Response) => res.status(403).json({ erro: 'auth.sem_permissao' });

  // Indica se o recurso está habilitado (R2 configurado) — para o front mostrar ou não.
  r.get('/anexos/habilitado', aut, (_req, res: Response) => {
    res.json({ habilitado: deps.anexosService.habilitado() });
  });

  r.get('/financeiro/titulos/:tituloId/anexos', aut, async (req, res: Response) => {
    if (!(await tem(req, CAPS_VER))) return negar(res);
    try { res.json(await deps.anexosService.listar(sch(req), req.params.tituloId!)); } catch (e) { tratarErro(res, e); }
  });

  r.post('/financeiro/titulos/:tituloId/anexos', aut, async (req, res: Response) => {
    if (!(await tem(req, CAPS_GER))) return negar(res);
    try {
      const a = await deps.anexosService.anexar(sch(req), req.params.tituloId!, req.body ?? {}, req.usuario?.nome ?? null);
      auditar(req, { modulo: 'Financeiro', entidade: 'Anexo', referencia: a.nomeArquivo, descricao: `Anexou o documento "${a.nomeArquivo}" a um título` });
      res.status(201).json(a);
    } catch (e) { tratarErro(res, e); }
  });

  r.get('/financeiro/anexos/:id/conteudo', aut, async (req, res: Response) => {
    if (!(await tem(req, CAPS_VER))) return negar(res);
    try {
      const out = await deps.anexosService.baixar(sch(req), req.params.id!);
      res.setHeader('Content-Type', out.contentType);
      res.setHeader('Content-Disposition', `inline; filename="${out.nomeArquivo}"`);
      const body = out.body as Readable;
      body.on('error', () => { if (!res.headersSent) res.status(500).end(); });
      body.pipe(res);
    } catch (e) { tratarErro(res, e); }
  });

  r.delete('/financeiro/anexos/:id', aut, async (req, res: Response) => {
    if (!(await tem(req, CAPS_GER))) return negar(res);
    try {
      await deps.anexosService.remover(sch(req), req.params.id!);
      auditar(req, { modulo: 'Financeiro', entidade: 'Anexo', descricao: 'Removeu um documento anexado a um título' });
      res.json({ ok: true });
    } catch (e) { tratarErro(res, e); }
  });

  return r;
}
