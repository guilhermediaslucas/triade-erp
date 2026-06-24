// Incrementa o patch da versão (x.y.z -> x.y.(z+1)) e sincroniza nos 3 package.json
// (raiz, apps/web, apps/api). Chamado pelo scripts\app-apk.bat ANTES do build, p/ a
// APK (versão embutida via __APP_VERSION__) e a API (/version) já saírem com a versão nova.
// Faz replace só da linha "version" (não reformata o arquivo). Fonte de verdade = apps/web.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arquivos = ['package.json', 'apps/web/package.json', 'apps/api/package.json'].map((p) => resolve(raiz, p));

// Versão atual = a do apps/web (é a exibida no app). Incrementa o patch.
const web = JSON.parse(readFileSync(resolve(raiz, 'apps/web/package.json'), 'utf-8'));
const partes = String(web.version || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
while (partes.length < 3) partes.push(0);
partes[2] += 1;
const nova = partes.slice(0, 3).join('.');

for (const arq of arquivos) {
  try {
    const conteudo = readFileSync(arq, 'utf-8');
    const novo = conteudo.replace(/("version"\s*:\s*")[^"]+(")/, `$1${nova}$2`);
    writeFileSync(arq, novo);
    console.log('  versao -> ' + nova + '  (' + arq + ')');
  } catch (e) {
    console.error('  *** nao consegui atualizar ' + arq + ': ' + ((e && e.message) || e));
  }
}
console.log('Nova versao: ' + nova);
