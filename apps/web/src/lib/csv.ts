import { baixarArquivo } from './download.js';

export function baixarCsv(nome: string, cabecalho: string[], linhas: (string | number)[][]): void {
  const esc = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
  const conteudo = [cabecalho, ...linhas].map((l) => l.map(esc).join(';')).join('\n');
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  void baixarArquivo(nome + '.csv', blob);
}
