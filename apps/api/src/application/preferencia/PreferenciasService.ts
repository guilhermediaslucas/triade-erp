import type { PreferenciaUsuarioRepository } from '../../domain/preferencia/PreferenciaUsuario.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

// Aceita letras/números e . _ - (ex.: "contas-receber"). Limite curto p/ evitar abuso.
function validarChave(chave: string): string {
  const c = (chave ?? '').trim();
  if (!c || c.length > 64 || !/^[a-zA-Z0-9_.-]+$/.test(c)) throw new ErroAplicacao('preferencia.chave_invalida', 400);
  return c;
}

export class PreferenciasService {
  constructor(private readonly repo: PreferenciaUsuarioRepository) {}

  obter(schema: string, usuarioId: string, chave: string): Promise<unknown | null> {
    return this.repo.obter(schema, usuarioId, validarChave(chave));
  }

  async salvar(schema: string, usuarioId: string, chave: string, valor: unknown): Promise<void> {
    if (valor === undefined) throw new ErroAplicacao('preferencia.valor_invalido', 400);
    await this.repo.salvar(schema, usuarioId, validarChave(chave), valor);
  }
}
