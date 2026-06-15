// Campanha de frete por cliente, com período. Espelha as campanhas de preço.
// tipo: 'gratis' (cliente paga 0) | 'fixo' (cliente paga `valor`) | 'percentual' (desconto % sobre o custo).
export const TIPOS_FRETE_CAMPANHA = ['gratis', 'fixo', 'percentual'] as const;
export type TipoFreteCampanha = (typeof TIPOS_FRETE_CAMPANHA)[number];

export interface FreteCampanha {
  id: string;
  clienteId: string;
  clienteNome: string | null;
  tipo: TipoFreteCampanha;
  valor: number;
  motivo: string | null;
  de: string;   // ISO date
  ate: string;  // ISO date
  vigente: boolean;
}

export interface FreteCampanhaRepository {
  listar(schema: string): Promise<FreteCampanha[]>;
  criar(schema: string, d: { clienteId: string; tipo: TipoFreteCampanha; valor: number; motivo: string | null; de: string; ate: string }): Promise<void>;
  remover(schema: string, id: string): Promise<void>;
  // Resolve o frete COBRADO do cliente, dada a campanha vigente hoje e o custo real do frete.
  // Sem campanha vigente → cobra o próprio custo.
  freteCobrado(schema: string, clienteId: string, custo: number): Promise<number>;
}
