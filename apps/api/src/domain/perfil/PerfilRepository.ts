import type { Perfil } from './Perfil.js';

export interface PerfilRepository {
  listar(schema: string): Promise<Perfil[]>;
  buscarPorId(schema: string, id: string): Promise<Perfil | null>;
  criar(schema: string, nome: string, capabilities: string[]): Promise<Perfil>;
  atualizar(schema: string, id: string, nome: string, capabilities: string[]): Promise<void>;
}
