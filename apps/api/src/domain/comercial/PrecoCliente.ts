export type TipoPrecoCliente = 'fixo' | 'periodo';

export interface PrecoClienteLinha {
  produtoId: string;
  produtoNome: string;
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

// Linha do histórico de preços praticados para um cliente (quem mudou, quando).
export interface PrecoClienteHistorico {
  produtoNome: string;
  preco: number;
  tipo: string;
  de: string | null;
  ate: string | null;
  usuarioNome: string | null;
  criadoEm: string; // ISO
}

export interface RegistroHistoricoPrecoCliente {
  clienteId: string; produtoId: string; preco: number; tipo: string;
  de: string | null; ate: string | null; usuarioId: string | null; usuarioNome: string | null;
}

export interface PrecoClienteRepository {
  listarPorCliente(schema: string, clienteId: string): Promise<PrecoClienteLinha[]>;
  definir(schema: string, clienteId: string, produtoId: string, dados: PrecoClienteEntrada): Promise<void>;
  precoDe(schema: string, clienteId: string, produtoId: string): Promise<number | null>;
  registrarHistorico(schema: string, r: RegistroHistoricoPrecoCliente): Promise<void>;
  listarHistorico(schema: string, clienteId: string): Promise<PrecoClienteHistorico[]>;
}
