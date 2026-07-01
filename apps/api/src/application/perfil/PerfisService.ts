import { capabilityExiste } from '@triade/shared';
import type { Perfil } from '../../domain/perfil/Perfil.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

function validarNome(nome: string): void {
  if (!nome || nome.trim().length < 2) throw new ErroAplicacao('perfil.nome_invalido', 400);
}

// Mantém só as permissões que ainda existem no catálogo. Descarta ids obsoletos
// (removidos em atualizações passadas) ou desconhecidos, em vez de rejeitar o
// perfil inteiro — assim o perfil se "auto-limpa" no próximo salvamento.
function soConhecidas(capabilities: string[]): string[] {
  return [...new Set(capabilities.filter(capabilityExiste))];
}

export class PerfisService {
  constructor(private readonly perfis: PerfilRepository) {}

  listar(schema: string): Promise<Perfil[]> {
    return this.perfis.listar(schema);
  }

  criar(schema: string, nome: string, descricao: string, ativo: boolean, capabilities: string[]): Promise<Perfil> {
    validarNome(nome);
    return this.perfis.criar(schema, nome.trim(), (descricao ?? '').trim(), ativo !== false, soConhecidas(capabilities));
  }

  async editar(schema: string, id: string, nome: string, descricao: string, ativo: boolean, capabilities: string[]): Promise<void> {
    validarNome(nome);
    const existe = await this.perfis.buscarPorId(schema, id);
    if (!existe) throw new ErroAplicacao('perfil.nao_encontrado', 404);
    await this.perfis.atualizar(schema, id, nome.trim(), (descricao ?? '').trim(), ativo !== false, soConhecidas(capabilities));
  }
}
