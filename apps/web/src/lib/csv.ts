export function baixarCsv(nome: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const esc = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
  const conteudo = [cabecalho, ...linhas].map((l) => l.map(esc).join(';')).join('\n');
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome + '.csv'; a.click();
  URL.revokeObjectURL(url);
}
