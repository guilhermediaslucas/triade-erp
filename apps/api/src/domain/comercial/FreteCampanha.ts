// Campanha de frete por cliente OU geral (sem cliente), com período. Espelha as campanhas de preço.
// tipo: 'gratis' (cliente paga 0) | 'fixo' (cliente paga `valor`) | 'percentual' (desconto % sobre o custo)
//     | 'gratis_acima' (frete grátis quando o subtotal do pedido ≥ `valor`; senão cobra o custo).
export const TIPOS_FRETE_CAMPANHA = ['gratis', 'fixo', 'percentual', 'gratis_acima'] as const;
export type TipoFreteCampanha = (typeof TIPOS_FRETE_CAMPANHA)[number];

// Quem absorve o desconto na hora de pagar o motoboy:
//   'cheio'   = motoboy recebe o custo real da corrida; a empresa absorve o desconto (padrão).
//   'cobrado' = motoboy recebe o que o cliente pagou (com a campanha aplicada).
export const ABSORVE_FRETE = ['cheio', 'cobrado'] as const;
export type AbsorveFrete = (typeof ABSORVE_FRETE)[number];

export interface FreteCampanha {
  id: string;
  clienteId: string | null;   // null = campanha geral (vale para todos)
  clienteNome: string | null;
  tipo: TipoFreteCampanha;
  valor: number;
  absorve: AbsorveFrete;
  motivo: string | null;
  de: string;   // ISO date
  ate: string;  // ISO date
  vigente: boolean;
}

export interface DadosFreteCampanha { clienteId: string | null; tipo: TipoFreteCampanha; valor: number; absorve: AbsorveFrete; motivo: string | null; de: string; ate: string; }

export interface FreteCampanhaRepository {
  listar(schema: string): Promise<FreteCampanha[]>;
  criar(schema: string, d: DadosFreteCampanha): Promise<void>;
  atualizar(schema: string, id: string, d: DadosFreteCampanha): Promise<void>;
  remover(schema: string, id: string): Promise<void>;
  // Resolve o frete COBRADO do cliente: aplica a campanha vigente (específica do cliente vence a geral),
  // usando o subtotal do pedido (para 'gratis_acima'). Sem campanha vigente → cobra o próprio custo.
  freteCobrado(schema: string, clienteId: string, custo: number, subtotal: number): Promise<number>;
  // Resolve o cobrado + o valor a pagar ao motoboy (conforme 'absorve' da campanha vigente).
  resolverFrete(schema: string, clienteId: string, custo: number, subtotal: number): Promise<{ cobrado: number; motoboy: number }>;
}
