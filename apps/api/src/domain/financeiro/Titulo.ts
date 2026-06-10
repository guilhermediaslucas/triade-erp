export type TipoTitulo = 'receber' | 'pagar';
export type StatusTitulo = 'aberto' | 'pago';

export interface Titulo {
  id: string; tipo: TipoTitulo; descricao: string; pessoaNome: string | null;
  valor: number; vencimento: string; status: StatusTitulo; formaPagamento: string | null;
  pagoEm: string | null; origem: string; pedidoId: string | null; criadoEm: string;
}
export interface NovoTitulo {
  tipo: TipoTitulo; descricao: string; pessoaNome: string | null; valor: number; vencimento: string;
}
export interface MovimentoFluxo {
  data: string; tipo: 'entrada' | 'saida'; descricao: string; pessoaNome: string | null; valor: number; formaPagamento: string | null;
}

export interface TituloRepository {
  listarPagos(schema: string): Promise<MovimentoFluxo[]>;
  listar(schema: string, tipo: TipoTitulo): Promise<Titulo[]>;
  buscarPorId(schema: string, id: string): Promise<Titulo | null>;
  criar(schema: string, t: NovoTitulo, origem: string, pedidoId: string | null): Promise<string>;
  baixar(schema: string, id: string, formaPagamento: string | null, contaCorrenteId: string | null): Promise<void>;
  cancelarBaixa(schema: string, id: string): Promise<void>;
  excluir(schema: string, id: string): Promise<void>;
  criarParcelasDePedido(schema: string, descricao: string, pessoaNome: string | null, valorTotal: number, pedidoId: string, parcelas: number, intervaloDias: number): Promise<void>;
}
