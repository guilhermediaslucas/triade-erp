// Taxa (%) cobrada pela operadora por forma de pagamento/bandeira (ex.: Cartão = 3,2%).
// Auto-preenche o campo "taxa do cartão" na baixa do título.
export interface FormaPagamentoTaxa { id: string; forma: string; percentual: number; ativo: boolean; }

export interface FormaPagamentoTaxaRepository {
  listar(schema: string): Promise<FormaPagamentoTaxa[]>;
  buscarPorId(schema: string, id: string): Promise<FormaPagamentoTaxa | null>;
  criar(schema: string, forma: string, percentual: number): Promise<string>;
  atualizar(schema: string, id: string, forma: string, percentual: number): Promise<void>;
  definirAtivo(schema: string, id: string, ativo: boolean): Promise<void>;
}
