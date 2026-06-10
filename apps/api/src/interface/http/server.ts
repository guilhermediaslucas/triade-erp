import express, { type Express, type Request, type Response } from 'express';
import { AppDataSource } from '../../infra/db/data-source.js';

export function criarServidor(): Express {
  const app = express();
  app.use(express.json());

  // Healthcheck: confirma que a API esta de pe e que o banco responde.
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await AppDataSource.query('SELECT 1');
      res.json({ status: 'ok', db: 'conectado' });
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : String(e);
      res.status(503).json({ status: 'erro', db: 'sem conexao', detalhe });
    }
  });

  return app;
}
