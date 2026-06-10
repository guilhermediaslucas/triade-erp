import express, { type Express, type Request, type Response } from 'express';
import { AppDataSource } from '../../infra/db/data-source.js';
import { montarDependencias } from '../composition.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasMe } from './rotas/me.js';
import { rotasCapabilities } from './rotas/capabilities.js';
import { rotasPerfis } from './rotas/perfis.js';
import { rotasUsuarios } from './rotas/usuarios.js';
import { rotasEmpresa } from './rotas/empresa.js';

export function criarServidor(): Express {
  const app = express();
  // Limite maior para acomodar logo em data URI.
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

  return app;
}
