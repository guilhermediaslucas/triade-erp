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
  // Leads: dados de contato (independem de um cliente cadastrado).
  contato: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
}
export interface NovaOportunidade {
  clienteId: string | null;
  clienteNome: string;
  titulo: string | null;
  valor: number;
  vendedorId: string | null;
  estagio: EstagioOportunidade;
  previsao: string | null;
  contato: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
}

export interface Interacao {
  id: string;
  clienteId: string | null;
  oportunidadeId: string | null;
  tipo: string;
  data: string;      // ISO
  nota: string | null;
}
export interface NovaInteracao {
  clienteId: string | null;
  oportunidadeId: string | null;
  tipo: string;
  data: string;
  nota: string | null;
}

// Resultado de uma importação em lote (clientes ou leads).
export interface ResultadoImportacao {
  criados: number;
  ignorados: number;
  erros: { linha: number; motivo: string }[];
}

// Alertas adaptativos (Frente 4): cada cliente comparado pelo SEU ritmo de compra.
export type RitmoCliente = 'semanal' | 'quinzenal' | 'mensal' | 'esporadico';
export interface AlertaCliente {
  clienteId: string;
  cliente: string;
  ritmo: RitmoCliente;
  ciclo: number | null;
  ultima: string | null;
  diasSemComprar: number | null;
  proxima: string | null;
  diasParaProxima: number | null;
  janela: number;
  valorRecente: number;
  valorAnterior: number;
  quedaValorPct: number | null;   // negativo = queda
  freqRecente: number;
  freqAnterior: number;
  quedaFreqPct: number | null;
}
export interface RelatorioAlertas {
  parametros: { k: number; limite: number; inativoDias: number };
  emQueda: AlertaCliente[];
  atrasados: AlertaCliente[];
  inativos: AlertaCliente[];
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
  removerOportunidades(schema: string, ids: string[]): Promise<void>;
  removerLeads(schema: string): Promise<number>;
  vincularPedido(schema: string, id: string, pedidoId: string): Promise<void>;
  vincularCliente(schema: string, id: string, clienteId: string): Promise<void>;
  // interações
  listarInteracoes(schema: string, clienteId: string): Promise<Interacao[]>;
  listarInteracoesOportunidade(schema: string, oportunidadeId: string): Promise<Interacao[]>;
  criarInteracao(schema: string, i: NovaInteracao): Promise<string>;
  migrarInteracoesParaCliente(schema: string, oportunidadeId: string, clienteId: string): Promise<void>;
  contarInteracoes(schema: string): Promise<number>;
  // analytics
  resumoBase(schema: string): Promise<{ clientesAtivos: number; clientesAtendidos: number; ticketMedio: number }>;
  vendasPorCliente(schema: string): Promise<VendaCliente[]>;
  topItensPorCliente(schema: string): Promise<ItemCliente[]>;
  pedidosDoCliente(schema: string, clienteId: string): Promise<PedidoTimeline[]>;
}
