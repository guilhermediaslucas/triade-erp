import type { DataSource } from 'typeorm';
import type { Migrador } from '../../domain/ports/Migrador.js';
import { migrarTenant } from './migrate.js';

export class TypeOrmMigrador implements Migrador {
  constructor(private readonly ds: DataSource) {}
  async migrarTenant(schema: string): Promise<void> {
    await migrarTenant(this.ds, schema);
  }
}
