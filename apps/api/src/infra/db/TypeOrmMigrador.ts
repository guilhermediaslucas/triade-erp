import type { DataSource } from 'typeorm';
import type { Migrador } from '../../domain/ports/Migrador.js';
import { migrarTenant, removerTenant } from './migrate.js';

export class TypeOrmMigrador implements Migrador {
  constructor(private readonly ds: DataSource) {}
  async migrarTenant(schema: string): Promise<void> {
    await migrarTenant(this.ds, schema);
  }
  async removerTenant(schema: string): Promise<void> {
    await removerTenant(this.ds, schema);
  }
}
