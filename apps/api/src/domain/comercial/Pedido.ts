export type StatusPedido =
  | 'orcamento' | 'aguardando_pagamento' | 'aprovado' | 'separacao' | 'expedido' | 'entregue' | 'cancelado';

export interface ItemLote {
  lote: string;
  validade: string | null; // ISO YYYY-MM-DD
}

export interface PedidoItem {
  id?: string;
  produtoId: string | null;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  lotes?: ItemLote[]; // lotes consumidos na separação (rastreabilidade); vazio antes de separar
}

export interface Pedido {
  id: string;
  numero: number;
  clienteId: string | null;
  clienteNome: string | null;
  vendedorId: string | null;
  vendedorNome: string | null;
  status: StatusPedido;
  formaPagamento: string | null;
  observacao: string | null;
  enderecoEntrega: string | null;
  formaEntrega: string;
  motoboyId: string | null;
  motoboyNome: string | null;
  distanciaKm: number | null;
  formaEnvio: string | null;          // definida ao expedir (catálogo Formas de entrega)
  formaEnvioDetalhe: string | null;   // ex.: código de rastreio / nome do motoboy
  entregueEm: string | null;          // data de entrega (definida ao mover p/ Entregue)
  separadoPor: string | null;         // log: quem separou o pedido
  separadoEm: string | null;          // log: data/hora ISO da separação
  expedidoPor: string | null;         // log: quem expediu o pedido
  expedidoEm: string | null;          // log: data/hora ISO da expedição
  recebidoPor: string | null;         // quem recebeu na entrega (opcional)
  subtotal: number;
  desconto: number;       // desconto no pedido por campanha de total (abate do total)
  frete: number;          // frete COBRADO do cliente (entra no total)
  freteCusto: number;     // custo real do frete para a empresa (absorvido = custo - cobrado)
  total: number;
  condicaoParcelas: number;
  condicaoIntervalo: number;
  criadoEm: Date;
  itens: PedidoItem[];
  titulos?: PedidoTituloResumo[];      // títulos financeiros do pedido (preenchido no detalhe)
}

// Resumo do(s) título(s) a receber do pedido — bloco Financeiro do detalhe.
export interface PedidoTituloResumo {
  id: string;
  tipo: 'receber' | 'pagar';
  numero: string;
  valor: number;
  vencimento: string;
  status: 'aberto' | 'pago';
  pagoEm: string | null;
  formaPagamento: string | null;
}

export interface PedidoResumo {
  id: string; numero: number; clienteNome: string | null; vendedorNome: string | null;
  status: StatusPedido; total: number; desconto: number; criadoEm: Date; formaEntrega: string; formaPagamento: string | null;
}

export interface NovoPedido {
  clienteId: string | null;
  vendedorId: string | null;
  formaPagamento: string | null;
  observacao: string | null;
  enderecoEntrega: string | null;
  formaEntrega: string;
  motoboyId: string | null;
  distanciaKm: number | null;
  frete: number;          // cobrado do cliente
  freteCusto: number;     // custo real para a empresa
  freteMotoboy: number;   // quanto a empresa paga ao motoboy (conforme 'absorve' da campanha)
  desconto: number;       // desconto no pedido por campanha de total
  itens: PedidoItem[];
  subtotal: number;
  total: number;
  condicaoParcelas: number;
  condicaoIntervalo: number;
}

// Histórico de troca de forma de entrega na expedição (quem mudou, de→para, motivo).
export interface HistFormaEntrega { de: string; para: string; justificativa: string; usuarioNome: string | null; criadoEm: string; }

export interface PedidoRepository {
  proximoNumero(schema: string): Promise<number>;
  criar(schema: string, numero: number, p: NovoPedido): Promise<string>;
  editar(schema: string, id: string, p: NovoPedido): Promise<void>;
  listar(schema: string): Promise<PedidoResumo[]>;
  buscarPorId(schema: string, id: string): Promise<Pedido | null>;
  buscarPorNumero(schema: string, numero: number): Promise<Pedido | null>;
  mudarStatus(schema: string, id: string, status: StatusPedido): Promise<void>;
  definirExpedicao(schema: string, id: string, formaEnvio: string, detalhe: string | null): Promise<void>;
  definirMotoboy(schema: string, id: string, motoboyId: string): Promise<void>;
  alterarFormaEntrega(schema: string, id: string, forma: string, motoboyId: string | null, hist: HistFormaEntrega): Promise<void>;
  historicoFormaEntrega(schema: string, id: string): Promise<HistFormaEntrega[]>;
  // Re-entrega: troca o endereço e reabre a entrega (status volta a aguardando, novo link do motoboy).
  reabrirEntrega(schema: string, id: string, endereco: string): Promise<void>;
  definirEntrega(schema: string, id: string, entregueEm: string, recebidoPor: string | null): Promise<void>;
  logSeparacao(schema: string, id: string, ator: string | null): Promise<void>;
  logExpedicao(schema: string, id: string, ator: string | null): Promise<void>;
  somaEmAberto(schema: string, clienteId: string, excetoPedidoId: string): Promise<number>;
}
