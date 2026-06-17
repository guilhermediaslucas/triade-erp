// Gera um arquivo .zip (método "store", sem compressão) no navegador, sem
// dependência externa. Usado para baixar vários XMLs de NF-e de uma vez.
import { baixarArquivo } from './download.js';

const ENC = new TextEncoder();

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

export interface ArquivoZip { nome: string; dados: Uint8Array; }

export function gerarZip(arquivos: ArquivoZip[]): Uint8Array {
  const locais: Uint8Array[] = []; const centrais: Uint8Array[] = []; let offset = 0;
  const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff];
  const u32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];
  for (const a of arquivos) {
    const nome = ENC.encode(a.nome); const crc = crc32(a.dados); const tam = a.dados.length;
    const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(tam), ...u32(tam), ...u16(nome.length), ...u16(0)];
    const localBuf = new Uint8Array(local.length + nome.length + tam);
    localBuf.set(local, 0); localBuf.set(nome, local.length); localBuf.set(a.dados, local.length + nome.length);
    locais.push(localBuf);
    const central = [...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(tam), ...u32(tam), ...u16(nome.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)];
    const centralBuf = new Uint8Array(central.length + nome.length);
    centralBuf.set(central, 0); centralBuf.set(nome, central.length);
    centrais.push(centralBuf); offset += localBuf.length;
  }
  const centralSize = centrais.reduce((a, b) => a + b.length, 0);
  const eocd = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(arquivos.length), ...u16(arquivos.length), ...u32(centralSize), ...u32(offset), ...u16(0)]);
  const total = locais.reduce((a, b) => a + b.length, 0) + centralSize + eocd.length;
  const out = new Uint8Array(total); let p = 0;
  for (const b of locais) { out.set(b, p); p += b.length; }
  for (const b of centrais) { out.set(b, p); p += b.length; }
  out.set(eocd, p);
  return out;
}

export async function baixarZip(nome: string, arquivos: ArquivoZip[]): Promise<void> {
  const bytes = gerarZip(arquivos);
  await baixarArquivo(nome.endsWith('.zip') ? nome : nome + '.zip', new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' }));
}
