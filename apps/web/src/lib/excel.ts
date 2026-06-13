// Gera um .xlsx real (OOXML) com formatação de relatório (igual ao mockup):
// título + subtítulo (empresa · data), cabeçalho com fundo na cor da empresa,
// linhas zebradas, colunas de valor em R$ alinhadas à direita e linha de Total.
// Sem dependência externa. Mesma assinatura usada pelas telas.

const ENC = new TextEncoder();

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}
function esc(v: string | number): string {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function colLetra(n: number): string {
  let s = ''; n += 1;
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
function empresaNome(): string {
  try {
    const raw = localStorage.getItem('triade_sessao') ?? sessionStorage.getItem('triade_sessao');
    if (raw) { const s = JSON.parse(raw); return s.empresaFantasia || ''; }
  } catch { /* ignora */ }
  return '';
}
function accentHex(): string {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
  } catch { /* ignora */ }
  return '4F46E5';
}
function humaniza(s: string): string { return s.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()); }
function ehValorCol(h: string): boolean { return /valor|r\$|total|saldo|pre[çc]o|comiss|montante|receb|pagar/i.test(h); }

function styles(accent: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot;\\ #,##0.00"/></numFmts>
<fonts count="6">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FF${accent}"/><name val="Calibri"/></font>
<font><sz val="9"/><color rgb="FF6B7280"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="13"/><color rgb="FFDC2626"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF${accent}"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/></patternFill></fill>
</fills>
<borders count="3">
<border/>
<border><bottom style="thin"><color rgb="FFE5E7EB"/></bottom></border>
<border><top style="medium"><color rgb="FF${accent}"/></top></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="12">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
<xf numFmtId="164" fontId="4" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function planilhaXml(titulo: string, cabecalho: string[], linhas: (string | number)[][], temImagem: boolean): string {
  const ncols = Math.max(1, cabecalho.length);
  const lastCol = colLetra(ncols - 1);
  const valCol = cabecalho.map((h) => ehValorCol(h));
  const emp = empresaNome();
  const agora = new Date();
  const dt = agora.toLocaleString('pt-BR');
  const sub = (emp ? emp + ' · ' : '') + 'Gerado em ' + dt;

  const cTexto = (ref: string, v: string | number, s: number) => `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
  const cNum = (ref: string, v: number, s: number) => `<c r="${ref}" s="${s}"><v>${v}</v></c>`;

  // Cabeçalho de marca: linha 1 = empresa (esquerda) + TRÍADE ERP (direita).
  // Quando há logo (imagem), a esquerda fica para a imagem (flutua sobre A1).
  // Linha 2 = título (mesclada), linha 3 = subtítulo (mesclada), linha 4 = colunas, dados a partir da 5.
  const rows: string[] = [];
  const cantoEsq = (!temImagem && emp) ? cTexto('A1', emp, 10) : '';
  const triade = ncols >= 2 ? cTexto(lastCol + '1', 'TRÍADE ERP', 11) : '';
  rows.push(`<row r="1" ht="${temImagem ? 34 : 20}" customHeight="1">${cantoEsq}${triade}</row>`);
  rows.push(`<row r="2">${cTexto('A2', titulo, 2)}</row>`);
  rows.push(`<row r="3">${cTexto('A3', sub, 3)}</row>`);
  rows.push(`<row r="4">${cabecalho.map((h, c) => cTexto(colLetra(c) + '4', h, 1)).join('')}</row>`);

  const somas = new Array(ncols).fill(0);
  linhas.forEach((linha, i) => {
    const r = i + 5;
    const zebra = i % 2 === 1;
    const cells = linha.map((v, c) => {
      const ref = colLetra(c) + r;
      const num = typeof v === 'number' && Number.isFinite(v);
      if (num) { if (valCol[c]) somas[c] += v; return cNum(ref, v, valCol[c] ? (zebra ? 7 : 5) : (zebra ? 6 : 4)); }
      return cTexto(ref, v, zebra ? 6 : 4);
    }).join('');
    rows.push(`<row r="${r}">${cells}</row>`);
  });

  // Linha de Total nas colunas de valor.
  const temTotal = valCol.some(Boolean) && linhas.length > 0;
  if (temTotal) {
    const r = linhas.length + 5;
    const cells = cabecalho.map((_, c) => {
      const ref = colLetra(c) + r;
      if (valCol[c]) return cNum(ref, Math.round(somas[c] * 100) / 100, 9);
      return c === 0 ? cTexto(ref, 'Total', 8) : `<c r="${ref}" s="8"/>`;
    }).join('');
    rows.push(`<row r="${r}">${cells}</row>`);
  }

  const merges = ncols >= 2 ? `<mergeCells count="2"><mergeCell ref="A2:${lastCol}2"/><mergeCell ref="A3:${lastCol}3"/></mergeCells>` : '';
  const drawing = temImagem ? '<drawing r:id="rId1"/>' : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews><sheetData>${rows.join('')}</sheetData>${merges}${drawing}</worksheet>`;
}

interface LogoImg { ext: string; mime: string; bytes: Uint8Array; }
// Lê a logo da empresa (data URI raster) persistida pelo BrandingContext.
function parseLogo(): LogoImg | null {
  try {
    const uri = localStorage.getItem('triade_logo');
    if (!uri) return null;
    const m = /^data:image\/(png|jpe?g|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(uri);
    if (!m) return null; // svg/sem logo → cabeçalho fica em texto
    const ext = m[1]!.toLowerCase() === 'jpeg' || m[1]!.toLowerCase() === 'jpg' ? 'jpg' : m[1]!.toLowerCase();
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    const bin = atob(m[2]!);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ext, mime, bytes };
  } catch { return null; }
}

function contentTypes(img: LogoImg | null): string {
  const extra = img
    ? `<Default Extension="${img.ext}" ContentType="image/${img.mime}"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${extra}<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
}
const DRAWING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>45720</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>27432</xdr:rowOff></xdr:from><xdr:ext cx="1500000" cy="400000"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="LogoEmpresa"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1500000" cy="400000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>`;
const SHEET_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`;
const drawingRels = (img: LogoImg) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.${img.ext}"/></Relationships>`;
const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
const WB_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

function zip(arquivos: { nome: string; dados: Uint8Array }[]): Uint8Array {
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

export function gerarXlsx(cabecalho: string[], linhas: (string | number)[][], titulo = 'Relatório'): Uint8Array {
  const txt = (s: string) => ENC.encode(s);
  const img = parseLogo();
  const partes: { nome: string; dados: Uint8Array }[] = [
    { nome: '[Content_Types].xml', dados: txt(contentTypes(img)) },
    { nome: '_rels/.rels', dados: txt(RELS) },
    { nome: 'xl/workbook.xml', dados: txt(WORKBOOK) },
    { nome: 'xl/_rels/workbook.xml.rels', dados: txt(WB_RELS) },
    { nome: 'xl/styles.xml', dados: txt(styles(accentHex())) },
    { nome: 'xl/worksheets/sheet1.xml', dados: txt(planilhaXml(titulo, cabecalho, linhas, !!img)) },
  ];
  if (img) {
    partes.push(
      { nome: 'xl/worksheets/_rels/sheet1.xml.rels', dados: txt(SHEET_RELS) },
      { nome: 'xl/drawings/drawing1.xml', dados: txt(DRAWING_XML) },
      { nome: 'xl/drawings/_rels/drawing1.xml.rels', dados: txt(drawingRels(img)) },
      { nome: 'xl/media/image1.' + img.ext, dados: img.bytes },
    );
  }
  return zip(partes);
}

export function baixarExcel(nome: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const bytes = gerarXlsx(cabecalho, linhas, humaniza(nome));
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome + '.xlsx'; a.click();
  URL.revokeObjectURL(url);
}
