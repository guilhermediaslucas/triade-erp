// Porta para aplicar as migrations no schema de um tenant recem-criado.
export interface Migrador {
  migrarTenant(schema: string): Promise<void>;
  // Remove por completo o schema do tenant (usado ao excluir uma empresa).
  removerTenant(schema: string): Promise<void>;
}
