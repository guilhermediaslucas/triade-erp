import { Capacitor } from '@capacitor/core';

// No app (Capacitor/WebView Android) o truque `<a download>` + Blob URL e o
// `window.open(blobUrl)` NÃO baixam/abrem nada — por isso Excel/CSV e os
// comprovantes "não funcionavam pelo app". Aqui, quando rodando como app
// nativo, gravamos o arquivo no Filesystem e abrimos a folha de
// compartilhamento (que permite abrir no visualizador ou salvar). Na web,
// segue o comportamento normal (âncora / nova aba).

function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => { const s = String(r.result); resolve(s.slice(s.indexOf(',') + 1)); };
    r.onerror = () => reject(new Error('leitura falhou'));
    r.readAsDataURL(blob);
  });
}

async function salvarECompartilhar(nomeComExt: string, blob: Blob): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const base64 = await blobParaBase64(blob);
    const seguro = nomeComExt.replace(/[^\w.\-() ]+/g, '_');
    const escrito = await Filesystem.writeFile({ path: seguro, data: base64, directory: Directory.Cache });
    await Share.share({ title: nomeComExt, url: escrito.uri });
    return true;
  } catch (e) {
    console.warn('[download] modo nativo falhou, caindo no fallback web:', e);
    return false;
  }
}

// Baixa/salva um arquivo (Excel, CSV, comprovante…). Funciona na web e no app.
export async function baixarArquivo(nomeComExt: string, blob: Blob): Promise<void> {
  if (await salvarECompartilhar(nomeComExt, blob)) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nomeComExt; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Abre um arquivo para visualização. Web: nova aba; app: folha de compartilhamento.
export async function abrirArquivo(nomeComExt: string, blob: Blob): Promise<void> {
  if (await salvarECompartilhar(nomeComExt, blob)) return;
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
