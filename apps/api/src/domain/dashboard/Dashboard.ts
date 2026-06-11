export interface ResumoDashboard {
  vendasMes: number;
  pedidosPorStatus: { status: string; quantidade: number }[];
  receberAberto: number; receberVencido: number;
  pagarAberto: number; pagarVencido: number;
  estoqueBaixo: number;
  saldoCaixa: number;
  topProdutos: { nome: string; quantidade: number }[];
  faturamentoMensal: { mes: string; total: number }[];
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
export interface DashboardRepository {
  resumo(schema: string): Promise<ResumoDashboard>;
}
