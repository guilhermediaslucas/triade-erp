import 'reflect-metadata';
import { AppDataSource } from './data-source.js';
import { migrarTudo } from './migrate.js';
import { seedDemo } from './seed.js';

async function main(): Promise<void> {
  const comando = process.argv[2];
  await AppDataSource.initialize();
  try {
    if (comando === 'migrate') {
      const aplicadas = await migrarTudo(AppDataSource);
      console.log(aplicadas.length ? `Migrations aplicadas:\n - ${aplicadas.join('\n - ')}` : 'Nada a migrar (tudo atualizado).');
    } else if (comando === 'seed') {
      const r = await seedDemo(AppDataSource);
      if (r.criado) {
        console.log(`Empresa demo criada.\n  Empresa (codigo): ${r.empresa}\n  Usuario: ${r.usuario}\n  Senha:   ${r.senhaPadrao}`);
      } else {
        console.log(`Empresa demo ja existia (nada recriado).\n  Empresa: ${r.empresa} | Usuario: ${r.usuario}`);
      }
    } else {
      console.error('Uso: cli.ts <migrate|seed>');
      process.exitCode = 1;
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((e) => {
  console.error('[db] erro:', e);
  process.exit(1);
});
