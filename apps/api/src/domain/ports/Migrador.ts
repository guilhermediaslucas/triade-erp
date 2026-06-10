// Porta para aplicar as migrations no schema de um tenant recem-criado.
export interface Migrador {
  migrarTenant(schema: string): Promise<void>;
}
