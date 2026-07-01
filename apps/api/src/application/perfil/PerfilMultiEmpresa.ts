import { capabilityExiste } from '@triade/shared';
import type { EmpresaRepository } from '../../domain/empresa/EmpresaRepository.js';
import type { PerfilRepository } from '../../domain/perfil/PerfilRepository.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface PerfilEmpresaInfo {
  codigo: string;
  fantasia: string;
  existe: boolean;     // já há um perfil com esse nome na empresa
  ativo: boolean;      // e está ativo
  qtdCaps: number;     // quantas permissões esse perfil tem hoje
}

export interface SituacaoPerfil {
  empresas: PerfilEmpresaInfo[];
  modelo: { descricao: string; capabilities: string[] } | null; // 1º perfil encontrado (para pré-preencher o editor)
}

export interface SincronizarPerfilEntrada {
  nome: string;
  descricao: string;
  capabilities: string[];
  empresas: string[];  // códigos das empresas onde aplicar
}

// Caso de uso (super-admin): define um perfil (nome + permissões) e aplica em
// várias empresas de uma vez. Nas empresas marcadas, cria (se não existe pelo
// nome) ou atualiza as permissões. Empresas DESMARCADAS não são tocadas — um
// perfil pode ter usuários vinculados, então não inativamos por aqui.
export class PerfilMultiEmpresa {
  constructor(
    private readonly empresas: EmpresaRepository,
    private readonly perfis: PerfilRepository,
  ) {}

  async situacao(nomeEntrada: string): Promise<SituacaoPerfil> {
    const alvo = String(nomeEntrada ?? '').trim().toLowerCase();
    const empresas: PerfilEmpresaInfo[] = [];
    let modelo: { descricao: string; capabilities: string[] } | null = null;
    for (const e of await this.empresas.listarTodas()) {
      if (!e.ativo) continue;
      const p = alvo ? (await this.perfis.listar(e.schemaName)).find((x) => x.nome.trim().toLowerCase() === alvo) : undefined;
      empresas.push({ codigo: e.codigo, fantasia: e.fantasia, existe: !!p, ativo: !!(p && p.ativo), qtdCaps: p?.capabilities.length ?? 0 });
      if (p && !modelo) modelo = { descricao: p.descricao, capabilities: [...p.capabilities] };
    }
    return { empresas, modelo };
  }

  async sincronizar(e: SincronizarPerfilEntrada): Promise<{ criadas: string[]; atualizadas: string[] }> {
    const nome = String(e.nome ?? '').trim();
    if (nome.length < 2) throw new ErroAplicacao('perfil.nome_invalido', 400);
    // Mantém só permissões que ainda existem no catálogo (descarta obsoletas/desconhecidas).
    const caps = [...new Set((e.capabilities ?? []).map(String).filter(capabilityExiste))];
    const descricao = String(e.descricao ?? '').trim();
    const alvo = nome.toLowerCase();
    const selecionadas = new Set((e.empresas ?? []).map((c) => String(c).trim().toLowerCase()));

    const criadas: string[] = [];
    const atualizadas: string[] = [];
    for (const emp of (await this.empresas.listarTodas()).filter((x) => x.ativo)) {
      if (!selecionadas.has(emp.codigo.toLowerCase())) continue; // desmarcada: não mexe
      const existente = (await this.perfis.listar(emp.schemaName)).find((p) => p.nome.trim().toLowerCase() === alvo);
      if (existente) {
        await this.perfis.atualizar(emp.schemaName, existente.id, nome, descricao, true, caps);
        atualizadas.push(emp.codigo);
      } else {
        await this.perfis.criar(emp.schemaName, nome, descricao, true, caps);
        criadas.push(emp.codigo);
      }
    }
    return { criadas, atualizadas };
  }
}
