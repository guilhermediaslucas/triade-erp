// ============================================================
//  TRIADE ERP — Copiar o cadastro de PRODUTOS de uma empresa para outra(s).
//  Cada empresa é um schema próprio no Postgres; este script lê os produtos
//  (e as categorias, casadas por nome) da empresa de ORIGEM e os recria nas
//  empresas de DESTINO.
//
//  - É IDEMPOTENTE: produto que já existe no destino (mesmo nome) é PULADO.
//  - Categoria do produto é casada por NOME no destino; se não existir, é criada.
//  - Copia os campos presentes nas DUAS tabelas (inclui NCM/fiscal, se houver).
//  - Por padrão roda em SIMULAÇÃO (não grava nada). Use --aplicar para gravar.
//
//  Uso:
//    node scripts/copiar-produtos.mjs "teste" "Maid" "Iskins"            (simula)
//    node scripts/copiar-produtos.mjs "teste" "Maid" "Iskins" --aplicar  (grava)
//
//  A empresa é identificada por CÓDIGO exato OU por parte do nome/fantasia.
//  Lê a conexão de DB_URL (variável de ambiente ou apps/api/.env).
// ============================================================
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, '..');

// --- carrega DB_URL do ambiente ou de um .env (raiz do monorepo ou apps/api) -
function carregarEnv() {
  if (process.env.DB_URL) return; // já veio do ambiente (ex.: setado pelo .bat)
  const candidatos = [join(raiz, '.env'), join(raiz, 'apps', 'api', '.env')];
  for (const caminho of candidatos) {
    try {
      const txt = readFileSync(caminho, 'utf8');
      for (const linha of txt.split(/\r?\n/)) {
        const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
      if (process.env.DB_URL) return;
    } catch { /* tenta o próximo */ }
  }
}
carregarEnv();

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error('ERRO: defina DB_URL (ou apps/api/.env).'); process.exit(1); }
const usaSsl = (process.env.DB_SSL ?? 'true') !== 'false';

const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const termos = args.filter((a) => !a.startsWith('--'));
if (termos.length < 2) {
  console.error('Uso: node scripts/copiar-produtos.mjs "<origem>" "<destino1>" ["<destino2>" ...] [--aplicar]');
  process.exit(1);
}
const [termoOrigem, ...termosDestino] = termos;

const cli = new pg.Client({ connectionString: DB_URL, ssl: usaSsl ? { rejectUnauthorized: false } : false });

function validarSchema(s) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)) throw new Error('schema inválido: ' + s);
  return s;
}

async function resolverEmpresa(termo) {
  // por código exato primeiro
  let r = await cli.query('SELECT codigo, fantasia, nome, schema_name FROM public.empresa WHERE lower(codigo)=lower($1)', [termo]);
  if (r.rows.length === 0) {
    r = await cli.query(
      `SELECT codigo, fantasia, nome, schema_name FROM public.empresa
       WHERE fantasia ILIKE $1 OR nome ILIKE $1 ORDER BY fantasia`, ['%' + termo + '%']);
  }
  if (r.rows.length === 0) throw new Error(`nenhuma empresa encontrada para "${termo}"`);
  if (r.rows.length > 1) {
    console.error(`Mais de uma empresa casa com "${termo}":`);
    for (const e of r.rows) console.error(`   - ${e.codigo}  (${e.fantasia})`);
    throw new Error(`seja mais específico para "${termo}" (use o código exato)`);
  }
  return r.rows[0];
}

async function colunasProduto(schema) {
  const r = await cli.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema=$1 AND table_name='produto'`, [schema]);
  return new Set(r.rows.map((x) => x.column_name));
}

async function copiarPara(origem, destino, colunasComuns) {
  const so = validarSchema(origem.schema_name);
  const sd = validarSchema(destino.schema_name);

  // categorias do destino por nome (lower)
  const catsDestino = new Map();
  for (const c of (await cli.query(`SELECT id, nome FROM "${sd}".categoria`)).rows) catsDestino.set(c.nome.toLowerCase(), c.id);
  // categorias da origem por id
  const catsOrigem = new Map();
  for (const c of (await cli.query(`SELECT id, nome FROM "${so}".categoria`)).rows) catsOrigem.set(c.id, c.nome);
  // produtos já existentes no destino (por nome)
  const existentes = new Set((await cli.query(`SELECT lower(nome) AS n FROM "${sd}".produto`)).rows.map((x) => x.n));

  const produtos = (await cli.query(`SELECT * FROM "${so}".produto ORDER BY nome`)).rows;
  // colunas a copiar: as comuns, menos id/criado_em/categoria_id (tratados à parte)
  const copiaveis = [...colunasComuns].filter((c) => !['id', 'criado_em', 'categoria_id'].includes(c));

  let criados = 0, pulados = 0, catsCriadas = 0;
  for (const p of produtos) {
    if (existentes.has((p.nome ?? '').toLowerCase())) { pulados++; continue; }

    // resolve categoria no destino (casando por nome; cria se faltar)
    let categoriaIdDestino = null;
    if (p.categoria_id && catsOrigem.has(p.categoria_id)) {
      const nomeCat = catsOrigem.get(p.categoria_id);
      const chave = nomeCat.toLowerCase();
      if (catsDestino.has(chave)) categoriaIdDestino = catsDestino.get(chave);
      else {
        const novoId = randomUUID();
        if (aplicar) await cli.query(`INSERT INTO "${sd}".categoria (id, nome) VALUES ($1,$2)`, [novoId, nomeCat]);
        catsDestino.set(chave, novoId);
        categoriaIdDestino = novoId;
        catsCriadas++;
      }
    }

    const cols = ['id', 'categoria_id', ...copiaveis];
    const vals = [randomUUID(), categoriaIdDestino, ...copiaveis.map((c) => p[c])];
    const ph = vals.map((_, i) => '$' + (i + 1)).join(',');
    if (aplicar) await cli.query(`INSERT INTO "${sd}".produto (${cols.map((c) => '"' + c + '"').join(',')}) VALUES (${ph})`, vals);
    existentes.add((p.nome ?? '').toLowerCase());
    criados++;
  }
  return { criados, pulados, catsCriadas };
}

(async () => {
  await cli.connect();
  try {
    const origem = await resolverEmpresa(termoOrigem);
    const destinos = [];
    for (const t of termosDestino) destinos.push(await resolverEmpresa(t));

    console.log(`\n${aplicar ? '>>> APLICANDO' : '*** SIMULAÇÃO (use --aplicar para gravar)'}`);
    console.log(`Origem:  ${origem.codigo}  (${origem.fantasia})  schema=${origem.schema_name}`);
    const colsOrigem = await colunasProduto(origem.schema_name);

    for (const d of destinos) {
      if (d.schema_name === origem.schema_name) { console.log(`\n- ${d.fantasia}: é a própria origem, ignorando.`); continue; }
      const colsDestino = await colunasProduto(d.schema_name);
      const comuns = new Set([...colsOrigem].filter((c) => colsDestino.has(c)));
      if (aplicar) await cli.query('BEGIN');
      try {
        const r = await copiarPara(origem, d, comuns);
        if (aplicar) await cli.query('COMMIT');
        console.log(`\n- ${d.codigo} (${d.fantasia}): ${r.criados} produto(s) ${aplicar ? 'criados' : 'a criar'}, ${r.pulados} já existente(s), ${r.catsCriadas} categoria(s) nova(s).`);
      } catch (e) { if (aplicar) await cli.query('ROLLBACK'); throw e; }
    }
    console.log(`\n${aplicar ? 'Concluído.' : 'Simulação concluída — nada foi gravado. Rode de novo com --aplicar para efetivar.'}\n`);
  } catch (e) {
    console.error('\nERRO:', e.message, '\n');
    process.exitCode = 1;
  } finally {
    await cli.end();
  }
})();
