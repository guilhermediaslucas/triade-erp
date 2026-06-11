import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { migrarPublic } from './migrate.js';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';

// Garante o administrador global do sistema (idempotente).
// E-mail e senha padrão podem ser sobrescritos por env. Trocar a senha em produção.
export async function garantirSuperAdmin(ds: DataSource): Promise<void> {
  await migrarPublic(ds);
  const email = (process.env.SUPER_ADMIN_EMAIL ?? 'admin@triadeerp.com.br').trim().toLowerCase();
  const senha = process.env.SUPER_ADMIN_SENHA ?? 'admin123';
  const nome = process.env.SUPER_ADMIN_NOME ?? 'Administrador do sistema';

  const existe = await ds.query(`SELECT id FROM public.super_admin WHERE email = $1`, [email]);
  if (existe.length > 0) return;
  const hash = await new BcryptHashSenha().gerar(senha);
  await ds.query(
    `INSERT INTO public.super_admin (id, email, senha_hash, nome) VALUES ($1,$2,$3,$4)`,
    [randomUUID(), email, hash, nome]);
}
