import express, { type Express, type Request, type Response } from 'express';
import { AppDataSource } from '../../infra/db/data-source.js';
import { montarDependencias } from '../composition.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasMe } from './rotas/me.js';
import { rotasCapabilities } from './rotas/capabilities.js';
import { rotasPerfis } from './rotas/perfis.js';
import { rotasUsuarios } from './rotas/usuarios.js';
import { rotasEmpresa } from './rotas/empresa.js';
import { rotasEmpresas } from './rotas/empresas.js';
import { rotasCategorias } from './rotas/categorias.js';
import { rotasProdutos } from './rotas/produtos.js';
import { rotasPessoas } from './rotas/pessoas.js';
import { rotasPrecos } from './rotas/precos.js';
import { rotasPedidos } from './rotas/pedidos.js';
import { rotasEstoque } from './rotas/estoque.js';

export function criarServidor(): Express {
  const app = express();
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
  app.use(rotasProdutos(deps));
  app.use(rotasPessoas(deps));
  app.use(rotasPrecos(deps));
  app.use(rotasPedidos(deps));
  app.use(rotasEstoque(deps));

  return app;
}
