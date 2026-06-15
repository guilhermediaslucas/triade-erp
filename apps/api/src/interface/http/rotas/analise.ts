import { Router, type Request, type Response } from 'express';
import type { Dependencias } from '../../composition.js';
import { criarAutenticar } from '../middlewares/autenticar.js';
import { criarAutorizar } from '../middlewares/autorizar.js';
import { tratarErro } from '../responder.js';

// Análise de vendas (Comercial): ranking por dimensão (produtos, categorias, clientes).
// Reusa os relatórios existentes, mas com cap própria (comercial.analise.ver).
export function rotasAnalise(deps: Dependencias): Router {
  const r = Router();
  const aut = criarAutenticar(deps.tokens);
  const az = criarAutorizar(deps.usuariosRepo);
  const sch = (req: Request) => req.usuario!.schema;

  r.get('/comercial/analise', aut, az('comercial.analise.ver'), async (req, res: Response) => {
    try {
      const dim = String(req.query.dim ?? 'produtos');
      const de = req.query.de, ate = req.query.ate;
      let linhas: { nome: string; quantidade: number; total: number }[];
      if (dim === 'categorias') {
        linhas = (await deps.relatoriosService.vendasPorCategoria(sch(req), de, ate)).map((l) => ({ nome: l.categoria, quantidade: l.quantidade, total: l.total }));
      } else if (dim === 'clientes') {
        linhas = (await deps.relatoriosService.curvaAbc(sch(req), de, ate, 'clientes')).linhas.map((l) => ({ nome: l.nome, quantidade: l.quantidade, total: l.total }));
      } else {
        linhas = await deps.relatoriosService.produtosVendidos(sch(req), de, ate);
      }
      res.json({ dim, linhas });
    } catch (e) { tratarErro(res, e); }
  });
  return r;
}
