import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env.js';

// Unico ponto que conhece o banco. Trocar de Postgres para outro SGBD
// no futuro acontece AQUI, sem tocar em dominio/aplicacao.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.dbUrl,
  // Neon e a maioria dos Postgres gerenciados exigem SSL.
  ssl: { rejectUnauthorized: false },
  // Entidades ORM e migrations vivem na infra (Fase 1 em diante).
  entities: [],
  migrations: ['src/infra/db/migrations/*.ts'],
  // Migrations explicitas; nunca sincronizar schema automaticamente.
  synchronize: false,
  logging: !env.isProd ? ['error', 'warn'] : ['error'],
});
