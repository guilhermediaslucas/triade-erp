import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Procura o .env subindo a partir deste arquivo ate a raiz do monorepo.
function acharEnv(): string | undefined {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const candidato = join(dir, '.env');
    if (existsSync(candidato)) return candidato;
    const pai = dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  return undefined;
}

dotenv.config({ path: acharEnv() });

function obrigatorio(nome: string): string {
  const valor = process.env[nome];
  if (!valor || valor.trim() === '') {
    throw new Error(`Variavel de ambiente ausente: ${nome}`);
  }
  return valor;
}

export const env = {
  dbUrl: obrigatorio('DB_URL'),
  // SSL ligado por padrao (Neon exige). Local sem SSL: DB_SSL=false.
  dbSsl: (process.env.DB_SSL ?? 'true') !== 'false',
  apiPort: Number(process.env.API_PORT ?? 3333),
  jwtSecret: obrigatorio('JWT_SECRET'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  get isProd(): boolean {
    return this.nodeEnv === 'production';
  },
};
