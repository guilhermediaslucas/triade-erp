import 'reflect-metadata';
import { AppDataSource } from './infra/db/data-source.js';
import { prepararBanco } from './infra/db/prepararBanco.js';
import { criarServidor } from './interface/http/server.js';
import { env } from './infra/config/env.js';

async function bootstrap(): Promise<void> {
  // Inicializa a conexao com o banco (uma vez, no boot).
  await AppDataSource.initialize();
  console.log('[db] conexao inicializada');

  // Aplica migrations pendentes + sincroniza permissoes (idempotente).
  // Desligavel com AUTO_MIGRATE=false (ex.: se preferir migrar so via CLI).
  if (env.autoMigrate) {
    try {
      await prepararBanco(AppDataSource);
    } catch (e) {
      console.error('[db] falha ao preparar o banco no boot:', e);
    }
  }

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
