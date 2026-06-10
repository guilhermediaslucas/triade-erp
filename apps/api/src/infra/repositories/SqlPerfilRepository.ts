import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { Perfil } from '../../domain/perfil/Perfil.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import { validarSchema } from '../tenant/validarSchema.js';

export class SqlPerfilRepository implements PerfilRepository {
  constructor(private readonly ds: DataSource) {}

  async listar(schema: string): Promise<Perfil[]> {
    const s = validarSchema(schema);
    const perfis = await this.ds.query(
      `SELECT id, nome, criado_em FROM "${s}".perfil ORDER BY nome`,
    );
    const caps = await this.ds.query(
      `SELECT perfil_id, capability FROM "${s}".perfil_capability`,
    );
    return perfis.map((p: any) => ({
      id: p.id,
      nome: p.nome,
      criadoEm: new Date(p.criado_em),
      capabilities: caps.filter((c: any) => c.perfil_id === p.id).map((c: any) => c.capability),
    }));
  }

  async buscarPorId(schema: string, id: string): Promise<Perfil | null> {
    const s = validarSchema(schema);
    const p = (await this.ds.query(`SELECT id, nome, criado_em FROM "${s}".perfil WHERE id = $1`, [id]))[0];
    if (!p) return null;
    const caps = await this.ds.query(`SELECT capability FROM "${s}".perfil_capability WHERE perfil_id = $1`, [id]);
    return { id: p.id, nome: p.nome, criadoEm: new Date(p.criado_em), capabilities: caps.map((c: any) => c.capability) };
  }

  async criar(schema: string, nome: string, capabilities: string[]): Promise<Perfil> {
    const s = validarSchema(schema);
    const id = randomUUID();
    await this.ds.query(`INSERT INTO "${s}".perfil (id, nome) VALUES ($1, $2)`, [id, nome]);
    await this.gravarCaps(s, id, capabilities);
    return { id, nome, capabilities, criadoEm: new Date() };
  }

  async atualizar(schema: string, id: string, nome: string, capabilities: string[]): Promise<void> {
    const s = validarSchema(schema);
    await this.ds.query(`UPDATE "${s}".perfil SET nome = $2 WHERE id = $1`, [id, nome]);
    await this.ds.query(`DELETE FROM "${s}".perfil_capability WHERE perfil_id = $1`, [id]);
    await this.gravarCaps(s, id, capabilities);
  }

  private async gravarCaps(schema: string, perfilId: string, capabilities: string[]): Promise<void> {
    for (const cap of capabilities) {
      await this.ds.query(
        `INSERT INTO "${schema}".perfil_capability (perfil_id, capability) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [perfilId, cap],
      );
    }
  }
}
