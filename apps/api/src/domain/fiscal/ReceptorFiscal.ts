import type { AmbienteFiscal } from './ConfigFiscal.js';

// Item de uma NF-e recebida (compra). `codigo` = cProd do fornecedor (usado p/ lembrar o
// mapeamento item→produto do Tríade por CNPJ do emitente).
export interface ItemNfeRecebida {
  codigo: string;
  descricao: string;
  ncm: string | null;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

// NF-e emitida contra o CNPJ da empresa (destinatário), capturada na SEFAZ via Focus.
export interface NfeRecebida {
  chave: string;             // 44 dígitos
  emitenteCnpj: string | null;
  emitenteNome: string | null;
  numero: string | null;
  serie: string | null;
  emissao: string | null;    // ISO date (YYYY-MM-DD)
  valor: number;             // valor total da nota
  itens: ItemNfeRecebida[];  // preenchido após ciência (XML completo)
}

// Porta (Ports & Adapters): consulta as NF-e recebidas do CNPJ dono do token,
// dando ciência automática para liberar o XML/itens completos. Implementação isola o Focus.
export interface ReceptorFiscal {
  configurado(): boolean;
  listar(ambiente: AmbienteFiscal, token: string): Promise<NfeRecebida[]>;
}
