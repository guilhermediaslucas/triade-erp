// Ajusta o projeto Android gerado pelo Capacitor:
//  - garante a permissao de CAMERA no AndroidManifest.xml (leitor de codigo de barras).
// Idempotente: pode rodar varias vezes sem duplicar nada.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = resolve(raiz, 'apps/web/android/app/src/main/AndroidManifest.xml');

if (!existsSync(manifest)) {
  console.error('[cap-fix] AndroidManifest.xml nao encontrado. Rode "npx cap add android" antes.');
  process.exit(1);
}

let xml = readFileSync(manifest, 'utf8');
const permCamera = '<uses-permission android:name="android.permission.CAMERA" />';
const featCamera = '<uses-feature android:name="android.hardware.camera" android:required="false" />';

let mudou = false;
if (!xml.includes('android.permission.CAMERA')) {
  // Insere logo apos a tag <manifest ...>
  xml = xml.replace(/(<manifest[^>]*>)/, `$1\n    ${permCamera}\n    ${featCamera}`);
  mudou = true;
  console.log('[cap-fix] Permissao de CAMERA adicionada.');
} else {
  console.log('[cap-fix] Permissao de CAMERA ja presente.');
}

if (mudou) writeFileSync(manifest, xml, 'utf8');
console.log('[cap-fix] OK.');
