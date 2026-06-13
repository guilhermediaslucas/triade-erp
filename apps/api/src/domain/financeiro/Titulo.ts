export type TipoTitulo = 'receber' | 'pagar';
export type StatusTitulo = 'aberto' | 'pago';

export interface Titulo {
  id: string; numero: string; tipo: TipoTitulo; descricao: string; pessoaNome: string | null;
  valor: number; vencimento: string; status: StatusTitulo; formaPagamento: string | null;
  pagoEm: string | null; origem: string; pedidoId: string | null;
  categoriaFinanceiraId: string | null; categoriaFinanceiraNome: string | null;
  favorecidoId: string | null; favorecidoNome: string | null;
  vendedorNome: string | null;     // vendedor do pedido vinculado (quando origem = pedido)
  previsto: boolean;   // lançamento previsto (provisão): mais claro na lista e NÃO pode ser baixado
  tipoDocumento: string | null;   // ex.: NF-e, Boleto, Fatura (cadastro Tipos de documento)
  numeroDocumento: string | null; // nº do documento (NF/boleto)
  emissao: string | null;         // data de emissão (ISO YYYY-MM-DD)
  contaCorrenteNome: string | null; // conta corrente da baixa (quando pago)
  desconto: number;   // composição da baixa (R$)
  multa: number;      // composição da baixa (R$)
  juros: number;      // composição da baixa (R$)
  criadoEm: string;
}
// Ajustes da baixa (composição do valor). Valor efetivo = valor - desconto + multa + juros.
export interface AjustesBaixa { desconto: number; multa: number; juros: number; }
export interface NovoTitulo {
  tipo: TipoTitulo; descricao: string; pessoaNome: string | null; valor: number; vencimento: string;
  categoriaFinanceiraId?: string | null;
  favorecidoId?: string | null;
  previsto?: boolean;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  emissao?: string | null;
}
export interface MovimentoFluxo {
  data: string; tipo: 'entrada' | 'saida'; descricao: string; pessoaNome: string | null; valor: number; formaPagamento: string | null;
}
// Soma dos títulos pagos por tipo + chave de agrupamento (origem ou categoria) — para a DRE de caixa.
export interface PagoAgrupado { tipo: TipoTitulo; chave: string; total: number; }
// Lançamento (título pago) numa conta corrente, para conciliação bancária.
export interface LinhaConciliacao { id: string; tipo: TipoTitulo; descricao: string; pessoaNome: string | null; valor: number; pagoEm: string; conciliado: boolean; }

export interface TituloRepository {
  listarPagos(schema: string): Promise<MovimentoFluxo[]>;
  pagosPorOrigem(schema: string, de: string | null, ate: string | null): Promise<PagoAgrupado[]>;
  pagosPorCategoria(schema: string, de: string | null, ate: string | null): Promise<PagoAgrupado[]>;
  listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]>;
  buscarPorId(schema: string, id: string): Promise<Titulo | null>;
  criar(schema: string, t: NovoTitulo, origem: string, pedidoId: string | null): Promise<string>;
  baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null, dataBaixa?: string | null, ajustes?: AjustesBaixa): Promise<void>;
  definirPrevisto(schema: string, id: string, previsto: boolean): Promise<void>;
  cancelarBaixa(schema: string, id: string): Promise<void>;
  excluir(schema: string, id: string): Promise<void>;
  atualizarCompra(schema: string, id: string, dados: { descricao: string; pessoaNome: string | null; valor: number; vencimento: string; numeroDocumento: string | null }): Promise<void>;
  criarParcelasDePedido(schema: string, descricao: string, pessoaNome: string | null, valorTotal: number, pedidoId: string, parcelas: number, intervaloDias: number): Promise<void>;
  conciliacao(schema: string, contaCorrenteId: string, de: string | null, ate: string | null): Promise<LinhaConciliacao[]>;
  definirConciliado(schema: string, id: string, conciliado: boolean): Promise<void>;
}
