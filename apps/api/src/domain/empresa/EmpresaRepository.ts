import type { Empresa } from './Empresa.js';

// Porta: implementacao concreta vive na infra. Busca no schema public.
export interface EmpresaRepository {
  buscarPorCodigo(codigo: string): Promise<Empresa | null>;
}
