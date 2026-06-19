import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import type { GrupoCatFin } from '../../domain/financeiro/CategoriaFinanceira.js';
import { tipoDoGrupo, CATEGORIA_COMPRA_MERCADORIA } from '../../domain/financeiro/CategoriaFinanceira.js';
import { validarSchema } from '../tenant/validarSchema.js';

// Plano de categorias financeiras base, comum a todas as empresas. São dados
// operacionais (pt-BR), não i18n. Cada empresa pode editar/adicionar depois.
export const CATEGORIAS_PADRAO: { nome: string; grupo: GrupoCatFin }[] = [
  // Receita
  { nome: 'Receita com vendas', grupo: 'receita' },
  { nome: 'Frete cobrado do cliente', grupo: 'receita' },
  { nome: 'Outras receitas', grupo: 'receita' },
  // Custo de aquisição de mercadoria (CMV)
  { nome: CATEGORIA_COMPRA_MERCADORIA, grupo: 'custo_mercadoria' },
  { nome: 'Frete sobre compras', grupo: 'custo_mercadoria' },
  // Custos operacionais
  { nome: 'Frete de entrega', grupo: 'custo_operacional' },
  { nome: 'Comissões de vendedores', grupo: 'custo_operacional' },
  { nome: 'Embalagens e materiais de expedição', grupo: 'custo_operacional' },
  { nome: 'Marketing e propaganda', grupo: 'custo_operacional' },
  // Despesas
  { nome: 'Aluguel', grupo: 'despesa' },
  { nome: 'Energia elétrica', grupo: 'despesa' },
  { nome: 'Água', grupo: 'despesa' },
  { nome: 'Internet e telefone', grupo: 'despesa' },
  { nome: 'Salários e ordenados', grupo: 'despesa' },
  { nome: 'Pró-labore', grupo: 'despesa' },
  { nome: 'Encargos sobre folha (FGTS/INSS)', grupo: 'despesa' },
  { nome: 'Benefícios (vale-transporte, alimentação)', grupo: 'despesa' },
  { nome: 'Honorários contábeis', grupo: 'despesa' },
  { nome: 'Software e assinaturas', grupo: 'despesa' },
  { nome: 'Material de escritório', grupo: 'despesa' },
  { nome: 'Tarifas bancárias', grupo: 'despesa' },
  { nome: 'Impostos e taxas (DAS/Simples)', grupo: 'despesa' },
  { nome: 'Outras despesas', grupo: 'despesa' },
];

// Classifica os títulos SEM categoria financeira (idempotente: só mexe em quem está null).
// Automáticos pela origem; manuais e quaisquer outros caem no genérico por tipo.
async function idCategoria(ds: DataSource, s: string, nome: string): Promise<string | null> {
  const r = (await ds.query(`SELECT id FROM "${s}".categoria_financeira WHERE lower(nome) = lower($1) LIMIT 1`, [nome]))[0];
  return r?.id ?? null;
}
export async function classificarTitulosSemCategoria(ds: DataSource, schemaRaw: string): Promise<void> {
  const s = validarSchema(schemaRaw);
  const set = async (cond: string, catId: string | null) => {
    if (!catId) return;
    await ds.query(`UPDATE "${s}".titulo SET categoria_financeira_id = $1 WHERE categoria_financeira_id IS NULL AND ${cond}`, [catId]);
  };
  // 1) Automáticos pela origem
  await set(`origem = 'pedido'`, await idCategoria(ds, s, 'Receita com vendas'));
  await set(`origem = 'compra'`, await idCategoria(ds, s, CATEGORIA_COMPRA_MERCADORIA));
  await set(`origem = 'comissao'`, await idCategoria(ds, s, 'Comissões de vendedores'));
  await set(`origem = 'frete'`, await idCategoria(ds, s, 'Frete de entrega'));
  // 2) Resto (manuais e origens não previstas): genérico por tipo
  await set(`tipo = 'receber'`, await idCategoria(ds, s, 'Outras receitas'));
  await set(`tipo = 'pagar'`, await idCategoria(ds, s, 'Outras despesas'));
}

// Garante as categorias base em um tenant. Idempotente: cria por nome só quando
// ainda não existe; nunca toca nas categorias que a empresa já criou/editou.
export async function garantirCategoriasPadrao(ds: DataSource, schemaRaw: string): Promise<void> {
  const s = validarSchema(schemaRaw);
  for (const c of CATEGORIAS_PADRAO) {
    const existe = (await ds.query(`SELECT 1 FROM "${s}".categoria_financeira WHERE lower(nome) = lower($1) LIMIT 1`, [c.nome]))[0];
    if (!existe) {
      await ds.query(
        `INSERT INTO "${s}".categoria_financeira (id, nome, tipo, grupo) VALUES ($1,$2,$3,$4)`,
        [randomUUID(), c.nome, tipoDoGrupo(c.grupo), c.grupo]);
    }
  }
}
