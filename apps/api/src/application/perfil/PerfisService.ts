import { capabilityExiste } from '@triade/shared';
import type { Perfil } from '../../domain/perfil/Perfil.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validar(nome: string, capabilities: string[]): void {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('perfil.nome_invalido', 400);
  for (const c of capabilities) {
    if (!capabilityExiste(c)) throw new ErroAplicacao('perfil.capability_invalida', 400);
  }
}

export class PerfisService {
  constructor(private readonly perfis: PerfilRepository) {}

  listar(schema: string): Promise<Perfil[]> {
    return this.perfis.listar(schema);
  }

  criar(schema: string, nome: string, capabilities: string[]): Promise<Perfil> {
    validar(nome, capabilities);
    return this.perfis.criar(schema, nome.trim(), [...new Set(capabilities)]);
  }

  async editar(schema: string, id: string, nome: string, capabilities: string[]): Promise<void> {
    validar(nome, capabilities);
    const existe = await this.perfis.buscarPorId(schema, id);
    if (!existe) throw new ErroAplicacao('perfil.nao_encontrado', 404);
    await this.perfis.atualizar(schema, id, nome.trim(), [...new Set(capabilities)]);
  }
}
