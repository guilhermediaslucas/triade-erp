import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { AppDataSource } from '../../infra/db/data-source.js';
import { env } from '../../infra/config/env.js';
import { montarDependencias } from '../composition.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasMe } from './rotas/me.js';
import { rotasCapabilities } from './rotas/capabilities.js';
import { rotasPerfis } from './rotas/perfis.js';
import { rotasUsuarios } from './rotas/usuarios.js';
import { rotasEmpresa } from './rotas/empresa.js';
import { rotasEmpresas } from './rotas/empresas.js';
import { rotasCategorias } from './rotas/categorias.js';
import { rotasMarcas } from './rotas/marcas.js';
import { rotasProdutos } from './rotas/produtos.js';
import { rotasPessoas } from './rotas/pessoas.js';
import { rotasMotoboys } from './rotas/motoboys.js';
import { rotasPrecos } from './rotas/precos.js';
import { rotasFrete } from './rotas/frete.js';
import { rotasLogistica } from './rotas/logistica.js';
import { rotasPedidos } from './rotas/pedidos.js';
import { rotasEstoque } from './rotas/estoque.js';
import { rotasFinanceiro } from './rotas/financeiro.js';
import { rotasCategoriasFinanceiras } from './rotas/categoriasFinanceiras.js';
import { rotasDashboard } from './rotas/dashboard.js';
import { rotasRelatorios } from './rotas/relatorios.js';
import { rotasCondicoes } from './rotas/condicoes.js';
import { rotasContas } from './rotas/contas.js';

export function criarServidor(): Express {
  const app = express();

  // CORS: permite o site (frontend) chamar a API. A origem vem de CORS_ORIGIN
  // (padrao '*'). Responde o preflight (OPTIONS) direto.
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', env.corsOrigin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
  });

  app.use(express.json({ limit: '3mb' }));

  const deps = montarDependencias();

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await AppDataSource.query('SELECT 1');
      res.json({ status: 'ok', db: 'conectado' });
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : String(e);
      res.status(503).json({ status: 'erro', db: 'sem conexao', detalhe });
    }
  });

  app.use(rotasAuth(deps));
  app.use(rotasMe(deps));
  app.use(rotasCapabilities(deps.tokens));
  app.use(rotasPerfis(deps));
  app.use(rotasUsuarios(deps));
  app.use(rotasEmpresa(deps));
  app.use(rotasEmpresas(deps));
  app.use(rotasCategorias(deps));
  app.use(rotasMarcas(deps));
  app.use(rotasProdutos(deps));
  app.use(rotasPessoas(deps));
  app.use(rotasMotoboys(deps));
  app.use(rotasPrecos(deps));
  app.use(rotasFrete(deps));
  app.use(rotasLogistica(deps));
  app.use(rotasPedidos(deps));
  app.use(rotasEstoque(deps));
  app.use(rotasFinanceiro(deps));
  app.use(rotasCategoriasFinanceiras(deps));
  app.use(rotasDashboard(deps));
  app.use(rotasRelatorios(deps));
  app.use(rotasCondicoes(deps));
  app.use(rotasContas(deps));

  return app;
}
