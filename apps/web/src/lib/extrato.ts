// Leitura de extrato bancário no navegador (sem dependência externa).
// Suporta OFX (padrão dos bancos BR) e CSV simples (data; valor; descrição).
// Convenção de sinal: crédito/entrada = positivo, débito/saída = negativo.

export interface TxExtrato { data: string; valor: number; descricao: string; }
export interface ExtratoLido { txs: TxExtrato[]; saldoFinal: number | null; }

function isoDeData(bruto: string): string {
  const s = bruto.trim();
  // OFX: YYYYMMDD (com possível hora/zona depois)
  const ofx = s.match(/^(\d{4})(\d{2})(\d{2})/);
  if (ofx) return `${ofx[1] ?? ''}-${ofx[2] ?? ''}-${ofx[3] ?? ''}`;
  // ISO YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1] ?? ''}-${iso[2] ?? ''}-${iso[3] ?? ''}`;
  // BR DD/MM/YYYY
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3] ?? ''}-${br[2] ?? ''}-${br[1] ?? ''}`;
  return '';
}

function numeroBR(bruto: string): number {
  let s = bruto.trim().replace(/[R$\s]/g, '');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56
  else if (s.includes(',')) s = s.replace(',', '.'); // 1234,56
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function lerOfx(texto: string): ExtratoLido {
  const txs: TxExtrato[] = [];
  const blocos = texto.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
  const campo = (b: string, tag: string) => {
    const m = b.match(new RegExp(`<${tag}>([^<\\r\\n]*)`, 'i'));
    return m && m[1] != null ? m[1].trim() : '';
  };
  for (const b of blocos) {
    const data = isoDeData(campo(b, 'DTPOSTED'));
    const valor = numeroBR(campo(b, 'TRNAMT'));
    const descricao = (campo(b, 'MEMO') || campo(b, 'NAME') || '').trim();
    if (data && Number.isFinite(valor)) txs.push({ data, valor, descricao });
  }
  const saldoM = texto.match(/<LEDGERBAL>[\s\S]*?<BALAMT>([^<\r\n]*)/i);
  const saldoFinal = saldoM && saldoM[1] != null ? numeroBR(saldoM[1]) : null;
  return { txs, saldoFinal: saldoFinal != null && Number.isFinite(saldoFinal) ? saldoFinal : null };
}

function lerCsv(texto: string): ExtratoLido {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const delim = (linhas[0]?.split(';').length ?? 1) > (linhas[0]?.split(',').length ?? 1) ? ';' : ',';
  const txs: TxExtrato[] = [];
  for (const l of linhas) {
    const cols = l.split(delim).map((c) => c.replace(/^"|"$/g, '').trim());
    let data = '', valor = NaN, desc = '';
    for (const c of cols) {
      if (!data) { const d = isoDeData(c); if (d) { data = d; continue; } }
      if (!Number.isFinite(valor)) { const n = numeroBR(c); if (Number.isFinite(n) && /[\d]/.test(c) && !/^\d{2}\/\d{2}\/\d{4}$/.test(c)) { valor = n; continue; } }
      if (c && !/^[\d.,/\sR$-]+$/.test(c)) desc = desc ? desc + ' ' + c : c;
    }
    if (data && Number.isFinite(valor)) txs.push({ data, valor, descricao: desc });
  }
  return { txs, saldoFinal: null };
}

export function lerExtrato(texto: string, nomeArquivo: string): ExtratoLido {
  const ehOfx = /\.ofx$/i.test(nomeArquivo) || /<OFX>|<STMTTRN>/i.test(texto);
  return ehOfx ? lerOfx(texto) : lerCsv(texto);
}
