import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS_GERAIS } from '@triade/shared';
import { migrarPublic, migrarTenant } from './migrate.js';
import { garantirSuperAdmin } from './superAdminSeed.js';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';

// Empresa pública de demonstração. Recriada do zero a cada execução (reset).
//   Login:  teste@teste.com.br  /  teste123
const CODIGO = 'demo';
const SCHEMA = 't_demo';
export const DEMO_EMAIL = 'teste@teste.com.br';

// Perfil "Demonstração": OPERACIONAL (testa de verdade), mas SEM administração de
// acesso (Usuários/Perfis/Empresa). Reusa as caps gerais menos as de "acesso.*".
const CAPS_DEMO = CAPABILITY_IDS_GERAIS.filter((id) => !id.startsWith('acesso.'));

const uuid = () => randomUUID();

export async function seedDemonstracao(ds: DataSource): Promise<void> {
  await migrarPublic(ds);
  await garantirSuperAdmin(ds);

  // 1) Reset: apaga a empresa demo anterior por completo. O DROP SCHEMA CASCADE já
  //    remove a tabela "${SCHEMA}".migracao (controle por schema), então o
  //    migrarTenant abaixo recria tudo do zero.
  try { await ds.query(`DELETE FROM public.empresa WHERE codigo = $1`, [CODIGO]); } catch { /* pode não existir */ }
  await ds.query(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`);

  // 2) Provisiona a empresa demo + schema.
  await ds.query(
    `INSERT INTO public.empresa (id, codigo, nome, fantasia, schema_name, ativo) VALUES ($1,$2,$3,$4,$5,true)`,
    [uuid(), CODIGO, 'Distribuidora Demonstração LTDA', 'Demonstração', SCHEMA],
  );
  await migrarTenant(ds, SCHEMA);

  // 3) Perfil "Demonstração" (operacional) + usuário público.
  const perfilId = uuid();
  await ds.query(`INSERT INTO "${SCHEMA}".perfil (id, nome, ativo, descricao) VALUES ($1,'Demonstração',true,$2)`,
    [perfilId, 'Conta pública de demonstração — testa o sistema, sem administrar acesso']);
  for (const cap of CAPS_DEMO) {
    await ds.query(`INSERT INTO "${SCHEMA}".perfil_capability (perfil_id, capability) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [perfilId, cap]);
  }
  const senha = await new BcryptHashSenha().gerar('teste123');
  await ds.query(`INSERT INTO "${SCHEMA}".usuario (id, nome, email, senha_hash, ativo, perfil_id) VALUES ($1,$2,$3,$4,true,$5)`,
    [uuid(), 'Usuário Demonstração', DEMO_EMAIL, senha, perfilId]);

  // 4) Catálogo fictício (categorias, produtos com preço e estoque, pessoas).
  const cats = [
    { nome: 'Bebidas' }, { nome: 'Mercearia' }, { nome: 'Limpeza' },
  ].map((c) => ({ id: uuid(), ...c }));
  for (const c of cats) await ds.query(`INSERT INTO "${SCHEMA}".categoria (id, nome) VALUES ($1,$2)`, [c.id, c.nome]);

  const prods = [
    { nome: 'Refrigerante Cola 2L', cat: 0, preco: 8.9, min: 24, saldo: 240 },
    { nome: 'Água Mineral 500ml (fardo 12)', cat: 0, preco: 18.5, min: 10, saldo: 38 },
    { nome: 'Suco de Uva Integral 1L', cat: 0, preco: 12.9, min: 12, saldo: 112 },
    { nome: 'Energético 250ml', cat: 0, preco: 6.5, min: 24, saldo: 410 },
    { nome: 'Arroz Tipo 1 5kg', cat: 1, preco: 27.9, min: 20, saldo: 160 },
    { nome: 'Feijão Carioca 1kg', cat: 1, preco: 7.8, min: 30, saldo: 95 },
    { nome: 'Detergente Neutro 500ml', cat: 2, preco: 2.9, min: 40, saldo: 300 },
    { nome: 'Sabão em Pó 1kg', cat: 2, preco: 11.5, min: 18, saldo: 64 },
  ];
  for (const p of prods) {
    const pid = uuid();
    await ds.query(`INSERT INTO "${SCHEMA}".produto (id, nome, categoria_id, unidade, preco, estoque_minimo) VALUES ($1,$2,$3,'UN',$4,$5)`,
      [pid, p.nome, cats[p.cat].id, p.preco, p.min]);
    await ds.query(`INSERT INTO "${SCHEMA}".preco_base (produto_id, preco) VALUES ($1,$2)`, [pid, p.preco]);
    const loteId = uuid();
    await ds.query(`INSERT INTO "${SCHEMA}".estoque_lote (id, produto_id, lote, quantidade, custo_unitario) VALUES ($1,$2,$3,$4,$5)`,
      [loteId, pid, 'L-DEMO', p.saldo, Number((p.preco * 0.6).toFixed(2))]);
    await ds.query(`INSERT INTO "${SCHEMA}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao) VALUES ($1,$2,$3,'entrada',$4,$5)`,
      [uuid(), pid, loteId, p.saldo, 'Carga inicial (demo)']);
  }

  const clientes = [
    { nome: 'Mercado Sul LTDA', fant: 'Mercado Sul', doc: '12.345.678/0001-90', lim: 20000 },
    { nome: 'Bar do João ME', fant: 'Bar do João', doc: '98.765.432/0001-10', lim: 5000 },
    { nome: 'Padaria Pão Quente', fant: 'Pão Quente', doc: '11.222.333/0001-44', lim: 8000 },
    { nome: 'Conveniência 24h', fant: 'Conv. 24h', doc: '44.555.666/0001-77', lim: 12000 },
  ];
  for (const c of clientes) {
    await ds.query(`INSERT INTO "${SCHEMA}".cliente (id, tipo_pessoa, nome, fantasia, documento, limite_credito) VALUES ($1,'PJ',$2,$3,$4,$5)`,
      [uuid(), c.nome, c.fant, c.doc, c.lim]);
  }

  const forns = [
    { nome: 'Distribuidora Alfa S/A', fant: 'Alfa', doc: '01.001.001/0001-01' },
    { nome: 'Atacado Beta LTDA', fant: 'Beta', doc: '02.002.002/0001-02' },
  ];
  for (const f of forns) {
    await ds.query(`INSERT INTO "${SCHEMA}".fornecedor (id, nome, fantasia, documento) VALUES ($1,$2,$3,$4)`,
      [uuid(), f.nome, f.fant, f.doc]);
  }

  const vends = [
    { nome: 'Carla Mendes', email: 'carla@demo.local', com: 3 },
    { nome: 'Rafael Souza', email: 'rafael@demo.local', com: 2.5 },
  ];
  for (const v of vends) {
    await ds.query(`INSERT INTO "${SCHEMA}".vendedor (id, nome, email, comissao_percentual) VALUES ($1,$2,$3,$4)`,
      [uuid(), v.nome, v.email, v.com]);
  }
}
