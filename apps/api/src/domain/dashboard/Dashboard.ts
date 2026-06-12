export interface ResumoDashboard {
  // KPIs (linha c5) com variação percentual vs período anterior
  vendasDia: number; vendasDiaDeltaPct: number;
  vendasSemana: number; vendasSemanaDeltaPct: number;
  vendasMes: number; vendasMesDeltaPct: number;
  vendasAno: number; vendasAnoDeltaPct: number;
  clientesAtivos: number; clientesDeltaPct: number;

  pedidosPorStatus: { status: string; quantidade: number }[];
  receberAberto: number; receberVencido: number;
  pagarAberto: number; pagarVencido: number;
  estoqueBaixo: number;
  saldoCaixa: number;

  topProdutos: { nome: string; quantidade: number; valor: number }[];
  topClientesValor: { nome: string; total: number }[];
  topClientesQtd: { nome: string; qtd: number }[];
  pedidosRecentes: { numero: number; cliente: string; vendedor: string; valor: number; status: string; data: string }[];

  fluxoEntradasMes: number; fluxoSaidasMes: number; fluxoSaldoMes: number;

  faturamentoMensal: { mes: string; total: number }[];
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
export interface DashboardRepository {
  resumo(schema: string): Promise<ResumoDashboard>;
}
