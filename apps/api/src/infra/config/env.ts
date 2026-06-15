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
  // Em producao (Render/Railway/etc.) a porta vem em PORT. Local usa API_PORT.
  apiPort: Number(process.env.PORT ?? process.env.API_PORT ?? 3333),
  // Origem permitida no CORS. '*' libera geral (ok para comecar — tudo exige JWT).
  // Em producao, pode-se restringir para a URL do site (ex.: https://erp.suaclinica.com.br).
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  autoMigrate: (process.env.AUTO_MIGRATE ?? 'true') !== 'false',
  jwtSecret: obrigatorio('JWT_SECRET'),
  // E-mail transacional (Resend). Opcionais: sem RESEND_API_KEY o envio vira
  // no-op (loga e segue) — local/dev não quebra e produção só envia quando configurado.
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'TRIADE ERP <notificacoes@triadeerp.com.br>',
  // Destino das notificações de suporte (cai no Gmail via Cloudflare Email Routing).
  suporteEmailDestino: process.env.SUPORTE_EMAIL_DESTINO ?? 'admin@triadeerp.com.br',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  get isProd(): boolean {
    return this.nodeEnv === 'production';
  },
};
