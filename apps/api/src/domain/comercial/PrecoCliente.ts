export type TipoPrecoCliente = 'fixo' | 'periodo';

export interface PrecoClienteLinha {
  produtoId: string;
  produtoNome: string;
  categoriaNome: string | null;
  precoBase: number;
  precoCliente: number | null;
  tipo: TipoPrecoCliente;
  de: string | null;  // ISO YYYY-MM-DD (só quando tipo='periodo')
  ate: string | null;
}

export interface PrecoClienteEntrada {
  preco: number;
  tipo: TipoPrecoCliente;
  de: string | null;
  ate: string | null;
}

export interface PrecoClienteRepository {
  listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]>;
  definir(schema: string, clienteId: string, produtoId: string, dados: PrecoClienteEntrada): Promise<void>;
  precoDe(schema: string, clienteId: string, produtoId: string): Promise<number | null>;
}
