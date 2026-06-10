import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env.js';

// Unico ponto que conhece o banco. Trocar de SGBD acontece AQUI.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.dbUrl,
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  entities: [],
  migrations: [],
  synchronize: false,
  logging: !env.isProd ? ['error', 'warn'] : ['error'],
});
