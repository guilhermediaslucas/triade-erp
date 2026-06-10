import 'reflect-metadata';
import { AppDataSource } from './infra/db/data-source.js';
import { criarServidor } from './interface/http/server.js';
import { env } from './infra/config/env.js';

async function bootstrap(): Promise<void> {
  // Inicializa a conexao com o banco (uma vez, no boot).
  await AppDataSource.initialize();
  console.log('[db] conexao inicializada');

  const app = criarServidor();
  app.listen(env.apiPort, () => {
    console.log(`[api] TRIADE ERP ouvindo em http://localhost:${env.apiPort}`);
    console.log(`[api] healthcheck: http://localhost:${env.apiPort}/health`);
  });
}

bootstrap().catch((e) => {
  console.error('[api] falha no boot:', e);
  process.exit(1);
});
