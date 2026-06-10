import type { Usuario } from './Usuario.js';

// Porta: a implementacao concreta busca no schema do tenant informado.
export interface UsuarioRepository {
  buscarPorEmail(schema: string, email: string): Promise<Usuario | null>;
}
