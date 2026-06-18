import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS_GERAIS, CAPS_PAINEL_TV } from '@triade/shared';
import { migrarTudo } from './migrate.js';
import { garantirSuperAdmin } from './superAdminSeed.js';
import { garantirPerfisPadrao } from './perfisPadraoSeed.js';
import { garantirCategoriasPadrao } from './categoriasPadraoSeed.js';
import { validarSchema } from '../tenant/validarSchema.js';

// Roda no boot da API (produção): aplica as migrations pendentes em public +
// todos os tenants e sincroniza as capabilities atuais no perfil Administrador
// de cada tenant ativo (assim permissões novas passam a valer sem passo manual).
// Tudo idempotente — seguro de rodar a cada deploy.
export async function prepararBanco(ds: DataSource): Promise<void> {
  const aplicadas = await migrarTudo(ds);
  await garantirSuperAdmin(ds);
  if (aplicadas.length) console.log(`[db] migrations aplicadas no boot:\n - ${aplicadas.join('\n - ')}`);
  else console.log('[db] migrations: tudo já atualizado.');

  const empresas: Array<{ schema_name: string; codigo: string }> = await ds.query(
    `SELECT schema_name, codigo FROM public.empresa WHERE ativo = true`);
  let tenants = 0;
  for (const e of empresas) {
    const s = validarSchema(e.schema_name);
    const perfil = (await ds.query(`SELECT id FROM "${s}".perfil WHERE nome = $1`, ['Administrador']))[0];
    if (perfil) {
      for (const cap of CAPABILITY_IDS_GERAIS) {
        await ds.query(
          `INSERT INTO "${s}".perfil_capability (perfil_id, capability) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [perfil.id, cap]);
      }
    }
    // Limpeza: caps de painel TV só podem existir nos perfis de Gestão à Vista.
    // (Corrige o caso em que o Administrador/Diretor recebeu essas caps e era
    // redirecionado pro painel TV ao logar.)
    await ds.query(
      `DELETE FROM "${s}".perfil_capability WHERE capability = ANY($1)
        AND perfil_id NOT IN (SELECT id FROM "${s}".perfil WHERE nome IN ('Gestão à Vista Comercial','Gestão à Vista Estoque/Expedição'))`,
      [CAPS_PAINEL_TV]);
    // Perfis padrão (Diretor/Comercial/Financeiro/Estoque + Gestão à Vista) + usuários TV.
    try { await garantirPerfisPadrao(ds, e.schema_name, e.codigo); } catch (err) { console.warn('[db] perfis padrão falhou em', e.schema_name, err); }
    // Categorias financeiras base (implantação) — idempotente.
    try { await garantirCategoriasPadrao(ds, e.schema_name); } catch (err) { console.warn('[db] categorias padrão falhou em', e.schema_name, err); }
    tenants++;
  }
  console.log(`[db] capabilities + perfis padrão sincronizados em ${tenants} tenant(s).`);
}
