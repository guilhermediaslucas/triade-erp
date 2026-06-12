export interface ResumoDashboard {
  // KPIs (linha c5) com variação percentual vs período anterior.
  // DeltaPct = null quando não havia período anterior (mostra "novo no período").
  vendasDia: number; vendasDiaDeltaPct: number | null;
  vendasSemana: number; vendasSemanaDeltaPct: number | null;
  vendasMes: number; vendasMesDeltaPct: number | null;
  vendasAno: number; vendasAnoDeltaPct: number | null;
  clientesAtivos: number; clientesDeltaPct: number | null;

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
  faturamentoAnterior: { mes: string; total: number }[];   // 6 meses imediatamente anteriores (série de comparação)
  vendasCategoria: { categoria: string; total: number }[];
  saldosBancarios: { nome: string; saldo: number }[];
}
// Série temporal para o drill dos KPIs (clique no card → gráfico do período).
export type TipoSerie = 'dia' | 'semana' | 'mes' | 'ano' | 'clientes';
export interface SerieDashboard {
  tipo: TipoSerie;
  labels: string[];
  data: number[];
  formato: 'moeda' | 'quantidade';
}
export interface DashboardRepository {
  resumo(schema: string): Promise<ResumoDashboard>;
  serie(schema: string, tipo: TipoSerie, de: string | null, ate: string | null): Promise<SerieDashboard>;
}
