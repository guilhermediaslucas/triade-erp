import type { DataSource } from 'typeorm';
import { SqlEmpresaRepository } from '../repositories/SqlEmpresaRepository.js';
import { SqlPerfilRepository } from '../repositories/SqlPerfilRepository.js';
import { PerfilMultiEmpresa } from '../../application/perfil/PerfilMultiEmpresa.js';

// Espelha TODOS os perfis de uma empresa de origem (ex.: Maid) para todas as
// demais empresas ativas. Modo "manter" (seguro): para cada perfil da origem,
// cria (se não existe pelo nome) ou atualiza as permissões na empresa alvo.
// Perfis exclusivos das outras empresas NÃO são tocados (reusa a lógica já
// testada de PerfilMultiEmpresa.sincronizar, que também descarta caps obsoletas).
export async function espelharPerfis(ds: DataSource, codigoOrigem: string): Promise<void> {
  const empresasRepo = new SqlEmpresaRepository(ds);
  const perfisRepo = new SqlPerfilRepository(ds);
  const multi = new PerfilMultiEmpresa(empresasRepo, perfisRepo);

  const ativas = (await empresasRepo.listarTodas()).filter((e) => e.ativo);
  const origem = ativas.find((e) => e.codigo.toLowerCase() === codigoOrigem.trim().toLowerCase());
  if (!origem) {
    throw new Error(
      `Empresa de origem '${codigoOrigem}' não encontrada (ou inativa).\n` +
      `Empresas ativas: ${ativas.map((e) => `${e.codigo} (${e.fantasia})`).join(', ')}`,
    );
  }

  const alvos = ativas.filter((e) => e.codigo.toLowerCase() !== origem.codigo.toLowerCase());
  if (alvos.length === 0) { console.log('Nenhuma outra empresa ativa para espelhar. Nada a fazer.'); return; }

  const perfis = await perfisRepo.listar(origem.schemaName);
  console.log(`Origem: ${origem.fantasia} (${origem.codigo}) — ${perfis.length} perfis.`);
  console.log(`Empresas alvo (${alvos.length}): ${alvos.map((e) => e.codigo).join(', ')}`);
  console.log('Modo: manter (só cria/atualiza os perfis da origem; não remove nada).\n');

  const codigosAlvo = alvos.map((e) => e.codigo);
  for (const p of perfis) {
    const r = await multi.sincronizar({
      nome: p.nome, descricao: p.descricao, capabilities: p.capabilities, empresas: codigosAlvo,
    });
    console.log(`  • ${p.nome} (${p.capabilities.length} permissões): ` +
      `criado em [${r.criadas.join(', ') || '—'}], atualizado em [${r.atualizadas.join(', ') || '—'}]`);
  }
  console.log('\nEspelhamento concluído.');
}
