import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { CAPABILITY_IDS_GERAIS } from '@triade/shared';
import { migrarPublic, migrarTenant } from './migrate.js';
import { garantirSuperAdmin } from './superAdminSeed.js';
import { BcryptHashSenha } from '../security/BcryptHashSenha.js';

// Empresa pública de demonstração ("TESTE Aesthetics"), populada com dados
// fictícios em todos os módulos. Recriada do zero a cada execução (reset diário).
//   Login:  teste@teste.com.br  /  teste123
const CODIGO = 'demo';
const SCHEMA = 't_demo';
export const DEMO_EMAIL = 'teste@teste.com.br';

// Perfil "Demonstração": OPERACIONAL (testa de verdade), mas SEM administração de
// acesso (Usuários/Perfis/Empresa). Reusa as caps gerais menos as de "acesso.*".
// (exclui acesso.* e ia.* — demo não administra acesso nem gasta a API de IA pública)
const CAPS_DEMO = CAPABILITY_IDS_GERAIS.filter((id) => !id.startsWith('acesso.') && !id.startsWith('ia.'));

const uuid = () => randomUUID();
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const din = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

// Logo "TESTE Aesthetics" recriada em SVG (degradê azul→teal + "T"). O Gui pode
// trocar pelo arquivo exato em Dados da empresa › Logo depois.
function logoDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 160">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b8def"/><stop offset="1" stop-color="#2cc7c7"/></linearGradient></defs>`
    + `<circle cx="80" cy="80" r="66" fill="url(#g)"/>`
    + `<rect x="46" y="50" width="68" height="17" rx="5" fill="#fff"/>`
    + `<rect x="71" y="50" width="18" height="64" rx="5" fill="#fff"/>`
    + `<text x="172" y="80" font-family="Arial,Helvetica,sans-serif" font-size="60" font-weight="800" fill="url(#g)" letter-spacing="2">TESTE</text>`
    + `<text x="174" y="126" font-family="Arial,Helvetica,sans-serif" font-size="33" font-weight="500" fill="url(#g)" letter-spacing="12">AESTHETICS</text>`
    + `</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

export async function seedDemonstracao(ds: DataSource): Promise<void> {
  await migrarPublic(ds);
  await garantirSuperAdmin(ds);

  // 1) Reset: apaga a empresa demo anterior por completo. O DROP SCHEMA CASCADE já
  //    remove a tabela "${SCHEMA}".migracao (controle por schema), então o
  //    migrarTenant abaixo recria tudo do zero.
  try { await ds.query(`DELETE FROM public.empresa WHERE codigo = $1`, [CODIGO]); } catch { /* pode não existir */ }
  await ds.query(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`);

  // 2) Provisiona a empresa demo (com branding "TESTE Aesthetics") + schema.
  await ds.query(
    `INSERT INTO public.empresa (id, codigo, nome, fantasia, schema_name, ativo, logo, cor_primaria, cor_secundaria)
     VALUES ($1,$2,$3,$4,$5,true,$6,$7,$8)`,
    [uuid(), CODIGO, 'TESTE Aesthetics Distribuidora LTDA', 'TESTE Aesthetics', SCHEMA, logoDataUri(), '#4f8ef7', '#2cc7c7'],
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

  // 4) Catálogo fictício de estética (categorias + produtos + preço + estoque).
  const cats = ['Toxina Botulínica', 'Preenchedores', 'Bioestimuladores', 'Skincare', 'Descartáveis']
    .map((nome) => ({ id: uuid(), nome }));
  for (const c of cats) await ds.query(`INSERT INTO "${SCHEMA}".categoria (id, nome) VALUES ($1,$2)`, [c.id, c.nome]);

  const defs = [
    { nome: 'Toxina Botulínica 100U', cat: 0, preco: 920, min: 10, saldo: 64, un: 'FR' },
    { nome: 'Toxina Botulínica 50U', cat: 0, preco: 520, min: 10, saldo: 80, un: 'FR' },
    { nome: 'Ácido Hialurônico 1ml', cat: 1, preco: 690, min: 12, saldo: 120, un: 'SER' },
    { nome: 'Ácido Hialurônico Volume 1ml', cat: 1, preco: 780, min: 12, saldo: 96, un: 'SER' },
    { nome: 'Bioestimulador de Colágeno', cat: 2, preco: 850, min: 8, saldo: 54, un: 'FR' },
    { nome: 'Hidroxiapatita de Cálcio 1,5ml', cat: 2, preco: 990, min: 6, saldo: 40, un: 'SER' },
    { nome: 'Sérum Vitamina C 30ml', cat: 3, preco: 180, min: 20, saldo: 210, un: 'UN' },
    { nome: 'Protetor Solar FPS 70', cat: 3, preco: 120, min: 24, saldo: 340, un: 'UN' },
    { nome: 'Creme Antioxidante 50g', cat: 3, preco: 240, min: 15, saldo: 150, un: 'UN' },
    { nome: 'Agulha 30G (cx 100)', cat: 4, preco: 95, min: 30, saldo: 420, un: 'CX' },
    { nome: 'Seringa 1ml Luer (cx 100)', cat: 4, preco: 130, min: 25, saldo: 260, un: 'CX' },
    { nome: 'Cânula 25G', cat: 4, preco: 38, min: 50, saldo: 600, un: 'UN' },
  ];
  const produtos = defs.map((d) => ({ id: uuid(), nome: d.nome, preco: d.preco }));
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i]; const pid = produtos[i].id;
    await ds.query(`INSERT INTO "${SCHEMA}".produto (id, nome, categoria_id, unidade, estoque_minimo) VALUES ($1,$2,$3,$4,$5)`,
      [pid, d.nome, cats[d.cat].id, d.un, d.min]);
    await ds.query(`INSERT INTO "${SCHEMA}".preco_base (produto_id, preco) VALUES ($1,$2)`, [pid, d.preco]);
    const loteId = uuid();
    await ds.query(`INSERT INTO "${SCHEMA}".estoque_lote (id, produto_id, lote, validade, quantidade, custo_unitario) VALUES ($1,$2,$3, CURRENT_DATE + interval '18 months', $4,$5)`,
      [loteId, pid, 'L-' + din(1000, 9999), d.saldo, Number((d.preco * 0.6).toFixed(2))]);
    await ds.query(`INSERT INTO "${SCHEMA}".estoque_movimento (id, produto_id, lote_id, tipo, quantidade, observacao) VALUES ($1,$2,$3,'entrada',$4,'Carga inicial (demo)')`,
      [uuid(), pid, loteId, d.saldo]);
  }

  // 5) Pessoas (clínicas, fornecedores, vendedores).
  const clientes = [
    { nome: 'Clínica Derma Bella LTDA', fant: 'Derma Bella', doc: '12.345.678/0001-90', lim: 40000 },
    { nome: 'Instituto Estético Renova', fant: 'Renova', doc: '98.765.432/0001-10', lim: 25000 },
    { nome: 'Espaço Saúde & Beleza', fant: 'Saúde & Beleza', doc: '11.222.333/0001-44', lim: 18000 },
    { nome: 'Clínica Vita Estética', fant: 'Vita', doc: '44.555.666/0001-77', lim: 30000 },
    { nome: 'Studio Face Premium', fant: 'Face Premium', doc: '55.666.777/0001-88', lim: 22000 },
  ].map((c) => ({ ...c, id: uuid() }));
  for (const c of clientes) {
    await ds.query(`INSERT INTO "${SCHEMA}".cliente (id, tipo_pessoa, nome, fantasia, documento, limite_credito) VALUES ($1,'PJ',$2,$3,$4,$5)`,
      [c.id, c.nome, c.fant, c.doc, c.lim]);
  }
  for (const f of [
    { nome: 'BioLab Farmacêutica S/A', fant: 'BioLab', doc: '01.001.001/0001-01' },
    { nome: 'Estética Import LTDA', fant: 'Estética Import', doc: '02.002.002/0001-02' },
  ]) {
    await ds.query(`INSERT INTO "${SCHEMA}".fornecedor (id, nome, fantasia, documento) VALUES ($1,$2,$3,$4)`, [uuid(), f.nome, f.fant, f.doc]);
  }
  const vendedores = [
    { nome: 'Carla Mendes', email: 'carla@demo.local', com: 4 },
    { nome: 'Rafael Souza', email: 'rafael@demo.local', com: 3 },
    { nome: 'Aline Costa', email: 'aline@demo.local', com: 3.5 },
  ].map((v) => ({ ...v, id: uuid() }));
  for (const v of vendedores) {
    await ds.query(`INSERT INTO "${SCHEMA}".vendedor (id, nome, email, comissao_percentual) VALUES ($1,$2,$3,$4)`, [v.id, v.nome, v.email, v.com]);
  }

  // 6) Pedidos espalhados nos últimos ~6 meses + títulos a receber (popula o dashboard).
  const STATUS = ['entregue', 'entregue', 'entregue', 'expedido', 'aprovado', 'separacao'];
  const FORMAS = ['pix', 'boleto', 'cartao', 'dinheiro'];
  const totalPedidos = 38;
  for (let i = 0; i < totalPedidos; i++) {
    // garante vendas recentes (alguns nos últimos 7 dias) + o resto em 6 meses
    const diasAtras = i < 8 ? din(0, 7) : din(8, 175);
    const cli = pick(clientes);
    const vend = pick(vendedores);
    const nItens = din(1, 3);
    const usados = new Set<string>();
    const itens: { id: string; nome: string; preco: number; qtd: number; sub: number }[] = [];
    let subtotal = 0;
    for (let j = 0; j < nItens; j++) {
      const p = pick(produtos);
      if (usados.has(p.id)) continue;
      usados.add(p.id);
      const qtd = din(1, 6);
      const sub = Number((qtd * p.preco).toFixed(2));
      subtotal += sub;
      itens.push({ id: p.id, nome: p.nome, preco: p.preco, qtd, sub });
    }
    subtotal = Number(subtotal.toFixed(2));
    const status = pick(STATUS);
    const forma = pick(FORMAS);
    const pedidoId = uuid();
    await ds.query(
      `INSERT INTO "${SCHEMA}".pedido (id, numero, cliente_id, vendedor_id, status, forma_pagamento, subtotal, frete, total, criado_em)
       VALUES ($1, nextval('"${SCHEMA}".pedido_numero_seq'), $2,$3,$4,$5,$6,0,$6, now() - ($7 || ' days')::interval)`,
      [pedidoId, cli.id, vend.id, status, forma, subtotal, String(diasAtras)],
    );
    for (const it of itens) {
      await ds.query(`INSERT INTO "${SCHEMA}".pedido_item (id, pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [uuid(), pedidoId, it.id, it.nome, it.qtd, it.preco, it.sub]);
    }
    // título a receber do pedido (parte pago, parte em aberto)
    const pago = Math.random() < 0.6;
    const pagoDias = Math.max(0, diasAtras - din(2, 8));
    const pagoEm = pago ? new Date(Date.now() - pagoDias * 86400000) : null;
    await ds.query(
      `INSERT INTO "${SCHEMA}".titulo (id, tipo, descricao, pessoa_nome, valor, vencimento, status, forma_pagamento, pago_em, origem, pedido_id, criado_em)
       VALUES ($1,'receber',$2,$3,$4, (now() - ($5 || ' days')::interval)::date + 30, $6, $7, $8, 'pedido', $9, now() - ($5 || ' days')::interval)`,
      [uuid(), `Venda — ${cli.fant}`, cli.nome, subtotal,
        String(diasAtras), pago ? 'pago' : 'aberto', pago ? forma : null, pagoEm, pedidoId],
    );
  }

  // alguns orçamentos em aberto (aparecem no Kanban, não contam como venda)
  for (let i = 0; i < 3; i++) {
    const cli = pick(clientes); const vend = pick(vendedores);
    const p = pick(produtos); const qtd = din(1, 4); const sub = Number((qtd * p.preco).toFixed(2));
    const pedidoId = uuid();
    await ds.query(
      `INSERT INTO "${SCHEMA}".pedido (id, numero, cliente_id, vendedor_id, status, subtotal, frete, total, criado_em)
       VALUES ($1, nextval('"${SCHEMA}".pedido_numero_seq'), $2,$3,'orcamento',$4,0,$4, now() - ($5 || ' days')::interval)`,
      [pedidoId, cli.id, vend.id, sub, String(din(0, 10))],
    );
    await ds.query(`INSERT INTO "${SCHEMA}".pedido_item (id, pedido_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [uuid(), pedidoId, p.id, p.nome, qtd, p.preco, sub]);
  }

  // 7) Contas a pagar (despesas fictícias — parte paga, parte em aberto).
  const despesas = [
    { d: 'Aluguel do depósito', v: 6500, forn: 'Imobiliária Central' },
    { d: 'Energia elétrica', v: 1830, forn: 'Concessionária' },
    { d: 'Compra de mercadorias', v: 24800, forn: 'BioLab Farmacêutica S/A' },
    { d: 'Compra de mercadorias', v: 12600, forn: 'Estética Import LTDA' },
    { d: 'Folha de pagamento', v: 18900, forn: 'Equipe' },
    { d: 'Software / sistemas', v: 740, forn: 'Fornecedor TI' },
    { d: 'Frete e logística', v: 2200, forn: 'Transportadora' },
  ];
  for (const e of despesas) {
    const diasAtras = din(0, 60);
    const pago = Math.random() < 0.5;
    const pagoEm = pago ? new Date(Date.now() - din(1, 10) * 86400000) : null;
    await ds.query(
      `INSERT INTO "${SCHEMA}".titulo (id, tipo, descricao, pessoa_nome, valor, vencimento, status, forma_pagamento, pago_em, origem, criado_em)
       VALUES ($1,'pagar',$2,$3,$4, (now() - ($5 || ' days')::interval)::date + 20, $6, $7, $8, 'manual', now() - ($5 || ' days')::interval)`,
      [uuid(), e.d, e.forn, e.v, String(diasAtras), pago ? 'pago' : 'aberto', pago ? 'boleto' : null, pagoEm],
    );
  }
}
