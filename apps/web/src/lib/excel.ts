// Exporta um .xls formatado (SpreadsheetML 2003) — sem dependência externa.
// Cabeçalho em negrito, células numéricas com formato de número, abre direto no Excel.
// Mesma assinatura do baixarCsv para reaproveitar os dados já montados nas telas.
export function baixarExcel(nome: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const esc = (v: string | number) => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const celula = (v: string | number) => {
    const num = typeof v === 'number' && Number.isFinite(v);
    return `<Cell${num ? ' ss:StyleID="num"' : ''}><Data ss:Type="${num ? 'Number' : 'String'}">${esc(v)}</Data></Cell>`;
  };
  const head = `<Row>${cabecalho.map((h) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join('')}</Row>`;
  const body = linhas.map((l) => `<Row>${l.map(celula).join('')}</Row>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/></Style>
<Style ss:ID="num"><NumberFormat ss:Format="#,##0.00"/></Style>
</Styles>
<Worksheet ss:Name="Dados"><Table>${head}${body}</Table></Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome + '.xls'; a.click();
  URL.revokeObjectURL(url);
}
