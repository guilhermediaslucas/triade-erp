// ===== CRM (Comercial): domínio =====
// Funil de oportunidades + interações por cliente + analytics de recompra/inatividade.

export type EstagioOportunidade = 'lead' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
export const ESTAGIOS: EstagioOportunidade[] = ['lead', 'contato', 'proposta', 'negociacao', 'ganho'];

export interface Oportunidade {
  id: string;
  clienteId: string | null;
  clienteNome: string;
  titulo: string | null;
  valor: number;
  vendedorId: string | null;
  vendedorNome: string | null;
  estagio: EstagioOportunidade;
  previsao: string | null;     // ISO YYYY-MM-DD
  pedidoId: string | null;
  pedidoNumero: number | null; // nº do orçamento gerado
  perdido: boolean;
}
export interface NovaOportunidade {
  clienteId: string | null;
  clienteNome: string;
  titulo: string | null;
  valor: number;
  vendedorId: string | null;
  estagio: EstagioOportunidade;
  previsao: string | null;
}

export interface Interacao {
  id: string;
  clienteId: string;
  tipo: string;
  data: string;      // ISO
  nota: string | null;
}
export interface NovaInteracao {
  clienteId: string;
  tipo: string;
  data: string;
  nota: string | null;
}

// Analytics (calculados a partir dos pedidos)
export interface VendaCliente { clienteId: string; cliente: string; data: string; total: number; }
export interface ItemCliente { clienteId: string; produto: string; qtd: number; }
export interface PedidoTimeline { numero: number; total: number; status: string; data: string; }

export interface CrmRepository {
  // oportunidades
  listarOportunidades(schema: string): Promise<Oportunidade[]>;
  buscarOportunidade(schema: string, id: string): Promise<Oportunidade | null>;
  criarOportunidade(schema: string, o: NovaOportunidade): Promise<string>;
  mudarEstagio(schema: string, id: string, estagio: EstagioOportunidade): Promise<void>;
  marcarPerdido(schema: string, id: string): Promise<void>;
  vincularPedido(schema: string, id: string, pedidoId: string): Promise<void>;
  // interações
  listarInteracoes(schema: string, clienteId: string): Promise<Interacao[]>;
  criarInteracao(schema: string, i: NovaInteracao): Promise<string>;
  contarInteracoes(schema: string): Promise<number>;
  // analytics
  resumoBase(schema: string): Promise<{ clientesAtivos: number; clientesAtendidos: number; ticketMedio: number }>;
  vendasPorCliente(schema: string): Promise<VendaCliente[]>;
  topItensPorCliente(schema: string): Promise<ItemCliente[]>;
  pedidosDoCliente(schema: string, clienteId: string): Promise<PedidoTimeline[]>;
}
