// Gera um .xlsx real (OOXML) sem dependência externa: monta o ZIP (método "store",
// sem compressão) com as partes mínimas + estilos (cabeçalho em negrito).
// Mesma assinatura do baixarCsv para reaproveitar os dados já montados nas telas.

const ENC = new TextEncoder();

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function escXml(v: string | number): string {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Converte índice 0-based de coluna para letra(s) do Excel (0->A, 26->AA).
function colLetra(n: number): string {
  let s = '';
  n += 1;
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function planilhaXml(cabecalho: string[], linhas: (string | number)[][]): string {
  const linha = (cells: (string | number)[], r: number, header: boolean): string => {
    const tds = cells.map((v, c) => {
      const ref = colLetra(c) + r;
      const num = typeof v === 'number' && Number.isFinite(v);
      const st = header ? ' s="1"' : '';
      if (num) return `<c r="${ref}"${st}><v>${v}</v></c>`;
      return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${escXml(v)}</t></is></c>`;
    }).join('');
    return `<row r="${r}">${tds}</row>`;
  };
  const body = [linha(cabecalho, 1, true), ...linhas.map((l, i) => linha(l, i + 2, false))].join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4F46E5"/></patternFill></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
</styleSheet>`;

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const WB_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

function zip(arquivos: { nome: string; dados: Uint8Array }[]): Uint8Array {
  const locais: Uint8Array[] = [];
  const centrais: Uint8Array[] = [];
  let offset = 0;
  const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff];
  const u32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];
  for (const a of arquivos) {
    const nome = ENC.encode(a.nome);
    const crc = crc32(a.dados);
    const tam = a.dados.length;
    const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(tam), ...u32(tam), ...u16(nome.length), ...u16(0)];
    const localBuf = new Uint8Array(local.length + nome.length + tam);
    localBuf.set(local, 0); localBuf.set(nome, local.length); localBuf.set(a.dados, local.length + nome.length);
    locais.push(localBuf);
    const central = [...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(tam), ...u32(tam), ...u16(nome.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)];
    const centralBuf = new Uint8Array(central.length + nome.length);
    centralBuf.set(central, 0); centralBuf.set(nome, central.length);
    centrais.push(centralBuf);
    offset += localBuf.length;
  }
  const centralSize = centrais.reduce((a, b) => a + b.length, 0);
  const eocd = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(arquivos.length), ...u16(arquivos.length), ...u32(centralSize), ...u32(offset), ...u16(0)]);
  const total = locais.reduce((a, b) => a + b.length, 0) + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const b of locais) { out.set(b, p); p += b.length; }
  for (const b of centrais) { out.set(b, p); p += b.length; }
  out.set(eocd, p);
  return out;
}

export function gerarXlsx(cabecalho: string[], linhas: (string | number)[][]): Uint8Array {
  const txt = (s: string) => ENC.encode(s);
  return zip([
    { nome: '[Content_Types].xml', dados: txt(CONTENT_TYPES) },
    { nome: '_rels/.rels', dados: txt(RELS) },
    { nome: 'xl/workbook.xml', dados: txt(WORKBOOK) },
    { nome: 'xl/_rels/workbook.xml.rels', dados: txt(WB_RELS) },
    { nome: 'xl/styles.xml', dados: txt(STYLES) },
    { nome: 'xl/worksheets/sheet1.xml', dados: txt(planilhaXml(cabecalho, linhas)) },
  ]);
}

export function baixarExcel(nome: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const bytes = gerarXlsx(cabecalho, linhas);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome + '.xlsx'; a.click();
  URL.revokeObjectURL(url);
}
