// Gera um .xlsx real (OOXML) com formatação de relatório:
// logo da empresa (esquerda) + logo TRÍADE ERP (direita, imagem gerada), título,
// linha de subtítulo (período filtrado · empresa · gerado em), cabeçalho na cor da
// empresa, linhas zebradas, colunas de valor em R$, largura de coluna ajustada ao
// conteúdo e linha de Total. Sem dependência externa.

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
const fmtDataBR = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR'); };

// Rótulo de período para o cabeçalho do relatório a partir das datas do filtro (ISO).
export function rotuloPeriodo(de?: string | null, ate?: string | null): string {
  if (de && ate) return fmtDataBR(de) + ' a ' + fmtDataBR(ate);
  if (de) return 'a partir de ' + fmtDataBR(de);
  if (ate) return 'até ' + fmtDataBR(ate);
  return 'Todos os períodos';
}

// ---- Logos (imagens embutidas) ----
interface Img { ext: string; mime: string; bytes: Uint8Array; col: number; colOff: number; cx: number; cy: number; }

function dataUriParaBytes(uri: string): { ext: string; mime: string; bytes: Uint8Array } | null {
  const m = /^data:image\/(png|jpe?g|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(uri);
  if (!m) return null;
  const ext = (m[1]!.toLowerCase() === 'jpeg' || m[1]!.toLowerCase() === 'jpg') ? 'jpg' : m[1]!.toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const bin = atob(m[2]!);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { ext, mime, bytes };
}

// Logo da empresa (data URI raster) persistida pelo BrandingContext.
function logoEmpresa(): { ext: string; mime: string; bytes: Uint8Array } | null {
  try { const uri = localStorage.getItem('triade_logo'); return uri ? dataUriParaBytes(uri) : null; }
  catch { return null; }
}

// Logo TRÍADE ERP gerada como PNG (canvas) — wordmark com o Í vermelho.
function logoTriade(): { ext: string; mime: string; bytes: Uint8Array } | null {
  try {
    const s = 2, W = 150, H = 38;
    const cv = document.createElement('canvas');
    cv.width = W * s; cv.height = H * s;
    const ctx = cv.getContext('2d');
    if (!ctx) return null;
    ctx.scale(s, s);
    ctx.textBaseline = 'middle';
    const y = H / 2; let x = 1;
    const big = '700 24px "Segoe UI", Arial, sans-serif';
    const seg = (txt: string, cor: string) => { ctx.font = big; ctx.fillStyle = cor; ctx.fillText(txt, x, y); x += ctx.measureText(txt).width; };
    seg('TR', '#1f2430'); seg('Í', '#e1483b'); seg('ADE', '#1f2430');
    ctx.font = '700 12px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = '#1f2430'; ctx.fillText('ERP', x + 4, y + 1);
    const d = dataUriParaBytes(cv.toDataURL('image/png'));
    return d;
  } catch { return null; }
}

function montarImagens(ncols: number): Img[] {
  const imgs: Img[] = [];
  const emp = logoEmpresa();
  if (emp) imgs.push({ ...emp, col: 0, colOff: 45720, cx: 1400000, cy: 360000 });
  const tri = logoTriade();
  if (tri) imgs.push({ ...tri, col: Math.max(1, ncols - 2), colOff: 0, cx: 1350000, cy: 342000 });
  return imgs;
}

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

function colsXml(cabecalho: string[], linhas: (string | number)[][], valCol: boolean[]): string {
  const larg = cabecalho.map((h, c) => {
    let max = String(h).length;
    for (const ln of linhas) {
      const v = ln[c];
      const s = typeof v === 'number' && Number.isFinite(v)
        ? (valCol[c] ? 'R$ ' + v.toFixed(2) : String(v))
        : String(v ?? '');
      if (s.length > max) max = s.length;
    }
    return Math.min(60, Math.max(10, max + 2));
  });
  return '<cols>' + larg.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>';
}

function planilhaXml(titulo: string, cabecalho: string[], linhas: (string | number)[][], imgs: Img[], periodo?: string): string {
  const ncols = Math.max(1, cabecalho.length);
  const lastCol = colLetra(ncols - 1);
  const valCol = cabecalho.map((h) => ehValorCol(h));
  const emp = empresaNome();
  const dt = new Date().toLocaleString('pt-BR');
  const sub = (periodo ? 'Período: ' + periodo + ' · ' : '') + (emp ? emp + ' · ' : '') + 'Gerado em ' + dt;

  const cTexto = (ref: string, v: string | number, s: number) => `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
  const cNum = (ref: string, v: number, s: number) => `<c r="${ref}" s="${s}"><v>${v}</v></c>`;

  // Linha 1 = faixa das logos (imagens flutuam); 2 = título; 3 = subtítulo; 4 = colunas; dados a partir da 5.
  const rows: string[] = [];
  rows.push(`<row r="1" ht="${imgs.length ? 30 : 8}" customHeight="1"></row>`);
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
  const drawing = imgs.length ? '<drawing r:id="rId1"/>' : '';
  const cols = colsXml(cabecalho, linhas, valCol);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>${cols}<sheetData>${rows.join('')}</sheetData>${merges}${drawing}</worksheet>`;
}

function contentTypes(imgs: Img[]): string {
  let extra = '';
  if (imgs.length) {
    const exts = Array.from(new Set(imgs.map((im) => im.ext)));
    extra = exts.map((e) => `<Default Extension="${e}" ContentType="image/${e === 'jpg' ? 'jpeg' : e}"/>`).join('')
      + '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>';
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${extra}<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
}
function drawingXml(imgs: Img[]): string {
  const anchors = imgs.map((im, i) => `<xdr:oneCellAnchor><xdr:from><xdr:col>${im.col}</xdr:col><xdr:colOff>${im.colOff}</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>18000</xdr:rowOff></xdr:from><xdr:ext cx="${im.cx}" cy="${im.cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${i + 2}" name="Logo${i + 1}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId${i + 1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors}</xdr:wsDr>`;
}
const SHEET_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`;
function drawingRels(imgs: Img[]): string {
  const rels = imgs.map((im, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.${im.ext}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}
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

export interface OpcoesExcel { periodo?: string }

export function gerarXlsx(cabecalho: string[], linhas: (string | number)[][], titulo = 'Relatório', opcoes?: OpcoesExcel): Uint8Array {
  const txt = (s: string) => ENC.encode(s);
  const imgs = montarImagens(Math.max(1, cabecalho.length));
  const partes: { nome: string; dados: Uint8Array }[] = [
    { nome: '[Content_Types].xml', dados: txt(contentTypes(imgs)) },
    { nome: '_rels/.rels', dados: txt(RELS) },
    { nome: 'xl/workbook.xml', dados: txt(WORKBOOK) },
    { nome: 'xl/_rels/workbook.xml.rels', dados: txt(WB_RELS) },
    { nome: 'xl/styles.xml', dados: txt(styles(accentHex())) },
    { nome: 'xl/worksheets/sheet1.xml', dados: txt(planilhaXml(titulo, cabecalho, linhas, imgs, opcoes?.periodo)) },
  ];
  if (imgs.length) {
    partes.push(
      { nome: 'xl/worksheets/_rels/sheet1.xml.rels', dados: txt(SHEET_RELS) },
      { nome: 'xl/drawings/drawing1.xml', dados: txt(drawingXml(imgs)) },
      { nome: 'xl/drawings/_rels/drawing1.xml.rels', dados: txt(drawingRels(imgs)) },
    );
    imgs.forEach((im, i) => partes.push({ nome: 'xl/media/image' + (i + 1) + '.' + im.ext, dados: im.bytes }));
  }
  return zip(partes);
}

export function baixarExcel(nome: string, cabecalho: string[], linhas: (string | number)[][], opcoes?: OpcoesExcel): void {
  const bytes = gerarXlsx(cabecalho, linhas, humaniza(nome), opcoes);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome + '.xlsx'; a.click();
  URL.revokeObjectURL(url);
}
