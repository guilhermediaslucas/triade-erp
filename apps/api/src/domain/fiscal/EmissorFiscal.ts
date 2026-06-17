// Porta (domínio) para emissão de NF-e. O adapter (FocusNFeEmissor) traduz estes
// DTOs neutros para o JSON específico do provedor — o domínio não conhece a Focus.

import type { AmbienteFiscal, RegimeTributario } from './ConfigFiscal.js';

export interface EmitenteNF {
  cnpj: string;
  inscricaoEstadual: string;
  nome: string;          // razão social
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  regime: RegimeTributario;
}

export interface DestinatarioNF {
  nome: string;
  documento: string;      // CNPJ (PJ) ou CPF (PF), só dígitos
  pessoaFisica: boolean;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string | null;
  // 7B: destinatário sempre tratado como NÃO contribuinte (indicador 9, sem IE).
}

export interface ItemNF {
  numeroItem: number;
  codigo: string;
  descricao: string;
  ncm: string;            // 8 dígitos
  cfop: string;           // 4 dígitos
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorBruto: number;
  icmsOrigem: number;     // 0..8
  icmsCst: string;        // CSOSN (Simples) OU CST de ICMS (Normal)
  icmsAliquota: number;   // > 0 só no Regime Normal (CST tributado)
  pisCst: string;
  cofinsCst: string;
}

export interface DadosEmissaoNF {
  naturezaOperacao: string;
  emitente: EmitenteNF;
  destinatario: DestinatarioNF;
  itens: ItemNF[];
  valorProdutos: number;
  valorFrete: number;
  valorTotal: number;
}

// Resposta normalizada do provedor (independe dos nomes de campo da Focus).
export interface RespostaFiscal {
  status: string;             // cru do provedor: processando_autorizacao | autorizado | erro_autorizacao | rejeitado | cancelado | ...
  statusSefaz: string | null;
  mensagemSefaz: string | null;
  chave: string | null;
  numero: string | null;
  serie: string | null;
  caminhoXml: string | null;
  caminhoDanfe: string | null;
}

export interface ArquivoFiscal { conteudo: Buffer; tipo: string; }

export interface EmissorFiscal {
  emitir(ambiente: AmbienteFiscal, token: string, ref: string, dados: DadosEmissaoNF): Promise<RespostaFiscal>;
  consultar(ambiente: AmbienteFiscal, token: string, ref: string): Promise<RespostaFiscal>;
  cancelar(ambiente: AmbienteFiscal, token: string, ref: string, justificativa: string): Promise<RespostaFiscal>;
  // Baixa um arquivo (DANFE/XML) a partir do caminho relativo devolvido pelo provedor.
  baixarArquivo(ambiente: AmbienteFiscal, token: string, caminhoRelativo: string): Promise<ArquivoFiscal>;
}
