// Nota fiscal emitida (ou em processamento) ligada a um pedido.

export type StatusNota = 'processando' | 'autorizado' | 'erro' | 'cancelado';

export interface NotaFiscal {
  id: string;
  pedidoId: string;
  ref: string;
  status: StatusNota;
  statusFocus: string | null;
  statusSefaz: string | null;
  mensagemSefaz: string | null;
  chave: string | null;
  numero: string | null;
  serie: string | null;
  caminhoDanfe: string | null;
  caminhoXml: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Campos atualizáveis após consultar/cancelar.
export interface AtualizacaoNota {
  status: StatusNota;
  statusFocus: string | null;
  statusSefaz: string | null;
  mensagemSefaz: string | null;
  chave: string | null;
  numero: string | null;
  serie: string | null;
  caminhoDanfe: string | null;
  caminhoXml: string | null;
}

export interface NotaFiscalRepository {
  buscarPorPedido(schema: string, pedidoId: string): Promise<NotaFiscal | null>;
  buscarPorRef(schema: string, ref: string): Promise<NotaFiscal | null>;
  criar(schema: string, pedidoId: string, ref: string): Promise<NotaFiscal>;
  atualizar(schema: string, ref: string, dados: AtualizacaoNota): Promise<void>;
}
