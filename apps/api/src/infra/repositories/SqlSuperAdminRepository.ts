import type { DataSource } from 'typeorm';
import type { SuperAdmin, SuperAdminRepository } from '../../domain/superadmin/SuperAdmin.js';

export class SqlSuperAdminRepository implements SuperAdminRepository {
  constructor(private readonly ds: DataSource) {}

  async buscarPorEmail(email: string): Promise<SuperAdmin | null> {
    const r = (await this.ds.query(
      `SELECT id, email, nome, senha_hash FROM public.super_admin WHERE email = $1`,
      [email.trim().toLowerCase()]))[0];
    return r ? { id: r.id, email: r.email, nome: r.nome, senhaHash: r.senha_hash } : null;
  }
}
